import { EventEmitter } from 'events';

/* doublylinked
 ------------------------
 (c) 2017-present Panates
 SQB may be freely distributed under the MIT license.
 For details and documentation:
 https://panates.github.io/doublylinked/
 */
class DoublyLinked {
  /**
   * @param {*} element... - The elements to add to the end of the list
   * @constructor
   */
  constructor(...element) {
    this._cursor = undefined;
    this._head = undefined;
    this._tail = undefined;
    this._length = 0;
    this._eof = undefined;

    if (arguments.length) this.push.apply(this, arguments);
  }

  /**
   *
   * @returns {Node}
   */
  get cursor() {
    return this._cursor;
  }

  /**
   *
   * @returns {Node}
   */
  get head() {
    return this._head;
  }

  /**
   *
   * @returns {int}
   */
  get length() {
    return this._length;
  }

  /**
   *
   * @returns {Node}
   */
  get tail() {
    return this._tail;
  }

  /**
   * Merges cursor list with and given lists/values into new list
   *
   * @param {String} element... - Lists and/or values to concatenate into a new list
   * @return {DoublyLinked} - A new DoublyLinked instance
   * @public
   */
  concat(...element) {
    const result = new DoublyLinked();
    const mergeFn = (acc, node) => {
      acc.push(node);

      return acc;
    };

    this.reduce(mergeFn, result);

    for (const arg of element) {
      if (arg instanceof DoublyLinked) arg.reduce(mergeFn, result);
      else result.push(arg);
    }

    return result.reset();
  }

  /**
   * Returns the iterator object contains entries
   *
   * @return {Iterator}
   */
  entries() {
    return {
      [Symbol.iterator]() {
        let _cursor;
        let i = 0;

        return {
          next: () => {
            _cursor = _cursor ? _cursor.next : this.head;

            return {
              value: _cursor && [i++, _cursor.value],
              done: !_cursor
            };
          }
        };
      }
    };
  }

  /**
   * Returns the iterator object contains keys
   *
   * @return {Iterator}
   */
  keys() {
    return {
      [Symbol.iterator]() {
        let _cursor;
        let i = 0;

        return {
          next: () => {
            _cursor = _cursor ? _cursor.next : this.head;

            return {
              value: _cursor && i++,
              done: !_cursor
            };
          }
        };
      }
    };
  }

  /**
   * Returns the iterator object contains values
   *
   * @return {function}
   */
  values() {
    return {
      [Symbol.iterator]() {
        let _cursor;

        return {
          next: () => {
            _cursor = _cursor ? _cursor.next : this.head;

            return {
              value: _cursor && _cursor.value,
              done: !_cursor
            };
          }
        };
      }
    };
  }

  /**
   * Tests whether all elements in the list pass the test implemented by
   * the provided function (from left to right)
   *
   * @param {Function} callback - Function to test for each element
   * @param {*} [thisArg] - Value to use as this when executing callback
   * @return {Boolean} - true if the callback function returns a truthy value for every list element; otherwise, false
   * @public
   */
  every(callback, thisArg) {
    if (typeof callback !== 'function')
      throw new TypeError('You must provide a function as first argument');

    if (!(this._length && callback)) return true;

    thisArg = thisArg !== undefined ? thisArg : this;

    let tmp = this._head;
    let nxt;
    let i = 0;

    while (tmp) {
      nxt = tmp.next;

      if (!callback.call(thisArg, tmp.value, i++, thisArg)) return false;

      tmp = nxt;
    }

    return true;
  }

  /**
   * Tests whether all elements in the list pass the test implemented by
   * the provided function (from right to left)
   *
   * @param {Function} callback - Function to test for each element
   * @param {*} [thisArg] - Value to use as this when executing callback
   * @return {Boolean} - true if the callback function returns a truthy value for every list element; otherwise, false
   * @public
   */
  everyRight(callback, thisArg) {
    if (typeof callback !== 'function')
      throw new TypeError('You must provide a function as first argument');

    if (!(this._length && callback)) return true;

    thisArg = thisArg !== undefined ? thisArg : this;

    let tmp = this.tail;

    for (let i = 0; i < this._length; i++) {
      if (!callback.call(thisArg, tmp.value, this._length - i - 1, thisArg))
        return false;

      tmp = tmp.prev;
    }

    return true;
  }

  /**
   * Creates a new list with all elements that pass the test implemented
   * by the provided function
   *
   * @param {Function} callback - Function to test for each element
   * @param {*} [thisArg] - Value to use as this when executing callback
   * @return {DoublyLinked} - A new list with the elements that pass the test
   * @public
   */
  filter(callback, thisArg) {
    if (typeof callback !== 'function')
      throw new TypeError('You must provide a function as first argument');

    thisArg = thisArg !== undefined ? thisArg : this;

    let index = 0;

    return this.reduce((acc, value) => {
      if (callback.call(thisArg, value, index++, thisArg)) acc.push(value);

      return acc;
    }, new DoublyLinked());
  }

