import ppp from '../ppp.js';
import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../lib/const.js';
import { Trader } from './common-trader.js';
import { AuthorizationError, TradingError } from '../lib/ppp-errors.js';
import { OperationType } from '../vendor/tinkoff/definitions/operations.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} FinamTradeApiTrader
 */
class FinamTradeApiTrader extends Trader {
  subs = {
    positions: new Map(),
    orders: new Map(),
    timeline: new Map()
  };

  refs = {
    positions: new Map(),
    orders: new Map(),
    timeline: new Map()
  };

  orders = new Map();

  positions = new Map();

  #timelineHistory = [];

  constructor(document) {
    super(document);

    this.#timelineHistory = [];
  }

  onOrdersMessage({ order }) {}

  onPositionsMessage() {}

  onTimelineMessage({ item, fromCache }) {}

  async instrumentChanged(source, oldValue, newValue) {
    await super.instrumentChanged(source, oldValue, newValue);

    // Broadcast positions for order widgets (at least).
    if (this.subs.positions.has(source)) {
      for (const [, position] of this.positions) {
        await this.onPositionsMessage({
          position,
          fromCache: true
        });
      }
    }
  }

  async subscribeField({ source, field, datum, condition }) {
    await super.subscribeField({ source, field, datum, condition });

    switch (datum) {
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.POSITION_SIZE:
      case TRADER_DATUM.POSITION_AVERAGE: {
        for (const [_, position] of this.positions) {
          await this.onPositionsMessage({
            position,
            fromCache: true
          });
        }

        break;
      }
      case TRADER_DATUM.CURRENT_ORDER: {
        for (const [_, order] of this.orders) {
          this.onOrdersMessage({
            order
          });
        }

        break;
      }
      case TRADER_DATUM.TIMELINE_ITEM: {
        for (const item of this.#timelineHistory) {
          this.onTimelineMessage({
            item,
            fromCache: true
          });
        }

        break;
      }
    }
  }

  subsAndRefs(datum) {
    return {
      [TRADER_DATUM.POSITION]: [this.subs.positions, this.refs.positions],
      [TRADER_DATUM.POSITION_SIZE]: [this.subs.positions, this.refs.positions],
      [TRADER_DATUM.POSITION_AVERAGE]: [
        this.subs.positions,
        this.refs.positions
      ],
      [TRADER_DATUM.CURRENT_ORDER]: [this.subs.orders, this.refs.orders],
      [TRADER_DATUM.TIMELINE_ITEM]: [this.subs.timeline, this.refs.timeline]
    }[datum];
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

  getInstrumentIconUrl(instrument) {
    if (!instrument) {
      return 'static/instruments/unknown.svg';
    }

    let symbol = instrument?.symbol;

    if (typeof instrument.symbol === 'string') {
      symbol = symbol.split('/')[0].split('~')[0].split('-')[0].split('-RM')[0];
    }

    if (instrument.currency === 'USD') {
      return `static/instruments/stocks/us/${symbol
        .replace(' ', '-')
        .replace('/', '-')}.svg`;
    }

    if (instrument?.currency === 'HKD') {
      return `static/instruments/stocks/hk/${symbol.replace(' ', '-')}.svg`;
    }

    const isRM = instrument?.symbol.endsWith('-RM');

    if (!isRM) {
      if (
        instrument?.exchange === EXCHANGE.MOEX ||
        instrument?.currency === 'RUB'
      ) {
        return `static/instruments/${instrument?.type}s/rus/${symbol.replace(
          ' ',
          '-'
        )}.svg`;
      }
    }

    if ((instrument?.exchange === EXCHANGE.SPBX || isRM) && symbol !== 'TCS') {
      return `static/instruments/stocks/us/${symbol.replace(' ', '-')}.svg`;
    }

    return super.getInstrumentIconUrl(instrument);
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
