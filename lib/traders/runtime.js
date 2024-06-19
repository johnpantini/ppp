import ppp from '../../ppp.js';
import { TRADERS } from '../const.js';
import {
  StaleInstrumentCacheError,
  NoInstrumentsError,
  TraderTrinityError
} from '../ppp-exceptions.js';
import * as Exceptions from '../ppp-exceptions.js';
import { EventBus } from '../event-bus.js';
import { uuidv4 } from '../ppp-crypto.js';
import { Trader } from './trader-worker.js';
import { later } from '../ppp-decorators.js';

export const UNIVERSAL_METHODS = [
  {
    name: 'adoptInstrument'
  },
  {
    name: 'hasCap'
  },
  {
    name: 'caps'
  },
  {
    name: 'relativeBondPriceToPrice'
  },
  {
    name: 'bondPriceToRelativeBondPrice'
  },
  {
    name: 'fixPrice'
  },
  {
    name: 'calcDistantPrice'
  },
  {
    name: 'getSymbol'
  },
  {
    name: 'instrumentsAreEqual'
  },
  {
    name: 'getBroker'
  },
  {
    name: 'getDictionary'
  },
  {
    name: 'getExchange'
  },
  {
    name: 'getObservedAttributes'
  },
  {
    name: 'getInstrumentIconUrl'
  },
  {
    name: 'getTimeframeList'
  },
  {
    name: 'search'
  },
  {
    name: 'formatError'
  }
];

export const RPC_METHODS = [
  {
    name: 'serialize',
    isAsync: true
  },
  {
    name: 'call',
    isAsync: true
  },
  {
    name: 'placeLimitOrder',
    isAsync: true
  },
  {
    name: 'placeMarketOrder',
    isAsync: true
  },
  {
    name: 'placeConditionalOrder',
    isAsync: true
  },
  {
    name: 'conditionalOrders',
    isAsync: false
  },
  {
    name: 'historicalTimeAndSales',
    isAsync: true
  },
  {
    name: 'historicalCandles',
    isAsync: true
  },
  {
    name: 'historicalTimeline',
    isAsync: true
  },
  {
    name: 'estimate',
    isAsync: true
  },
  {
    name: 'modifyRealOrders',
    isAsync: true
  },
  {
    name: 'cancelRealOrder',
    isAsync: true
  },
  {
    name: 'cancelAllRealOrders',
    isAsync: true
  },
  {
    name: 'cancelConditionalOrder',
    isAsync: true
  },
  {
    name: 'cancelAllConditionalOrders',
    isAsync: true
  }
];

export class TraderRuntime {
  #pendingDictionaryPromise;

  #instruments = new Map();

  #bus = new EventBus();

  #sources = new Map();

  #sourceObservers = new WeakMap();

  get instruments() {
    return this.#instruments;
  }

  #worker;

  get worker() {
    return this.#worker;
  }

  #trader;

  get trader() {
    return this.#trader;
  }

  document;

  url;

  // Aspirant Worker URL.
  #awUrl;

  #pendingAWConnectionPromise;

  #awConnection;

  #awOnTraderLoadListener;

  #awReconnectionTimeout;

  // Used when Aspirant Worker is restored from exit or crash.
  #awSubscriptions = new Set();

  constructor(document) {
    this.document = document;

    if (typeof this.document.runtime === 'undefined') {
      this.document.runtime = 'main-thread';
    }

    if (!document.type) {
      throw new TypeError('document.type is required');
    }

    this.url = {
      [TRADERS.ALOR_OPENAPI_V2]: `${ppp.rootUrl}/lib/traders/alor-openapi-v2.js`,
      [TRADERS.TINKOFF_GRPC_WEB]: `${ppp.rootUrl}/lib/traders/tinkoff-grpc-web.js`,
      [TRADERS.ALPACA_V2_PLUS]: `${ppp.rootUrl}/lib/traders/alpaca-v2-plus.js`,
      [TRADERS.BINANCE_V3]: `${ppp.rootUrl}/lib/traders/binance-v3.js`,
      [TRADERS.BYBIT_V5]: `${ppp.rootUrl}/lib/traders/bybit-v5.js`,
      [TRADERS.UTEX_MARGIN_STOCKS]: `${ppp.rootUrl}/lib/traders/utex-margin-stocks.js`,
      [TRADERS.FINAM_TRADE_API]: `${ppp.rootUrl}/lib/traders/finam-trade-api.js`,
      [TRADERS.IB]: `${ppp.rootUrl}/lib/traders/ib.js`,
      [TRADERS.CAPITALCOM]: `${ppp.rootUrl}/lib/traders/capitalcom.js`,
      [TRADERS.PAPER_TRADE]: `${ppp.rootUrl}/lib/traders/paper-trade.js`,
      [TRADERS.COMBINED_L1]: `${ppp.rootUrl}/lib/traders/combined-l1.js`,
      [TRADERS.CUSTOM]: document.url
    }[document.type];
  }

