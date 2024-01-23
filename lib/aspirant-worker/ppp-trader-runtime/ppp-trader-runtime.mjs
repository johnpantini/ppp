// ==PPPScript==
// @version 3
// @meta {"enableHttp":true,"env":"{\n  USER_AGENT: '[%#navigator.userAgent%]'\n}"}
// ==/PPPScript==

import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { WebSocket } from '/ppp/vendor/websocket/websocket.mjs';
import uWS from '/ppp/vendor/uWebSockets.js/uws.js';
import Redis from '/ppp/vendor/ioredis.min.js';

class EventBus {
  #eventHandlers = {};

  isValidType(type) {
    return typeof type === 'string';
  }

  isValidHandler(handler) {
    return typeof handler === 'function';
  }

  on(type, handler) {
    if (!type || !handler) return false;

    if (!this.isValidType(type)) return false;

    if (!this.isValidHandler(handler)) return false;

    let handlers = this.#eventHandlers[type];

    if (!handlers) handlers = this.#eventHandlers[type] = [];

    if (handlers.indexOf(handler) >= 0) return false;

    handler._once = false;
    handlers.push(handler);

    return true;
  }

  once(type, handler) {
    if (!type || !handler) return false;

    if (!this.isValidType(type)) return false;

    if (!this.isValidHandler(handler)) return false;

    const ret = this.on(type, handler);

    if (ret) {
      handler._once = true;
    }

    return ret;
  }

  off(type, handler) {
    if (!type) return this.offAll();

    if (!handler) {
      this.#eventHandlers[type] = [];

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

        break;
      }
    }
  }

  offAll() {
    this.#eventHandlers = {};
  }

  emit(type, data) {
    if (!type || !this.isValidType(type)) return;

    const handlers = this.#eventHandlers[type];

    if (!handlers || !handlers.length) return;

    const event = this.createEvent(type, data);

    for (const handler of handlers) {
      if (!this.isValidHandler(handler)) continue;

      if (handler._once) event.once = true;

      handler(event);

      if (event.once) this.off(type, handler);
    }
  }

  has(type, handler) {
    if (!type || !this.isValidType(type)) return false;

    const handlers = this.#eventHandlers[type];

    if (!handlers || !handlers.length) return false;

    if (!handler || !this.isValidHandler(handler)) return true;

    return handlers.indexOf(handler) >= 0;
  }

  getHandlers(type) {
    if (!type || !this.isValidType(type)) return [];

    return this.#eventHandlers[type] || [];
  }

  createEvent(type, data, once = false) {
    return { type, detail: data, timestamp: Date.now(), once };
  }
}

globalThis.vm = vm;
globalThis.https = https;
globalThis.EventBus = EventBus;
globalThis.module = {};
globalThis.WebSocket = WebSocket;
globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = path.dirname(globalThis.__filename);
globalThis.navigator = {
  userAgent: process.env.USER_AGENT
};

// URL-based traders may only load URL-based traders. The trader has to be initialized earlier.
class RemoteAWTraderRuntime {
  document;

  // Aspirant Worker URL.
  #awUrl;

  #awConnection;

  #awReconnectionTimeout;

  #pendingAWConnectionPromise;

  // For looking up sources by sourceID.
  #awSources = new Map();

  #getAWReconnectionTimeout() {
    if (typeof this.#awReconnectionTimeout === 'undefined') {
      this.#awReconnectionTimeout = 100;
    } else {
      this.#awReconnectionTimeout += 100;

      if (this.#awReconnectionTimeout > 500) {
        this.#awReconnectionTimeout = 500;
      }
    }

