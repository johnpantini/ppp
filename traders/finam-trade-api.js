import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../lib/const.js';
import { OperationType } from '../vendor/tinkoff/definitions/operations.js';
import { GlobalTraderDatum, Trader } from './common-trader.js';
import { ConnectionError, TradingError } from '../lib/ppp-errors.js';

class PositionDatum extends GlobalTraderDatum {
  #timer;

  #shouldLoop = false;

  portfolio;

  positions = new Map();

  #getInstrument(position) {
    let symbol = position.securityCode;

    if (position.market === 'Mma') {
      symbol = `${symbol}~US`;
    } else if (position.market === 'Stock') {
      switch (symbol) {
        case 'ASTR':
          symbol = 'ASTR~MOEX';

          break;
        case 'FIVE':
          symbol = 'FIVE~MOEX';

          break;
        case 'GOLD':
          symbol = 'GOLD~MOEX';

          break;
      }
    }

    return this.trader.instruments.get(symbol);
  }

  firstReferenceAdded() {
    this.portfolio = null;

    clearTimeout(this.#timer);

    this.#shouldLoop = true;

    return this.#fetchPortfolioLoop();
  }

  lastReferenceRemoved() {
    this.portfolio = null;

    clearTimeout(this.#timer);

    this.#shouldLoop = false;
  }

  async #fetchPortfolioLoop() {
    if (this.#shouldLoop) {
      try {
        const { positions, money } = await this.trader.getPortfolio();
        const balances = {};

        for (const { currency, balance } of money ?? []) {
          balances[currency] ??= 0;
          balances[currency] = balances[currency] + balance;
        }

        for (const currency in balances) {
          this.dataArrived({
            isBalance: true,
            position: {
              currency,
              available: balances[currency]
            }
          });
        }

        const newPositions = new Set();

        for (const p of positions) {
          const positionId = `${p.securityCode}:${p.market}`;

          newPositions.add(positionId);

          this.positions.set(positionId, p);
          this.dataArrived({
            isBalance: false,
            position: p
          });
        }

        for (const [positionId, position] of this.positions) {
          if (!newPositions.has(positionId)) {
            // This position has been closed.
            position.balance = 0;

            this.dataArrived({
              isBalance: false,
              position
            });
            this.positions.delete(positionId);
          }
        }

        this.#timer = setTimeout(() => {
          this.#fetchPortfolioLoop();
        }, 750);
      } catch (e) {
        console.error(e);

        this.#timer = setTimeout(() => {
          this.#fetchPortfolioLoop();
        }, 750);
      }
    }
  }

  filter(data, source, key, datum) {
    if (datum !== TRADER_DATUM.POSITION) {
      if (data.isBalance) {
        return data.position.currency === source.getAttribute('balance');
      }

      return this.trader.instrumentsAreEqual(
        this.#getInstrument(data.position),
        source.instrument
      );
    } else {
      return true;
    }
  }

  valueKeyForData(data) {
    if (data.isBalance) {
      return data.position.currency;
    } else {
      return `${data.position.securityCode}:${data.position.market}`;
    }
  }

  [TRADER_DATUM.POSITION](data) {
    if (data.isBalance) {
      return {
        symbol: data.position.currency,
        lot: 1,
        exchange: EXCHANGE.CUSTOM,
        isCurrency: true,
        isBalance: true,
        size: data.position.available,
        accountId: this.trader.document.account
      };
    } else {
      const { position } = data;
      const instrument = this.#getInstrument(position);

      if (instrument) {
        return {
          instrument,
          symbol: instrument.symbol,
          lot: instrument.lot,
          exchange: instrument.exchange,
          averagePrice: position.averagePrice,
          isCurrency: false,
          isBalance: false,
          size: position.balance,
          accountId: this.trader.document.account
        };
      }
    }
  }

  [TRADER_DATUM.POSITION_SIZE](data) {
    if (data.isBalance) {
      return data.position.available;
    } else {
      const instrument = this.#getInstrument(data.position);

      if (instrument) {
        return data.position.balance / instrument.lot;
      }
    }
  }

  [TRADER_DATUM.POSITION_AVERAGE](data) {
    if (!data.isBalance) {
      return data.position.averagePrice;
    }
  }
}

