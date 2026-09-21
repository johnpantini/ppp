import { plugin } from 'bun';
import { afterEach, mock } from 'bun:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadServiceWorker } from './helpers/service-worker.js';

const { context } = loadServiceWorker();
const sourceRoot = fileURLToPath(new URL('../', import.meta.url))
  .replaceAll('\\', '/')
  .split('/')
  .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('[\\\\/]');
const sourceFilter = new RegExp(
  `${sourceRoot}(lib|elements|design)[\\\\/].*\\.js$`
);

// The production service worker removes decorated fields before applying
// legacy decorators. Native class-field transpilation has different semantics.
plugin({
  name: 'ppp-browser-decorators',
  setup(build) {
    build.onLoad({ filter: sourceFilter }, ({ path }) => {
      const contents = readFileSync(path, 'utf8');

      return {
        contents: contents.startsWith('/** @decorator */')
          ? context.removeDecorators(contents)
          : contents,
        loader: 'js'
      };
    });
  }
});

/** Fails closed: unit tests must explicitly provide every network response. */
function unexpectedFetch() {
  throw new Error('Unexpected network request. Mock fetch in this test.');
}

/** Application boundary for isolated modules; does not boot the SPA or log in. */
export const app = {
  i18nLocale: 'en-US',
  fetch: unexpectedFetch,
  settings: new Map(),
  i18n: async () => {},
  t: (key) => key,
  decrypt: async (document) => document,
  user: { functions: {} }
};

globalThis.ppp = app;
globalThis.fetch = unexpectedFetch;

/** Blocks accidental socket creation just as unexpectedFetch blocks HTTP. */
class OfflineWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor() {
    throw new Error('Unexpected WebSocket connection. Supply a test socket.');
  }
}

globalThis.WebSocket = OfflineWebSocket;

mock.module(fileURLToPath(new URL('../ppp.js', import.meta.url)), () => ({
  default: app
}));

afterEach(() => {
  mock.restore();
  app.i18nLocale = 'en-US';
  app.settings.clear();
});