  /**
   * Returns the value of the first element in the list that satisfies
   * the provided testing function. Otherwise undefined is returned
   *
   * @param {Function} callback - Function to test for each element
   * @param {*} [thisArg] - Value to use as this when executing callback
   * @return {*} - A value in the list if an element passes the test; otherwise, undefined
   * @public
   */
  find(callback, thisArg) {
    if (typeof callback !== 'function')
      throw new TypeError('You must provide a function as first argument');

    if (!this._length) return;

    thisArg = thisArg !== undefined ? thisArg : this;

    let tmp = this.head;

    for (let i = 0; i < this.length; i++) {
      if (callback.call(thisArg, tmp.value, i, thisArg)) {
        this._cursor = tmp;
        this._eof = false;

        return tmp.value;
      }

      tmp = tmp.next;
    }

    this._cursor = undefined;
  }

  /**
   * Executes a provided function once for each list element (from left to right)
   *
   * @param {Function} callback - Function to execute for each element
   * @param {*} [thisArg] - Value to use as this when executing callback
   * @public
   */
  forEach(callback, thisArg) {
    this.every((element, index, instance) => {
      callback.call(this, element, index, instance);

      return true;
    }, thisArg);
  }

  /**
   * Executes a provided function once for each list element (from right-to-left)
   *
   * @param {Function} callback - Function to execute for each element
   * @param {*} [thisArg] - Value to use as this when executing callback
   * @public
   */
  forEachRight(callback, thisArg) {
    this.everyRight((element, index, instance) => {
      callback.call(this, element, index, instance);

      return true;
    }, thisArg);
  }

  /**
   * Determines whether an list includes a certain element,
   * returning true or false as appropriate
   *
   * @param {*} searchElement - The element to search for
   * @param {int} [fromIndex = 0] - The position in this list at which to begin searching for searchElement
   * @return {Boolean} - true if the searchElement found in the list; otherwise, false
   * @public
   */
  includes(searchElement, fromIndex) {
    const sameValueZero = (x, y) => {
      return (
        x === y ||
        (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y))
      );
    };

    fromIndex = fromIndex || 0;

    if (fromIndex < 0) fromIndex = this.length + fromIndex;

    this.find(
      (element, index) =>
        index >= fromIndex && sameValueZero(element, searchElement)
    );

