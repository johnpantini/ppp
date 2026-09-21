/**
 * Runs immediately, then at most once per interval with the latest pending call.
 * The caller's receiver and arguments are preserved; return values are discarded.
 * @template {(...args: any[]) => any} F
 * @param {F} fn Callback to limit.
 * @param {number} wait Interval in milliseconds.
 * @returns {(...args: Parameters<F>) => void} Throttled callback.
 */
export function $throttle(fn, wait) {
  let isThrottled = false,
    savedArgs,
    savedThis;

  function wrapper() {
    if (isThrottled) {
      // biome-ignore lint/complexity/noArguments: OK
      savedArgs = arguments;
      savedThis = this;

      return;
    }

    // biome-ignore lint/complexity/noArguments: OK
    fn.apply(this, arguments);

    isThrottled = true;

    // biome-ignore lint/complexity/useArrowFunction: OK
    setTimeout(function () {
      isThrottled = false;

      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, wait);
  }

  return wrapper;
}

/**
 * Runs the latest call after an interval without further calls.
 * @template {(...args: any[]) => any} F
 * @param {F} fn Callback whose receiver and arguments will be preserved.
 * @param {number} wait Quiet interval in milliseconds.
 * @returns {(...args: Parameters<F>) => void} Debounced callback.
 */
export function $debounce(fn, wait) {
  let timeout;

  return function () {
    clearTimeout(timeout);
    // biome-ignore lint/complexity/noArguments: OK
    timeout = setTimeout(() => fn.apply(this, arguments), wait);
  };
}

/**
 * Creates a legacy method decorator using {@link $throttle}.
 * @param {number} [wait=0] Interval in milliseconds.
 * @returns {(proto: object, name: string, descriptor: PropertyDescriptor) => void}
 * @throws {Error} When applied to a field or other non-function member.
 */
export function throttle(wait = 0) {
  return (proto, name, descriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('throttle can only decorate functions.');
    }

    const fn = descriptor.value;

    descriptor.value = $throttle(fn, wait);
    Object.defineProperty(proto, name, descriptor);
  };
}

/**
 * Creates a legacy method decorator using {@link $debounce}.
 * @param {number} [wait=0] Quiet interval in milliseconds.
 * @returns {(proto: object, name: string, descriptor: PropertyDescriptor) => void}
 * @throws {Error} When applied to a field or other non-function member.
 */
export function debounce(wait = 0) {
  return (proto, name, descriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('debounce can only decorate functions.');
    }

    const fn = descriptor.value;

    descriptor.value = $debounce(fn, wait);
    Object.defineProperty(proto, name, descriptor);
  };
}

/**
 * @param {number} delay Milliseconds to wait.
 * @returns {Promise<void>}
 */
export async function later(delay) {
  // biome-ignore lint/complexity/useArrowFunction: OK
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}