    return this.#awReconnectionTimeout;
  }

  constructor(document) {
    this.document = document;

    if (this.document.runtime === 'url') {
      const runtimeUrl = new URL(this.document.runtimeUrl);

      if (runtimeUrl.protocol === 'http:') {
        runtimeUrl.protocol = 'ws:';
      } else {
        runtimeUrl.protocol = 'wss:';
      }

      this.#awUrl = new URL(runtimeUrl).toString();

      if (process.env.DOCKERIZED && !process.env.SYSTEMD_EXEC_PID) {
        this.#awUrl = this.#awUrl
          .replace('localhost', 'host.docker.internal')
          .replace('127.0.0.1', 'host.docker.internal');
      }
    }
  }

  async #connectToURLTraderFromAspirantWorker(reconnect) {
    if (this.#awConnection?.readyState === WebSocket.OPEN) {
      this.#pendingAWConnectionPromise = void 0;

      return this.#awConnection;
    } else if (this.#pendingAWConnectionPromise) {
      return this.#pendingAWConnectionPromise;
    } else {
      return (this.#pendingAWConnectionPromise = new Promise((resolve) => {
        if (!reconnect && this.#awConnection) {
          resolve(this.#awConnection);
        } else {
          this.#awConnection = new WebSocket(this.#awUrl);

          this.#awConnection.onclose = async () => {
            await later(this.#getAWReconnectionTimeout());

            this.#pendingAWConnectionPromise = void 0;

            return this.#connectToURLTraderFromAspirantWorker(true);
          };
          this.#awConnection.onerror = () => this.#awConnection.close();
          this.#awConnection.onmessage = ({ data }) => {
            const messages = JSON.parse(data);

            if (Array.isArray(messages)) {
              for (const payload of messages) {
                if (payload.T === 'ready') {
                  return resolve(this.#awConnection);
                } else if (
                  payload.T === 'success' &&
                  payload.msg === 'connected'
                ) {
                  return this.#awConnection.send(
                    JSON.stringify({
                      T: 'connack',
                      _id: this.document._id
                    })
                  );
                } else if (payload.T === 'assign') {
                  const source = this.#awSources.get(payload.sourceID);

                  if (source?.sourceID === payload.sourceID) {
                    source[payload.field] = payload.value;
                  }
                }
              }
            }
          };
        }
      }));
    }
  }

  async subscribeField({ source, field, datum }) {
    if (this.document.runtime !== 'url') {
      return;
    }

    await this.#connectToURLTraderFromAspirantWorker();

    this.#awConnection.send(
      JSON.stringify({
        T: 'source-changed',
        sourceID: source.sourceID,
        reason: 'instrument',
        oldValue: null,
        newValue: source.instrument,
        canChangeInstrument: source.canChangeInstrument,
        doNotFire: true
      })
    );

    this.#awSources.set(source.sourceID, source);

    return this.#awConnection.send(
      JSON.stringify({
        T: 'subscribe-field',
        sourceID: source.sourceID,
        field,
        datum,
        canChangeInstrument: source.canChangeInstrument
      })
    );
  }

  async unsubscribeField({ source, field, datum }) {
    if (this.document.runtime !== 'url') {
      return;
    }

    await this.#connectToURLTraderFromAspirantWorker();

    return this.#awConnection.send(
      JSON.stringify({
        T: 'unsubscribe-field',
        sourceID: source.sourceID,
        field,
        datum
      })
    );
  }

  async resubscribe(onlyForDatums = []) {
    if (this.document.runtime !== 'url') {
      return;
    }

    await this.#connectToURLTraderFromAspirantWorker();

    return this.#awConnection.send(
      JSON.stringify({
        T: 'resubscribe',
        onlyForDatums
      })
    );
  }

  async loadAWRemoteTrader() {
    if (this.document.runtime !== 'url') {
      return null;
    }

    await this.#connectToURLTraderFromAspirantWorker();

    return this;
  }
}

class RemoteAWTraders {
  runtimes = new Map();

  async getOrCreateTrader(document) {
    if (document) {
      if (document.runtime !== 'url') {
        return null;
      }

      if (!this.runtimes.has(document._id)) {
        this.runtimes.set(document._id, new RemoteAWTraderRuntime(document));
      }

      return this.runtimes.get(document._id).loadAWRemoteTrader();
    }
  }
}

globalThis.ppp = new (class {
  traders = new RemoteAWTraders();

  async getOrCreateTrader(document) {
    return this.traders.getOrCreateTrader(document);
  }

  async fetch(url, options) {
    return globalThis.fetch(url, options);
  }
})();

globalThis.sessionStorage = new (class {
  #storage = new Map();

  getItem(key) {
    return this.#storage.get(key);
  }

  setItem(key, value) {
    this.#storage.set(key, value);
  }

  removeItem(key) {
    this.#storage.delete(key);
  }
})();

