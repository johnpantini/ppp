// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
// This variable is intentionally declared and unused.
// Add a comment for your linter if you want:
// eslint-disable-next-line no-unused-vars
const OFFLINE_VERSION = 9;
const PPP_CACHE_NAME = 'offline';
const OFFLINE_URL = 'offline.html';

// noinspection DuplicatedCode
const DECORATE_HELPER =
  'const __decorate = function (decorators, target, key, desc) {\n' +
  '  let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n' +
  '  for (let i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n' +
  '  return c > 3 && r && Object.defineProperty(target, key, r), r;\n' +
  '};\n';

// Only lines containing one of these can be affected, every other line is
// copied verbatim, so the source is never split into lines.
const DECORATOR_CANDIDATE = /@|class|export default/g;

function isDecoratorLine(line) {
  return line.startsWith('@') && !/^@keyframes/.test(line) && !/=/.test(line);
}

function placeDecorators(decorators = []) {
  let result = '';

  for (const { d, c, t, l } of decorators) {
    if (t === 'class') {
      result += `${c} = __decorate([${d}], ${c});\n`;
    } else if (t === 'method') {
      result += `__decorate([${d}], ${c}.prototype, '${l
        .split(/\(/i)[0]
        .trim()}', null);\n`;
    } else if (t === 'prop') {
      result += `__decorate([${d}], ${c}.prototype, '${l
        .split(/=/i)[0]
        .replace(/;/, '')
        .trim()}', void 0);\n`;
    }
  }

  return result;
}

function removeDecorators(source) {
  const decorators = [];
  const chunks = [];
  const length = source.length;
  let currentClass = '';
  let hasDefaultExport = false;
  // Start of the pending run of unmodified source.
  let runStart = 0;
  // Start of the line processed last, a line is handled once.
  let lastLineStart = -1;
  // True when the trailing newline has already been emitted (or dropped).
  let trailingNewlineDone = false;
  let match;

  DECORATOR_CANDIDATE.lastIndex = 0;

  while ((match = DECORATOR_CANDIDATE.exec(source)) !== null) {
    const lineStart = source.lastIndexOf('\n', match.index) + 1;

    if (lineStart === lastLineStart) {
      continue;
    }

    lastLineStart = lineStart;

    let lineEnd = source.indexOf('\n', match.index);

    if (lineEnd === -1) lineEnd = length;

    // Continue scanning from the next line.
    DECORATOR_CANDIDATE.lastIndex = lineEnd + 1;

    const line = source.slice(lineStart, lineEnd).trim();

    if (/class\s+/.test(line)) {
      currentClass = line.split(/class /)[1].split(/\s/)[0];
    }

    if (isDecoratorLine(line)) {
      // Collect the whole stack of decorators, the target follows them.
      const stack = [line.substring(1)];
      let stackEnd = lineEnd;
      let target;
      let targetEnd = -1;

      while (stackEnd < length) {
        targetEnd = source.indexOf('\n', stackEnd + 1);

        if (targetEnd === -1) targetEnd = length;

        target = source.slice(stackEnd + 1, targetEnd).trim();

        if (!isDecoratorLine(target)) {
          break;
        }

        stack.push(target.substring(1));
        stackEnd = targetEnd;
        target = void 0;
        targetEnd = -1;
      }

      const d = stack.join(', ');

      if (/class\s+/.test(target)) {
        currentClass = target.split(/class /)[1].split(/\s/)[0];

        decorators.push({ d, c: currentClass, t: 'class' });
      } else {
        const t = /\)\s+{/.test(target) ? 'method' : 'prop';

        decorators.unshift({ d, c: currentClass, t, l: target });

        if (t === 'prop' && targetEnd !== -1) {
          // Decorator lines are dropped, the property line is replaced by
          // an empty one and is not inspected any further.
          chunks.push(source.slice(runStart, lineStart), '\n');
          runStart = targetEnd + 1;
          lastLineStart = stackEnd + 1;
          DECORATOR_CANDIDATE.lastIndex = targetEnd + 1;
          trailingNewlineDone = targetEnd === length;

          continue;
        }
      }

      // Decorator lines are dropped.
      chunks.push(source.slice(runStart, lineStart));
      runStart = stackEnd + 1;
      lastLineStart = stackEnd + 1;
      DECORATOR_CANDIDATE.lastIndex = stackEnd + 1;
      trailingNewlineDone = stackEnd === length;
    } else if (/(^export default)|(\/\/ export default)/.test(line)) {
      hasDefaultExport = true;

      chunks.push(
        source.slice(runStart, lineStart),
        placeDecorators(decorators)
      );
      runStart = lineStart;
    }
  }

  if (runStart < length) chunks.push(source.slice(runStart));

  // Every line is emitted with a newline, so the output ends with one.
  if (!trailingNewlineDone) chunks.push('\n');

  let result = chunks.join('');

  if (decorators.length) {
    result = DECORATE_HELPER + result;

    if (!hasDefaultExport) {
      result += placeDecorators(decorators);
    }
  }

  return result;
}

