import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../const.js';
import {
  TraderDatum,
  Trader,
  pppTraderInstanceForWorkerIs
} from './trader-worker.js';
import { ConnectionError, AuthorizationError } from '../ppp-exceptions.js';

class QuotesDatum extends TraderDatum {
  #timer;

  #shouldLoop = false;

  #loopOnceFlag = false;

  filter(data, instrument, source, datum) {
    return source?.instrument?.type === instrument?.type;
  }

  firstReferenceAdded() {
    this.#shouldLoop = true;

    if (!this.#loopOnceFlag) {
      clearTimeout(this.#timer);

      this.#loopOnceFlag = true;

      return this.#fetchLoop();
    }
  }

  lastReferenceRemoved() {
    clearTimeout(this.#timer);

    this.#loopOnceFlag = false;
    this.#shouldLoop = false;
  }

  async #fetchLoop() {
    if (this.#shouldLoop) {
      try {
        await this.trader.ensureSessionIsOk();

        const symbols = new Set();

        for (const datum in this.sources) {
          for (const [source] of this.sources[datum]) {
            if (source.instrument) {
              symbols.add(source.instrument.symbol);
            }
          }
        }

        const response = await fetch(
          `${this.trader.document.connectorUrl}fetch`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              method: 'GET',
              url: `https://api-capital.backend-capital.com/api/v1/markets?epics=${Array.from(
                symbols
              )
                .slice(0, 50)
                .join(',')}`,
              headers: {
                'X-SECURITY-TOKEN': this.trader.securityToken,
                CST: this.trader.cst
              }
            })
          }
        );

        const json = await response.json();

        if (Array.isArray(json.marketDetails)) {
          for (const i of json.marketDetails) {
            this.dataArrived(i, this.trader.instruments.get(i.instrument.epic));
          }
        }

        this.#timer = setTimeout(() => {
          this.#fetchLoop();
        }, 1000);
      } catch (e) {
        console.error(e);

        if (e instanceof AuthorizationError) {
          this.#shouldLoop = false;
        }

        this.#timer = setTimeout(() => {
          this.#fetchLoop();
        }, 1000);
      }
    }
  }

  [TRADER_DATUM.LAST_PRICE](data, instrument) {
    switch (this.trader.document.lastPriceMode) {
      case 'bid':
        return data.snapshot.bid;
      case 'ask':
        return data.snapshot.offer;
      case 'mid':
        return (data.snapshot.offer + data.snapshot.bid) / 2;
    }
  }

  [TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE](data) {
    return data.snapshot.percentageChange;
  }

  [TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE](data, instrument) {
    const lp = (() => {
      switch (this.trader.document.lastPriceMode) {
        case 'bid':
          return data.snapshot.bid;
        case 'ask':
          return data.snapshot.offer;
        case 'mid':
          return (data.snapshot.offer + data.snapshot.bid) / 2;
      }
    })();

    // Derive.
    if (data.snapshot.percentageChange < 0) {
      const p = lp / (1 - (data.snapshot.percentageChange * -1) / 100);

      return (p - lp) * -1;
    } else {
      const p = lp - (lp * data.snapshot.percentageChange) / 100;

      return lp - p;
    }
  }

  [TRADER_DATUM.BEST_BID](data, instrument) {
    return data.snapshot.bid;
  }

  [TRADER_DATUM.BEST_ASK](data, instrument) {
    return data.snapshot.offer;
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} CapitalcomTrader
 */
class CapitalcomTrader extends Trader {
  #cst;

  get cst() {
    return this.#cst;
  }

  #securityToken;

  get securityToken() {
    return this.#securityToken;
  }

  #pendingSessionPromise;

  // Valid for 10 minutes.
  #lastSessionCheckPoint;

  constructor(document) {
    super(document, [
      {
        type: QuotesDatum,
        datums: [
          TRADER_DATUM.LAST_PRICE,
          TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
          TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
          TRADER_DATUM.BEST_BID,
          TRADER_DATUM.BEST_ASK
        ]
      }
    ]);

    if (typeof document.connectorUrl !== 'string') {
      throw new ConnectionError({ details: this });
    }
  }

  async ensureSessionIsOk() {
    try {
      const now = Date.now();

      if (
        typeof this.#lastSessionCheckPoint === 'number' &&
        now - this.#lastSessionCheckPoint < 1000 * 60 * 9
      ) {
        return;
      }

      if (this.#pendingSessionPromise) {
        await this.#pendingSessionPromise;
      } else {
        this.#pendingSessionPromise = fetch(
          `${this.document.connectorUrl}fetch`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              method: 'POST',
              url: 'https://api-capital.backend-capital.com/api/v1/session',
              headers: {
                'Content-Type': 'application/json',
                'X-CAP-API-KEY': this.document.broker.key
              },
              headersToInclude: ['X-SECURITY-TOKEN', 'CST'],
              body: JSON.stringify({
                identifier: this.document.broker.identifier,
                password: this.document.broker.password,
                encryptedPassword: false
              })
            })
          }
        )
          .then((response) => response.json())
          .then((json) => {
            const { headers = [] } = json;
            const securityToken = headers.find(
              (h) => h.header.toUpperCase() === 'X-SECURITY-TOKEN'
            )?.value;
            const cst = headers.find(
              (h) => h.header.toUpperCase() === 'CST'
            )?.value;

            if (!securityToken || !cst) {
              throw new AuthorizationError({ details: json });
            }

            this.#securityToken = securityToken;
            this.#cst = cst;
            this.#lastSessionCheckPoint = now;
            this.#pendingSessionPromise = void 0;
          })
          .catch((e) => {
            console.error(e);

            if (e instanceof AuthorizationError) {
              throw e;
            }

            this.#pendingSessionPromise = void 0;

            return new Promise((resolve) => {
              setTimeout(async () => {
                await this.ensureSessionIsOk();
                resolve();
              }, 5000);
            });
          });

        await this.#pendingSessionPromise;
      }
    } catch (e) {
      console.error(e);

      if (e instanceof AuthorizationError) {
        throw e;
      }

      this.#lastSessionCheckPoint = void 0;

      return new Promise((resolve) => {
        setTimeout(async () => {
          await this.ensureSessionIsOk();

          resolve();
        }, 5000);
      });
    }
  }

  getExchange() {
    return EXCHANGE.CAPITALCOM;
  }

  getExchangeForDBRequest() {
    return EXCHANGE.CAPITALCOM;
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.CAPITALCOM;
  }

  getBroker() {
    return BROKERS.CAPITALCOM;
  }
}

if (typeof self !== 'undefined') {
  pppTraderInstanceForWorkerIs(CapitalcomTrader);
}

export default CapitalcomTrader;