const ROOT = process.env.DOCKERIZED ? '.' : '/ppp';
const { PPPUWSWorkerApplication, defaultRedisOptions, later } = await import(
  `${ROOT}/lib/aspirant-worker/utils.mjs`
);

class RemoteSource {
  bus = new EventBus();

  ws;

  sourceID;

  canChangeInstrument;

  constructor(sourceID, canChangeInstrument, ws) {
    this.sourceID = sourceID;
    this.canChangeInstrument = !!canChangeInstrument;
    this.ws = ws;
  }

  instrument;

  attributes = new Map();

  getAttribute(attribute) {
    return this.attributes.get(attribute);
  }

  addEventListener(event, listener) {
    return this.bus.on(event, listener);
  }

  removeEventListener(event, listener) {
    return this.bus.off(event, listener);
  }
}

class PPPTraderRuntime extends PPPUWSWorkerApplication {
  #app = uWS.App({});

  traders = new Map();

  redis = new Redis(defaultRedisOptions());

  sources = new Map();

  // Use this map when ws's 'close' event is triggered to unsubscribe.
  wsSources = new WeakMap();

  async main() {
    const worker = this;

    this.#app
      .ws('/*', {
        idleTimeout: 60,
        maxPayloadLength: 1024 ** 3,
        maxBackpressure: 1024 ** 3,
        open: (ws) => {
          this.wsSources.set(ws, new Set());
          ws.send(JSON.stringify([{ T: 'success', msg: 'connected' }]));
        },
        close: async (ws) => {
          ws.closed = true;

          if (ws.trader && this.wsSources.has(ws)) {
            for (const source of this.wsSources.get(ws)) {
              for (const datum in ws.trader.datums) {
                const sources = ws.trader.datums[datum].sources[datum];

                if (sources.has(source)) {
                  await ws.trader.unsubscribeField({ source, datum });
                }
              }
            }

            this.wsSources.delete(ws);
            ws.trader = null;
          }
        },
        message: async (ws, message) => {
          try {
            const payload = JSON.parse(Buffer.from(message).toString());

            if (payload.T === 'connack') {
              if (!payload._id) {
                return ws.send(
                  JSON.stringify([
                    { T: 'error', code: 422, msg: 'missing payload _id.' }
                  ])
                );
              }

              const existingTrader = worker.traders.get(payload._id);

              if (typeof existingTrader !== 'undefined') {
                ws.trader = existingTrader;

                ws.send(JSON.stringify([{ T: 'ready' }]));
              } else {
                ws.send(JSON.stringify([{ T: 'init' }]));
              }
            } else if (payload.T === 'trinity') {
              if (!payload.document || !payload.code || !payload.instruments) {
                return ws.send(
                  JSON.stringify([
                    { T: 'error', code: 422, msg: 'invalid trinity payload.' }
                  ])
                );
              }

              const existingTrader = worker.traders.get(payload.document._id);

              if (typeof existingTrader !== 'undefined') {
                ws.trader = existingTrader;

                ws.send(JSON.stringify([{ T: 'ready' }]));
              } else {
                let instanceType;

                globalThis.pppTraderInstanceForWorkerRecv = (i) =>
                  (instanceType = i);

                try {
                  vm.runInThisContext(payload.code, {
                    filename: payload.document._id
                  });
                } finally {
                  globalThis.pppTraderInstanceForWorkerRecv = null;
                }

                ws.trader = new instanceType(payload.document);

                worker.traders.set(payload.document._id, ws.trader);

                if (
                  typeof ws.trader.oneTimeInitializationCallback === 'function'
                ) {
                  await ws.trader.oneTimeInitializationCallback();
                }

                await ws.trader.instrumentsArrived?.(
                  new Map(payload.instruments)
                );

                !ws.closed && ws.send(JSON.stringify([{ T: 'ready' }]));
              }
            } else if (payload.T === 'rpc') {
              if (!ws.trader) {
                return ws.send(
                  JSON.stringify([
                    { T: 'error', code: 404, msg: 'trader not initialized.' }
                  ])
                );
              }

              try {
                const response = await ws.trader[payload.method](
                  ...payload.args
                );

                !ws.closed &&
                  ws.send(
                    JSON.stringify([
                      {
                        T: `rpc-${payload.requestId}`,
                        response
                      }
                    ])
                  );
              } catch (exception) {
                !ws.closed &&
                  ws.send(
                    JSON.stringify([
                      {
                        T: `rpc-${payload.requestId}`,
                        exception: exception.serialize?.() ?? {
                          name: 'RemoteTraderError',
                          args: {
                            details: exception.name,
                            message: exception.message
                          }
                        }
                      }
                    ])
                  );
              }
            } else if (payload.T === 'subscribe-field') {
              const source = worker.sources.get(payload.sourceID);

              if (source) {
                try {
                  await ws.trader.subscribeField({
                    source,
                    field: payload.field,
                    datum: payload.datum
                  });
                } catch (exception) {
                  console.error(exception);
                  !ws.closed &&
                    ws.send(
                      JSON.stringify([
                        {
                          T: 'subscription-exception',
                          sourceKey: `${payload.sourceID}:${payload.field}`,
                          exception: exception.serialize?.() ?? {
                            name: 'RemoteTraderError',
                            args: {
                              details: exception.name,
                              message: exception.message
                            }
                          }
                        }
                      ])
                    );
                }
              }
            } else if (payload.T === 'unsubscribe-field') {
              const source = worker.sources.get(payload.sourceID);

              if (source) {
                ws.trader.unsubscribeField({
                  source,
                  field: payload.field,
                  datum: payload.datum
                });
              }
            } else if (payload.T === 'source-changed') {
              if (!worker.sources.has(payload.sourceID)) {
                worker.sources.set(
                  payload.sourceID,
                  new RemoteSource(
                    payload.sourceID,
                    payload.canChangeInstrument,
                    ws
                  )
                );
              }

              worker.wsSources
                .get(ws)
                .add(worker.sources.get(payload.sourceID));

              const source = worker.sources.get(payload.sourceID);

              source.ws = ws;

              switch (payload.reason) {
                case 'attribute':
                  source.attributes.set(payload.attribute, payload.value);

                  break;
                case 'instrument':
                  source.instrument = payload.newValue;

                  if (!payload.doNotFire) {
                    source.bus.emit('instrumentchange', {
                      source,
                      oldValue: payload.oldValue,
                      newValue: payload.newValue
                    });
                  }

                  break;
              }
            } else if (payload.T === 'resubscribe') {
              ws.trader.resubscribe(payload.onlyForDatums ?? []);
            } else if (payload.T === 'terminate') {
              if (ws.trader) {
                for (const datum in ws.trader.datums) {
                  const sources = ws.trader.datums[datum].sources[datum];

                  for (const source of sources) {
                    await ws.trader.unsubscribeField({ source, datum });
                  }
                }

                this.wsSources.delete(ws);
                ws.trader = null;
              }

              !ws.closed && ws.send(JSON.stringify([{ T: 'terminated' }]));
            }
          } catch (e) {
            console.error(e);

            !ws.closed &&
              ws.send(
                JSON.stringify([
                  { T: 'error', code: 400, msg: 'invalid syntax' }
                ])
              );
          }
        }
      })
      .post('/serialize', async (res) => {
        try {
          const payload = await this.readJSONPayload(res);
          const existingTrader = this.traders.get(payload._id);

          if (typeof existingTrader !== 'undefined') {
            return this.jsonResponse(res, await existingTrader.serialize());
          } else {
            return this.jsonResponse(res, {});
          }
        } catch (e) {
          return this.errorResponse(res, e);
        }
      })
      .get('/*', (res) =>
        this.jsonResponse(res, {
          env: {
            PPP_WORKER_ID: process.env.PPP_WORKER_ID
          }
        })
      )
      .listen(
        '0.0.0.0',
        process.env.NOMAD_PORT_HTTP ?? process.env.PORT ?? 38118,
        (listenSocket) => {
          if (listenSocket) {
            console.log(
              `PPP Trader Runtime worker is listening to port ${uWS.us_socket_local_port(
                listenSocket
              )}`
            );
          } else {
            process.exit(1);
          }
        }
      );
  }
}

await new PPPTraderRuntime().main();
