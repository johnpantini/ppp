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
    const ordersResponse = await fetch(
      `https://trade-api.finam.ru/public/api/v1/orders?ClientId=${this.document.account}&IncludeMatched=false&IncludeCanceled=false&IncludeActive=true`,
      {
        headers: {
          'X-Api-Key': this.document.broker.token
        }
      }
    );

    const { data } = await ordersResponse.json();

    if (ordersResponse.ok) {
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
      securityCode: this.getSymbol(instrument),
      buySell: direction === 'buy' ? 'Buy' : 'Sell',
      quantity,
      useCredit: true,
      property: 'PutInQueue'
    };

    if (price !== 0) {
      payload.price = +this.fixPrice(instrument, price);
    }

    const orderResponse = await fetch(
      'https://trade-api.finam.ru/public/api/v1/orders',
      {
        method: 'POST',
        headers: {
          'X-Api-Key': this.document.broker.token
        },
        body: JSON.stringify(payload)
      }
    );

    const order = await orderResponse.json();

    if (orderResponse.status !== 200) {
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

  adoptInstrument(instrument = {}) {
    if (
      (instrument.exchange === EXCHANGE.US ||
        instrument.exchange === EXCHANGE.UTEX_MARGIN_STOCKS) &&
      this.instruments.has(`${instrument.symbol}~US`)
    ) {
      return this.instruments.get(`${instrument.symbol}~US`);
    }

    if (
      instrument.exchange === EXCHANGE.MOEX &&
      this.getSymbol(instrument) === 'ASTR'
    ) {
      return this.instruments.get(`ASTR~MOEX`);
    }

    if (
      instrument.exchange === EXCHANGE.MOEX &&
      this.getSymbol(instrument) === 'FIVE'
    ) {
      return this.instruments.get(`FIVE~MOEX`);
    }

    if (
      instrument.exchange === EXCHANGE.MOEX &&
      this.getSymbol(instrument) === 'GOLD'
    ) {
      return this.instruments.get(`GOLD~MOEX`);
    }

    if (
      instrument.symbol === 'TCS' &&
      (instrument.exchange === EXCHANGE.US ||
        instrument.exchange === EXCHANGE.UTEX_MARGIN_STOCKS)
    ) {
      return this.instruments.get(`TCS~US`);
    }

    return super.adoptInstrument(instrument);
  }
}

export default FinamTradeApiTrader;