    return !!this.cursor;
  }

  /**
   * Adds one or more elements right after the cursor node of the list and returns
   * the new length of the list
   *
   * @param {*} element... - The elements to add after cursor node
   * @returns {int} - The new length of the list
   * @public
   */
  insert(...element) {
    for (const arg of element) {
      const node = new Node(this, arg);

      if (this._length) {
        this._cursor.next = node;
        node.prev = this._cursor;
        this._cursor = node;
      } else {
        this._head = node;
        this._tail = node;
        this._cursor = node;
      }

      this._length++;
      this._eof = false;
    }

    return this._length;
  }

  /**
   * Joins all elements of the list into a string and returns this string
   *
   * @param {String} [separator=','] - Specifies a string to separate each pair of adjacent elements of the list
   * @return {String} - A string with all list elements joined. If length is 0, the empty string is returned
   * @public
   */
  join(separator) {
    separator = separator || ',';

    let out = '';

    this.forEach((value) => {
      out += (out ? separator : '') + value;
    });

    return out;
  }

  /**
   * Creates a new list with the results of calling a provided function on
   * every element in the calling list
   *
   * @param {Function} callback - Function that produces an element of the new list
   * @return {DoublyLinked} - A new list with each element being the result of the callback function
   * @public
   */
  map(callback) {
    if (typeof callback !== 'function')
      throw new TypeError('You must provide a function as first argument');

    const out = new DoublyLinked();

    this.forEach((value, index, instance) =>
      out.push(callback(value, index, instance))
    );

    return out.reset();
  }

  /**
   * Moves cursor to the next and returns its value
   *
   * @return {*} - Returns value of next node to the cursor. If cursor reaches to the end it returns undefined
   * @public
   */
  next() {
    if (this._cursor === this._tail) {
      this._eof = true;

      return undefined;
    }

    const c = this._cursor ? this._cursor.next : this._head;

    this._cursor = c;

    return c && c.value;
  }

  /**
   * Moves cursor to the previous and returns its value
   *
   * @return {*} - Returns value of previous node to the cursor. If cursor reaches to the head it returns undefined
   * @public
   */
  prev() {
    let c;

    if (this._eof) {
      this._eof = false;
      c = this._cursor = this._tail;

      return c && c.value;
    }

    c = this._cursor && this._cursor.prev;
    this._cursor = c;

    return c && c.value;
  }

  /**
   * Removes the last element from the list and returns that element
   *
   * @returns {*} - The removed element from the list; undefined if the list is empty.
   * @public
   */
  pop() {
    const ret = this._tail;

    if (ret) {
      ret.remove();

      return ret.value;
    }
  }

  /**
   * Adds one or more elements to the end of the list and returns
   * the new length of the list
   *
   * @param {*} element... - The elements to add to the end of the list
   * @returns {int} - The new length of the list
   * @public
   */
  push(...element) {
    if (element.length) this._eof = false;

    for (const arg of element) {
      const node = new Node(this, arg);

      if (this._length) {
        this._tail.next = node;
        node.prev = this._tail;
        this._tail = node;
      } else {
        this._head = node;
        this._tail = node;
      }

      this._length++;
    }

    return this._length;
  }

  /**
   * Applies a function against an accumulator and each element in
   * the list (from left-to-right) to reduce it to a single value
   *
   * @param {Function} callback - Function to execute on each element in the list
   * @param {*} [initialValue] - Value to use as the first argument to the first call of the callback
   * @return {*} - The value that results from the reduction
   * @public
   */
  reduce(callback, initialValue) {
    if (typeof callback !== 'function')
      throw new TypeError('You must provide a function as first argument');

    let accumulator = initialValue;

    this.forEach((value, index) => {
      accumulator = callback(accumulator, value, index, this);
    });

    return accumulator;
  }

  /**
   * Applies a function against an accumulator and each element in
   * the list (from right-to-left) to reduce it to a single value
   *
   * @param {Function} callback - Function to execute on each element in the list
   * @param {*} [initialValue] - Value to use as the first argument to the first call of the callback
   * @return {*} - The value that results from the reduction
   * @public
   */
  reduceRight(callback, initialValue) {
    if (typeof callback !== 'function')
      throw new TypeError('You must provide a function as first argument');

    let accumulator = initialValue;

    this.forEachRight((value, index) => {
      accumulator = callback(accumulator, value, index, this);
    });

    return accumulator;
  }

  /**
   * Removes an element from the list
   *
   * @param {*} element - The element to be removed
   * @param {int} [fromIndex = 0] - The position in this list at which to begin searching for element
   * @return {*} - Returns removed element if found, undefined otherwise
   * @public
   */
  remove(element, fromIndex) {
    if (this.includes(element, fromIndex)) {
      const cur = this._cursor;

      cur.remove();

      return cur.value;
    }
  }

  /**
   * Resets cursor to head
   *
   * @return {DoublyLinked} - Returns the DoublyLinked instance which this method is called
   * @public
   */
  reset() {
    this._cursor = undefined;
    this._eof = false;

    return this;
  }

  /**
   * Reverses a list in place. The first array element becomes the last, and the last list element becomes the first.
   *
   * @return {DoublyLinked} - Returns the DoublyLinked instance which this method is called
   * @public
   */
  reverse() {
    let cur = this._head;
    let p, n;

    for (let i = 0; i < this._length; i++) {
      p = cur.prev;
      n = cur.next;
      cur.prev = n;
      cur.next = p;
      cur = n;
    }

    p = this._head;
    n = this._tail;
    this._head = n;
    this._tail = p;
    this.reset();

    return this;
  }

  /**
   * Removes the first element from the list and returns that element
   *
   * @returns {*} - The removed element from the list; undefined if the list is empty
   * @public
   */
  shift() {
    const ret = this._head;

    if (ret) {
      ret.remove();

      return ret.value;
    }
  }

  /**
   * Returns a shallow copy of a portion of an array into a new array object
   * selected from start to end (end not included) where start and
   * end represent the index of items in that array.
   *
   * @param {number} [start]
   * @param {number} [end]
   * @returns {Array}
   * @public
   */
  slice(start, end) {
    start = start || 0;

    const acc = [];

    this.every((value, index) => {
      if (index >= start) acc.push(value);

      return !end || index < end;
    });

    return acc;
  }

  /**
   * Tests whether all elements in the list pass the test implemented by
   * the provided function (from left to right)
   *
   * @param {Function} callback - Function to test for each element
   * @param {*} [thisArg] - Value to use as this when executing callback
   * @public
   */
  some(callback, thisArg) {
    return !this.every(
      (element, index, instance) =>
        !callback.call(this, element, index, instance),
      thisArg
    );
  }

  /**
   * Tests whether at least one element in the list passes the test
   * implemented by the provided function (from right to left)
   *
   * @param {Function} callback - Function to test for each element
   * @param {*} [thisArg] - Value to use as this when executing callback
   * @public
   */
  someRight(callback, thisArg) {
    return !this.everyRight(
      (element, index, instance) =>
        !callback.call(this, element, index, instance),
      thisArg
    );
  }

  /**
   * Returns a new array containing elements of the list
   *
   * @return {Array} - A new Array instance contains elements of the list
   * @public
   */
  toArray() {
    return this.slice();
  }

  /**
   * Returns a string representing the specified list and its elements.
   * @return {string} - Returns a string representing the specified list and its elements.
   */
  toString() {
    return 'DoublyLinked(' + this.join() + ')';
  }

  /**
   * Adds one or more elements to the beginning of the list
   * the new length of the list
   *
   * @param {*} element... - The elements to add to the front of the list
   * @returns {int} - The new length of the list
   * @public
   */
  unshift(...element) {
    for (const arg of element) {
      const node = new Node(this, arg);

      if (this._length) {
        this._head.prev = node;
        node.next = this._head;
        this._head = node;
      } else {
        this._head = node;
        this._tail = node;
      }

      this._length++;
    }

    return this._length;
  }

  /**
   * Returns the iterator object contains entries
   *
   * @return {Object} - Returns the iterator object contains entries
   */
  [Symbol.iterator]() {
    let _cursor;

    return {
      next: () => {
        _cursor = _cursor ? _cursor.next : this.head;

        return {
          value: _cursor && _cursor.value,
          done: !_cursor
        };
      }
    };
  }
}