  async load() {
    if (this.#pendingDictionaryPromise) {
      return this.#pendingDictionaryPromise;
    } else {
      return (this.#pendingDictionaryPromise = new Promise(
        async (resolve, reject) => {
          this.#trader = new (await import(this.url)).default(this.document);

          switch (this.document.runtime) {
            case 'main-thread':
              this.#worker = null;

              if (
                typeof this.#trader.oneTimeInitializationCallback === 'function'
              ) {
                await this.#trader.oneTimeInitializationCallback();
              }

              return this.buildDictionary(resolve, reject);

            case 'shared-worker':
              this.#worker = new SharedWorker(this.url, {
                name: this.document._id,
                type: 'module'
              });

              window.addEventListener('beforeunload', () => {
                this.#worker.port.postMessage({ type: 'close' });
              });

              this.#worker.port.onmessage = async ({ data }) => {
                if (data?.type === 'conn') {
                  this.#worker.port.postMessage({
                    type: 'connack',
                    document: this.document,
                    globalProxyUrl: ppp.keyVault.getKey('global-proxy-url')
                  });
                } else if (data?.type === 'init') {
                  this.buildDictionary(resolve, reject);
                } else if (data?.type === 'ready') {
                  // Instruments received.
                  resolve(this);
                } else if (data?.type === 'assign') {
                  const source = this.#sources.get(
                    `${data.sourceID}:${data.field}`
                  );

                  if (typeof source !== 'undefined') {
                    source[data.field] = data.value;
                  }
                } else if (/^rpc-/.test(data?.type)) {
                  this.#bus.emit(data.type, data);
                } else if (data?.type === 'subscription-exception') {
                  if (data.sourceKey) {
                    const source = this.#sources.get(data.sourceKey);

                    if (typeof source !== 'undefined') {
                      source.catchException?.(
                        new Exceptions[data.exception.args.details](
                          data.exception.args
                        )
                      );
                    }
                  }
                } else if (data?.type === 'shared-worker-needed') {
                  await ppp.getOrCreateTrader(data.document);
                  data.port2.postMessage({ type: 'shared-worker-created' });
                } else if (data?.type === 'shared-worker-subscribe-field') {
                  const requestedSharedWorker = await ppp.getOrCreateTrader(
                    data.document
                  );

                  requestedSharedWorker.worker.port.postMessage(
                    {
                      type: 'source-changed',
                      sourceID: data.sourceID,
                      port2: data.port2,
                      reason: 'instrument',
                      oldValue: null,
                      newValue: data.instrument,
                      canChangeInstrument: data.canChangeInstrument,
                      doNotFire: true
                    },
                    [data.port2]
                  );

                  requestedSharedWorker.worker.port.postMessage({
                    type: 'subscribe-field',
                    sourceID: data.sourceID,
                    field: data.field,
                    datum: data.datum,
                    canChangeInstrument: data.canChangeInstrument
                  });
                } else if (data?.type === 'shared-worker-unsubscribe-field') {
                  const requestedSharedWorker = await ppp.getOrCreateTrader(
                    data.document
                  );

                  requestedSharedWorker.worker.port.postMessage({
                    type: 'unsubscribe-field',
                    sourceID: data.sourceID,
                    field: data.field,
                    datum: data.datum
                  });
                } else if (data?.type === 'shared-worker-resubscribe') {
                  const requestedSharedWorker = await ppp.getOrCreateTrader(
                    data.document
                  );

                  requestedSharedWorker.worker.port.postMessage({
                    type: 'resubscribe',
                    sourceID: data.sourceID,
                    onlyForDatums: data.onlyForDatums
                  });
                }
              };

              return this.#worker.port.start();

            case 'url':
              this.#worker = null;

              const runtimeUrl = new URL(this.document.runtimeUrl);

              if (runtimeUrl.protocol === 'http:') {
                runtimeUrl.protocol = 'ws:';
              } else {
                runtimeUrl.protocol = 'wss:';
              }

              await this.buildDictionary(resolve, reject);

              this.#awUrl = new URL(runtimeUrl).toString();
              this.#awOnTraderLoadListener = ({ data }) => {
                const parsed = JSON.parse(data) ?? [];

                for (const payload of parsed) {
                  if (payload.T === 'init' || payload.T === 'ready') {
                    if (payload.T === 'ready') {
                      this.#awConnection.removeEventListener(
                        'message',
                        this.#awOnTraderLoadListener
                      );

                      this.#awOnTraderLoadListener = null;
                      resolve(this);
                    } else {
                      // No trader on the other side. Send document, code and instruments (trinity).
                      this.#sendAWTrinityMessage(reject);
                    }
                  }
                }
              };

              await this.#connectToAW();
              this.#awConnection.addEventListener(
                'message',
                this.#awOnTraderLoadListener
              );
          }
        }
      ));
    }
  }

  async #sendAWTrinityMessage(reject) {
    const parts = this.url.split('/');

    parts.splice(-1, 0, 'build');
    parts[parts.length - 1] = parts[parts.length - 1].replace(
      /\.js$/,
      '.min.js'
    );

    const response = await fetch(parts.join('/'), {
      cache: 'reload'
    });

    if (response.ok) {
      const code = await response.text();

      this.#awConnection.send(
        JSON.stringify({
          T: 'trinity',
          document: this.document,
          instruments: Array.from(this.#instruments.entries()),
          code
        })
      );
    } else {
      reject &&
        reject(
          new TraderTrinityError({
            message: response.statusText,
            details: response
          })
        );
    }
  }

  async #onAWMessage(data, done) {
    if (Array.isArray(data)) {
      for (const payload of data) {
        switch (payload.T) {
          case 'success':
            if (payload.msg === 'connected') {
              return this.#awConnection.send(
                JSON.stringify({
                  T: 'connack',
                  _id: this.document._id,
                  name: this.document.name
                })
              );
            }
          case 'init':
            if (!this.#awOnTraderLoadListener) {
              // No trader on the other side. Send document, code and instruments.
              return this.#sendAWTrinityMessage();
            }
          case 'ready':
            if (!this.#awOnTraderLoadListener) {
              // There are 2 possible scenarios:
              // 1. The trader has been restored from crash/exit.
              await this.resubscribe();

              // 2. The trader is OK. The connection has been reestablished.
              const subscriptions = Array.from(this.#awSubscriptions);

              this.#awSubscriptions.clear();

              for (const sfd of subscriptions) {
                const [sourceID, field, datum] = sfd.split(':');
                const source = this.#sources.get(`${sourceID}:${field}`);

                if (source) {
                  await this.unsubscribeField({
                    source,
                    field,
                    datum
                  });
                  // Reestablish the source inside Aspirant Worker.
                  this.#awConnection.send(
                    JSON.stringify({
                      T: 'source-changed',
                      sourceID,
                      reason: 'instrument',
                      oldValue: null,
                      newValue: source.instrument,
                      canChangeInstrument: source.canChangeInstrument,
                      doNotFire: true
                    })
                  );
                  await this.subscribeField({
                    source,
                    field,
                    datum
                  });
                }
              }

              if (typeof done === 'function') {
                done();
              }
            }

            break;
          case 'subscription-exception':
            if (payload.sourceKey) {
              const source = this.#sources.get(payload.sourceKey);

              if (typeof source !== 'undefined') {
                source.catchException?.(
                  new Exceptions[payload.exception.args.details](
                    payload.exception.args
                  )
                );
              }
            }

            break;
          case 'assign':
            const source = this.#sources.get(
              `${payload.sourceID}:${payload.field}`
            );

            if (typeof source !== 'undefined') {
              source[payload.field] = payload.value;
            }
          default:
            this.#bus.emit(payload.T, payload);
        }
      }
    }
  }

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

  async #connectToAW(reconnect) {
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

          this.#awConnection.onopen = () => {
            if (this.#awOnTraderLoadListener) {
              resolve(this.#awConnection);
            }
          };
          this.#awConnection.onclose = async () => {
            await later(this.#getAWReconnectionTimeout());

            this.#pendingAWConnectionPromise = void 0;

            return this.#connectToAW(true);
          };
          this.#awConnection.onerror = () => this.#awConnection.close();
          this.#awConnection.onmessage = ({ data }) =>
            this.#onAWMessage(JSON.parse(data), () => {
              resolve(this.#awConnection);
            });
        }
      }));
    }
  }

  async buildDictionary(resolve, reject) {
    this.#instruments.clear();

    const dictionary = await this.#trader.getDictionary();

    if (Array.isArray(dictionary)) {
      for (const instrument of dictionary) {
        this.#instruments.set(instrument.symbol, instrument);
      }
    } else {
      const exchange = this.#trader.getExchange();
      const broker = this.#trader.getBroker();

      if (exchange === '*' || broker === '*' || !dictionary)
        return resolve(this);

      const cache = await ppp.openInstrumentCache({
        exchange,
        broker
      });

      const lastCacheVersion = ppp.settings.get(
        `instrumentCache:${exchange}:${broker}`
      );
      let currentCacheVersion = 0;

      try {
        await new Promise((resolve2, reject2) => {
          const storeName = `${exchange}:${broker}`;

          if (!cache.objectStoreNames.contains(storeName)) {
            resolve2();
          }

          const tx = cache.transaction(storeName, 'readonly');
          const instrumentsStore = tx.objectStore(storeName);
          const cursorRequest = instrumentsStore.getAll();

          cursorRequest.onsuccess = (event) => {
            const result = event.target.result;

            if (Array.isArray(result)) {
              for (const instrument of result) {
                if (
                  instrument.symbol === '@version' &&
                  typeof instrument.version === 'number'
                ) {
                  currentCacheVersion = instrument.version;
                } else {
                  this.#instruments.set(instrument.symbol, instrument);
                }
              }
            }
          };

          tx.oncomplete = () => {
            resolve2();
          };

          tx.onerror = (event) => {
            reject2(event.target.error);
          };
        });
      } finally {
        cache.close();
      }

      if (!this.#instruments.size) {
        reject(
          new NoInstrumentsError({
            trader: this,
            currentCacheVersion,
            lastCacheVersion
          })
        );
      }

      if (currentCacheVersion < lastCacheVersion) {
        reject(
          new StaleInstrumentCacheError({
            trader: this,
            currentCacheVersion,
            lastCacheVersion
          })
        );
      }
    }

    this.#trader.instrumentsArrived(this.#instruments);

    switch (this.document.runtime) {
      case 'main-thread':
        return resolve(this);

      case 'shared-worker':
        // Should receive 'ready' after 'instruments'.
        this.#worker.port.postMessage({
          type: 'instruments',
          instruments: this.#instruments
        });

        break;

      // Finish, then send trinity message.
      case 'url':
        return;
    }
  }

  async syncDictionary({ lastCacheVersion }) {
    // For cache key (<exchange>:<broker>).
    const exchange = this.#trader.getExchange();
    const broker = this.#trader.getBroker();
    const dictionary = this.#trader.getDictionary();
    const instruments = await ppp.user.functions.find(
      {
        collection: 'instruments'
      },
      {
        broker,
        dictionary
      }
    );

    if (!instruments.length) {
      return;
    }

    const cache = await ppp.openInstrumentCache({
      exchange,
      broker
    });

    try {
      await new Promise((resolve, reject) => {
        const storeName = `${exchange}:${broker}`;
        const tx = cache.transaction(storeName, 'readwrite');
        const instrumentsStore = tx.objectStore(storeName);

        instrumentsStore.put({
          symbol: '@version',
          version: lastCacheVersion
        });

        instruments.forEach((i) => {
          // Without _id.
          const stripped = {};

          for (const k in i) {
            if (k !== '_id') {
              stripped[k] = i[k];
            }
          }

          instrumentsStore.put(stripped);
        });

        tx.oncomplete = () => {
          resolve();
        };

        tx.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } finally {
      cache.close();
    }
  }

  async subscribeField({ source, field, datum }) {
    if (this.document.runtime === 'main-thread') {
      return this.#trader.subscribeField({ source, field, datum });
    } else if (this.document.runtime === 'shared-worker') {
      const sourceID = source.sourceID;

      this.#sources.set(`${sourceID}:${field}`, source);

      if (!this.#sourceObservers.has(source)) {
        // Propagate current values.
        this.#worker.port.postMessage({
          type: 'source-changed',
          sourceID,
          reason: 'instrument',
          oldValue: null,
          newValue: source.instrument,
          canChangeInstrument: source.canChangeInstrument,
          doNotFire: true
        });

        for (const attribute of this.#trader.getObservedAttributes()) {
          source.hasAttribute?.(attribute) &&
            this.#worker.port.postMessage({
              type: 'source-changed',
              sourceID,
              reason: 'attribute',
              attribute,
              value: source.getAttribute(attribute),
              canChangeInstrument: true
            });
        }

        if (source.canChangeInstrument) {
          const observer = new MutationObserver((mutationsList) => {
            const observedAttrs = this.#trader.getObservedAttributes();

            for (let mutation of mutationsList) {
              if (
                mutation.type === 'attributes' &&
                observedAttrs.includes(mutation.attributeName)
              ) {
                this.#worker.port.postMessage({
                  type: 'source-changed',
                  sourceID,
                  reason: 'attribute',
                  attribute: mutation.attributeName,
                  value: source.getAttribute(mutation.attributeName),
                  canChangeInstrument: true
                });
              }
            }
          });

          this.#sourceObservers.set(source, observer);

          observer.observe(source, {
            attributes: true
          });

          source.addEventListener('instrumentchange', ({ detail }) => {
            this.#worker.port.postMessage({
              type: 'source-changed',
              sourceID,
              reason: 'instrument',
              oldValue: detail.oldValue,
              newValue: detail.newValue,
              canChangeInstrument: true
            });
          });
        } else {
          // Non-DOM source.
          this.#sourceObservers.set(source, null);
        }
      }

      return this.#worker.port.postMessage({
        type: 'subscribe-field',
        sourceID: source.sourceID,
        field,
        datum,
        canChangeInstrument: source.canChangeInstrument
      });
    } else {
      const sourceID = source.sourceID;

      this.#sources.set(`${sourceID}:${field}`, source);

      // Aspirant Worker (URL).
      await this.#connectToAW();

      if (!this.#sourceObservers.has(source)) {
        // Propagate current values.
        this.#awConnection.send(
          JSON.stringify({
            T: 'source-changed',
            sourceID,
            reason: 'instrument',
            oldValue: null,
            newValue: source.instrument,
            canChangeInstrument: source.canChangeInstrument,
            doNotFire: true
          })
        );

        for (const attribute of this.#trader.getObservedAttributes()) {
          source.hasAttribute?.(attribute) &&
            this.#awConnection.send(
              JSON.stringify({
                T: 'source-changed',
                sourceID,
                reason: 'attribute',
                attribute,
                value: source.getAttribute(attribute),
                canChangeInstrument: true
              })
            );
        }

        if (source.canChangeInstrument) {
          const observer = new MutationObserver((mutationsList) => {
            const observedAttrs = this.#trader.getObservedAttributes();

            for (let mutation of mutationsList) {
              if (
                mutation.type === 'attributes' &&
                observedAttrs.includes(mutation.attributeName)
              ) {
                this.#awConnection.send(
                  JSON.stringify({
                    T: 'source-changed',
                    sourceID,
                    reason: 'attribute',
                    attribute: mutation.attributeName,
                    value: source.getAttribute(mutation.attributeName),
                    canChangeInstrument: true
                  })
                );
              }
            }
          });

          this.#sourceObservers.set(source, observer);

          observer.observe(source, {
            attributes: true
          });

          source.addEventListener('instrumentchange', ({ detail }) => {
            this.#awConnection.send(
              JSON.stringify({
                T: 'source-changed',
                sourceID,
                reason: 'instrument',
                oldValue: detail.oldValue,
                newValue: detail.newValue,
                canChangeInstrument: true
              })
            );
          });
        } else {
          // Non-DOM source.
          this.#sourceObservers.set(source, null);
        }
      }

      this.#awSubscriptions.add(`${sourceID}:${field}:${datum}`);

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
  }

  async unsubscribeField({ source, field, datum }) {
    if (this.document.runtime === 'main-thread') {
      return this.#trader.unsubscribeField({ source, field, datum });
    } else if (this.document.runtime === 'shared-worker') {
      this.#sources.delete(`${source.sourceID}:${field}`);

      return this.#worker.port.postMessage({
        type: 'unsubscribe-field',
        sourceID: source.sourceID,
        field,
        datum
      });
    } else {
      this.#sources.delete(`${source.sourceID}:${field}`);
      this.#awSubscriptions.delete(`${source.sourceID}:${field}:${datum}`);

      // Aspirant Worker.
      await this.#connectToAW();

      return this.#awConnection.send(
        JSON.stringify({
          T: 'unsubscribe-field',
          sourceID: source.sourceID,
          field,
          datum
        })
      );
    }
  }

  async resubscribe(onlyForDatums = []) {
    if (this.document.runtime === 'main-thread') {
      return this.#trader.resubscribe(onlyForDatums);
    } else if (this.document.runtime === 'shared-worker') {
      return this.#worker.port.postMessage({
        type: 'resubscribe',
        onlyForDatums
      });
    } else {
      // Aspirant Worker.
      await this.#connectToAW();

      return this.#awConnection.send(
        JSON.stringify({
          T: 'resubscribe',
          onlyForDatums
        })
      );
    }
  }

  async rpc({ method, args }) {
    if (this.document.runtime === 'main-thread') {
      return this.#trader[method](...args);
    } else {
      const requestId = uuidv4();

      if (typeof this.#trader[method] === 'function') {
        return new Promise(async (resolve, reject) => {
          this.#bus.once(`rpc-${requestId}`, ({ detail }) => {
            if (!('exception' in detail)) {
              resolve(detail.response);
            } else {
              reject(
                new Exceptions[detail.exception.name](detail.exception.args)
              );
            }
          });

          if (this.document.runtime === 'shared-worker') {
            this.#worker.port.postMessage({
              type: 'rpc',
              requestId,
              method,
              args
            });
          } else {
            await this.#connectToAW();

            return this.#awConnection.send(
              JSON.stringify({
                T: 'rpc',
                requestId,
                method,
                args
              })
            );
          }
        });
      }
    }
  }

  terminate() {
    if (this.document.runtime === 'shared-worker') {
      return this.#worker.port.postMessage({
        type: 'terminate'
      });
    } else if (this.document.runtime === 'url') {
      this.#connectToAW().then(() =>
        this.#awConnection.send(
          JSON.stringify({
            T: 'terminate'
          })
        )
      );
    }
  }
}

