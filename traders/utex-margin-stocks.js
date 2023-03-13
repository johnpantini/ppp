import { TRADER_DATUM } from '../lib/const.js';
import { later } from '../lib/ppp-decorators.js';
import { Trader } from './common-trader.js';
import { cyrillicToLatin } from '../lib/intl.js';
import ppp from '../ppp.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} UtexMarginStocksTrader
 */

class UtexMarginStocksTrader extends Trader {
  getExchange() {
    return ['utex'];
  }

  getBrokerType() {
    return this.document.broker.type;
  }
}

export default UtexMarginStocksTrader;
