/** @decorator */

import { TRADER_DATUM } from '../const.js';
import { later } from '../later.js';
import { TraderWithSimpleSearch } from './trader-with-simple-search.js';
import { Trader } from './common-trader.js';
import { applyMixins } from '../utilities/apply-mixins.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} AlpacaV2PlusTrader
 */

class AlpacaV2PlusTrader extends Trader {
  #pendingConnection;

  subs = {
    orderbook: new Map(),
    allTrades: new Map()
  };

  refs = {
    orderbook: new Map(),
    allTrades: new Map()
  };

  connection;

  getSymbol(instrument = {}) {
    let symbol;

    if (this.document.exchange === 'SPBX' && instrument.spbexSymbol)
      symbol = instrument.spbexSymbol;
    else symbol = instrument.symbol;

    if (/~/gi.test(symbol)) symbol = symbol.split('~')[0];

    return symbol;
  }

  async #connectWebSocket(reconnect) {
    if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve) => {
        if (!reconnect && this.connection) {
          resolve(this.connection);
        } else {
          this.connection = new WebSocket(this.document.wsUrl);

          this.connection.onopen = () => {
            resolve(this.connection);
          };

          this.connection.onclose = async () => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));

            this.#pendingConnection = null;

            await this.#connectWebSocket(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = ({ data }) => {
            const payload = JSON.parse(data);

            console.log(payload);
          };
        }
      }));
    }
  }

  subsAndRefs(datum) {
    return {
      [TRADER_DATUM.ORDERBOOK]: [this.subs.orderbook, this.refs.orderbook],
      [TRADER_DATUM.MARKET_PRINT]: [this.subs.allTrades, this.refs.allTrades]
    }[datum];
  }

  async subscribeField({ source, field, datum }) {
    await this.#connectWebSocket();
    await super.subscribeField({ source, field, datum });
  }

  async addFirstRef(instrument, refs, ref) {}

  async removeLastRef(instrument, refs, ref) {
    if (this.connection.readyState === WebSocket.OPEN) {

    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await super.instrumentChanged(source, oldValue, newValue);
  }

  getExchange() {
    switch (this.document.exchange) {
      case 'SPBX':
        return 'spbex';
      default:
        return '';
    }
  }

  getBroker() {
    return this.document.broker.type;
  }
}

export default applyMixins(AlpacaV2PlusTrader, TraderWithSimpleSearch);