UNIVERSAL_METHODS.forEach(({ name, isAsync }) => {
  if (isAsync) {
    TraderRuntime.prototype[name] = async function (...args) {
      if (typeof this.trader[name] === 'function') {
        return this.trader[name](...args);
      }
    };
  } else {
    TraderRuntime.prototype[name] = function (...args) {
      if (typeof this.trader[name] === 'function') {
        return this.trader[name](...args);
      }
    };
  }
});

RPC_METHODS.forEach(({ name, isAsync }) => {
  if (isAsync) {
    TraderRuntime.prototype[name] = async function (...args) {
      if (typeof this.trader[name] === 'function') {
        return this.rpc({ method: name, args });
      }
    };
  } else {
    TraderRuntime.prototype[name] = function (...args) {
      if (typeof this.trader[name] === 'function') {
        return this.rpc({ method: name, args });
      }
    };
  }
});

TraderRuntime.prototype.subscribeFields = Trader.prototype.subscribeFields;
TraderRuntime.prototype.unsubscribeFields = Trader.prototype.unsubscribeFields;

export class Traders {
  runtimes = new Map();

  async getOrCreateTrader(document) {
    if (document) {
      if (!this.runtimes.has(document._id)) {
        this.runtimes.set(document._id, new TraderRuntime(document));
      }

      return this.runtimes.get(document._id).load();
    }
  }
}