class OrderAndTimelineDatum extends GlobalTraderDatum {
  #timer;

  #shouldLoop = false;

  orders = new Map();

  filter(data, source, key, datum) {
    if (datum === TRADER_DATUM.ACTIVE_ORDER) {
      // Active and Matched to removed orders properly.
      return true;
    } else if (datum === TRADER_DATUM.TIMELINE_ITEM) {
      return data.status === 'Matched';
    }
  }

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

  async #fetchOrdersLoop() {
    if (this.#shouldLoop) {
      try {
        const orders = await this.trader.getOrdersAndExecutions();
        const newOrders = new Set();

        for (const o of orders) {
          newOrders.add(o.orderNo);

          if (!this.orders.has(o.orderNo)) {
            this.orders.set(o.orderNo, o);
            this.dataArrived(o);
          }
        }

        for (const [orderNo, order] of this.orders) {
          if (!newOrders.has(orderNo)) {
            // Order is absent, hide it from listing.
            order.status = 'Unknown';

            this.dataArrived(order);
            this.orders.delete(orderNo);
          }
        }

        this.#timer = setTimeout(() => {
          this.#fetchOrdersLoop();
        }, 750);
      } catch (e) {
        console.error(e);

        this.#timer = setTimeout(() => {
          this.#fetchOrdersLoop();
        }, 750);
      }
    }
  }

  [TRADER_DATUM.ACTIVE_ORDER](order) {
    const instrument = this.trader.securities
      .get(order.securityBoard)
      ?.get(order.securityCode);

    if (instrument) {
      return {
        instrument,
        orderId: order.orderNo,
        extraId: order.transactionId,
        symbol: instrument.symbol,
        exchange: instrument.exchange,
        orderType: 'limit',
        side: order.buySell.toLowerCase(),
        status: this.trader.getOrderStatus(order),
        placedAt: new Date(order.createdAt),
        endsAt: null,
        quantity: order.quantity,
        filled: order.quantity - order.balance,
        price: order.price
      };
    }
  }

  [TRADER_DATUM.TIMELINE_ITEM](order) {
    const instrument = this.trader.securities
      .get(order.securityBoard)
      ?.get(order.securityCode);

    if (instrument) {
      return {
        instrument,
        operationId: order.orderNo,
        accruedInterest: 0,
        commission: 0,
        parentId: order.orderNo,
        symbol: instrument.symbol,
        type:
          order.buySell === 'Buy'
            ? OperationType.OPERATION_TYPE_BUY
            : OperationType.OPERATION_TYPE_SELL,
        exchange: instrument.exchange,
        quantity: order.quantity,
        price: order.price,
        createdAt: order.createdAt
      };
    }
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} FinamTradeApiTrader
 */
class FinamTradeApiTrader extends Trader {
  #securities = new Map();

  connectorUrl;

  get securities() {
    return this.#securities;
  }

  constructor(document) {
    super(document, [
      {
        type: PositionDatum,
        datums: [
          TRADER_DATUM.POSITION,
          TRADER_DATUM.POSITION_SIZE,
          TRADER_DATUM.POSITION_AVERAGE
        ]
      },
      {
        type: OrderAndTimelineDatum,
        datums: [TRADER_DATUM.ACTIVE_ORDER, TRADER_DATUM.TIMELINE_ITEM]
      }
    ]);

    if (typeof document.connectorUrl !== 'string') {
      throw new ConnectionError({ details: this });
    }
  }

  instrumentCacheCallback(instrument) {
    if (instrument.classCode) {
      if (!this.securities.has(instrument.classCode)) {
        this.securities.set(instrument.classCode, new Map());
      }

      this.securities
        .get(instrument.classCode)
        .set(this.getSymbol(instrument), instrument);
    }
  }

