import ppp from '../ppp.js';
import { BROKERS, EXCHANGE, INSTRUMENT_DICTIONARY } from '../lib/const.js';
import { Trader } from './common-trader.js';
import { TradingError } from '../lib/ppp-errors.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} FinamTradeApiTrader
 */
class FinamTradeApiTrader extends Trader {
  getExchange() {
    return EXCHANGE.CUSTOM;
  }

  getExchangeForDBRequest() {
    return {
      $in: [EXCHANGE.SPBX, EXCHANGE.MOEX, EXCHANGE.US]
    };
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.FINAM;
  }

  getBroker() {
    return BROKERS.FINAM;
  }

  async modifyLimitOrders({ instrument, side, value }) {}

  async cancelAllLimitOrders({ instrument, filter } = {}) {}

  async cancelLimitOrder(order) {}

  async placeLimitOrder({ instrument, price, quantity, direction }) {
    const payload = {
      clientId: this.document.account,
      securityBoard: instrument.classCode,
      securityCode: instrument.symbol,
      buySell: direction === 'buy' ? 'Buy' : 'Sell',
      quantity,
      useCredit: true,
      property: 'PutInQueue'
    };

    if (price !== 0) {
      payload.price = +this.fixPrice(instrument, price);
    }

    const orderRequest = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'POST',
          url: 'https://trade-api.finam.ru/public/api/v1/orders',
          body: JSON.stringify(payload),
          headers: {
            'X-Api-Key': this.document.broker.token
          }
        })
      }
    );

    const order = await orderRequest.json();

    if (orderRequest.status !== 200) {
      throw new TradingError({
        details: order
      });
    } else {
      return {
        orderId: order.orderId
      };
    }
  }

  async placeMarketOrder({ instrument, quantity, direction }) {
    return this.placeLimitOrder({ instrument, quantity, direction, price: 0 });
  }

  async formatError(instrument, error) {
    const details = error.details;

    if (details.error) {
      if (/Money shortage/i.test(details.error?.message)) {
        return 'Недостаточно покупательской способности для открытия позиции.';
      }
    }
  }
}

export default FinamTradeApiTrader;
