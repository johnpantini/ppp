import { EventEmitter } from 'node:events';
import Redis from '/ppp/vendor/ioredis.min.js';

// Kept standalone because worker deployments upload this file independently.
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

export class PPPEventEmitter extends EventEmitter {
  constructor() {
    super();

    process
      .on('uncaughtException', (error) => {
        console.error(error);
        this.emit('exception', error);
      })
      .on('unhandledRejection', (reason) => {
        console.error(reason);
        this.emit('exception', reason);
      });
  }
}

export class PPPUWSWorkerApplication extends PPPEventEmitter {
  async readJSONPayload(res) {
    return new Promise((resolve, reject) => {
      res.onAborted(() => {
        res.aborted = true;

        return resolve({});
      });

      let buffer;

      res.onData((ab, isLast) => {
        const chunk = Buffer.from(ab);

        if (isLast) {
          let json;

          if (buffer) {
            try {
              json = JSON.parse(Buffer.concat([buffer, chunk]).toString());
            } catch (e) {
              console.error(e);
              res.close();

              return reject(e);
            }

            resolve(json);
          } else {
            try {
              json = JSON.parse(chunk.toString());
            } catch (e) {
              res.close();

              return reject(e);
            }

            resolve(json);
          }
        } else if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      });
    });
  }

  jsonResponse(res, json = {}) {
    if (res.aborted) {
      return;
    }

    return res.cork(() => {
      res
        .writeStatus('200 OK')
        .writeHeader('Content-Type', 'application/json;charset=UTF-8');

      if (typeof process.env.NOMAD_PORT_HTTP === 'undefined') {
        res.writeHeader('Access-Control-Allow-Origin', '*');
        res.writeHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, OPTIONS, PUT, PATCH, DELETE'
        );
        res.writeHeader('Access-Control-Allow-Headers', '*');
      }

      res.end(
        JSON.stringify({
          ok: true,
          result: json
        })
      );
    });
  }

  errorResponse(
    res,
    error = {
      name: 'InternalServerError',
      message: 'An internal server error occurred.'
    }
  ) {
    console.error(error);

    if (res.aborted) {
      return;
    }

    return res.cork(() => {
      // noinspection JSVoidFunctionReturnValueUsed
      res
        .writeStatus('400 Bad Request')
        .writeHeader('Content-Type', 'application/json;charset=UTF-8');

      if (typeof process.env.NOMAD_PORT_HTTP === 'undefined') {
        res.writeHeader('Access-Control-Allow-Origin', '*');
        res.writeHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, OPTIONS, PUT, PATCH, DELETE'
        );
        res.writeHeader('Access-Control-Allow-Headers', '*');
      }

      res.end(
        JSON.stringify({
          ok: false,
          error: error
            ? {
                name:
                  error.name === 'Error' ? 'InternalServerError' : error.name,
                message: error.message,
                details: error.details
              }
            : null
        })
      );
    });
  }
}

export class PPPBunServerApplication extends PPPEventEmitter {
  server;

  get headers() {
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8'
    };

    if (typeof process.env.NOMAD_PORT_HTTP === 'undefined') {
      headers['Access-Control-Allow-Origin'] = '*';
      headers['Access-Control-Allow-Methods'] =
        'GET, POST, OPTIONS, PUT, PATCH, DELETE';
      headers['Access-Control-Allow-Headers'] = '*';
    }

    return headers;
  }

  async checkKnownPaths(req, url) {
    if (
      url.pathname === '/debug' &&
      typeof globalThis.ppp.$debug !== 'undefined'
    ) {
      const { namespaces } = await req.json();

      if (typeof namespaces !== 'string') {
        throw new psinaError({
          reason: 'Validation',
          code: 'E_INVALID_NAMESPACES'
        });
      }

      if (!namespaces.trim().length) {
        globalThis.ppp.$debug.disable();
      } else {
        globalThis.ppp.$debug.enable(namespaces);
      }

      return this.jsonResponse({ namespaces });
    } else if (url.pathname === '/') {
      return this.jsonResponse({
        env: {
          PPP_WORKER_ID: process.env.PPP_WORKER_ID
        }
      });
    }

    return false;
  }

  jsonResponse(json = {}) {
    return new Response(
      JSON.stringify({
        ok: true,
        result: json
      }),
      {
        headers: this.headers
      }
    );
  }

  errorResponse(
    error = {
      name: 'InternalServerError',
      message: 'An internal server error occurred.'
    }
  ) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error
          ? {
              name: error.name === 'Error' ? 'InternalServerError' : error.name,
              message: error.message,
              details: error.details
            }
          : null
      }),
      {
        headers: this.headers,
        status: 400,
        statusText: 'Bad Request'
      }
    );
  }
}

export function defaultRedisOptions() {
  return {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    tls: process.env.REDIS_TLS
      ? {
          servername: process.env.REDIS_HOST
        }
      : void 0,
    username: process.env.REDIS_USERNAME,
    db: parseInt(process.env.REDIS_DATABASE ?? '0'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    autoResubscribe: true,
    autoResendUnfulfilledCommands: true,
    retryStrategy(times) {
      return Math.min(times * 50, 1000);
    }
  };
}

export function canUseRedis() {
  return ['REDIS_HOST', 'REDIS_PORT'].every(
    (v) => typeof process.env[v] !== 'undefined'
  );
}

export async function redisCommand(command, args = []) {
  if (canUseRedis()) {
    const client = new Redis(
      Object.assign({}, defaultRedisOptions(), { lazyConnect: true })
    );

    client.on('error', (e) => {
      console.dir(e);
    });

    try {
      await client.connect();

      return client[command]?.apply(client, args);
    } catch (e) {
      console.error(e);

      return null;
    } finally {
      client.quit();
    }
  }

  return null;
}

export function equalConstTime(s1, s2) {
  if (s1.length !== s2.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < s1.length; i++) {
    result |= s1[i].charCodeAt(0) ^ s2[i].charCodeAt(0);
  }

  return result === 0;
}

export async function later(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 1000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });

  clearTimeout(id);

  return response;
}

export function isDST(currentDate = new Date()) {
  const currentYear = currentDate.getFullYear();
  const firstOfMarch = new Date(currentYear, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch =
    firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(currentYear, 2, secondSundayInMarch);
  const firstOfNovember = new Date(currentYear, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember =
    firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(currentYear, 10, firstSundayInNovember);

  return (
    currentDate.getTime() <= end.getTime() &&
    currentDate.getTime() >= start.getTime()
  );
}

export function psinaError({ reason = 'InternalServer', code, details }) {
  const e = new Error(code);

  e.name = `${reason}Error`;

  if (details) {
    e.details = details;
  }

  return e;
}
