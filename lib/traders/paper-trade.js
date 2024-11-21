/** @decorator */

import {
  TRADER_DATUM,
  OPERATION_TYPE,
  getInstrumentDictionaryMeta
} from '../const.js';
import { observable } from '../fast/observable.js';
import { uuidv4 } from '../ppp-crypto.js';
import { Tmpl } from '../tmpl.js';
import {
  ConditionalOrderDatum,
  GlobalTraderDatum,
  Trader,
  TraderEventDatum,
  pppTraderInstanceForWorkerIs
} from './trader-worker.js';
import { TradingError } from '../ppp-exceptions.js';
import { stringToFloat } from '../intl.js';

export class PositionsDatum extends GlobalTraderDatum {
  firstReferenceAdded() {
    this.trader.broadcastBalances({ origin: 'datum' });

    return this.trader.broadcastPositions({ origin: 'datum' });
  }

  valueKeyForData(data) {
    // operationId can be @CLEAR.
    return data.symbol ?? data.operationId;
  }

  filter(data, source, key, datum) {
    if (datum !== TRADER_DATUM.POSITION) {
      const isBalance = data.isCurrency;

      if (isBalance) {
        return data.symbol === source.getAttribute('balance');
      }

      return data.symbol === this.trader.getSymbol(source.instrument);
    } else {
      return true;
    }
  }

  [TRADER_DATUM.POSITION](data) {
    if (!data.isBalance) {
      if (typeof data.size === 'number' && data.size !== 0) {
        this.trader.positions.set(data.symbol, data);
      } else {
        if (data.operationId === '@CLEAR') {
          return {
            operationId: data.operationId,
            instrument: null
          };
        }

        this.trader.positions.delete(data.symbol);
      }
    }

    return data;
  }

  [TRADER_DATUM.POSITION_SIZE](data) {
    return data.size;
  }

  [TRADER_DATUM.POSITION_AVERAGE](data) {
    const isBalance = data.isCurrency;

    if (isBalance) {
      return;
    }

    return data.averagePrice;
  }
}

export class TimelineDatum extends GlobalTraderDatum {
  firstReferenceAdded() {
    // Broadcast executions.
    for (const t of this.trader.timeline) {
      this.dataArrived(t, { origin: 'datum' });
    }
  }

  valueKeyForData(data) {
    return data.operationId;
  }

  [TRADER_DATUM.TIMELINE_ITEM](data) {
    return data;
  }
}

export class RealOrderDatum extends GlobalTraderDatum {
  firstReferenceAdded() {
    // Broadcast all orders.
    for (const [, orders] of this.trader.orders) {
      for (const o of orders) {
        this.dataArrived(o, { origin: 'datum' });
      }
    }
  }

  valueKeyForData(data) {
    return data.orderId;
  }

  [TRADER_DATUM.REAL_ORDER](data) {
    // Trigger observables.
    return { ...data };
  }
}

export class InstrumentSource {
  sourceID = uuidv4();

  instrument;

  parent;

  trader;

  constructor(instrument, parent, trader) {
    this.instrument = instrument;
    this.parent = parent;
    this.trader = trader;
  }

  @observable
  orderbook;

  orderbookChanged(oldValue, newValue) {
    if (newValue) {
      this.orderbook.bids = (newValue.bids ?? []).sort((a, b) => {
        return b.price - a.price || b.volume - a.volume;
      });

      this.orderbook.asks = (newValue.asks ?? []).sort((a, b) => {
        return a.price - b.price || b.volume - a.volume;
      });

      return this.parent.processAllOrders(this.instrument, this.orderbook);
    }
  }

  async subscribe() {
    return this.trader.subscribeFields({
      source: this,
      fieldDatumPairs: {
        orderbook: TRADER_DATUM.ORDERBOOK
      }
    });
  }

  async unsubscribe() {
    this.orderbook = null;

    return this.trader.unsubscribeFields({
      source: this,
      fieldDatumPairs: {
        orderbook: TRADER_DATUM.ORDERBOOK
      }
    });
  }
}

/**
 * @typedef {Object} PaperTradeTrader
 */
class PaperTradeTrader extends Trader {
  #dictionaryMeta;

  // By symbol.
  orders = new Map();

  // By symbol.
  positions = new Map();

  timeline = [];

  nextOrderId = 0;

  nextOperationId = 0;

