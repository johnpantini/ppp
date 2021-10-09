import { CustomError } from './custom-error.js';

class AssertionError extends CustomError {
  constructor({ message = 'Assertion failed.', status = 422, details }) {
    super(message);

    this.name = 'AssertionError';
    this.details = details;
    this.status = status;
  }
}

export function assert(condition) {
  if (condition instanceof Response) {
    if (!condition.ok)
      throw new AssertionError({
        message: 'Fetch failed.',
        status: condition.status,
        details: condition
      });
  }
}
