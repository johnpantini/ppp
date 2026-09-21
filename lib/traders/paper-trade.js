/** @decorator */

import {
  TRADER_DATUM,
  OPERATION_TYPE,
  getInstrumentDictionaryMeta,
  INSTRUMENT_DICTIONARY
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
import { stringToFloat, getInstrumentQuantityPrecision } from '../intl.js';

/**
 * @typedef {object} PaperLimitOrderOptions
 * @property {import('../types.js').Instrument} instrument Instrument to trade.
 * @property {number | string} price Limit price, rounded to the instrument tick.
 * @property {number | string} quantity Quantity accepting comma decimal input.
 * @property {'buy' | 'sell'} direction Order side.
 * @property {import('../types.js').Orderbook} [orderbook] Explicit book for deterministic execution.
 * @property {{trackingId?: string | number}} [options] Optional caller tracking ID.
 */

/**
 * @typedef {object} PaperOrderModification
 * @property {string | number} orderId Existing order identifier.
 * @property {number | string} price Replacement limit price.
 * @property {number | string} quantity Replacement total quantity, including previous fills.
 * @property {import('../types.js').Orderbook} [orderbook] Book for synchronous processing.
 */

/** Publishes simulated positions and currency balances through the portfolio API. */
export class PositionsDatum extends GlobalTraderDatum {
  /** Replays the account's current balances and positions for its first subscriber. */
  firstReferenceAdded() {
    this.trader.broadcastBalances({ origin: 'datum' });

    return this.trader.broadcastPositions({ origin: 'datum' });
  }

  /**
   * @param {object} data Position or clear marker.
   * @returns {string} Symbol or operation identifier.
   */
  valueKeyForData(data) {
    // operationId can be @CLEAR.
    return data.symbol ?? data.operationId;
  }

  /** @override Selects balance/position values for the receiving source's instrument. */
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

/** Replays and publishes executions, keyed by their operation IDs. */
export class TimelineDatum extends GlobalTraderDatum {
  /** Publishes the account's execution history when observation starts. */
  firstReferenceAdded() {
    // Broadcast executions.
    for (const t of this.trader.timeline) {
      this.dataArrived(t, { origin: 'datum' });
    }
  }

  /**
   * @param {object} data Execution.
   * @returns {string} Stable operation ID.
   */
  valueKeyForData(data) {
    return data.operationId;
  }

  [TRADER_DATUM.TIMELINE_ITEM](data) {
    return data;
  }
}

/** Publishes simulated limit orders using the same datum as broker orders. */
export class RealOrderDatum extends GlobalTraderDatum {
  /** Replays working and completed orders on the first subscription. */
  firstReferenceAdded() {
    // Broadcast all orders.
    for (const [, orders] of this.trader.orders) {
      for (const o of orders) {
        this.dataArrived(o, { origin: 'datum' });
      }
    }
  }

  /**
   * @param {import('../types.js').LimitOrder} data Order.
   * @returns {string | number} Order ID.
   */
  valueKeyForData(data) {
    return data.orderId;
  }

  [TRADER_DATUM.REAL_ORDER](data) {
    // Trigger observables.
    return { ...data };
  }
}

/** Keeps one upstream orderbook subscription for a simulated instrument. */
export class InstrumentSource {
  sourceID = uuidv4();

  instrument;

  parent;

  trader;

  /**
   * @param {import('../types.js').Instrument} instrument Instrument to observe.
   * @param {PaperTradeTrader} parent Account processing matching orders.
   * @param {Trader} trader Upstream provider of orderbook data.
   */
  constructor(instrument, parent, trader) {
    this.instrument = instrument;
    this.parent = parent;
    this.trader = trader;
  }

  /** @type {import('../types.js').Orderbook | null} Most recent orderbook. */
  @observable
  orderbook;

  /**
   * Sorts copied level arrays and processes pending orders on a book update.
   * @param {import('../types.js').Orderbook | null} oldValue Previous book.
   * @param {import('../types.js').Orderbook | null} newValue Incoming book.
   * @returns {Promise<void> | undefined} Completion of account processing.
   */
  orderbookChanged(oldValue, newValue) {
    if (newValue) {
      // Copy before sorting: the book object is shared with other subscribers.
      this.orderbook.bids = [...(newValue.bids ?? [])].sort((a, b) => {
        return b.price - a.price || b.volume - a.volume;
      });

      this.orderbook.asks = [...(newValue.asks ?? [])].sort((a, b) => {
        return a.price - b.price || b.volume - a.volume;
      });

      return this.parent.processAllOrders(this.instrument, this.orderbook);
    }
  }

  /** @returns {Promise<unknown>} Completion of the upstream book subscription. */
  async subscribe() {
    return this.trader.subscribeFields({
      source: this,
      fieldDatumPairs: {
        orderbook: TRADER_DATUM.ORDERBOOK
      }
    });
  }

  /**
   * Clears the saved book and releases the upstream subscription.
   * @returns {Promise<unknown>}
   */
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
 * Simulates limit-order executions against observed orderbooks.
 * Balances include per-execution commission; positions use weighted average cost.
 * Market orders are explicitly unsupported.
 */
class PaperTradeTrader extends Trader {
  #dictionaryMeta;

  /** @type {Map<string, import('../types.js').LimitOrder[]>} All orders grouped by symbol. */
  orders = new Map();

  /** @type {Map<string, object>} Last published nonzero positions by symbol. */
  positions = new Map();

  /** @type {object[]} Executions in chronological insertion order. */
  timeline = [];

  nextOrderId = 0;

  nextOperationId = 0;

  /** @type {Map<string, number>} Available account balances by currency. */
  balances = new Map();

  /** @type {(trade: {instrument: import('../types.js').Instrument, price: number, quantity: number, side: 'buy' | 'sell'}) => number} Compiled account commission rule. */
  commissionFunc;

  /** @type {Map<string, InstrumentSource>} Reusable upstream sources by symbol. */
  sources = new Map();

  /** @type {Trader} Upstream provider selected during initialization. */
  bookTrader;

  // Not ready yet.
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: OK
  #marketOrderCoef = 0;

  /** @param {import('../types.js').TraderDocument} document Dictionary, deposits and commission settings. */
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

  /** @override Returns the exchange configured by the instrument dictionary. */
  getExchange() {
    return this.#dictionaryMeta.exchange;
  }

  /** @returns {string[]} Balance-selector attributes needed by remote sources. */
  getObservedAttributes() {
    return ['balance'];
  }

  /** @returns {string} Configured dictionary identifier. */
  getDictionary() {
    return this.document.dictionary;
  }

  /** @override Returns the provider whose dictionary defines simulated instruments. */
  getBroker() {
    return this.#dictionaryMeta.broker;
  }

  /** @override Normalizes PSINA share separators to dots for book subscriptions. */
  getSymbol(instrument = {}) {
    if (this.document.dictionary === INSTRUMENT_DICTIONARY.PSINA_US_STOCKS) {
      return (instrument.symbol ?? '').replace(' ', '.').replace('-', '.');
    }

    return super.getSymbol(instrument);
  }

  /** @returns {object} Public account snapshot, including balances and working orders. */
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

  /**
   * Compiles the trusted commission template and resolves the upstream book trader.
   * @returns {Promise<void>}
   * @throws {TradingError} When the upstream trader is unavailable in this runtime.
   */
  async oneTimeInitializationCallback() {
    this.commissionFunc = new Function(
      'trade',
      await new Tmpl().render(this, this.document.commFunctionCode, {})
    );

    this.bookTrader = await ppp.getOrCreateTrader(this.document.bookTrader);

    // Main-thread traders are not available inside a worker.
    if (!this.bookTrader) {
      throw new TradingError({
        message: 'E_BOOK_TRADER_UNAVAILABLE',
        details: { bookTrader: this.document.bookTrader }
      });
    }

    // this.$$debug('this.bookTrader: %o', this.bookTrader);
  }

  /**
   * @param {import('../types.js').Instrument} [instrument] Optional symbol filter.
   * @returns {import('../types.js').LimitOrder[]} Working order references, excluding open/completed orders.
   */
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

  /**
   * Opens an order and consumes eligible levels up to its remaining quantity.
   * Every fill records an execution; incoming book levels are not decremented.
   * @param {import('../types.js').LimitOrder} order Mutable simulated order.
   * @param {import('../types.js').Orderbook} [orderbook] Available liquidity.
   * @returns {void}
   */
  processOrder(order, orderbook) {
    if (order?.status === 'open') {
      order.status = 'working';

      this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);
    }

    if (order?.status === 'working' && order.filled < order.quantity) {
      const iterable =
        order.side === 'buy'
          ? (orderbook?.asks ?? [])
          : (orderbook?.bids ?? []);
      const filled = order.filled;
      const precision = getInstrumentQuantityPrecision(order.instrument);

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
            // Rounding keeps floating point dust out of the remainder.
            order.filled = +(order.filled + volume).toFixed(precision);

            this.createExecution({
              instrument: order.instrument,
              price,
              quantity: volume,
              side: order.side,
              parentId: order.orderId
            });
          } else {
            // The last fill completes the order exactly.
            order.filled = order.quantity;

            this.createExecution({
              instrument: order.instrument,
              price,
              quantity: rest,
              side: order.side,
              parentId: order.orderId
            });
          }
        }

        if (order.filled >= order.quantity) {
          order.status = 'filled';

          break;
        }
      }

      if (filled !== order.filled) {
        this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);
      }
    }
  }

  /**
   * Processes working orders and releases the book when none remain.
   * @param {import('../types.js').Instrument} instrument Instrument to process.
   * @param {import('../types.js').Orderbook} [orderbook] Supplied book, otherwise subscribed lazily.
   * @returns {Promise<void>}
   */
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

  /**
   * Processes working orders synchronously with supplied liquidity.
   * @param {import('../types.js').Instrument} instrument Instrument to process.
   * @param {import('../types.js').Orderbook} orderbook Available liquidity.
   * @returns {void}
   */
  processAllOrdersWithOrderbook(instrument, orderbook) {
    const workingOrders = this.getWorkingOrders(instrument);

    for (const order of workingOrders) {
      this.processOrder(order, orderbook);
    }
  }

  /**
   * @param {import('../types.js').Instrument} instrument Instrument to trade.
   * @param {number} price Proposed execution price.
   * @param {number} quantity Proposed quantity.
   * @param {boolean} isBuy True for a buy, false for a sell.
   * @returns {number} User-defined commission estimate; does not change account state.
   */
  estimateCommission(instrument, price, quantity, isBuy) {
    return this.commissionFunc({
      instrument,
      price,
      quantity,
      side: isBuy ? 'buy' : 'sell'
    });
  }

  /** @override Returns commission and zero buying/selling-power estimates. */
  async estimate(instrument, price, quantity, isBuy) {
    return {
      marginSellingPowerQuantity: 0,
      marginBuyingPowerQuantity: 0,
      sellingPowerQuantity: 0,
      buyingPowerQuantity: 0,
      commission: this.estimateCommission(instrument, price, quantity, isBuy)
    };
  }

  /**
   * Records one execution, applies commission and publishes balances/positions.
   * @param {object} execution Executed trade parameters.
   * @param {import('../types.js').Instrument} execution.instrument Traded instrument.
   * @param {number} execution.price Execution price.
   * @param {number} execution.quantity Executed quantity.
   * @param {'buy' | 'sell'} execution.side Execution side.
   * @param {string | number} [execution.parentId] Originating order ID.
   * @returns {void}
   */
  createExecution({ instrument, price, quantity, side, parentId }) {
    // A user function returning undefined/NaN must not corrupt balances.
    const commission =
      Number(
        this.commissionFunc({
          instrument,
          price,
          quantity,
          side
        })
      ) || 0;
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

  /**
   * @param {{origin?: string}} [options] Optional replay origin.
   * @returns {void} Publishes every currency balance.
   */
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

  /**
   * Recomputes weighted average cost, preserving it during partial reductions.
   * A reversal starts a new average at its crossing execution; a flat position is zero.
   * @param {{instrument?: import('../types.js').Instrument, origin?: string}} [options] Instrument or all saved positions.
   * @returns {void}
   */
  broadcastPositions({ instrument, origin } = {}) {
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

    for (const trade of trades) {
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
          } else {
            // A partial cover of a short: the average price stays the same,
            // only the base shrinks.
            currentSum =
              (currentSum * (Math.abs(total) - trade.quantity)) /
              Math.abs(total);
            total += trade.quantity;
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
          } else {
            // A partial sale of a long: the average price stays the same,
            // only the base shrinks.
            currentSum = (currentSum * (total - trade.quantity)) / total;
            total -= trade.quantity;
          }
        }
      }

      if (size === 0) {
        total = 0;
        currentSum = 0;
      }
    }

    // Weighted Average (0 for a flat position instead of NaN).
    const averagePrice = total ? Math.abs(currentSum / total) : 0;

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

  /**
   * @param {import('../types.js').Instrument} instrument Instrument to subscribe.
   * @returns {Promise<import('../types.js').Orderbook | undefined>} Latest book, or empty sides before the first quote.
   */
  async #orderbookNeeded(instrument) {
    if (!instrument) {
      return;
    }

    this.$$debug('#orderbookNeeded for %s', instrument.symbol);

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

  /**
   * @param {string | number} trackingId Caller tracking ID.
   * @returns {string | number} Unmodified ID.
   */
  trackingIdToOrderId(trackingId) {
    return trackingId;
  }

  /**
   * Creates an order and processes it using a supplied or subscribed book.
   * @param {PaperLimitOrderOptions} options Placement parameters.
   * @returns {Promise<{orderId: number, trackingId: string | number}>} Assigned identifiers.
   */
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
      status: 'open',
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

  /**
   * Creates and processes an order synchronously without opening a subscription.
   * @param {PaperLimitOrderOptions} options Placement parameters and liquidity.
   * @returns {{orderId: number, trackingId: string | number}} Assigned identifiers.
   */
  placeLimitOrderWithOrderbook({
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
      status: 'open',
      placedAt: new Date().toISOString(),
      endsAt: null,
      quantity: stringToFloat(quantity),
      filled: 0,
      price: this.fixPrice(instrument, price)
    };

    order.trackingId = options.trackingId ?? order.orderId;

    this.orders.get(instrument.symbol).push(order);
    this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);

    this.processOrder(order, orderbook);

    return {
      orderId: order.orderId,
      trackingId: order.trackingId
    };
  }

  /** @returns {Promise<never>} Always rejects: this simulator supports limit orders only. */
  async placeMarketOrder() {
    throw new TradingError({
      details: {
        code: 'E_MARKET_ORDERS_NOT_SUPPORTED'
      }
    });
  }

  /**
   * Normalizes replacement values while retaining the already executed quantity.
   * @param {import('../types.js').LimitOrder} order Mutable order to update.
   * @param {number | string} price New limit price.
   * @param {number | string} quantity New total quantity.
   * @returns {void}
   */
  #applyOrderModification(order, price, quantity) {
    order.price = this.fixPrice(order.instrument, price);
    order.quantity = stringToFloat(quantity);
    order.filled = Math.min(order.filled, order.quantity);

    if (order.filled >= order.quantity) {
      order.status = 'filled';
    }

    this.datums[TRADER_DATUM.REAL_ORDER].dataArrived(order);
  }

  /**
   * Updates a pending order and processes the instrument against its live book.
   * @param {PaperOrderModification} options Replacement parameters.
   * @returns {Promise<{orderId: number | string, details: object}>} Updated order identity.
   * @throws {TradingError} When the order ID is unknown.
   */
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

    if (order.status === 'working' || order.status === 'open') {
      this.#applyOrderModification(order, price, quantity);
    }

    await this.processAllOrders(order.instrument);

    return {
      orderId: order.orderId,
      details: {}
    };
  }

  /**
   * Updates a pending order and processes the instrument with supplied liquidity.
   * @param {PaperOrderModification} options Replacement parameters and book.
   * @returns {{orderId: number | string, details: object}} Updated order identity.
   * @throws {TradingError} When the order ID is unknown.
   */
  modifyRealOrderWithOrderbook({ orderId, price, quantity, orderbook } = {}) {
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

    if (order.status === 'working' || order.status === 'open') {
      this.#applyOrderModification(order, price, quantity);
    }

    this.processAllOrdersWithOrderbook(order.instrument, orderbook);

    return {
      orderId: order.orderId,
      details: {}
    };
  }

  /**
   * Moves matching pending orders by a signed number of price ticks.
   * @param {{instrument: import('../types.js').Instrument, side: 'buy' | 'sell' | 'all', value: number}} options Instrument, side filter and tick offset.
   * @returns {Promise<void>} Completion of subsequent book processing.
   */
  async modifyRealOrders({ instrument, side, value }) {
    const orders = this.orders.get(instrument.symbol) ?? [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      if (
        (order.status === 'working' || order.status === 'open') &&
        (order.side === side || side === 'all')
      ) {
        if (instrument && order.symbol !== instrument.symbol) continue;

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

  /**
   * Cancels pending orders matching optional instrument and direction filters.
   * @param {{instrument?: import('../types.js').Instrument, filter?: 'buy' | 'sell'}} [options] Cancellation filters.
   * @returns {Promise<{orderId: string | number}[]>} Results for matched orders.
   */
  async cancelAllRealOrders({ instrument, filter } = {}) {
    const orders = instrument
      ? (this.orders.get(instrument.symbol) ?? [])
      : Array.from(this.orders.values()).flat();
    const promises = [];

    for (const o of orders) {
      if (o.status === 'working' || o.status === 'open') {
        if (instrument && o.symbol !== instrument.symbol) continue;

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

  /**
   * Cancels a pending order and processes/relinquishes its book subscription.
   * @param {import('../types.js').LimitOrder} order Order to cancel.
   * @returns {Promise<{orderId: string | number}>} Order identity, including for completed orders.
   */
  async cancelRealOrder(order) {
    if (order.status === 'working' || order.status === 'open') {
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

  /**
   * Cancels an order synchronously, then processes other orders with the supplied book.
   * @param {import('../types.js').LimitOrder} order Order to cancel.
   * @param {import('../types.js').Orderbook} orderbook Available liquidity.
   * @returns {{orderId: string | number}} Order identity.
   */
  cancelRealOrderWithOrderbook(order, orderbook) {
    if (order.status === 'working' || order.status === 'open') {
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

    this.processAllOrdersWithOrderbook(order.instrument, orderbook);

    return {
      orderId: order.orderId
    };
  }

  /**
   * Restores initial deposits, clears executions/positions and cancels pending orders.
   * @returns {Promise<{orderId: string | number}[]>} Cancellation results.
   */
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

  /**
   * Dispatches the simulator's remote clear command; unknown commands do nothing.
   * @param {{method?: string}} [data] Remote command.
   * @returns {Promise<unknown>} Command result.
   */
  async call(data = {}) {
    const method = data.method;

    if (method === 'clear') {
      return this.clear();
    }
  }

  /**
   * @param {{error: TradingError}} options Execution error.
   * @returns {string | undefined} Translation key from provider details.
   */
  getErrorI18nKey({ error }) {
    return error.details?.code;
  }
}

pppTraderInstanceForWorkerIs(PaperTradeTrader);

export default PaperTradeTrader;
