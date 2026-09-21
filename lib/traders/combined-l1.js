import {
  BROKERS,
  EXCHANGE,
  getInstrumentDictionaryMeta,
  TRADER_DATUM
} from '../const.js';
import { Trader, pppTraderInstanceForWorkerIs } from './trader-worker.js';

/** @type {Record<string, string>} Persisted selection flags mapped to public datum identifiers. */
export const FLAG_TO_DATUM_MAP = {
  1: TRADER_DATUM.LAST_PRICE,
  2: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
  3: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
  4: TRADER_DATUM.BEST_BID,
  5: TRADER_DATUM.BEST_ASK,
  6: TRADER_DATUM.EXTENDED_LAST_PRICE,
  7: TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE,
  8: TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE,
  9: TRADER_DATUM.STATUS,
  A: TRADER_DATUM.TRADING_STATUS,
  B: TRADER_DATUM.DAY_VOLUME
};

/**
 * Expands selection flags in order, retaining duplicates and unknown entries.
 * @param {string[]} [flags=[]] Persisted provider selections.
 * @returns {(string | undefined)[]} Datum identifiers; unknown flags map to undefined.
 */
export function flagsToDatums(flags = []) {
  return flags.map((flag) => FLAG_TO_DATUM_MAP[flag]);
}

/**
 * Routes selected quote datums to visible upstream traders in configured order.
 */
class CombinedL1Trader extends Trader {
  #dictionaryMeta;

  /** @param {import('../types.js').TraderDocument} document Dictionary and upstream traderList. */
  constructor(document) {
    super(document, []);

    this.#dictionaryMeta = getInstrumentDictionaryMeta(
      this.document.dictionary
    );
  }

  /**
   * Subscribes matching visible upstreams; unavailable runtime providers are skipped.
   * @param {import('../types.js').FieldSubscription} subscription Receiver, field and datum.
   * @returns {Promise<unknown>} Completion of all applicable subscriptions.
   */
  async subscribeField({ source, field, datum }) {
    for (const t of this.document.traderList) {
      if (t.hidden) {
        continue;
      }

      const trader = await ppp.getOrCreateTrader(t.document);
      const datums = flagsToDatums(t.flags);

      // Main-thread traders are not available inside a worker.
      if (trader && datums.includes(datum)) {
        await trader.subscribeField({ source, field, datum });
      }
    }

    return super.subscribeField({ source, field, datum });
  }

  /**
   * Releases the same configured upstream datums used by subscribeField.
   * @param {{source: import('../types.js').TraderSource, datum: string}} subscription Receiver and datum.
   * @returns {Promise<unknown>} Completion of upstream cleanup.
   */
  async unsubscribeField({ source, datum }) {
    for (const t of this.document.traderList) {
      if (t.hidden) {
        continue;
      }

      const trader = await ppp.getOrCreateTrader(t.document);
      const datums = flagsToDatums(t.flags);

      if (trader && datums.includes(datum)) {
        await trader.unsubscribeField({ source, datum });
      }
    }

    return super.unsubscribeField({ source, datum });
  }

  /** @returns {string} Dictionary exchange, falling back to CUSTOM. */
  getExchange() {
    return this.#dictionaryMeta.exchange ?? EXCHANGE.CUSTOM;
  }

  /** @returns {string[]} Source attributes forwarded to upstream traders. */
  getObservedAttributes() {
    return ['balance'];
  }

  /** @returns {string | null} Configured dictionary, if any. */
  getDictionary() {
    return this.document.dictionary ?? null;
  }

  /** @returns {string} Dictionary broker, falling back to UNKNOWN. */
  getBroker() {
    return this.#dictionaryMeta.broker ?? BROKERS.UNKNOWN;
  }
}

pppTraderInstanceForWorkerIs(CombinedL1Trader);

export default CombinedL1Trader;
