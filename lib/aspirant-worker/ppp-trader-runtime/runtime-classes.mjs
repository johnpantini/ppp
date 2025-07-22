export class RemoteSource {
  bus = new globalThis.EventBus();

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

// URL-based traders may only load URL-based traders. The trader has to be initialized earlier.
export class RemoteAWTraderRuntime {
  document;

  // Aspirant Worker URL.
  #awUrl;

  #awConnection;

  #awReconnectionTimeout;

  #pendingAWConnection;

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
    this.$$rawtr = globalThis.ppp.$debug('rawtr').extend(document._id);
    this.$$rawtrMessage = globalThis.ppp.$debug('rawtrm').extend(document._id);

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

      this.$$rawtr('[%s] #awUrl is: %s', document.name, this.#awUrl);
    }
  }

  async #connectToURLTraderFromAspirantWorker(reconnect) {
    this.$$rawtr(
      '[%s] #connectToURLTraderFromAspirantWorker, reconnect: %s',
      this.document.name,
      !!reconnect
    );

    if (this.#awConnection?.readyState === WebSocket.OPEN) {
      return this.#awConnection;
    } else if (this.#pendingAWConnection && !reconnect) {
      return this.#pendingAWConnection;
    } else {
      this.#pendingAWConnection = new Promise((resolve) => {
        this.#awConnection = new WebSocket(this.#awUrl);

        this.#awConnection.onWebSocketOpen = () => {
          if (reconnect) {
            this.$$rawtr('[%s] resubscribing on reconnect', this.document.name);
            this.resubscribe();
          }
        };

        this.#awConnection.addEventListener(
          'open',
          this.#awConnection.onWebSocketOpen
        );

        this.#awConnection.onWebSocketClose = async () => {
          this.#awConnection.removeEventListener(
            'open',
            this.#awConnection.onWebSocketOpen
          );
          this.#awConnection.removeEventListener(
            'close',
            this.#awConnection.onWebSocketClose
          );
          this.#awConnection.removeEventListener(
            'error',
            this.#awConnection.onWebSocketError
          );
          this.#awConnection.removeEventListener(
            'message',
            this.#awConnection.onWebSocketMessage
          );

          const timeout = this.#getAWReconnectionTimeout();

          this.$$rawtr(
            '[%s] onWebSocketClose reconnect, timeout: %d',
            this.document.name,
            timeout
          );

          await later(timeout);
          resolve(this.#connectToURLTraderFromAspirantWorker(true));
        };

        this.#awConnection.addEventListener(
          'close',
          this.#awConnection.onWebSocketClose
        );

        this.#awConnection.onWebSocketError = (event) => {
          this.$$rawtr(
            '[%s] onWebSocketError with event: %o',
            this.document.name,
            event
          );
          this.#awConnection.close();
        };

        this.#awConnection.addEventListener(
          'error',
          this.#awConnection.onWebSocketError
        );

        this.#awConnection.onWebSocketMessage = async ({ data }) => {
          const messages = JSON.parse(data);

          if (Array.isArray(messages)) {
            for (const payload of messages) {
              if (payload.T === 'ready') {
                this.$$rawtrMessage('[%s] is ready', this.document.name);

                return resolve(this.#awConnection);
              } else if (
                payload.T === 'success' &&
                payload.msg === 'connected'
              ) {
                this.$$rawtrMessage(
                  '[%s] connected, sending connack...',
                  this.document.name
                );

                return this.#awConnection.send(
                  JSON.stringify({
                    T: 'connack',
                    _id: this.document._id,
                    name: this.document.name
                  })
                );
              } else if (payload.T === 'assign') {
                // this.$$rawtrMessage(
                //   '[%s] assign: %s = %o',
                //   this.document.name,
                //   payload.field,
                //   payload.value
                // );

                const source = this.#awSources.get(payload.sourceID);

                if (source?.sourceID === payload.sourceID) {
                  source[payload.field] = payload.value;
                }
              }
            }
          }
        };

        this.#awConnection.addEventListener(
          'message',
          this.#awConnection.onWebSocketMessage
        );
      });

      return this.#pendingAWConnection;
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

  async subscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      if (typeof datum === 'string') {
        await this.subscribeField({ source, field, datum });
      } else if (typeof datum === 'object') {
        await this.subscribeField({
          source,
          field,
          datum: datum.datum
        });
      }
    }
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

  async unsubscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.unsubscribeField({ source, field, datum });
    }
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