self.onmessage = (event) => {
  // For hard resets
  if (event.data === 'reclaim') {
    return self.clients.claim();
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PPP_CACHE_NAME);

      // Setting { cache: 'reload' } in the new request will ensure that the
      // response isn't fulfilled from the HTTP cache; i.e., it will be from
      // the network.
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })()
  );

  // Force the waiting service worker to become the active service worker.
  return self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Tell the active service worker to take control of the page immediately.
  return self.clients.claim();
});

self.addEventListener('fetch', async (event) => {
  // If no fetch handlers call event.respondWith(), the request will be handled
  // by the browser as if there were no service worker involvement.
  if (
    (event.request.destination === 'image' &&
      event.request.url?.endsWith('.png')) ||
    event.request.url?.endsWith('.sql') ||
    event.request.url?.endsWith('.json') ||
    event.request.url?.startsWith('chrome-extension')
  ) {
    return;
  }

  if (
    event.request.destination &&
    event.request.method === 'GET' &&
    (new URL(event.request.url).pathname.endsWith('.js') ||
      /\?page=/i.test(event.request.url))
  ) {
    return event.respondWith(
      (async () => {
        try {
          if (
            location.origin.endsWith('.io.dev') ||
            // Tauri dev and release.
            event.request.url?.startsWith('http://127.0.0.1') ||
            event.request.url?.startsWith('http://localhost')
          ) {
            return await fetch(event.request, {
              cache: 'no-store'
            }).then(async (r) => {
              const ct = r.headers.get('content-type');
              const text = await r.text();
              const init = {
                status: r.status,
                statusText: r.statusText,
                headers: r.headers
              };

              if (
                /javascript/gi.test(ct) &&
                text.startsWith('/** @decorator */')
              ) {
                return new Response(removeDecorators(text), init);
              } else {
                return new Response(text, init);
              }
            });
          }

          const cache = await caches.open(PPP_CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          const fetchedResponse = fetch(event.request, {
            cache: 'no-store'
          }).then(async (networkResponse) => {
            const clone = networkResponse.clone();
            const ct = clone.headers.get('content-type');
            const text = await clone.text();
            const init = {
              status: clone.status,
              statusText: clone.statusText,
              headers: clone.headers
            };

            if (
              /javascript/gi.test(ct) &&
              text.startsWith('/** @decorator */')
            ) {
              const r = new Response(removeDecorators(text), init);

              void cache.put(event.request, r.clone());

              return r;
            } else {
              void cache.put(event.request, new Response(text, init));

              return networkResponse;
            }
          });

          return cachedResponse ?? fetchedResponse;
        } catch (e) {
          const cache = await caches.open(PPP_CACHE_NAME);

          return await cache.match(OFFLINE_URL);
        }
      })()
    );
  }
});
