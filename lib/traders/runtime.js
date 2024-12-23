import ppp from '../../ppp.js';
import { TRADERS } from '../const.js';
import {
  StaleInstrumentCacheError,
  NoInstrumentsError
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
    name: 'symbolToCanonical'
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
    name: 'getDestinationList'
  },
  {
    name: 'getTIFList'
  },
  {
    name: 'search'
  },
  {
    name: 'getErrorI18nKey'
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
    name: 'getRealDatumType',
    isAsync: false
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
    name: 'pco',
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
    name: 'estimateCommission',
    isAsync: false
  },
  {
    name: 'modifyRealOrder',
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
    name: 'performConditionalOrderAction',
    isAsync: true
  },
  {
    name: 'pcoa',
    isAsync: true
  },
  {
    name: 'cancelConditionalOrder',
    isAsync: true
  },
  { name: 'cco', isAsync: true },
  {
    name: 'cancelAllConditionalOrders',
    isAsync: true
  },
  {
    name: 'requestLocate',
    isAsync: true
  },
  {
    name: 'acquireLocate',
    isAsync: true
  },
  {
    name: 'redisCommand',
    isAsync: true
  },
  {
    name: 'getEnvVar',
    isAsync: false
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

  #pendingAWConnection;

  #awConnection;

  #awReconnectionTimeout;

  // Used when Aspirant Worker is restored from exit or crash.
  #awSubscriptions = new Set();

  trinityUrl;

  reqCounter = 0;

  constructor(document) {
    this.document = document;

    if (typeof this.document.runtime === 'undefined') {
      this.document.runtime = 'main-thread';
    }

    if (!document.type) {
      throw new TypeError('document.type is required');
    }

    this.$$runtime = ppp.$debug(`runtime:${this.document._id}`);

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
      [TRADERS.COMBINED_ORDERBOOK]: `${ppp.rootUrl}/lib/traders/combined-orderbook.js`,
      [TRADERS.CUSTOM]: document.url
    }[document.type];
  }

  async load(options = {}) {
    if (options.trinityUrl) {
      this.trinityUrl = options.trinityUrl;
    }

    if (this.#pendingDictionaryPromise) {
      return this.#pendingDictionaryPromise;
    } else {
      this.#pendingDictionaryPromise = new Promise(async (resolve, reject) => {
        this.#trader = new (await import(this.url)).default(this.document);

        switch (this.document.runtime) {
          case 'main-thread':
            this.#worker = null;

            this.#trader.$$debug ??= globalThis.ppp.$debug(this.document._id);
            this.#trader.$$connection ??=
              this.#trader.$$debug.extend('connection');

            if (
              typeof this.#trader.oneTimeInitializationCallback ===
                'function' &&
              !this.#trader.oneTimeInitializationCallbackCalled
            ) {
              this.$$runtime(
                'calling [main-thread] this.#trader.oneTimeInitializationCallback()'
              );

              this.#trader.oneTimeInitializationCallbackCalled = true;

              await this.#trader.oneTimeInitializationCallback();
            }

            return this.buildDictionary(resolve, reject);

          case 'shared-worker':
            this.#worker = new SharedWorker(this.url, {
              name: this.document._id,
              type: 'module'
            });

            window.addEventListener('beforeunload', () => {
              this.#worker?.port.postMessage({ type: 'close' });
            });

            this.#worker.port.onmessage = async ({ data }) => {
              if (data?.type === 'conn') {
                this.#worker?.port.postMessage({
                  type: 'connack',
                  document: this.document,
                  globalProxyUrl: ppp.keyVault.getKey('global-proxy-url'),
                  rootUrl: ppp.rootUrl
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
                      new Exceptions[data.exception.name](data.exception.args)
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

            if (!options.doNotStartWorker) {
              return this.#worker.port.start();
            }

            break;
          case 'url':
            this.#worker = null;

            const runtimeUrl = new URL(this.document.runtimeUrl);

            if (runtimeUrl.protocol === 'http:') {
              runtimeUrl.protocol = 'ws:';
            } else {
              runtimeUrl.protocol = 'wss:';
            }

            this.#awUrl = new URL(runtimeUrl).toString();

            await this.buildDictionary(
              () => {},
              () => {}
            );

            if (!options.doNotStartWorker) {
              this.$$runtime(
                'calling #connectToRemoteTraderRuntime() upon load()'
              );

              this.#connectToRemoteTraderRuntime()
                .then(() => {
                  this.$$runtime(
                    '#connectToRemoteTraderRuntime() called upon load()'
                  );

                  resolve(this);
                })
                .catch((e) => {
                  this.$$runtime(
                    '#connectToRemoteTraderRuntime() failed: %o',
                    e
                  );
                  reject(e);
                });
            } else {
              resolve(this);
            }
        }
      });

      return this.#pendingDictionaryPromise;
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

  async #connectToRemoteTraderRuntime(reconnect) {
    if (this.#awConnection?.readyState === WebSocket.OPEN) {
      return this.#awConnection;
    } else if (this.#pendingAWConnection && !reconnect) {
      return this.#pendingAWConnection;
    } else {
      this.#pendingAWConnection = new Promise((resolve, reject) => {
        this.#awConnection = new WebSocket(this.#awUrl);

        this.#awConnection.onclose = async () => {
          await later(this.#getAWReconnectionTimeout());
          resolve(this.#connectToRemoteTraderRuntime(true));
        };
        this.#awConnection.onerror = () => this.#awConnection.close();
        this.#awConnection.onmessage = async ({ data }) => {
          const messages = JSON.parse(data);

          if (Array.isArray(messages)) {
            for (const message of messages) {
              switch (message.T) {
                case 'success':
                  if (message.msg === 'connected') {
                    return this.#awConnection.send(
                      JSON.stringify({
                        T: 'connack',
                        _id: this.document._id,
                        name: this.document.name,
                        trinityUrl: this.trinityUrl ?? ''
                      })
                    );
                  }
                case 'ready':
                  this.$$runtime(
                    '[#awConnection.onmessage] trader is ready, reconnect is %s',
                    !!reconnect
                  );

                  if (reconnect) {
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
                  }

                  resolve(this.#awConnection);

                  break;
                case 'subscription-exception':
                  if (message.sourceKey) {
                    const source = this.#sources.get(message.sourceKey);

                    if (typeof source !== 'undefined') {
                      if (message.exception.name === 'TypeError') {
                        source.catchException?.(
                          new TypeError(message.exception.args.message)
                        );
                      } else if (message.exception.name === 'ReferenceError') {
                        source.catchException?.(
                          new ReferenceError(message.exception.args.message)
                        );
                      } else if (message.exception.name in Exceptions) {
                        source.catchException?.(
                          new Exceptions[message.exception.name]({
                            message: message.exception.args.message,
                            details: message.exception.args.details
                          })
                        );
                      } else {
                        source.catchException?.(
                          new Exceptions.RemoteTraderError({
                            message: `[${message.exception.name}] ${message.exception.args.message}`
                          })
                        );
                      }
                    }
                  }

                  break;
                case 'assign':
                  const source = this.#sources.get(
                    `${message.sourceID}:${message.field}`
                  );

                  if (typeof source !== 'undefined') {
                    source[message.field] = message.value;
                  }

                  break;
                case 'error':
                  // Recoverable errors.
                  if (
                    ![
                      'subscribe-field failed, no source',
                      'unsubscribe-field failed, no source'
                    ].includes(message.msg)
                  ) {
                    this.$$runtime(
                      '[#awConnection.onmessage] error: %o',
                      message
                    );

                    reject(
                      new Exceptions.RemoteTraderError({
                        message: message.msg,
                        details: message
                      })
                    );
                  }

                default:
                  this.#bus.emit(message.T, message);
              }
            }
          }
        };
      });

      return this.#pendingAWConnection;
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
        this.#worker?.port.postMessage({
          type: 'instruments',
          instruments: this.#instruments
        });

        break;

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
      await this.#connectToRemoteTraderRuntime();

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
      await this.#connectToRemoteTraderRuntime();

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
      await this.#connectToRemoteTraderRuntime();

      return this.#awConnection.send(
        JSON.stringify({
          T: 'resubscribe',
          onlyForDatums
        })
      );
    }
  }

  generateRequestId() {
    return `${Date.now()}:${this.reqCounter++}`;
  }

  async rpc({ method, args }) {
    if (this.document.runtime === 'main-thread') {
      return this.#trader[method](...args);
    } else {
      const rid = this.generateRequestId();

      if (typeof this.#trader[method] === 'function') {
        return new Promise(async (resolve, reject) => {
          this.#bus.once(`rpc-${rid}`, ({ detail }) => {
            if (!('exception' in detail)) {
              resolve(detail.response);
            } else {
              if (detail.exception.name === 'TypeError') {
                reject(new TypeError(detail.exception.args.message));
              }

              if (detail.exception.name === 'ReferenceError') {
                reject(new ReferenceError(detail.exception.args.message));
              } else if (detail.exception.name in Exceptions) {
                reject(
                  new Exceptions[detail.exception.name]({
                    message: detail.exception.args.message,
                    details: detail.exception.args.details
                  })
                );
              } else {
                reject(
                  new Exceptions.RemoteTraderError({
                    message: `[${detail.exception.name}] ${detail.exception.args.message}`
                  })
                );
              }
            }
          });

          if (this.document.runtime === 'shared-worker') {
            this.#worker.port.postMessage({
              type: 'rpc',
              rid,
              method,
              args
            });
          } else {
            await this.#connectToRemoteTraderRuntime();

            return this.#awConnection.send(
              JSON.stringify({
                T: 'rpc',
                rid,
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
      this.#connectToRemoteTraderRuntime().then(() =>
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

  async getOrCreateTrader(document, options = {}) {
    if (document) {
      if (!this.runtimes.has(document._id)) {
        this.runtimes.set(document._id, new TraderRuntime(document));
      }

      return this.runtimes.get(document._id).load(options);
    }
  }
}