/**
 *
 * @constructor
 */
class Node {
  constructor(list, value) {
    this.list = list;
    this.value = value;
    this.prev = undefined;
    this.next = undefined;
  }

  remove() {
    if (!this.list) return;

    if (this.prev)
      // noinspection JSUnresolvedVariable
      this.prev.next = this.next;

    if (this.next)
      // noinspection JSUnresolvedVariable
      this.next.prev = this.prev;

    if (this === this.list._cursor) this.list._cursor = this.next || this.prev;

    if (this === this.list._head) this.list._head = this.next;

    if (this === this.list._tail) this.list._tail = this.prev;

    this.list._length--;
    this.prev = undefined;
    this.next = undefined;
    this.list = undefined;
  }
}

/* putil-taskqueue
 ------------------------
 (c) 2017-present Panates
 This library may be freely distributed under the MIT license.
 For details and documentation:
 https://github.com/panates/putil-taskqueue
 */
export class TaskQueue extends EventEmitter {
  /**
   *
   * @param {Object} [options]
   * @param {int} [options.maxQueue]
   * @constructor
   */
  constructor(options) {
    super();
    this._queue = new DoublyLinked();
    this.maxQueue = options && options.maxQueue;
    this.paused = false;
  }

  /**
   *
   * @return {int}
   */
  get size() {
    return this._queue.length + (this._taskRunning ? 1 : 0);
  }

  /**
   *
   */
  pause() {
    this.paused = true;
  }

  /**
   *
   */
  resume() {
    this.paused = false;
    setImmediate(() => this._next());
  }

  /**
   *
   * @param {Function} task Adds new task to the execute queue
   * @param {boolean} [first] Adds new task to first location in queue
   * @return {Promise}
   */
  enqueue(task, first) {
    return new Promise((resolve, reject) => {
      if (this.maxQueue && this.size >= this.maxQueue)
        throw new Error('Queue limit exceeded.');

      this.emit('enqueue', task);

      const executor = () => {
        let resolved;
        const handleCallback = (err, result) => {
          /* istanbul ignore next */
          if (resolved) return;

          resolved = true;
          this._taskRunning = null;

          if (err) {
            reject(err);

            if (this.listenerCount('error') > 0) this.emit('error', err);
          } else {
            this.emit('task-complete', task);
            resolve(result);
          }

          if (!this._queue.length) this.emit('finish');
          else setImmediate(() => this._next());
        };

        try {
          const o = task(handleCallback);

          if (task.length === 0) {
            if (
              typeof o === 'object' &&
              typeof o.then === 'function' &&
              typeof o.catch === 'function'
            ) {
              o.then((x) => handleCallback(null, x)).catch((e) =>
                handleCallback(e || 'Rejected')
              );

              return;
            }
          }

          handleCallback(null, o);
        } catch (e) {
          handleCallback(e);
        }
      };

      if (first) this._queue.unshift(executor);
      else this._queue.push(executor);

      setImmediate(() => this._next());
    });
  }

  /**
   * Executes next task
   * @private
   */
  _next() {
    if (this._taskRunning || this.paused) return;

    this._taskRunning = this._queue.shift();

    if (this._taskRunning) this._taskRunning();
  }

  /**
   *
   */
  clear() {
    this._queue = new DoublyLinked();
  }
}
