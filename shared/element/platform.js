/**
 * A reference to globalThis, with support
 * for browsers that don't yet support the spec.
 * @public
 */
export const $global = (function () {
  if (typeof globalThis !== 'undefined') {
    // We're running in a modern environment.
    return globalThis;
  }

  if (typeof self !== 'undefined') {
    // We're running in a worker.
    return self;
  }

  if (typeof window !== 'undefined') {
    // We're running in the browser's main thread.
    return window;
  }
})();

// API-only Polyfill for trustedTypes
if ($global.trustedTypes === void 0) {
  $global.trustedTypes = { createPolicy: (n, r) => r };
}

/**
 * A readonly, empty array.
 * @remarks
 * Typically returned by APIs that return arrays when there are
 * no actual items to return.
 * @internal
 */
export const emptyArray = Object.freeze([]);
