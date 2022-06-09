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

const propConfig = {
  configurable: false,
  enumerable: false,
  writable: false
};

if ($global.PPP === void 0) {
  Reflect.defineProperty(
    $global,
    'PPP',
    Object.assign({ value: Object.create(null) }, propConfig)
  );
}

/**
 * The PPP global.
 * @internal
 */
export const PPP = $global.PPP;

if (PPP.getById === void 0) {
  const storage = Object.create(null);

  Reflect.defineProperty(
    PPP,
    'getById',
    Object.assign(
      {
        value(id, initialize) {
          let found = storage[id];

          if (found === void 0) {
            found = initialize ? (storage[id] = initialize()) : null;
          }

          return found;
        }
      },
      propConfig
    )
  );
}

/**
 * A readonly, empty array.
 * @remarks
 * Typically returned by APIs that return arrays when there are
 * no actual items to return.
 * @internal
 */
export const emptyArray = Object.freeze([]);
