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
    name: 'getExchangeForDBRequest'
  },
  {
    name: 'getObservedAttributes'
  },
  {
    name: 'getInstrumentIconUrl'
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
    name: 'placeLimitOrder',
    isAsync: true
  },
  {
    name: 'placeMarketOrder',
    isAsync: true
  },
  {
    name: 'allTrades',
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
    name: 'modifyLimitOrders',
    isAsync: true
  },
  {
    name: 'cancelLimitOrder',
    isAsync: true
  },
  {
    name: 'cancelAllLimitOrders',
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

  constructor(document) {
    this.document = document;

    if (typeof this.document.runtime === 'undefined') {
      this.document.runtime = 'main-thread';
    }

    this.url = {
      [TRADERS.ALOR_OPENAPI_V2]: `${ppp.rootUrl}/lib/traders/alor-openapi-v2.js`,
      [TRADERS.TINKOFF_GRPC_WEB]: `${ppp.rootUrl}/lib/traders/tinkoff-grpc-web.js`,
      [TRADERS.ALPACA_V2_PLUS]: `${ppp.rootUrl}/lib/traders/alpaca-v2-plus.js`,
      [TRADERS.BINANCE_V3]: `${ppp.rootUrl}/lib/traders/binance-v3.js`,
      [TRADERS.UTEX_MARGIN_STOCKS]: `${ppp.rootUrl}/lib/traders/utex-margin-stocks.js`,
      [TRADERS.FINAM_TRADE_API]: `${ppp.rootUrl}/lib/traders/finam-trade-api.js`,
      [TRADERS.IB]: `${ppp.rootUrl}/lib/traders/ib.js`,
      [TRADERS.PSINA_ALOR_OPENAPI_V2]: document.url,
      [TRADERS.CUSTOM]: document.url
    }[document.type];
  }

  async buildDictionary(resolve, reject) {
    this.#instruments.clear();

    const exchange = this.#trader.getExchange();
    const broker = this.#trader.getBroker();
    const dictionary = this.#trader.getDictionary();

    if (exchange === '*' || broker === '*' || !dictionary) return resolve(this);

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

    this.#trader.instrumentsArrived(this.#instruments);

    switch (this.document.runtime) {
      case 'main-thread':
        resolve(this);

        break;
      case 'shared-worker':
        this.#worker.port.postMessage({
          type: 'instruments',
          instruments: this.#instruments
        });

        break;

      case 'aspirant-worker':
        break;
    }
  }

  async syncDictionary({ lastCacheVersion }) {
    const exchange = this.#trader.getExchange();
    const broker = this.#trader.getBroker();
    const instruments = await ppp.user.functions.find(
      {
        collection: 'instruments'
      },
      {
        exchange: this.#trader.getExchangeForDBRequest(),
        broker
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
                    document: this.document
                  });
                } else if (data?.type === 'init') {
                  this.buildDictionary(resolve, reject);
                } else if (data?.type === 'ready') {
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

            case 'aspirant-worker':
              return;
          }
        }
      ));
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
          source.hasAttribute(attribute) &&
            this.#worker.port.postMessage({
              type: 'source-changed',
              sourceID,
              reason: 'attribute',
              attribute,
              value: source.getAttribute(attribute),
              canChangeInstrument: source.canChangeInstrument
            });
        }

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
                canChangeInstrument: source.canChangeInstrument
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
            canChangeInstrument: source.canChangeInstrument
          });
        });
      }

      // Subscribe.
      this.#worker.port.postMessage({
        type: 'subscribe-field',
        sourceID: source.sourceID,
        field,
        datum,
        canChangeInstrument: source.canChangeInstrument
      });
    } else {
      // Aspirant Worker.
    }
  }

  async unsubscribeField({ source, field, datum }) {
    if (this.document.runtime === 'main-thread') {
      return this.#trader.unsubscribeField({ source, field, datum });
    } else if (this.document.runtime === 'shared-worker') {
      this.#sources.delete(`${source.sourceID}:${field}`);

      this.#worker.port.postMessage({
        type: 'unsubscribe-field',
        sourceID: source.sourceID,
        field,
        datum
      });
    } else {
      // Aspirant Worker.
    }
  }

  async resubscribe(onlyForDatums = []) {
    if (this.document.runtime === 'main-thread') {
      return this.#trader.resubscribe(onlyForDatums);
    } else if (this.document.runtime === 'shared-worker') {
      this.#worker.port.postMessage({
        type: 'resubscribe',
        onlyForDatums
      });
    } else {
      // Aspirant Worker.
    }
  }

  async rpc({ method, args }) {
    if (this.document.runtime === 'main-thread') {
      return this.#trader[method](...args);
    } else if (this.document.runtime === 'shared-worker') {
      const requestId = uuidv4();

      if (typeof this.#trader[method] === 'function') {
        return new Promise((resolve, reject) => {
          this.#bus.once(`rpc-${requestId}`, ({ detail }) => {
            if ('response' in detail) {
              resolve(detail.response);
            } else {
              reject(
                new Exceptions[detail.exception.name](detail.exception.args)
              );
            }
          });

          this.#worker.port.postMessage({
            type: 'rpc',
            requestId,
            method,
            args
          });
        });
      }
    } else {
      // Aspirant Worker.
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
