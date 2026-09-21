import { Window } from 'happy-dom';

/**
 * Installs DOM APIs required by real FAST components. Network APIs remain the
 * fail-closed test implementations; no application startup or HTTP server runs.
 * @returns {Window} Browser document used by component tests.
 */
export function installDOM() {
  const window = new Window({
    url: 'https://app.test/',
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      fetch: {
        interceptor: {
          beforeAsyncRequest: async () => {
            throw new Error(
              'Unexpected DOM network request. Mock the request.'
            );
          },
          beforeSyncRequest: () => {
            throw new Error(
              'Unexpected DOM network request. Mock the request.'
            );
          }
        }
      }
    }
  });

  window.fetch = (...args) => globalThis.fetch(...args);
  window.WebSocket = globalThis.WebSocket;

  for (const name of [
    'document',
    'customElements',
    'HTMLElement',
    'Element',
    'Node',
    'Document',
    'HTMLStyleElement',
    'ShadowRoot',
    'CSSStyleSheet',
    'CustomEvent',
    'Event',
    'KeyboardEvent',
    'MouseEvent',
    'MutationObserver',
    'CSS',
    'localStorage'
  ]) {
    globalThis[name] = window[name];
  }

  globalThis.window = window;
  globalThis.matchMedia = window.matchMedia.bind(window);
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  // Keep scheduling independent of Happy DOM's lifecycle and fake timeouts.
  globalThis.requestAnimationFrame = (callback) => setImmediate(callback);
  globalThis.cancelAnimationFrame = (id) => clearImmediate(id);

  return window;
}
