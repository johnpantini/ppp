/**
 * @typedef {object} BusEvent
 * @property {string} type Event name.
 * @property {unknown} detail Payload, passed by reference.
 * @property {number} timestamp Unix time in milliseconds.
 * @property {boolean} once Whether this subscription is removed after one call.
 */

/** @typedef {(event: BusEvent) => void} EventHandler */

/** Synchronous named events with ordered, duplicate-free subscriptions. */
export class EventBus {
  /** @type {Record<string, EventHandler[]>} */
  #eventHandlers = Object.create(null);

  /** @type {Map<string, Set<EventHandler>>} */
  #onceHandlers = new Map();

  /**
   * @param {unknown} type Candidate name.
   * @returns {type is string}
   */
  isValidType(type) {
    return typeof type === 'string';
  }

  /**
   * @param {unknown} handler Candidate callback.
   * @returns {handler is EventHandler}
   */
  isValidHandler(handler) {
    return typeof handler === 'function';
  }

  /**
   * Registers a persistent callback; a duplicate leaves the subscription intact.
   * @param {string} type Nonempty event name.
   * @param {EventHandler} handler Callback invoked synchronously by emit.
   * @returns {boolean} Whether a new subscription was added.
   */
  on(type, handler) {
    if (!type || !handler) return false;

    if (!this.isValidType(type)) return false;

    if (!this.isValidHandler(handler)) return false;

    let handlers = this.#eventHandlers[type];

    if (!handlers) handlers = this.#eventHandlers[type] = [];

    if (handlers.indexOf(handler) >= 0) return false;

    handlers.push(handler);

    return true;
  }

  /**
   * Registers a callback removed before its first invocation, including reentry.
   * The same function can have independent subscriptions on different events.
   * @param {string} type Nonempty event name.
   * @param {EventHandler} handler Callback to invoke once.
   * @returns {boolean} Whether a new subscription was added.
   */
  once(type, handler) {
    if (!type || !handler) return false;

    if (!this.isValidType(type)) return false;

    if (!this.isValidHandler(handler)) return false;

    const ret = this.on(type, handler);

    if (ret) {
      let handlers = this.#onceHandlers.get(type);

      if (!handlers) {
        handlers = new Set();
        this.#onceHandlers.set(type, handlers);
      }

      handlers.add(handler);
    }

    return ret;
  }

  /**
   * Removes one subscription, all handlers for a name, or all subscriptions.
   * @param {string} [type] Omit to clear the bus.
   * @param {EventHandler} [handler] Omit to clear the named event.
   * @returns {void}
   */
  off(type, handler) {
    if (!type) return this.offAll();

    if (!handler) {
      this.#eventHandlers[type] = [];
      this.#onceHandlers.delete(type);

      return;
    }

    if (!this.isValidType(type)) return;

    if (!this.isValidHandler(handler)) return;

    const handlers = this.#eventHandlers[type];

    if (!handlers || !handlers.length) return;

    for (let i = 0; i < handlers.length; i++) {
      const fn = handlers[i];

      if (fn === handler) {
        handlers.splice(i, 1);
        this.#onceHandlers.get(type)?.delete(handler);

        break;
      }
    }
  }

  /**
   * Removes every subscription.
   * @returns {void}
   */
  offAll() {
    this.#eventHandlers = Object.create(null);
    this.#onceHandlers.clear();
  }

  /**
   * Delivers to current subscribers in registration order. New subscriptions
   * wait for the next emission; subscriptions removed during delivery are skipped.
   * @param {string} type Event name.
   * @param {unknown} [data] Payload retained by reference.
   * @returns {void}
   * @throws {Error} Propagates callback errors to the caller.
   */
  emit(type, data) {
    if (!type || !this.isValidType(type)) return;

    const handlers = this.#eventHandlers[type];

    if (!handlers || !handlers.length) return;

    for (const handler of [...handlers]) {
      if (!this.isValidHandler(handler) || !this.has(type, handler)) continue;

      const once = this.#onceHandlers.get(type)?.has(handler) ?? false;
      const event = this.createEvent(type, data, once);

      if (once) this.off(type, handler);

      handler(event);

      if (!once && event.once) this.off(type, handler);
    }
  }

  /**
   * @param {string} type Event name.
   * @param {EventHandler} [handler] Omit to check for any subscriber.
   * @returns {boolean} Whether the requested subscription exists.
   */
  has(type, handler) {
    if (!type || !this.isValidType(type)) return false;

    const handlers = this.#eventHandlers[type];

    if (!handlers || !handlers.length) return false;

    if (!handler || !this.isValidHandler(handler)) return true;

    return handlers.indexOf(handler) >= 0;
  }

  /**
   * @param {string} type Event name.
   * @returns {EventHandler[]} Registered callbacks in delivery order.
   */
  getHandlers(type) {
    if (!type || !this.isValidType(type)) return [];

    return this.#eventHandlers[type] || [];
  }

  /**
   * @param {string} type Event name.
   * @param {unknown} data Payload retained by reference.
   * @param {boolean} [once=false] Whether the receiving subscription is one-shot.
   * @returns {BusEvent} Event metadata and payload.
   */
  createEvent(type, data, once = false) {
    const event = { type, detail: data, timestamp: Date.now(), once };

    return event;
  }
}
