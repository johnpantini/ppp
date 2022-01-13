import { CustomError } from './custom-error.js';

class AssertionError extends CustomError {
  constructor({ message = 'Assertion failed.', status = 422, details }) {
    super(message);

    this.name = 'AssertionError';
    this.details = details;
    this.status = status;
  }
}

export function assert(condition, message) {
  if (condition instanceof Response) {
    if (!condition.ok) {
      if (typeof message === 'function')
        message = message();
      else
        message = message ?? 'Fetch failed.';

      throw new AssertionError({
        message,
        status:  condition.status,
        details: condition
      });
    }
  } else if (typeof condition === 'boolean') {
    if (!condition)
      throw new AssertionError({
        message: message ?? 'Assertion failed.',
        status: condition.status,
        details: condition
      });
  } else if (typeof condition === 'object' && 'predicate' in condition) {
    if (!condition.predicate)
      throw new AssertionError({
        message: message ?? 'Assertion failed.',
        status: condition.status,
        details: condition
      });
  }
}
