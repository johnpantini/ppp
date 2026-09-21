import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

/**
 * Loads the real service worker in an isolated realm without registering it.
 * Overrides supply controlled browser APIs for lifecycle and cache tests.
 * @param {Record<string, unknown>} [overrides] Global values for the worker.
 * @returns {{context: object, listeners: Map<string, Function>}}
 */
export function loadServiceWorker(overrides = {}) {
  const listeners = new Map();
  const context = {
    URL,
    Request,
    Response,
    location: { origin: 'https://example.test' },
    self: {
      addEventListener: (name, listener) => listeners.set(name, listener),
      skipWaiting() {},
      clients: { claim() {} }
    },
    ...overrides
  };

  runInNewContext(
    readFileSync(new URL('../../ppp-sw.js', import.meta.url), 'utf8'),
    context,
    { filename: 'ppp-sw.js' }
  );

  return { context, listeners };
}