  getOrderStatus(o = {}) {
    switch (o.status) {
      case 'Cancelled':
        return 'canceled';
      case 'Active':
        return 'working';
      case 'Matched':
        return 'filled';
      case 'None':
        return 'inactive';
      case 'Unknown':
        return 'unspecified';
    }
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

  async getPortfolio() {
    const portfolioResponse = await fetch(
      `${this.document.connectorUrl}fetch`,
      {
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          url: `https://trade-api.finam.ru/public/api/v1/portfolio?ClientId=${this.document.account}&Content.IncludeMoney=true&Content.IncludePositions=true&Content.IncludeMaxBuySell=true`,
          headers: {
            'X-Api-Key': this.document.broker.token
          }
        })
      }
    );

    const { data } = await portfolioResponse.json();

    if (portfolioResponse.ok) {
      return data ?? {};
    } else {
      return {};
    }
  }

  async getOrdersAndExecutions() {
    const ordersResponse = await fetch(`${this.document.connectorUrl}fetch`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'GET',
        url: `https://trade-api.finam.ru/public/api/v1/orders?ClientId=${this.document.account}&IncludeMatched=true&IncludeCanceled=false&IncludeActive=true`,
        headers: {
          'X-Api-Key': this.document.broker.token
        }
      })
    });

    const { data } = await ordersResponse.json();

    if (ordersResponse.ok) {
      return data.orders ?? [];
    } else {
      return [];
    }
  }

  async modifyLimitOrders({ instrument, side, value }) {
    const orders = this.datums[TRADER_DATUM.ACTIVE_ORDER].orders;

    for (const [, o] of orders) {
      const status = this.getOrderStatus(o);
      const orderInstrument = this.securities
        .get(o.securityBoard)
        ?.get(o.securityCode);

      if (
        status === 'working' &&
        (o.buySell.toLowerCase() === side || side === 'all')
      ) {
        if (
          instrument &&
          !this.instrumentsAreEqual(instrument, orderInstrument)
        )
          continue;

        if (orderInstrument?.minPriceIncrement >= 0) {
          // US stocks only.
          let minPriceIncrement = +o.price < 1 ? 0.0001 : 0.01;

          if (orderInstrument.exchange !== EXCHANGE.US) {
            minPriceIncrement = orderInstrument.minPriceIncrement;
          }

          const price = +this.fixPrice(
            orderInstrument,
            +o.price + minPriceIncrement * value
          );

          o.extraId = o.transactionId;

          await this.cancelLimitOrder(o);
          await this.placeLimitOrder({
            instrument: orderInstrument,
            price,
            quantity: o.balance,
            direction: o.buySell.toLowerCase()
          });
        }
      }
    }
  }

  async cancelAllLimitOrders({ instrument, filter } = {}) {
    const orders = this.datums[TRADER_DATUM.ACTIVE_ORDER].orders;

    for (const [, o] of orders) {
      const status = this.getOrderStatus(o);
      const orderInstrument = this.securities
        .get(o.securityBoard)
        ?.get(o.securityCode);

      if (orderInstrument && status === 'working') {
        if (
          instrument &&
          !this.instrumentsAreEqual(instrument, orderInstrument)
        )
          continue;

        if (filter === 'buy' && o.buySell !== 'Buy') {
          continue;
        }

        if (filter === 'sell' && o.buySell !== 'Sell') {
          continue;
        }

        o.extraId = o.transactionId;

        await this.cancelLimitOrder(o);
      }
    }
  }

  async cancelLimitOrder(order) {
    const orderResponse = await fetch(`${this.document.connectorUrl}fetch`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'DELETE',
        url: `https://trade-api.finam.ru/public/api/v1/orders/?ClientId=${this.document.account}&TransactionId=${order.extraId}`,
        headers: {
          'X-Api-Key': this.document.broker.token
        }
      })
    });

    const orderData = await orderResponse.json();

    if (orderResponse.ok) {
      return {
        orderId: order.orderId
      };
    } else {
      throw new TradingError({
        message: orderData.error?.message
      });
    }
  }

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

    const orderResponse = await fetch(`${this.document.connectorUrl}fetch`, {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://trade-api.finam.ru/public/api/v1/orders',
        headers: {
          'X-Api-Key': this.document.broker.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    });

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
      } else if (/ market standby mode/i.test(details.error?.message)) {
        return 'Инструмент сейчас не торгуется.';
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
