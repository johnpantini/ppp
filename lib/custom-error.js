export class CustomError extends Error {
  constructor(message) {
    super(message);

    this.name = 'CustomError';
    this.message = message;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
  }
}
