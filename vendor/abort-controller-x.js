/**
 * Thrown when an abortable function was aborted.
 *
 * **Warning**: do not use `instanceof` with this class. Instead, use
 * `isAbortError` function.
 */
export class AbortError extends Error {
  constructor() {
    super('The operation has been aborted');
    this.message = 'The operation has been aborted';
    this.name = 'AbortError';

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Checks whether given `error` is an `AbortError`.
 */
export function isAbortError(error) {
  return (
    typeof error === 'object' && error !== null && error.name === 'AbortError'
  );
}

/**
 * If `signal` is aborted, throws `AbortError`. Otherwise does nothing.
 */
export function throwIfAborted(signal) {
  if (signal.aborted) {
    throw new AbortError();
  }
}

/**
 * If `error` is `AbortError`, throws it. Otherwise does nothing.
 *
 * Useful for `try/catch` blocks around abortable code:
 *
 *    try {
 *      await somethingAbortable(signal);
 *    } catch (err) {
 *      rethrowAbortError(err);
 *
 *      // do normal error handling
 *    }
 */
export function rethrowAbortError(error) {
  if (isAbortError(error)) {
    throw error;
  }
}

/**
 * If `error` is `AbortError`, does nothing. Otherwise throws it.
 *
 * Useful for invoking top-level abortable functions:
 *
 *    somethingAbortable(signal).catch(catchAbortError)
 *
 * Without `catchAbortError`, aborting would result in unhandled promise
 * rejection.
 */
export function catchAbortError(error) {
  if (isAbortError(error)) {
    return;
  }

  throw error;
}

/**
 * Similar to `new Promise(executor)`, but allows executor to return abort
 * callback that is called once `signal` is aborted.
 *
 * Returned promise rejects with `AbortError` once `signal` is aborted.
 *
 * Callback can return a promise, e.g. for doing any async cleanup. In this
 * case, the promise returned from `execute` rejects with `AbortError` after
 * that promise fulfills.
 */
export function execute(signal, executor) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new AbortError());

      return;
    }

    let removeAbortListener;
    let finished = false;

    function finish() {
      if (!finished) {
        finished = true;

        if (removeAbortListener != null) {
          removeAbortListener();
        }
      }
    }

    const callback = executor(
      (value) => {
        resolve(value);
        finish();
      },
      (reason) => {
        reject(reason);
        finish();
      }
    );

    if (!finished) {
      const listener = () => {
        const callbackResult = callback();

        if (callbackResult == null) {
          reject(new AbortError());
        } else {
          callbackResult.then(
            () => {
              reject(new AbortError());
            },
            (reason) => {
              reject(reason);
            }
          );
        }

        finish();
      };

      signal.addEventListener('abort', listener);
      removeAbortListener = () => {
        signal.removeEventListener('abort', listener);
      };
    }
  });
}