  // By currency.
  balances = new Map();

  commissionFunc;

  // Orderbook holders.
  sources = new Map();

  bookTrader;

  // Not ready yet.
  #marketOrderCoef = 0;

  constructor(document) {
    super(document, [
      {
        type: PositionsDatum,
        datums: [
          TRADER_DATUM.POSITION,
          TRADER_DATUM.POSITION_SIZE,
          TRADER_DATUM.POSITION_AVERAGE
        ]
      },
      {
        type: TimelineDatum,
        datums: [TRADER_DATUM.TIMELINE_ITEM]
      },
      {
        type: RealOrderDatum,
        datums: [TRADER_DATUM.REAL_ORDER]
      },
      {
        type: ConditionalOrderDatum,
        datums: [TRADER_DATUM.CONDITIONAL_ORDER]
      },
      {
        type: TraderEventDatum,
        datums: [TRADER_DATUM.TRADER]
      }
    ]);

    this.balances.set('USD', document.initialDepositUSD);
    this.balances.set('RUB', document.initialDepositRUB);

    this.#dictionaryMeta = getInstrumentDictionaryMeta(
      this.document.dictionary
    );
    this.#marketOrderCoef = document.marketOrderCoeff ?? 0.3;
  }

  getExchange() {
    return this.#dictionaryMeta.exchange;
  }

  getObservedAttributes() {
    return ['balance'];
  }

  getDictionary() {
    return this.document.dictionary;
  }

  getBroker() {
    return this.#dictionaryMeta.broker;
  }

  serialize() {
    return {
      ...super.serialize(),
      balances: Object.fromEntries(this.balances),
      timeline: this.timeline,
      orders: this.getWorkingOrders(),
      positions: Object.fromEntries(this.positions),
      dictionaryMeta: this.#dictionaryMeta
    };
  }

  async oneTimeInitializationCallback() {
    this.commissionFunc = new Function(
      'trade',
      await new Tmpl().render(this, this.document.commFunctionCode, {})
    );

    this.bookTrader = await ppp.getOrCreateTrader(this.document.bookTrader);

    this.$$debug('this.bookTrader: %o', this.bookTrader);
  }

  getWorkingOrders(instrument) {
    if (!instrument) {
      const allWorkingOrders = [];

      this.orders.forEach((orders) => {
        orders.forEach((order) => {
          if (order.status === 'working') {
            allWorkingOrders.push(order);
          }
        });
      });

      return allWorkingOrders;
    } else {
      return (this.orders.get(instrument.symbol) ?? []).filter(
        (o) => o.status === 'working'
      );
    }
  }

  processOrder(order, orderbook) {
    if (order?.status === 'working' && order.filled < order.quantity) {
      const iterable =
        order.side === 'buy' ? orderbook?.asks ?? [] : orderbook?.bids ?? [];
      const filled = order.filled;

      // Sweep thru the book.
      for (const { price, volume } of iterable) {
        if (!price || !volume) {
          continue;
        }

        let priceIsEligibleForFill = false;

        if (order.side === 'buy') {
          priceIsEligibleForFill = price <= order.price;
        } else {
          priceIsEligibleForFill = price >= order.price;
        }

        if (priceIsEligibleForFill) {
          const rest = order.quantity - order.filled;

          if (rest >= volume) {
            order.filled += volume;

            this.createExecution({
              instrument: order.instrument,
              price,
              quantity: volume,
              side: order.side,
              parentId: order.orderId
            });
          } else {
            order.filled += rest;

            this.createExecution({
              instrument: order.instrument,
              price,
              quantity: rest,
              side: order.side,
              parentId: order.orderId
            });
          }
        }

        if (order.filled === order.quantity) {
          order.status = 'filled';

          break;
        }
      }

      if (filled !== order.filled) {
        this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);
      }
    }
  }

  async processAllOrders(instrument, orderbook) {
    const workingOrders = this.getWorkingOrders(instrument);
    const book = orderbook ?? (await this.#orderbookNeeded(instrument));

    for (const order of workingOrders) {
      this.processOrder(order, book);
    }

    if (!this.getWorkingOrders(instrument).length) {
      await this.sources.get(instrument.symbol).unsubscribe();
    }
  }

  createExecution({ instrument, price, quantity, side, parentId }) {
    const commission = this.commissionFunc({
      instrument,
      price,
      quantity,
      side
    });
    const balance = this.balances.get(instrument.currency) ?? 0;
    const timelineItem = {
      instrument,
      operationId: uuidv4(),
      accruedInterest: 0,
      commission,
      parentId,
      symbol: instrument.symbol,
      type:
        side === 'buy'
          ? OPERATION_TYPE.OPERATION_TYPE_BUY
          : OPERATION_TYPE.OPERATION_TYPE_SELL,
      exchange: this.getExchange(),
      quantity,
      price,
      createdAt: new Date().toISOString()
    };

    this.timeline.push(timelineItem);
    this.datums[TRADER_DATUM.TIMELINE_ITEM].dataArrived(timelineItem);

    if (side === 'buy') {
      this.balances.set(
        instrument.currency,
        balance - quantity * price - commission
      );
    } else {
      this.balances.set(
        instrument.currency,
        balance + quantity * price - commission
      );
    }

    this.broadcastBalances({});
    this.broadcastPositions({ instrument });
  }

  broadcastBalances({ origin } = {}) {
    for (const [symbol, size] of this.balances) {
      this.datums[TRADER_DATUM.POSITION].dataArrived(
        {
          symbol,
          lot: 1,
          exchange: this.getExchange(),
          averagePrice: null,
          isCurrency: true,
          isBalance: true,
          size,
          accountId: this.document._id
        },
        { origin }
      );
    }
  }

  broadcastPositions({ instrument, origin }) {
    if (typeof instrument === 'undefined') {
      for (const [symbol, position] of this.positions) {
        this.broadcastPositions({ instrument: position.instrument, origin });
      }

      return;
    }

    const trades = this.timeline.filter((t) =>
      this.instrumentsAreEqual(t.instrument, instrument)
    );

    // Always non-negative.
    let currentSum = 0;
    // Can be negative.
    let total = 0;
    let size = 0;

    for (let trade of trades) {
      const isBuy = trade.type !== OPERATION_TYPE.OPERATION_TYPE_SELL;

      if (isBuy) {
        size += trade.quantity;
      } else {
        size -= trade.quantity;
      }

      if (total === 0) {
        currentSum = trade.price * trade.quantity;

        if (isBuy) {
          total += trade.quantity;
        } else {
          // Sell.
          total -= trade.quantity;
        }
      } else {
        // Total is non-zero.
        if (isBuy) {
          if (total > 0) {
            currentSum += trade.price * trade.quantity;
            total += trade.quantity;
          } else if (total + trade.quantity >= 0) {
            // A reversal.
            total += trade.quantity;
            currentSum = trade.price * total;
          }
        } else {
          // Sell.
          if (total < 0) {
            currentSum += trade.price * trade.quantity;
            total -= trade.quantity;
          } else if (total - trade.quantity <= 0) {
            // A reversal.
            total -= trade.quantity;
            currentSum = trade.price * total;
          }
        }
      }

      if (size === 0) {
        total = 0;
        currentSum = 0;
      }
    }

    // Weighted Average.
    const averagePrice = Math.abs(currentSum / total);

    this.datums[TRADER_DATUM.POSITION].dataArrived(
      {
        instrument,
        symbol: instrument.symbol,
        lot: instrument.lot,
        exchange: this.getExchange(),
        averagePrice,
        isCurrency: false,
        isBalance: false,
        size,
        accountId: this.document._id
      },
      {
        origin
      }
    );
  }

  async #orderbookNeeded(instrument) {
    this.$$debug('#orderbookNeeded for %s', instrument.symbol);

    if (!instrument) {
      return;
    }

    if (typeof this.sources.get(instrument.symbol) === 'undefined') {
      this.sources.set(
        instrument.symbol,
        new InstrumentSource(instrument, this, this.bookTrader)
      );
    }

    const source = this.sources.get(instrument.symbol);

    await source.subscribe();

    this.$$debug(
      '#orderbookNeeded called source[%s].subscribe() for %s',
      source.sourceID,
      instrument.symbol
    );

    return (
      source.orderbook ?? {
        bids: [],
        asks: []
      }
    );
  }

  trackingIdToOrderId(trackingId) {
    return trackingId;
  }

  async placeLimitOrder({
    instrument,
    price,
    quantity,
    direction,
    orderbook,
    options = {}
  }) {
    if (!this.orders.has(instrument.symbol)) {
      this.orders.set(instrument.symbol, []);
    }

    const order = {
      instrument,
      orderId: ++this.nextOrderId,
      symbol: instrument.symbol,
      exchange: instrument.exchange,
      orderType: 'limit',
      side: direction,
      status: 'working',
      placedAt: new Date().toISOString(),
      endsAt: null,
      quantity: stringToFloat(quantity),
      filled: 0,
      price: this.fixPrice(instrument, price)
    };

    order.trackingId = options.trackingId ?? order.orderId;

    this.orders.get(instrument.symbol).push(order);
    this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);

    if (orderbook) {
      this.processOrder(order, orderbook);
    } else {
      this.processOrder(order, await this.#orderbookNeeded(order.instrument));
    }

    return {
      orderId: order.orderId,
      trackingId: order.trackingId
    };
  }

  async placeMarketOrder({}) {
    throw new TradingError({
      details: {
        code: 'E_MARKET_ORDERS_NOT_SUPPORTED'
      }
    });
  }

  async modifyRealOrder({ orderId, price, quantity } = {}) {
    let order;

    for (const [, orders] of this.orders) {
      for (const o of orders) {
        if (o.orderId === orderId) {
          order = o;

          break;
        }
      }

      if (order) {
        break;
      }
    }

    if (!order) {
      throw new TradingError({
        message: 'E_ORDER_NOT_FOUND',
        details: {
          orderId,
          price,
          quantity
        }
      });
    }

    if (order.status === 'working') {
      order.price = price;
      order.quantity = quantity;
      order.filled = 0;

      this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);
    }

    await this.processAllOrders(order.instrument);

    return {
      orderId: order.orderId,
      details: {}
    };
  }

  async modifyRealOrders({ instrument, side, value }) {
    const orders = this.orders.get(instrument.symbol) ?? [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      if (
        order.status === 'working' &&
        (order.side === side || side === 'all')
      ) {
        if (instrument && order.symbol !== this.getSymbol(instrument)) continue;

        if (!instrument.minPriceIncrement) {
          instrument.minPriceIncrement = order.price < 1 ? 0.0001 : 0.01;
        }

        const price = this.fixPrice(
          instrument,
          order.price + instrument.minPriceIncrement * value
        );

        if (price < 0.0001) continue;

        order.price = price;

        this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);
      }
    }

    return this.processAllOrders(instrument);
  }

  async cancelAllRealOrders({ instrument, filter } = {}) {
    const orders = instrument
      ? this.orders.get(instrument.symbol) ?? []
      : Array.from(this.orders.values()).flat();
    const promises = [];

    for (const o of orders) {
      if (o.status === 'working') {
        if (instrument && o.symbol !== this.getSymbol(instrument)) continue;

        if (filter === 'buy' && o.side !== 'buy') {
          continue;
        }

        if (filter === 'sell' && o.side !== 'sell') {
          continue;
        }

        promises.push(this.cancelRealOrder(o));
      }
    }

    return Promise.all(promises);
  }

  async cancelRealOrder(order) {
    if (order.status === 'working') {
      order.status = 'canceled';

      this.orders.forEach((orders) => {
        orders.forEach((o) => {
          if (o.orderId === order.orderId) {
            o.status = 'canceled';
          }
        });
      });

      this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);
    }

    await this.processAllOrders(order.instrument);

    return {
      orderId: order.orderId
    };
  }

  async clear() {
    this.balances.has('USD') &&
      this.balances.set('USD', this.document.initialDepositUSD);
    this.balances.has('RUB') &&
      this.balances.set('RUB', this.document.initialDepositRUB);
    this.broadcastBalances({});

    this.timeline = [];

    this.datums[TRADER_DATUM.TIMELINE_ITEM].dataArrived(
      {
        operationId: '@CLEAR'
      },
      {
        doNotSaveValue: true
      }
    );

    this.positions.clear();

    this.datums[TRADER_DATUM.POSITION].dataArrived(
      {
        operationId: '@CLEAR'
      },
      {
        doNotSaveValue: true
      }
    );

    return this.cancelAllRealOrders();
  }

  async call(data = {}) {
    const method = data.method;

    if (method === 'clear') {
      return this.clear();
    }
  }

  getErrorI18nKey({ error }) {
    return error.details?.code;
  }
}

pppTraderInstanceForWorkerIs(PaperTradeTrader);

export default PaperTradeTrader;
