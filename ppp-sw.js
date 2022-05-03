// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
// This variable is intentionally declared and unused.
// Add a comment for your linter if you want:
// eslint-disable-next-line no-unused-vars
const OFFLINE_VERSION = 1;

const CACHE_NAME = 'offline';
const OFFLINE_URL = 'offline.html';

function removeDecorators(source) {
  const decorators = [];
  const lines = source.split(/\n/gi);
  let result = '';
  let currentClass = '';

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
          d: line.substr(1),
          c: currentClass,
          t: 'class'
        });
      } else {
        // Member decorator
        const t = /\)\s+{/.test(nextLine) ? 'method' : 'prop';

        decorators.unshift({
          d: line.substr(1),
          c: currentClass,
          t,
          l: nextLine
        });

        t === 'prop' && (lines[i + 1] = '');
      }
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
  }

  return result;
}

self.onmessage = (event) => {
  if (event.data === 'reclaim') {
    self.clients.claim();
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Setting {cache: 'reload'} in the new request will ensure that the
      // response isn't fulfilled from the HTTP cache; i.e., it will be from
      // the network.
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })()
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (
    event.request.url.startsWith(location.origin.split('.')[0]) &&
    event.request.destination === 'script'
  ) {
    return event.respondWith(
      (async () => {
        try {
          return await fetch(event.request).then(async (r) => {
            const ct = r.headers.get('content-type');
            const text = await r.text();
            const init = {
              status: r.status,
              statusText: r.statusText,
              headers: r.headers
            };

            if (
              ct?.startsWith('application/javascript') &&
              text.startsWith('/** @decorator */')
            ) {
              return new Response(removeDecorators(text), init);
            } else {
              return new Response(text, init);
            }
          });
        } catch (error) {
          // TODO - add offline logic
        }
      })()
    );
  }

  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported.
          const preloadResponse = await event.preloadResponse;

          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first.
          return await fetch(event.request);
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is likely
          // due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(CACHE_NAME);

          return await cache.match(OFFLINE_URL);
        }
      })()
    );
  }

  // If our if() condition is false, then this fetch handler won't intercept the
  // request. If there are any other fetch handlers registered, they will get a
  // chance to call event.respondWith(). If no fetch handlers call
  // event.respondWith(), the request will be handled by the browser as if there
  // were no service worker involvement.
});
