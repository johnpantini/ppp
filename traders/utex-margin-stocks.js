import ppp from '../ppp.js';
import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../lib/const.js';
import { later } from '../lib/ppp-decorators.js';
import { Trader } from './common-trader.js';
import { isJWTTokenExpired } from '../lib/ppp-crypto.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} UtexMarginStocksTrader
 */

class UtexMarginStocksTrader extends Trader {
  connection;

  #symbols = new Map();

  subs = {
    positions: new Map(),
    orders: new Map()
  };

  refs = {
    positions: new Map(),
    orders: new Map()
  };

  onCacheInstrument(instrument) {
    if (typeof instrument.utexSymbolID === 'number') {
      this.#symbols.set(instrument.utexSymbolID, instrument);
    }
  }

  async ensureAccessTokenIsOk() {}

  subsAndRefs(datum) {
    return {
      [TRADER_DATUM.POSITION]: [this.subs.positions, this.refs.positions],
      [TRADER_DATUM.POSITION_SIZE]: [this.subs.positions, this.refs.positions],
      [TRADER_DATUM.POSITION_AVERAGE]: [
        this.subs.positions,
        this.refs.positions
      ],
      [TRADER_DATUM.CURRENT_ORDER]: [this.subs.orders, this.refs.orders]
    }[datum];
  }

  getExchange() {
    return EXCHANGE.UTEX_MARGIN_STOCKS;
  }

  getExchangeForDBRequest() {
    return EXCHANGE.UTEX_MARGIN_STOCKS;
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS;
  }

  getBroker() {
    return BROKERS.UTEX;
  }

  getInstrumentIconUrl(instrument) {
    if (!instrument) {
      return 'static/instruments/unknown.svg';
    }

    if (instrument.currency === 'USD' || instrument.currency === 'USDT') {
      return `static/instruments/stocks/us/${instrument.symbol
        .replace(' ', '-')
        .replace('/', '-')}.svg`;
    }

    return super.getInstrumentIconUrl(instrument);
  }

  async placeLimitOrder({ instrument, price, quantity, direction }) {
    await this.ensureAccessTokenIsOk();
  }
}

export default UtexMarginStocksTrader;