export class RemoteAWTraders {
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

globalThis.ppp ??= new (class {
  traders = new RemoteAWTraders();

  async getOrCreateTrader(document) {
    return this.traders.getOrCreateTrader(document);
  }

  async fetch(url, options) {
    return globalThis.fetch(url, options);
  }
})();

globalThis.sessionStorage ??= new (class {
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

function stripDocument(document = {}) {
  return {
    name: document.name,
    type: document.type
  };
}

export function onRuntimeWebSocketOpen(ws) {
  this.$$ws('new WebSocket connection');

  this.wsSources.set(ws, new Map());
  ws.send(JSON.stringify([{ T: 'success', msg: 'connected' }]));
}

export function onRuntimeWebSocketDrain(ws) {
  this.$$ws('slow client: %o', ws);
}

export async function onRuntimeWebSocketClose(ws) {
  ws.closed = true;

  if (ws.trader && this.wsSources.has(ws)) {
    for (const [sourceID, source] of this.wsSources.get(ws)) {
      for (const datum in ws.trader.datums) {
        const sources = ws.trader.datums[datum].sources[datum];

        if (sources.has(source)) {
          await ws.trader.unsubscribeField({ source, datum });
        }
      }
    }

    this.wsSources.delete(ws);
    this.$$ws(
      'WebSocket connection closed: %o',
      stripDocument(ws.trader.document)
    );

    ws.trader = null;
  } else {
    this.$$ws('WebSocket connection closed');
  }
}

export async function trinityResponseToObject(response) {
  const zip = globalThis.zip;
  const reader = new zip.ZipReader(new zip.BlobReader(await response.blob()));
  const entries = await reader.getEntries();

  for (const entry of entries) {
    if (entry.filename === 'trinity.json') {
      const json = await entry.getData(new zip.TextWriter());

      if (json) {
        return JSON.parse(json);
      }
    }
  }

  return {};
}

export async function onRuntimeWebSocketMessage(ws, message) {
  try {
    const payload = JSON.parse(Buffer.from(message).toString());

    if (payload.T === 'connack') {
      if (!payload._id) {
        this.$$server('missing payload _id');

        return ws.send(
          JSON.stringify([
            { T: 'error', code: 422, msg: 'missing payload _id.' }
          ])
        );
      }

      if (payload.trinityUrl) {
        this.$$server(
          'saving trinityUrl %s for %s',
          payload.trinityUrl,
          payload._id
        );
        await this.redis.hset(
          this.getFullKey('trinity'),
          payload._id,
          payload.trinityUrl
        );
        this.$$server('trinityUrl saved for %s', payload._id);
      }

      const existingTrader = this.traders.get(payload._id);

      if (typeof existingTrader !== 'undefined' && existingTrader !== true) {
        ws.trader = existingTrader;

        if (payload.trinityUrl) {
          // Reload instruments.
          const trinityResponse = await fetch(payload.trinityUrl);

          if (trinityResponse.ok) {
            const { instruments } = await trinityResponseToObject.call(
              this,
              trinityResponse
            );

            await ws.trader.instrumentsArrived?.(new Map(instruments));
            ws.trader.$$debug('instruments reloaded');
          } else {
            ws.trader.$$debug(
              'trinityResponse failed (reloading): %o',
              trinityResponse
            );
          }
        }

        if (!ws.closed) {
          ws.send(JSON.stringify([{ T: 'ready' }]));
          ws.trader.$$debug(
            'trader is ready on connack: %o',
            stripDocument(ws.trader.document)
          );
        }
      } else {
        // Create a stub.
        this.traders.set(payload._id, true);

        // No trader here, trinity document is needed.
        const trinityUrl = await this.redis.hget(
          this.getFullKey('trinity'),
          payload._id
        );

        if (trinityUrl) {
          this.$$server(
            'retrieved cached trinityUrl %s for %s',
            trinityUrl,
            payload._id
          );

          const trinityResponse = await fetch(trinityUrl);

          if (trinityResponse.ok) {
            const { document, code, instruments } =
              await trinityResponseToObject.call(this, trinityResponse);

            if (document && code && instruments) {
              let traderToUse = this.traders.get(document._id);

              if (typeof traderToUse === 'undefined' || traderToUse === true) {
                let instanceType;

                globalThis.pppTraderInstanceForWorkerRecv = (i) =>
                  (instanceType = i);

                try {
                  globalThis.vm.runInThisContext(code, {
                    filename: document._id,
                    importModuleDynamically:
                      constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
                  });
                } finally {
                  globalThis.pppTraderInstanceForWorkerRecv = null;
                }

                const trader = new instanceType(document);

                this.traders.set(document._id, trader);
                traderToUse = trader;

                trader.$$debug ??= globalThis.ppp.$debug(
                  document._id.slice(-4)
                );
                trader.$$connection ??= trader.$$debug.extend('connection');
                trader.$$rpc ??= trader.$$debug.extend('rpc');
                trader.$$rpc.log = console.log.bind(console);

                if (
                  typeof trader.oneTimeInitializationCallback === 'function' &&
                  !trader.oneTimeInitializationCallbackCalled
                ) {
                  trader.oneTimeInitializationCallbackCalled = true;

                  trader.$$rpc(
                    'calling instrumentsArrived() for %o',
                    stripDocument(trader.document)
                  );

                  await trader.instrumentsArrived?.(new Map(instruments));

                  trader.$$rpc(
                    'calling oneTimeInitializationCallback() for %o',
                    stripDocument(trader.document)
                  );
                  await trader.oneTimeInitializationCallback();
                  trader.$$rpc(
                    'oneTimeInitializationCallback() called for %o',
                    stripDocument(trader.document)
                  );
                }
              }

              if (!ws.closed) {
                ws.trader = traderToUse;

                ws.send(JSON.stringify([{ T: 'ready' }]));
                ws.trader.$$debug(
                  'trader is ready after creation: %o',
                  stripDocument(ws.trader.document)
                );
              }
            } else {
              this.$$server.$$debug('invalid trinityResponse', payload._id);

              if (!ws.closed) {
                ws.send(
                  JSON.stringify([
                    { T: 'error', code: 422, msg: 'invalid trinity payload.' }
                  ])
                );
              }
            }
          } else {
            this.$$server.$$debug(
              'trinityResponse failed (new trader %s): %o',
              payload._id,
              trinityResponse
            );
          }
        } else {
          this.$$server('missing trinityUrl');

          if (!ws.closed) {
            ws.send(
              JSON.stringify([
                { T: 'error', code: 422, msg: 'missing trinityUrl.' }
              ])
            );
          }
        }
      }
    } else if (payload.T === 'rpc') {
      if (!ws.trader) {
        this.$$server('the trader has not been initialized yet');

        return ws.send(
          JSON.stringify([
            { T: 'error', code: 404, msg: 'trader not initialized.' }
          ])
        );
      }

      try {
        // ws.trader.$$rpc(
        //   'calling rpc method %s for %o',
        //   payload.method,
        //   stripDocument(ws.trader.document)
        // );

        let response = await ws.trader[payload.method](...payload.args);

        if (typeof response?.serialize === 'function') {
          response = response.serialize();
        }

        // if (JSON.stringify(response)?.length >= 512) {
        //   ws.trader.$$rpc(
        //     'rpc method %s called, response is too long',
        //     payload.method
        //   );
        // } else {
        //   ws.trader.$$rpc(
        //     'rpc method %s called with response %o',
        //     payload.method,
        //     response
        //   );
        // }

        !ws.closed &&
          ws.send(
            JSON.stringify([
              {
                T: `rpc-${payload.rid}`,
                response
              }
            ])
          );
      } catch (exception) {
        ws.trader.$$rpc(
          'rpc exception %o from trader %o',
          ws.trader.formatException(exception),
          stripDocument(ws.trader.document)
        );

        !ws.closed &&
          ws.send(
            JSON.stringify([
              {
                T: `rpc-${payload.rid}`,
                exception: exception.serialize?.() ?? {
                  name: exception.name ?? 'RemoteTraderError',
                  args: {
                    details: exception.details ?? {},
                    message: exception.message
                  }
                }
              }
            ])
          );
      }
    } else if (payload.T === 'subscribe-field') {
      const sm = this.wsSources.get(ws);
      let source = sm?.get(payload.sourceID);

      if (!source) {
        source = new RemoteSource(
          payload.sourceID,
          payload.canChangeInstrument,
          ws
        );

        sm.set(payload.sourceID, source);
      }

      source.ws = ws;

      if (source && ws.trader) {
        // ws.trader.$$debug(
        //   'subscribe-field request for %o with payload %o',
        //   stripDocument(ws.trader.document),
        //   {
        //     field: payload.field,
        //     sourceID: payload.sourceID
        //   }
        // );

        try {
          await ws.trader.subscribeField({
            source,
            field: payload.field,
            datum: payload.datum
          });
        } catch (exception) {
          ws.trader.$$debug(
            'subscribeField exception %o for trader %o',
            ws.trader.formatException(exception),
            stripDocument(ws.trader.document)
          );
          !ws.closed &&
            ws.send(
              JSON.stringify([
                {
                  T: 'subscription-exception',
                  sourceKey: `${payload.sourceID}:${payload.field}`,
                  exception: exception.serialize?.() ?? {
                    name: exception.name ?? 'RemoteTraderError',
                    args: {
                      details: exception.details ?? {},
                      message: exception.message
                    }
                  }
                }
              ])
            );
        }
      } else if (!ws.closed) {
        if (!ws.trader) {
          ws.send(
            JSON.stringify([
              {
                T: 'error',
                code: 400,
                msg: 'subscribe-field failed, no trader',
                d: {
                  sid: payload.sourceID
                }
              }
            ])
          );
        } else if (!source) {
          ws.send(
            JSON.stringify([
              {
                T: 'error',
                code: 400,
                msg: 'subscribe-field failed, no source',
                d: {
                  sid: payload.sourceID
                }
              }
            ])
          );
        }
      }
    } else if (payload.T === 'unsubscribe-field') {
      const sm = this.wsSources.get(ws);
      const source = sm?.get(payload.sourceID);

      if (source && ws.trader) {
        // ws.trader.$$debug(
        //   'unsubscribe-field request for %o with payload %o',
        //   stripDocument(ws.trader.document),
        //   {
        //     field: payload.field,
        //     sourceID: payload.sourceID
        //   }
        // );
        ws.trader.unsubscribeField({
          source,
          field: payload.field,
          datum: payload.datum
        });
      } else if (!ws.closed) {
        if (!ws.trader) {
          ws.send(
            JSON.stringify([
              {
                T: 'error',
                code: 400,
                msg: 'unsubscribe-field failed, no trader',
                d: {
                  sid: payload.sourceID
                }
              }
            ])
          );
        } else if (!source) {
          ws.send(
            JSON.stringify([
              {
                T: 'error',
                code: 400,
                msg: 'unsubscribe-field failed, no source',
                d: {
                  sid: payload.sourceID
                }
              }
            ])
          );
        }
      }
    } else if (payload.T === 'source-changed') {
      const sm = this.wsSources.get(ws);
      let source = sm?.get(payload.sourceID);

      if (!source) {
        source = new RemoteSource(
          payload.sourceID,
          payload.canChangeInstrument,
          ws
        );

        sm.set(payload.sourceID, source);
      }

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
      if (ws.trader) {
        // ws.trader.$$debug(
        //   'resubscribe request for %o',
        //   stripDocument(ws.trader.document)
        // );
        ws.trader.resubscribe(payload.onlyForDatums ?? []);
      }
    } else if (payload.T === 'terminate') {
      if (ws.trader) {
        ws.trader.$$debug(
          'terminate request for %o',
          stripDocument(ws.trader.document)
        );

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
    this.$$ws('onmessage error: %o', e);

    !ws.closed &&
      ws.send(
        JSON.stringify([{ T: 'error', code: 400, msg: 'invalid syntax' }])
      );
  }
}
