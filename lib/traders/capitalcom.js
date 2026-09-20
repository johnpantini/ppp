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

  // Incremented on every restart, an in-flight loop of an older generation
  // stops instead of scheduling a second loop.
  #loopGeneration = 0;

  filter(data, instrument, source, datum) {
    return source?.instrument?.type === instrument?.type;
  }

  firstReferenceAdded() {
    this.#shouldLoop = true;

    if (!this.#loopOnceFlag) {
      clearTimeout(this.#timer);

      this.#loopOnceFlag = true;

      return this.#fetchLoop(++this.#loopGeneration);
    }
  }

  lastReferenceRemoved() {
    // The loop serves every subscribed symbol, stop it with the last one.
    if (this.refs.size > 0) {
      return;
    }

    clearTimeout(this.#timer);

    this.#loopOnceFlag = false;
    this.#shouldLoop = false;
  }

  async #fetchLoop(generation = this.#loopGeneration) {
    if (this.#shouldLoop && generation === this.#loopGeneration) {
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

        if (symbols.size) {
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
              this.dataArrived(
                i,
                this.trader.instruments.get(i.instrument.epic)
              );
            }
          }
        }

        this.#timer = setTimeout(() => {
          this.#fetchLoop(generation);
        }, 1000);
      } catch (e) {
        this.trader.$$debug('#fetchLoop failed: %s', e.message);

        if (e instanceof AuthorizationError) {
          this.#shouldLoop = false;
        }

        this.#timer = setTimeout(() => {
          this.#fetchLoop(generation);
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

    // Derive: previous price = lp / (1 + change / 100), for either sign.
    const previousPrice = lp / (1 + data.snapshot.percentageChange / 100);

    return lp - previousPrice;
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
              if (json.headers && json.response) {
                throw new AuthorizationError({ details: json });
              }

              // A connection interruption: keep the old tokens and retry
              // through the catch below instead of running unauthenticated.
              throw new Error('E_SESSION_INTERRUPTED');
            }

            this.#securityToken = securityToken;
            this.#cst = cst;
            this.#lastSessionCheckPoint = now;
            this.#pendingSessionPromise = void 0;
          })
          .catch((e) => {
            this.$$debug('#pendingSessionPromise fetch failed: %s', e.message);

            // Clear the rejected promise so that a later call can retry.
            this.#pendingSessionPromise = void 0;

            if (e instanceof AuthorizationError) {
              throw e;
            }

            return new Promise((resolve) => {
              setTimeout(() => resolve(this.ensureSessionIsOk()), 5000);
            });
          });

        await this.#pendingSessionPromise;
      }
    } catch (e) {
      this.$$debug('ensureSessionIsOk failed: %s', e.message);

      if (e instanceof AuthorizationError) {
        throw e;
      }

      this.#lastSessionCheckPoint = void 0;

      return new Promise((resolve) => {
        setTimeout(() => resolve(this.ensureSessionIsOk()), 5000);
      });
    }
  }

  getExchange() {
    return EXCHANGE.CAPITALCOM;
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.CAPITALCOM;
  }

  getBroker() {
    return BROKERS.CAPITALCOM;
  }
}

pppTraderInstanceForWorkerIs(CapitalcomTrader);

export default CapitalcomTrader;
