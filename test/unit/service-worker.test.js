import { expect, mock, test } from 'bun:test';
import { runInNewContext } from 'node:vm';
import { loadServiceWorker } from '../helpers/service-worker.js';

test('decorator transformation preserves ordinary source and CSS at-rules', () => {
  const { context } = loadServiceWorker();
  const source = 'const css = `\n@keyframes spin {}\n`;\n// @example\n';

  expect(context.removeDecorators(source)).toBe(source + '\n');
  expect(context.removeDecorators('const value = 1;')).toBe(
    'const value = 1;\n'
  );
  expect(context.removeDecorators('')).toBe('\n');
});

test.each(['\n', '\r\n'])(
  'legacy property and stacked method decorators execute correctly with %p',
  (newline) => {
    const { context } = loadServiceWorker();
    const source = [
      'class Example {',
      '  @property',
      '  value;',
      '  @first',
      '  @second',
      '  method() { return 2; }',
      '}',
      'globalThis.Example = Example;'
    ].join(newline);
    const calls = [];
    const realm = {
      property: (target, key) => {
        Object.defineProperty(target, key, { get: () => 42 });
      },
      first: (target, key, descriptor) => {
        calls.push('first');
        return descriptor;
      },
      second: (target, key, descriptor) => {
        calls.push('second');
        return descriptor;
      }
    };

    runInNewContext(context.removeDecorators(source), realm);
    const instance = new realm.Example();
    expect(instance.value).toBe(42);
    expect(instance.method()).toBe(2);
    expect(calls).toEqual(['second', 'first']);
    expect(Object.hasOwn(instance, 'value')).toBe(false);
  }
);

test('decorators are applied before the default export', () => {
  const { context } = loadServiceWorker();
  const result = context.removeDecorators(
    '@decorate\nclass Example {}\nexport default Example;'
  );

  expect(result.indexOf('Example = __decorate')).toBeLessThan(
    result.indexOf('export default Example')
  );
});

test('install caches the offline page, activation and reclaim claim clients', async () => {
  const cache = { add: mock(async () => {}) };
  const claim = mock();
  const skipWaiting = mock();
  const { listeners, context } = loadServiceWorker({
    Request: class {
      constructor(url, options) {
        this.url = url;
        Object.assign(this, options);
      }
    },
    caches: { open: mock(async () => cache) }
  });
  context.self.clients.claim = claim;
  context.self.skipWaiting = skipWaiting;
  let pending;

  listeners.get('install')({
    waitUntil: (promise) => {
      pending = promise;
    }
  });
  await pending;
  expect(cache.add.mock.calls[0][0]).toMatchObject({
    url: 'offline.html',
    cache: 'reload'
  });
  expect(skipWaiting).toHaveBeenCalledTimes(1);
  listeners.get('activate')();
  context.self.onmessage({ data: 'reclaim' });
  expect(claim).toHaveBeenCalledTimes(2);
});

test.each([
  'https://app.test/image.png',
  'https://app.test/data.json',
  'https://app.test/query.sql',
  'chrome-extension://test/script.js'
])('leaves excluded resource %s to the browser', async (url) => {
  const { listeners } = loadServiceWorker();
  const respondWith = mock();

  await listeners.get('fetch')({
    request: { url, method: 'GET', destination: 'image' },
    respondWith
  });
  expect(respondWith).not.toHaveBeenCalled();
});

test('development fetch transforms decorators and preserves response status', async () => {
  const source = '/** @decorator */\nclass Example {\n @observable\n value;\n}';
  const fetch = mock(
    async () =>
      new Response(source, {
        status: 200,
        headers: { 'content-type': 'application/javascript' }
      })
  );
  const { listeners } = loadServiceWorker({
    fetch,
    location: { origin: 'https://app.io.dev' }
  });
  let response;

  await listeners.get('fetch')({
    request: {
      url: 'https://app.io.dev/script.js',
      method: 'GET',
      destination: 'script'
    },
    respondWith: (promise) => {
      response = promise;
    }
  });
  const result = await response;
  expect(result.status).toBe(200);
  expect(await result.text()).toContain('__decorate([observable]');
  expect(fetch.mock.calls[0][1]).toEqual({ cache: 'no-store' });
});

test('network failure on an uncached page returns the offline fallback', async () => {
  const fallback = new Response('offline');
  const cache = {
    match: mock(async (key) => (key === 'offline.html' ? fallback : undefined))
  };
  const { listeners } = loadServiceWorker({
    fetch: mock(async () => {
      throw new Error('offline');
    }),
    caches: { open: async () => cache }
  });
  let response;

  await listeners.get('fetch')({
    request: {
      url: 'https://app.test/?page=orders',
      method: 'GET',
      destination: 'document'
    },
    respondWith: (promise) => {
      response = promise;
    }
  });
  expect(await response).toBe(fallback);
});

test('cached responses return immediately while revalidation is kept alive', async () => {
  const cached = new Response('cached');
  const cache = { match: mock(async () => cached), put: mock(async () => {}) };
  const { listeners } = loadServiceWorker({
    fetch: mock(async () => new Response('fresh')),
    caches: { open: async () => cache }
  });
  const pending = [];
  let response;

  await listeners.get('fetch')({
    request: {
      url: 'https://app.test/main.js',
      method: 'GET',
      destination: 'script'
    },
    respondWith: (promise) => {
      response = promise;
    },
    waitUntil: (promise) => pending.push(promise)
  });
  expect(await response).toBe(cached);
  expect(pending.length).toBeGreaterThan(0);
  await Promise.all(pending);
  expect(cache.put).toHaveBeenCalledTimes(1);
});

test('failed background revalidation leaves a cached page usable', async () => {
  const cached = new Response('cached');
  const cache = { match: mock(async () => cached) };
  const { listeners } = loadServiceWorker({
    fetch: mock(async () => {
      throw new Error('offline');
    }),
    caches: { open: async () => cache }
  });
  const pending = [];
  let response;

  await listeners.get('fetch')({
    request: {
      url: 'https://app.test/main.js',
      method: 'GET',
      destination: 'script'
    },
    respondWith: (promise) => {
      response = promise;
    },
    waitUntil: (promise) => pending.push(promise)
  });
  expect(await response).toBe(cached);
  await expect(Promise.all(pending)).resolves.toEqual([undefined]);
});

test.each([
  'const answer = 42;',
  '/** @decorator */\nclass Example {\n @observable\n value;\n}'
])(
  'a cache write failure preserves a successful network response: %s',
  async (source) => {
    const cache = {
      match: mock(async () => undefined),
      put: mock(async () => {
        throw new Error('QuotaExceededError');
      })
    };
    const { listeners, context } = loadServiceWorker({
      fetch: mock(
        async () =>
          new Response(source, {
            headers: { 'content-type': 'application/javascript' }
          })
      ),
      caches: { open: async () => cache }
    });
    let response;

    await listeners.get('fetch')({
      request: {
        url: 'https://app.test/main.js',
        method: 'GET',
        destination: 'script'
      },
      respondWith: (promise) => {
        response = promise;
      }
    });
    const result = await response;
    expect(result.status).toBe(200);
    expect(await result.text()).toBe(
      source.startsWith('/** @decorator */')
        ? context.removeDecorators(source)
        : source
    );
    expect(cache.put).toHaveBeenCalledTimes(1);
  }
);
