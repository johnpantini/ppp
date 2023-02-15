// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
// This variable is intentionally declared and unused.
// Add a comment for your linter if you want:
// eslint-disable-next-line no-unused-vars
const OFFLINE_VERSION = 7;
const PPP_CACHE_NAME = 'offline';
const OFFLINE_URL = 'offline.html';

// noinspection DuplicatedCode
function placeDecorators(decorators = []) {
  let result = '';

  decorators.forEach(({ d, c, t, l }) => {
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
  });

  return result;
}

function removeDecorators(source) {
  const decorators = [];
  // Should be moved to the bottom after __decorate
  const exports = [];
  const lines = source.split(/\n/gi);
  let result = '';
  let currentClass = '';
  let hasDefaultExport = false;

  lines.forEach((l, i) => {
    const line = l.trim();

    if (/class\s+/.test(line)) {
      currentClass = line.split(/class /)[1].split(/\s/)[0];
    }

    if (line.startsWith('@') && !/^@keyframes/.test(line) && !/=/.test(line)) {
      const nextLine = lines[i + 1]?.trim();

      if (/class\s+/.test(nextLine)) {
        // Class decorator
        currentClass = nextLine.split(/class /)[1].split(/\s/)[0];

        decorators.push({
          d: line.substring(1),
          c: currentClass,
          t: 'class'
        });
      } else {
        // Member decorator
        const t = /\)\s+{/.test(nextLine) ? 'method' : 'prop';

        decorators.unshift({
          d: line.substring(1),
          c: currentClass,
          t,
          l: nextLine
        });

        t === 'prop' && (lines[i + 1] = '');
      }
    } else if (/^export default/.test(line)) {
      hasDefaultExport = true;

      result += placeDecorators(decorators);
      result += l + '\n';
    } else result += l + '\n';
  });

  if (decorators.length) {
    result =
      'const __decorate = function (decorators, target, key, desc) {\n' +
      '  let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n' +
      '  for (let i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n' +
      '  return c > 3 && r && Object.defineProperty(target, key, r), r;\n' +
      '};\n' +
      result;

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
    (/\.js$/i.test(event.request.url) || /\?page=/i.test(event.request.url))
  ) {
    return event.respondWith(
      (async () => {
        try {
          if (location.origin.endsWith('.io.dev')) {
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
