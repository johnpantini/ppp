// borrowed from IxJS
// https://github.com/ReactiveX/IxJS/blob/v4.5.1/src/asynciterable/asyncsink.ts
const ARRAY_VALUE = 'value';
const ARRAY_ERROR = 'error';

export class AsyncSink {
  constructor() {
    this._ended = false;
    this._values = [];
    this._resolvers = [];
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  write(value) {
    this._push({ type: ARRAY_VALUE, value });
  }

  error(error) {
    this._push({ type: ARRAY_ERROR, error });
  }

  _push(item) {
    if (this._ended) {
      throw new Error('AsyncSink already ended');
    }

    if (this._resolvers.length > 0) {
      const { resolve, reject } = this._resolvers.shift();

      if (item.type === ARRAY_ERROR) {
        reject(item.error);
      } else {
        resolve({ done: false, value: item.value });
      }
    } else {
      this._values.push(item);
    }
  }

  next() {
    if (this._values.length > 0) {
      const { type, value, error } = this._values.shift();

      if (type === ARRAY_ERROR) {
        return Promise.reject(error);
      } else {
        return Promise.resolve({ done: false, value });
      }
    }

    if (this._ended) {
      return Promise.resolve({ done: true });
    }

    return new Promise((resolve, reject) => {
      this._resolvers.push({ resolve, reject });
    });
  }

  end() {
    while (this._resolvers.length > 0) {
      this._resolvers.shift().resolve({ done: true });
    }

    this._ended = true;
  }
}
