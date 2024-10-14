import {
  BROKERS,
  EXCHANGE,
  getInstrumentDictionaryMeta,
  TRADER_DATUM
} from '../const.js';
import { Trader, pppTraderInstanceForWorkerIs } from './trader-worker.js';

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

export function flagsToDatums(flags = []) {
  return flags.map((flag) => FLAG_TO_DATUM_MAP[flag]);
}

/**
 * @typedef {Object} CombinedL1Trader
 */
class CombinedL1Trader extends Trader {
  #dictionaryMeta;

  constructor(document) {
    super(document, []);

    this.#dictionaryMeta = getInstrumentDictionaryMeta(
      this.document.dictionary
    );
  }

  async subscribeField({ source, field, datum }) {
    for (const t of this.document.traderList) {
      const trader = await ppp.getOrCreateTrader(t.document);
      const datums = flagsToDatums(t.flags);

      if (datums.includes(datum)) {
        await trader.subscribeField({ source, field, datum });
      }
    }

    return super.subscribeField({ source, field, datum });
  }

  async unsubscribeField({ source, datum }) {
    for (const t of this.document.traderList) {
      const trader = await ppp.getOrCreateTrader(t.document);
      const datums = flagsToDatums(t.flags);

      if (datums.includes(datum)) {
        await trader.unsubscribeField({ source, datum });
      }
    }

    return super.unsubscribeField({ source, datum });
  }

  getExchange() {
    return this.#dictionaryMeta.exchange ?? EXCHANGE.CUSTOM;
  }

  getObservedAttributes() {
    return ['balance'];
  }

  getDictionary() {
    return this.document.dictionary ?? null;
  }

  getBroker() {
    return this.#dictionaryMeta.broker ?? BROKERS.UNKNOWN;
  }
}

pppTraderInstanceForWorkerIs(CombinedL1Trader);

export default CombinedL1Trader;
