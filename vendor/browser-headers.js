export function iterateHeaders(headers, callback) {
  const iterator = headers[Symbol.iterator]();
  let entry = iterator.next();

  while (!entry.done) {
    callback(entry.value[0]);
    entry = iterator.next();
  }
}

export function iterateHeadersKeys(headers, callback) {
  const iterator = headers.keys();
  let entry = iterator.next();

  while (!entry.done) {
    callback(entry.value);
    entry = iterator.next();
  }
}

/** @internal */
export function normalizeName(name) {
  if (typeof name !== 'string') {
    name = String(name);
  }

  if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
    throw new TypeError('Invalid character in header field name');
  }

  return name.toLowerCase();
}

/** @internal */
export function normalizeValue(value) {
  if (typeof value !== 'string') {
    value = String(value);
  }

  return value;
}

// getHeadersValues abstracts the difference between get() and getAll() between browsers and always returns an array
/** @internal */
export function getHeaderValues(headersAsNative, key) {
  const headers = toWindowHeaders(headersAsNative);

  if (headers instanceof Headers && headers.getAll) {
    // If the headers instance has a getAll function then it will return an array
    return headers.getAll(key);
  }

  // There is no getAll() function so get *should* return an array
  const getValue = headers.get(key);

  if (getValue && typeof getValue === 'string') {
    // some .get() implementations return a string even though they don't have a .getAll() - notably Microsoft Edge
    return [getValue];
  }

  return getValue;
}

// toWindowHeaders casts the native browser class to an interface that includes functions of different browser implementations
function toWindowHeaders(headersAsNative) {
  return headersAsNative;
}

// getHeaderKeys returns an array of keys in a headers instance
/** @internal */
export function getHeaderKeys(headersAsNative) {
  const headers = toWindowHeaders(headersAsNative);
  const asMap = {};
  const keys = [];

  if (headers.keys) {
    iterateHeadersKeys(headers, (key) => {
      if (!asMap[key]) {
        // Only add the key if it hasn't been added already
        asMap[key] = true;
        keys.push(key);
      }
    });
  } else if (headers.forEach) {
    headers.forEach((_, key) => {
      if (!asMap[key]) {
        // Only add the key if it hasn't been added already
        asMap[key] = true;
        keys.push(key);
      }
    });
  } else {
    // If keys() and forEach() aren't available then fallback to iterating through headers
    iterateHeaders(headers, (entry) => {
      const key = entry[0];

      if (!asMap[key]) {
        // Only add the key if it hasn't been added already
        asMap[key] = true;
        keys.push(key);
      }
    });
  }

  return keys;
}

/** @internal */
export function splitHeaderValue(str) {
  const values = [];
  const commaSpaceValues = str.split(', ');

  commaSpaceValues.forEach((commaSpaceValue) => {
    commaSpaceValue.split(',').forEach((commaValue) => {
      values.push(commaValue);
    });
  });

  return values;
}

// isBrowserHeaders is used to check if an argument is an instance of BrowserHeaders from another
// version of the dependency.
function isBrowserHeaders(arg) {
  return (
    typeof arg === 'object' &&
    typeof arg.headersMap === 'object' &&
    typeof arg.forEach === 'function'
  );
}

// BrowserHeaders is a wrapper class for Headers
export class BrowserHeaders {
  constructor(init = {}, options = { splitValues: false }) {
    this.headersMap = {};

    if (init) {
      if (typeof Headers !== 'undefined' && init instanceof Headers) {
        const keys = getHeaderKeys(init);

        keys.forEach((key) => {
          const values = getHeaderValues(init, key);

          values.forEach((value) => {
            if (options.splitValues) {
              this.append(key, splitHeaderValue(value));
            } else {
              this.append(key, value);
            }
          });
        });
      } else if (isBrowserHeaders(init)) {
        init.forEach((key, values) => {
          this.append(key, values);
        });
      } else if (typeof Map !== 'undefined' && init instanceof Map) {
        const asMap = init;

        asMap.forEach((value, key) => {
          this.append(key, value);
        });
      } else if (typeof init === 'string') {
        this.appendFromString(init);
      } else if (typeof init === 'object') {
        Object.getOwnPropertyNames(init).forEach((key) => {
          const asObject = init;
          const values = asObject[key];

          if (Array.isArray(values)) {
            values.forEach((value) => {
              this.append(key, value);
            });
          } else {
            this.append(key, values);
          }
        });
      }
    }
  }

  appendFromString(str) {
    const pairs = str.split('\r\n');

    for (let i = 0; i < pairs.length; i++) {
      const p = pairs[i];
      const index = p.indexOf(':');

      if (index > 0) {
        const key = p.substring(0, index).trim();
        const value = p.substring(index + 1).trim();

        this.append(key, value);
      }
    }
  }

  // delete either the key (all values) or a specific value for a key
  delete(key, value) {
    const normalizedKey = normalizeName(key);

    if (value === undefined) {
      delete this.headersMap[normalizedKey];
    } else {
      const existing = this.headersMap[normalizedKey];

      if (existing) {
        const index = existing.indexOf(value);

        if (index >= 0) {
          existing.splice(index, 1);
        }

        if (existing.length === 0) {
          // The last value was removed - remove the key
          delete this.headersMap[normalizedKey];
        }
      }
    }
  }

  append(key, value) {
    const normalizedKey = normalizeName(key);

    if (!Array.isArray(this.headersMap[normalizedKey])) {
      this.headersMap[normalizedKey] = [];
    }

    if (Array.isArray(value)) {
      value.forEach((arrayValue) => {
        this.headersMap[normalizedKey].push(normalizeValue(arrayValue));
      });
    } else {
      this.headersMap[normalizedKey].push(normalizeValue(value));
    }
  }

  // set overrides all existing values for a key
  set(key, value) {
    const normalizedKey = normalizeName(key);

    if (Array.isArray(value)) {
      const normalized = [];

      value.forEach((arrayValue) => {
        normalized.push(normalizeValue(arrayValue));
      });
      this.headersMap[normalizedKey] = normalized;
    } else {
      this.headersMap[normalizedKey] = [normalizeValue(value)];
    }
  }

  has(key, value) {
    const keyArray = this.headersMap[normalizeName(key)];
    const keyExists = Array.isArray(keyArray);

    if (!keyExists) {
      return false;
    }

    if (value !== undefined) {
      const normalizedValue = normalizeValue(value);

      return keyArray.indexOf(normalizedValue) >= 0;
    } else {
      return true;
    }
  }

  get(key) {
    const values = this.headersMap[normalizeName(key)];

    if (values !== undefined) {
      return values.concat();
    }

    return [];
  }

  // forEach iterates through the keys and calls the callback with the key and *all* of it's values as an array
  forEach(callback) {
    Object.getOwnPropertyNames(this.headersMap).forEach((key) => {
      callback(key, this.headersMap[key]);
    }, this);
  }

  toHeaders() {
    if (typeof Headers !== 'undefined') {
      const headers = new Headers();

      this.forEach((key, values) => {
        values.forEach((value) => {
          headers.append(key, value);
        });
      });

      return headers;
    } else {
      throw new Error('Headers class is not defined');
    }
  }
}
