import ppp from '../ppp.js';
import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../lib/const.js';
import { GlobalTraderDatum, Trader } from './common-trader.js';
import { TradingError } from '../lib/ppp-errors.js';

class ActiveOrderDatum extends GlobalTraderDatum {
  #timer;

  #shouldLoop = false;

  orders = new Map();

  firstReferenceAdded() {
    this.orders.clear();

    clearTimeout(this.#timer);

    this.#shouldLoop = true;

    return this.#fetchOrdersLoop();
  }

  lastReferenceRemoved() {
    this.orders.clear();
    clearTimeout(this.#timer);

    this.#shouldLoop = false;
  }

  valueKeyForData(data) {
    return data.transactionId;
  }

  async #fetchOrdersLoop() {}

  [TRADER_DATUM.ACTIVE_ORDER](order) {}
}

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} FinamTradeApiTrader
 */
class FinamTradeApiTrader extends Trader {
  constructor(document) {
    super(document, [
      {
        type: ActiveOrderDatum,
        datums: [TRADER_DATUM.ACTIVE_ORDER]
      }
    ]);
  }

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

  async getAllOpenOrders() {
    const ordersRequest = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          url: `https://trade-api.finam.ru/public/api/v1/orders?ClientId=${this.document.account}&IncludeMatched=false&IncludeCanceled=false&IncludeActive=true`,
          headers: {
            'X-Api-Key': this.document.broker.token
          }
        })
      }
    );

    const { data } = await ordersRequest.json();

    if (ordersRequest.ok) {
      return data.orders ?? [];
    } else {
      return [];
    }
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
      } else if (
        /confirm your qualification level/i.test(details.error?.message)
      ) {
        return 'Нет необходимой квалификации для торговли инструментом.';
      }
    }
  }

  adoptInstrument(instrument) {
    if (
      instrument?.exchange === EXCHANGE.US &&
      this.instruments.has(`${instrument.symbol}~US`)
    ) {
      return this.instruments.get(`${instrument.symbol}~US`);
    }

    return super.adoptInstrument(instrument);
  }
}

export default FinamTradeApiTrader;
