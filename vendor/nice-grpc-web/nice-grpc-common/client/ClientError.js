import { Status } from '../Status.js';

export class ExtendableError extends Error {
  constructor(...params) {
    super(...params);

    const message =
      params.length > 0 && typeof params[0] === 'string' ? params[0] : '';

    // Replace Error with ClassName of the constructor, if it has not been overwritten already
    if (this.name === undefined || this.name === 'Error') {
      Object.defineProperty(this, 'name', {
        configurable: true,
        enumerable: false,
        value: this.constructor.name,
        writable: true
      });
    }

    Object.defineProperty(this, 'message', {
      configurable: true,
      enumerable: false,
      value: message,
      writable: true
    });

    Object.defineProperty(this, 'stack', {
      configurable: true,
      enumerable: false,
      value: '',
      writable: true
    });

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else if (this.stack === '') {
      this.stack = new Error(message).stack;
    }
  }
}

/**
 * Represents gRPC errors returned from client calls.
 */
export class ClientError extends ExtendableError {
  constructor(path, code, details) {
    super(`${path} ${Status[code]}: ${details}`);
    this.path = path;
    this.code = code;
    this.details = details;
    this.name = 'ClientError';
    Object.defineProperty(this, '@@nice-grpc', {
      value: true
    });
    Object.defineProperty(this, '@@nice-grpc:ClientError', {
      value: true
    });
  }

  static [Symbol.hasInstance](instance) {
    // allow instances of ClientError from different versions of nice-grpc
    // to work with `instanceof ClientError`
    if (this !== ClientError) {
      return this.prototype.isPrototypeOf(instance);
    }

    return (
      typeof instance === 'object' &&
      instance !== null &&
      (instance.constructor === ClientError ||
        instance['@@nice-grpc:ClientError'] === true ||
        (instance.name === 'ClientError' && instance['@@nice-grpc'] === true))
    );
  }
}
