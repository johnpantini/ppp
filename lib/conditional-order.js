/** @decorator */

import { observable } from '../lib/fast/observable.js';
import { TRADER_DATUM } from './const.js';
import { $throttle, $debounce } from './ppp-decorators.js';

/**
 * Shared lifecycle and transport representation for locally managed orders.
 * Subclasses receive their owning trader as the first constructor argument.
 */
export class ConditionalOrder {
  /** @type {typeof $throttle} Callback rate limiter available to order implementations. */
  $throttle;

  /** @type {typeof $debounce} Callback debouncer available to order implementations. */
  $debounce;

  /** @type {import('./traders/trader-worker.js').Trader} Trader executing this order. */
  mainTrader;

  /** @type {import('./types.js').Instrument} Instrument fixed at first placement. */
  instrument;

  /** @type {'buy' | 'sell'} Direction fixed at first placement. */
  side;

  /** @type {import('./types.js').PPPDocument} Order configuration and form values. */
  payload;

  /** @type {string} Lifecycle state published through the conditional-order datum. */
  @observable
  status;

  /** @type {string} ISO timestamp of the initial placement. */
  placedAt;

  /** @type {string} Unique identifier assigned by the owning trader. */
  orderId;

  /** @type {string} Identifier used when subscribing to other traders. */
  sourceID;

  sourceIDCounter = 0;

  /**
   * @param {import('./traders/trader-worker.js').Trader} mainTrader Owning execution trader.
   * @param {number} [throttleTime=250] Minimum interval between throttled broadcasts, in ms.
   */
  constructor(mainTrader, throttleTime = 250) {
    this.$throttle ??= $throttle;
    this.$debounce ??= $debounce;
    this.mainTrader = mainTrader;
    this.orderId = this.mainTrader.nextConditionalOrderId();
    this.sourceID ??= this.nextSourceID();

    this.changedWithThrottle = $throttle(this.changed, throttleTime);
  }

  /** @returns {string} Next subscription-source ID local to this order. */
  nextSourceID() {
    return `O${++this.sourceIDCounter}`;
  }

  /**
   * @param {Record<string, unknown>} [data] Trader event payload.
   * @returns {unknown} Result of the owning trader's event delivery.
   */
  traderEvent(data = {}) {
    return this.mainTrader.traderEvent(data);
  }

  /**
   * Broadcasts an observable status transition.
   * @returns {unknown} Delivery result.
   */
  statusChanged() {
    return this.changed();
  }

  /**
   * @param {Record<string, unknown>} [options] Datum delivery options.
   * @returns {unknown} Result of broadcasting the current serialized order.
   */
  changed(options) {
    return this.mainTrader.datums?.[
      TRADER_DATUM.CONDITIONAL_ORDER
    ]?.dataArrived?.(this.serialize(), options);
  }

  /**
   * Records initial placement data and updates lastPlacedAt on every placement.
   * @param {object} options Initial order parameters.
   * @param {import('./types.js').Instrument} options.instrument Instrument to trade.
   * @param {'buy' | 'sell'} options.direction Order side.
   * @param {import('./types.js').PPPDocument} options.payload Order settings.
   * @returns {void}
   */
  place({ instrument, direction, payload }) {
    this.instrument ??= instrument;
    this.side ??= direction;
    this.payload ??= payload;
    this.placedAt ??= new Date().toISOString();
    this.lastPlacedAt = new Date().toISOString();
    this.status ??= 'inactive';
  }

  /**
   * Sets canceled status; subclasses release their own subscriptions.
   * @returns {void}
   */
  cancel() {
    this.status = 'canceled';
  }

  /** @returns {object} Transport-safe public order state, retaining payload references. */
  serialize() {
    return {
      instrument: this.instrument,
      side: this.side,
      payload: this.payload,
      placedAt: this.placedAt,
      lastPlacedAt: this.lastPlacedAt,
      sourceID: this.sourceID,
      orderId: this.orderId,
      status: this.status,
      isConditionalOrder: true
    };
  }
}

/**
 * Registers an order constructor with the Aspirant worker loader when present.
 * @param {typeof ConditionalOrder} instance Constructor exported by an order module.
 * @returns {void}
 */
export function pppOrderInstanceForWorkerIs(instance) {
  if (typeof process !== 'undefined' && process.release.name === 'node') {
    // Aspirant Worker related section.
    globalThis.pppOrderInstanceForWorkerRecv?.(instance);
  }
}
