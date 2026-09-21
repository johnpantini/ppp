import {
  cyrillicToLatin,
  getInstrumentMinPriceIncrement,
  getInstrumentPrecision,
  getInstrumentQuantityPrecision,
  latinToCyrillic,
  stringToFloat
} from '../intl.js';
import { EventBus } from '../event-bus.js';
import { EXCHANGE, TRADER_DATUM } from '../const.js';
import { later } from '../ppp-decorators.js';
import { TradingError } from '../ppp-exceptions.js';

/**
 * @param {string} [symbol=''] Original unsupported symbol.
 * @returns {import('../types.js').Instrument} Explicit unsupported-instrument marker.
 */
export function unsupportedInstrument(symbol = '') {
  return {
    symbol,
    notSupported: true
  };
}

/** Shared per-instrument cache, subscription counts and field delivery. */
class TraderDatum {
  // Maps for every possible subdatum (source => field).
  sources = {};

  // Keys are symbols.
  refs = new Map();

  // Keys are symbols.
  values = new Map();

  // "instrumentchange" event listeners.
  #listeners = new Map();

  trader;

  doNotSaveValue;

  // Optimization for Aspirant Worker runtimes. Turn off if source argument adds side effects.
  disableOptimizations;

  /** @param {Trader} trader Owning trader that normalizes instruments and delivers values. */
  constructor(trader) {
    this.trader = trader;
  }

  /**
   * Extension hook deciding whether a source should receive a datum.
   * @param {unknown} data Provider payload.
   * @param {import('../types.js').Instrument} instrument Payload instrument.
   * @param {import('../types.js').TraderSource} source Receiving source.
   * @param {string} datum Datum identifier.
   * @param {object} [options] Delivery metadata.
   * @returns {boolean} True by default; provider subclasses may reject a payload.
   */
  filter(data, instrument, source, datum, options) {
    return true;
  }

  /**
   * @param {import('../types.js').TraderSource} source Receiver.
   * @returns {boolean} Whether any subdatum tracks it.
   */
  hasSource(source) {
    for (const key in this.sources) {
      if (this.sources[key].has(source)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Caches incoming data and assigns canonical values to matching subscribers.
   * Remote runtimes may batch assignments for sources sharing one socket.
   * @param {unknown} data Provider payload.
   * @param {import('../types.js').Instrument} instrument Payload instrument.
   * @param {{doNotSaveValue?: boolean, saveSlot?: number, origin?: string}} [options] Cache/delivery options.
   * @returns {void}
   */
  dataArrived(data, instrument, options = {}) {
    if (!instrument) {
      return;
    }

    if (this.doNotSaveValue !== true && options.doNotSaveValue !== true) {
      const symbol = this.trader.getSymbol(instrument);

      if (typeof options.saveSlot === 'undefined') {
        // One centralized data source.
        this.values.set(symbol, data);
      } else if (options.saveSlot >= 0) {
        // Many concurrent sources.
        const slots = this.values.get(symbol) ?? [];

        slots[options.saveSlot] = data;

        this.values.set(symbol, slots);
      }
    }

    // Optimization for Aspirant Worker runtimes.
    if (
      this.disableOptimizations !== true &&
      this.trader.document.runtime === 'url'
    ) {
      for (const datum in this.sources) {
        const M = {};
        let sender;
        let value;
        let hasKeys;

        for (const [source, field] of this.sources[datum]) {
          if (
            this.trader.instrumentsAreEqual(source.instrument, instrument) &&
            this.filter(data, instrument, source, datum, options)
          ) {
            value ??=
              this[datum]?.(data, instrument, { source, options }) ??
              this.emptyValue(datum) ??
              '—';

            if (source.mainTrader === this.trader) {
              source[field] = value;
            } else if (source.ws && !source.ws.closed) {
              // Sending to a closed uWS socket throws.
              M[source.sourceID] = field;
              sender ??= source.ws;
              hasKeys = true;
            }
          }
        }

        if (sender && hasKeys) {
          sender.send(
            JSON.stringify([
              {
                T: 'a',
                M,
                v: value
              }
            ])
          );
        }
      }
    } else {
      for (const datum in this.sources) {
        for (const [source, field] of this.sources[datum]) {
          if (
            this.trader.instrumentsAreEqual(source.instrument, instrument) &&
            this.filter(data, instrument, source, datum, options)
          ) {
            this.trader.assignSourceField(
              source,
              field,
              this[datum]?.(data, instrument, { source, options }) ??
                this.emptyValue(datum) ??
                '—'
            );
          }
        }
      }
    }
  }

  /**
   * @param {string} datum Datum identifier.
   * @returns {object | string} Appropriate empty UI value.
   */
  emptyValue(datum) {
    switch (datum) {
      case TRADER_DATUM.CANDLE:
      case TRADER_DATUM.MARKET_PRINT:
      case TRADER_DATUM.ORDERBOOK:
      case TRADER_DATUM.NOII:
        return {};
      case TRADER_DATUM.TRADING_STATUS:
      case TRADER_DATUM.STATUS:
        return '';
    }

    return '—';
  }

  /**
   * Adds an instrument reference and replays cached values for later subscribers.
   * Called after the owning trader has added the source/field mapping.
   * @param {import('../types.js').TraderSource} source Receiving source.
   * @param {string} field Property updated with datum values.
   * @param {string} datum Datum identifier.
   * @returns {Promise<unknown>} Provider subscription hook result.
   */
  async subscribe(source, field, datum) {
    // Columns do not change instruments.
    if (!this.#listeners.has(source) && source.canChangeInstrument) {
      const listener = async ({ detail }) => {
        const { source, oldValue } = detail;

        try {
          // Unsub/sub for every subdatum.
          for (const d of Object.keys(this.sources)) {
            if (this.sources[d].has(source)) {
              const f = this.sources[d].get(source);

              if (oldValue) {
                await this.unsubscribe(source, oldValue);
              }

              await this.subscribe(source, f, d);
            }
          }
        } catch (e) {
          // The listener is fired by the event bus, nobody awaits it.
          this.trader.$$debug?.('instrumentchange resubscribe failed: %o', e);
        }
      };

      source.addEventListener('instrumentchange', listener);
      this.#listeners.set(source, listener);
    }

    if (!source.instrument) {
      return;
    }

    const symbol = this.trader.getSymbol(source.instrument);
    const refCount = this.refs.get(symbol) ?? 0;

    if (refCount === 0) {
      this.refs.set(symbol, 1);

      return this.firstReferenceAdded?.(source, symbol, datum);
    } else {
      this.refs.set(symbol, refCount + 1);

      // The source needs our saved data here.
      const slots = this.values.get(symbol);

      if (!Array.isArray(slots) || this.slotted === false) {
        if (typeof slots !== 'undefined') {
          if (
            this.filter(slots, source.instrument, source, datum, {
              origin: 'datum'
            })
          ) {
            if (source.instrument) {
              this.trader.assignSourceField(
                source,
                field,
                this[datum]?.(slots, source.instrument, {
                  source,
                  origin: 'datum'
                }) ??
                  this.emptyValue(datum) ??
                  '—'
              );
            } else {
              this.trader.assignSourceField(
                source,
                field,
                this.emptyValue(datum) ?? '—'
              );
            }
          }
        }
      } else {
        for (const value of slots) {
          if (
            this.filter(value, source.instrument, source, datum, {
              origin: 'datum'
            })
          ) {
            if (source.instrument && typeof value !== 'undefined') {
              this.trader.assignSourceField(
                source,
                field,
                this[datum]?.(value, source.instrument, {
                  source,
                  origin: 'datum'
                }) ??
                  this.emptyValue(datum) ??
                  '—'
              );
            } else {
              this.trader.assignSourceField(
                source,
                field,
                this.emptyValue(datum) ?? '—'
              );
            }
          }
        }
      }

      return this.anotherReferenceAdded?.(source, symbol, datum);
    }
  }

  /**
   * Releases an instrument reference and clears its cache after the last listener.
   * @param {import('../types.js').TraderSource} source Former receiver.
   * @param {import('../types.js').Instrument} [oldInstrument] Previous instrument during a switch.
   * @returns {Promise<unknown>} Provider cleanup hook result.
   */
  async unsubscribe(source, oldInstrument) {
    if (!this.hasSource(source) && source.canChangeInstrument) {
      const listener = this.#listeners.get(source);

      if (listener) {
        source.removeEventListener('instrumentchange', listener);
        this.#listeners.delete(source);
      }
    }

    if (!oldInstrument && !source.instrument) {
      return;
    }

    const symbol = this.trader.getSymbol(oldInstrument ?? source.instrument);
    const refCount = this.refs.get(symbol) ?? 0;

    if (refCount === 1) {
      this.refs.delete(symbol);

      if (this.doNotClearValue !== true) {
        this.values.delete(symbol);
      }

      return this.lastReferenceRemoved?.(source, symbol);
    } else if (refCount > 1) {
      this.refs.set(symbol, Math.max(0, refCount - 1));

      return this.anotherReferenceRemoved?.(source, symbol);
    }
  }
}

// Positions (portfolio), orders, timeline, trader events.
/** Account-wide positions, orders, timeline and events, cached by provider key. */
class GlobalTraderDatum {
  /** @type {Record<string, Map<import('../types.js').TraderSource, string>>} Source-to-field mappings for every subdatum. */
  sources = {};

  /** @type {number} Number of active source/field subscriptions. */
  refCount = 0;

  /** @type {Trader} Owning provider. */
  trader;

  /** @type {Map<string | number, unknown>} Latest provider values by stable item key. */
  value = new Map();

  // "instrumentchange" event listeners.
  #listeners = new Map();

  // Useful for special data items like @CLEAR.
  doNotSaveValue;

  // Useful when data should stay forever (for instance, for outside access).
  doNotClearValue;

  // If true, the [datum] method will take care of any assignments.
  // Otherwise, the [datum] method only returns the value to be assigned by the datum object.
  manualAssignment;

  // Optimization for Aspirant Worker runtimes. Turn off if source argument adds side effects.
  disableOptimizations;

  /** @param {Trader} trader Owning provider, which creates source mappings. */
  constructor(trader) {
    this.trader = trader;
  }

  /**
   * Provider override deciding whether a receiver should see an account-wide item.
   * @param {unknown} data Provider payload.
   * @param {import('../types.js').TraderSource} source Receiver.
   * @param {string | number} key Stable item key.
   * @param {string} datum Datum identifier.
   * @param {object} [options] Delivery context, including replay origin.
   * @returns {boolean} True by default.
   */
  filter(data, source, key, datum, options) {
    return true;
  }

  /**
   * Caches a keyed item and delivers canonical values to matching subscribers.
   * URL runtimes batch remote assignments; local conditional orders receive them directly.
   * @param {unknown} data Provider payload understood by valueKeyForData.
   * @param {{origin?: string, doNotSaveValue?: boolean}} [options] Replay and transient-item flags.
   * @returns {void}
   */
  dataArrived(data, options = {}) {
    const key = this.valueKeyForData(data);

    if (typeof key !== 'undefined') {
      if (this.doNotSaveValue !== true && options.doNotSaveValue !== true) {
        this.value.set(key, data);
      }

      // Optimization for Aspirant Worker runtimes.
      if (
        this.disableOptimizations !== true &&
        this.trader.document.runtime === 'url'
      ) {
        for (const datum in this.sources) {
          const M = {};
          let sender;
          let value;
          let hasKeys;

          for (const [source, field] of this.sources[datum]) {
            if (this.filter(data, source, key, datum, options)) {
              if (this.manualAssignment !== true) {
                value ??=
                  this[datum]?.(data, {
                    source,
                    key,
                    field,
                    origin: options.origin
                  }) ??
                  this.emptyValue(datum) ??
                  '—';

                if (source.mainTrader === this.trader) {
                  source[field] = value;
                } else if (source.ws && !source.ws.closed) {
                  // Sending to a closed uWS socket throws.
                  M[source.sourceID] = field;
                  sender ??= source.ws;
                  hasKeys = true;
                }
              } else {
                this[datum]?.(data, {
                  source,
                  key,
                  field,
                  origin: options.origin
                });
              }
            }
          }

          if (sender && hasKeys) {
            sender.send(
              JSON.stringify([
                {
                  T: 'a',
                  M,
                  v: value
                }
              ])
            );
          }
        }
      } else {
        for (const datum in this.sources) {
          for (const [source, field] of this.sources[datum]) {
            if (this.filter(data, source, key, datum, options)) {
              if (this.manualAssignment !== true) {
                this.trader.assignSourceField(
                  source,
                  field,
                  this[datum]?.(data, {
                    source,
                    key,
                    field,
                    origin: options.origin
                  }) ??
                    this.emptyValue(datum) ??
                    '—'
                );
              } else {
                this[datum]?.(data, {
                  source,
                  key,
                  field,
                  origin: options.origin
                });
              }
            }
          }
        }
      }
    } else {
      this.trader.$$debug('no key for data: %o', data);
    }
  }

  /**
   * @param {string} datum Datum identifier.
   * @returns {number | object | string} Zero, an empty object or an em dash for missing data.
   */
  emptyValue(datum) {
    switch (datum) {
      case TRADER_DATUM.POSITION_SIZE:
        return 0;
      case TRADER_DATUM.POSITION_AVERAGE:
        return 0;
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.REAL_ORDER:
      case TRADER_DATUM.TIMELINE_ITEM:
      case TRADER_DATUM.TRADER:
        return {};
    }

    return '—';
  }

  /**
   * @param {{symbol?: string}} data Provider payload.
   * @returns {string | undefined} Default cache key; providers may override it.
   */
  valueKeyForData(data) {
    return data?.symbol;
  }

  /**
   * Registers instrument-change replay and acquires an account-wide reference.
   * The owning trader must already have installed the source/field mapping.
   * @param {import('../types.js').TraderSource} source Receiver.
   * @param {string} field Target property.
   * @param {string} datum Datum identifier.
   * @returns {Promise<unknown>} Provider hook result.
   */
  async subscribe(source, field, datum) {
    // Columns and orders do not change instruments.
    if (!this.#listeners.has(source) && source?.canChangeInstrument) {
      const listener = async ({ detail }) => {
        const { source } = detail;

        for (const d of Object.keys(this.sources)) {
          if (this.sources[d].has(source)) {
            const f = this.sources[d].get(source);

            // Cleanup should be done only once per field:datum pair.
            this.trader.assignSourceField(source, f, this.emptyValue(d));

            // Propagate keyed data in an array-like style.
            for (const [key, data] of this.value) {
              if (this.filter(data, source, key, d, { origin: 'datum' })) {
                if (this.manualAssignment !== true) {
                  this.trader.assignSourceField(
                    source,
                    f,
                    this[d]?.(data, {
                      source,
                      key,
                      field: f,
                      origin: 'datum'
                    }) ??
                      this.emptyValue(d) ??
                      '—'
                  );
                } else {
                  this[d]?.(data, { source, key, field: f, origin: 'datum' });
                }
              }
            }
          }
        }
      };

      source.addEventListener('instrumentchange', listener);
      this.#listeners.set(source, listener);
    }

    if (this.refCount === 0) {
      this.refCount = 1;

      return this.firstReferenceAdded?.(source, field, datum);
    } else {
      this.refCount++;

      // The source needs our saved data here.
      for (const [key, data] of this.value) {
        if (this.filter(data, source, key, datum, { origin: 'datum' })) {
          if (this.manualAssignment !== true) {
            this.trader.assignSourceField(
              source,
              field,
              this[datum]?.(data, { source, key, field, origin: 'datum' }) ??
                this.emptyValue(datum) ??
                '—'
            );
          } else {
            this[datum]?.(data, { source, key, field, origin: 'datum' });
          }
        }
      }

      return this.anotherReferenceAdded?.(source, field, datum);
    }
  }

  /**
   * Releases a reference and clears cached values after the final subscriber leaves.
   * doNotClearValue retains the cache; listeners are removed when a source has no fields.
   * @param {import('../types.js').TraderSource} source Former receiver.
   * @param {string} field Former property.
   * @param {string} datum Datum identifier.
   * @returns {Promise<unknown>} Provider cleanup hook result.
   */
  async unsubscribe(source, field, datum) {
    if (!this.hasSource(source) && source.canChangeInstrument) {
      const listener = this.#listeners.get(source);

      if (listener) {
        source.removeEventListener('instrumentchange', listener);
        this.#listeners.delete(source);
      }
    }

    if (this.refCount === 1) {
      this.refCount = 0;

      if (this.doNotClearValue !== true) {
        this.value.clear();
      }

      return this.lastReferenceRemoved?.(source, field, datum);
    } else if (this.refCount > 1) {
      this.refCount--;

      return this.anotherReferenceRemoved?.(source, field, datum);
    }
  }
}

/** Account-wide trader events delivered through the global datum lifecycle. */
class TraderEventDatum extends GlobalTraderDatum {}

/** Replays locally managed conditional orders and indexes them by orderId. */
class ConditionalOrderDatum extends GlobalTraderDatum {
  async firstReferenceAdded() {
    for (const order of await this.trader.conditionalOrders()) {
      this.dataArrived(order, { origin: 'datum' });
    }
  }

  valueKeyForData(data) {
    return this.trader.rawCOToCanonicalCO(data)?.orderId;
  }

  [TRADER_DATUM.CONDITIONAL_ORDER](data) {
    return data;
  }
}

GlobalTraderDatum.prototype.hasSource = TraderDatum.prototype.hasSource;

/** Common instrument, subscription and conditional-order API for every provider. */
class Trader {
  bus = new EventBus();

  datums = {};

  document = {};

  #instruments = new Map();

  /** @returns {Map<string, import('../types.js').Instrument>} Mutable instrument dictionary by symbol. */
  get instruments() {
    return this.#instruments;
  }

  #instances = [];

  #conditionalOrders = [];

  /** @returns {import('../conditional-order.js').ConditionalOrder[]} Live conditional-order instances. */
  get rawConditionalOrders() {
    return this.#conditionalOrders ?? [];
  }

  /**
   * @param {unknown} rawCO Provider order.
   * @returns {unknown} Canonical order; identity by default.
   */
  rawCOToCanonicalCO(rawCO) {
    return rawCO;
  }

  createdAt = new Date().toISOString();

  /**
   * @param {import('../types.js').TraderDocument} document Persisted runtime configuration.
   * @param {{type: Function, datums: string[]}[]} [typeWithDatums] Provider datum implementations.
   */
  constructor(document, typeWithDatums = []) {
    this.document = document;

    typeWithDatums.forEach(({ type, datums }) => {
      const instance = new (this.getRealDatumType(type))(this);

      datums.forEach((datum) => {
        instance.sources[datum] = new Map();

        this.datums[datum] = instance;
      });

      this.#instances.push(instance);
    });
  }

  /**
   * @param {{name?: string, message?: string, details?: object, stack?: string}} [exception] Error-like value.
   * @returns {{name: string, message: string, details: object, stack: string}} Transport error fields.
   */
  formatException(exception = {}) {
    return {
      name: exception.name ?? 'TradingError',
      message: exception.message ?? 'Unknown trader error occurred.',
      details: exception.details ?? {},
      stack: exception.stack ?? ''
    };
  }

  conditionalOrderIdCounter = 0;

  /** @returns {string} Timestamp plus a monotonic counter scoped to this trader. */
  nextConditionalOrderId() {
    return `${Date.now()}:${this.conditionalOrderIdCounter++}`;
  }

  /**
   * @param {Function} type Requested datum constructor.
   * @returns {Function} Constructor to instantiate.
   */
  getRealDatumType(type) {
    return type;
  }

  /**
   * @param {unknown} data Extension command.
   * @returns {unknown} Echoed payload unless overridden.
   */
  call(data) {
    return data;
  }

  /** @returns {object} Runtime metadata and persisted trader configuration. */
  serialize() {
    return {
      createdAt: this.createdAt,
      document: this.document,
      broker: this.getBroker(),
      dictionary: this.getDictionary(),
      exchange: this.getExchange(),
      observedAttributes: this.getObservedAttributes()
    };
  }

  /**
   * @param {'global' | 'instrument'} singleton Configured uniqueness scope.
   * @param {string} orderId Order template ID, distinct from the instance orderId.
   * @param {import('../types.js').Instrument} instrument Requested instrument.
   * @returns {import('../conditional-order.js').ConditionalOrder | undefined} Existing singleton.
   */
  #findConditionalOrderInstance(singleton, orderId, instrument) {
    if (singleton === 'global') {
      return this.#conditionalOrders.find((o) => o.payload.orderId === orderId);
    } else if (singleton === 'instrument') {
      return this.#conditionalOrders.find(
        (o) =>
          o.payload.orderId === orderId &&
          this.instrumentsAreEqual(o.instrument, instrument)
      );
    }
  }

  /**
   * Loads or reuses a conditional order and delegates its placement.
   * Implementations and code are trusted application inputs; one-off orders are not retained.
   * @param {object} options Placement and implementation parameters.
   * @param {import('../types.js').Instrument} options.instrument Instrument to trade.
   * @param {'buy' | 'sell'} options.direction Order side.
   * @param {import('../types.js').PPPDocument} options.payload Settings with required orderId and optional order.singleton/oneOff.
   * @param {string} [options.implUrl] URL exporting the order constructor.
   * @param {string} [options.code] Worker bundle executed in a Node-compatible runtime.
   * @param {typeof import('../conditional-order.js').ConditionalOrder} [options.instance] Preloaded constructor.
   * @returns {Promise<unknown>} Implementation's placement result.
   * @throws {TradingError} For missing identifiers or an unavailable implementation.
   */
  async placeConditionalOrder({
    instrument,
    direction,
    payload,
    implUrl,
    code,
    instance
  }) {
    if (!payload?.orderId) {
      throw new TradingError({
        message: 'Missing payload.orderId.',
        details: {
          instrument,
          direction,
          payload
        }
      });
    }

    const singleton = payload.order?.singleton;
    const oneOff = payload.order?.oneOff === true;
    let orderInstance;

    if (typeof implUrl === 'string') {
      orderInstance = this.#findConditionalOrderInstance(
        singleton,
        payload.orderId,
        instrument
      );

      if (!orderInstance) {
        const { default: orderClass } = await import(
          `${implUrl}?t=${Date.now()}`
        );

        orderInstance = new orderClass(this);
        orderInstance.factory = orderClass;

        !oneOff && this.#conditionalOrders.push(orderInstance);
      }
    } else if (
      typeof code === 'string' &&
      typeof process !== 'undefined' &&
      process.release.name === 'node'
    ) {
      orderInstance = this.#findConditionalOrderInstance(
        singleton,
        payload.orderId,
        instrument
      );

      if (!orderInstance) {
        if (!code) {
          throw new TradingError({
            message: 'E_MISSING_ORDER_CODE',
            details: {
              instrument,
              direction,
              payload
            }
          });
        }

        let instanceType;

        globalThis.pppOrderInstanceForWorkerRecv = (i) => (instanceType = i);

        try {
          globalThis.vm.runInThisContext(code, {
            filename: payload.orderId
          });
        } finally {
          globalThis.pppOrderInstanceForWorkerRecv = null;
        }

        if (!instanceType) {
          throw new TradingError({
            message: 'Missing pppOrderInstanceForWorkerRecv.',
            details: {
              instrument,
              direction,
              payload
            }
          });
        }

        orderInstance = new instanceType(this);
        orderInstance.factory = instanceType;

        !oneOff && this.#conditionalOrders.push(orderInstance);
      }
    } else if (typeof instance === 'function') {
      orderInstance = this.#findConditionalOrderInstance(
        singleton,
        payload.orderId,
        instrument
      );

      if (!orderInstance) {
        orderInstance = new instance(this);
        orderInstance.factory = instance;

        !oneOff && this.#conditionalOrders.push(orderInstance);
      }
    }

    if (orderInstance) {
      return orderInstance.place({
        instrument,
        direction,
        payload
      });
    } else {
      throw new TradingError({
        message: 'Missing orderInstance.',
        details: {
          instrument,
          direction,
          payload
        }
      });
    }
  }

  /** @type {Trader['placeConditionalOrder']} Short transport alias for placeConditionalOrder. */
  async pco({ instrument, direction, payload, implUrl, code, instance }) {
    return this.placeConditionalOrder({
      instrument,
      direction,
      payload,
      implUrl,
      code,
      instance
    });
  }

  /**
   * @param {boolean} [raw=false] Return instances instead of serialized state.
   * @returns {object[]} Managed orders in insertion order.
   */
  conditionalOrders(raw = false) {
    const result = [];

    for (const order of this.#conditionalOrders) {
      if (raw) {
        result.push(order);
      } else if (typeof order.serialize === 'function') {
        result.push(order.serialize());
      }
    }

    return result;
  }

  /**
   * Calls an available action on a managed order; unknown orders/actions are ignored.
   * @param {string} orderId Instance identifier.
   * @param {string} action Implementation method name.
   * @param {object} [payload] Action arguments.
   * @returns {Promise<unknown>} Action result when implemented.
   */
  async performConditionalOrderAction(orderId, action, payload = {}) {
    const order = this.#conditionalOrders.find(
      (order) => order.orderId === orderId
    );

    if (typeof order?.[action] === 'function') {
      return order?.[action](payload);
    }
  }

  /** @type {Trader['performConditionalOrderAction']} Short transport alias for order actions. */
  async pcoa(orderId, action, payload = {}) {
    return this.performConditionalOrderAction(orderId, action, payload);
  }

  /**
   * Removes an order from management before invoking its cancellation hook.
   * @param {string} orderId Instance identifier.
   * @param {object} [payload] Implementation-specific cancellation options.
   * @returns {Promise<unknown>} Cancellation result; undefined for an unknown order.
   */
  async cancelConditionalOrder(orderId, payload = {}) {
    const order = this.#conditionalOrders.find(
      (order) => order.orderId === orderId
    );

    if (order) {
      this.#conditionalOrders.splice(this.#conditionalOrders.indexOf(order), 1);

      if (typeof order.cancel === 'function') {
        return order.cancel(payload);
      }
    }
  }

  /** @type {Trader['cancelConditionalOrder']} Short transport alias for cancellation. */
  async cco(orderId, payload = {}) {
    return this.cancelConditionalOrder(orderId, payload);
  }

  /**
   * Starts cancellation for matching orders from a stable snapshot.
   * Cancellation hooks run in the background; failures are sent to the debug logger.
   * @param {{instrument?: import('../types.js').Instrument, filter?: 'buy' | 'sell', payload?: object}} [options] Filters and cancellation payload.
   * @returns {Promise<void>} Resolves after cancellations are scheduled, not completed.
   */
  async cancelAllConditionalOrders({ instrument, filter, payload = {} } = {}) {
    const orders = [];

    // this.#conditionalOrders changes via splice().
    for (const order of this.#conditionalOrders) {
      orders.push({
        orderId: order.orderId,
        instrument: order.instrument,
        side: order.side
      });
    }

    for (const order of orders) {
      if (
        instrument &&
        !this.instrumentsAreEqual(order.instrument, instrument)
      ) {
        continue;
      }

      if (filter === 'buy' && order.side !== 'buy') {
        continue;
      }

      if (filter === 'sell' && order.side !== 'sell') {
        continue;
      }

      // Async way.
      this.cancelConditionalOrder(order.orderId, payload).catch((e) =>
        this.$$debug?.('cancelConditionalOrder %s failed: %o', order.orderId, e)
      );
    }
  }

  /**
   * @param {Map<string, import('../types.js').Instrument>} instruments Replacement dictionary.
   * @returns {Promise<void>}
   */
  async instrumentsArrived(instruments) {
    this.#instruments = instruments;
  }

  /**
   * Registers one source/field subscription once, then activates the datum.
   * @param {import('../types.js').FieldSubscription} options Subscription parameters.
   * @returns {Promise<unknown>} Provider subscription result, if newly registered.
   */
  async subscribeField({ source, field, datum }) {
    const traderDatum = this.datums[datum];

    if (typeof traderDatum !== 'undefined') {
      if (!traderDatum.sources[datum].has(source)) {
        traderDatum.sources[datum].set(source, field);

        return traderDatum.subscribe(source, field, datum);
      }
    }
  }

  /**
   * @param {object} options Receiver and field mappings.
   * @param {import('../types.js').TraderSource} options.source Receiving source.
   * @param {Record<string, string | {datum: string}>} [options.fieldDatumPairs] Fields mapped to datums.
   * @returns {Promise<void>} Resolves after sequential subscription setup.
   */
  async subscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      if (typeof datum === 'string') {
        await this.subscribeField({ source, field, datum });
      } else if (typeof datum === 'object') {
        await this.subscribeField({
          source,
          field,
          datum: datum.datum
        });
      }
    }
  }

  /**
   * @param {{source: import('../types.js').TraderSource, datum: string}} options Subscription to remove.
   * @returns {Promise<unknown>} Provider cleanup result, if a subscription existed.
   */
  async unsubscribeField({ source, datum }) {
    const traderDatum = this.datums[datum];

    if (typeof traderDatum !== 'undefined') {
      if (traderDatum.sources[datum].has(source)) {
        traderDatum.sources[datum].delete(source);

        return traderDatum.unsubscribe(source);
      }
    }
  }

  /**
   * @param {object} options Receiver and subscriptions to remove.
   * @param {import('../types.js').TraderSource} options.source Receiving source.
   * @param {Record<string, string>} [options.fieldDatumPairs] Field-to-datum mapping.
   * @returns {Promise<void>}
   */
  async unsubscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.unsubscribeField({ source, field, datum });
    }
  }

  /**
   * Recreates existing subscriptions after reconnecting to a provider.
   * @param {string[]} [onlyForDatums=[]] Limit recreation to these datums; empty means all.
   * @returns {Promise<void>}
   */
  async resubscribe(onlyForDatums = []) {
    const sfd = [];

    for (const i of this.#instances) {
      for (const sd of Object.keys(i.sources)) {
        for (const [source, field] of i.sources[sd]) {
          if (!onlyForDatums.length || onlyForDatums.includes(sd)) {
            sfd.push({ source, field, datum: sd });
          }
        }
      }
    }

    for (const { source, field, datum } of sfd) {
      await this.unsubscribeField({ source, field, datum });
    }

    for (const { source, field, datum } of sfd) {
      await this.subscribeField({ source, field, datum });
    }
  }

  /** @returns {Promise<object>} Empty estimate until implemented by a provider. */
  async estimate() {
    return {};
  }

  /**
   * Sends a command through the worker's configured Redis client when available.
   * @param {string} command Redis command name.
   * @param {string[]} [args=[]] Command arguments.
   * @returns {Promise<unknown>} Redis response, or null when Redis is unavailable.
   */
  async redisCommand(command, args = []) {
    if (globalThis.ppp?.runtime?.redis) {
      if (typeof Bun !== 'undefined') {
        return globalThis.ppp?.runtime?.redis.send(command, args);
      } else {
        return globalThis.ppp?.runtime?.redis.call(command, ...args);
      }
    } else {
      return null;
    }
  }

  /**
   * @param {string} variable Environment variable name.
   * @returns {string | undefined} Value in Node-compatible runtimes.
   */
  getEnvVar(variable) {
    if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
      return process.env[variable];
    }
  }

  /**
   * @param {import('../types.js').Instrument} instrument Proposed instrument.
   * @param {number} price Proposed execution price.
   * @param {number} quantity Proposed quantity.
   * @param {boolean} isBuy True for a buy.
   * @returns {number} Zero unless overridden by the provider.
   */
  estimateCommission(instrument, price, quantity, isBuy) {
    return 0;
  }

  /**
   * Assigns locally or forwards an assignment over the configured worker/socket.
   * @param {import('../types.js').TraderSource} source Receiver of this value.
   * @param {string} field Receiver property name.
   * @param {unknown} value Canonical datum value.
   * @returns {unknown} Transport delivery result when applicable.
   */
  assignSourceField(source, field, value) {
    switch (this.document.runtime) {
      case 'main-thread':
        source[field] = value;

        break;
      case 'shared-worker':
        // For conditional orders.
        if (
          source.mainTrader &&
          source.mainTrader.document._id === self.pppTrader.document._id
        ) {
          source[field] = value;

          return;
        }

        source.port.postMessage({
          type: 'assign',
          sourceID: source.sourceID,
          field,
          value
        });

        break;
      case 'url':
        // For conditional orders.
        if (source.mainTrader === this) {
          source[field] = value;

          return;
        }

        if (typeof source.ws === 'undefined') {
          return this.$$debug('no ws in URL source: %o', source);
        }

        !source.ws.closed &&
          source.sourceID &&
          source.ws.send(
            JSON.stringify([
              {
                T: 'a',
                SI: source.sourceID,
                f: field,
                v: value
              }
            ])
          );

        break;
    }
  }

  /**
   * Broadcasts a trader lifecycle event without storing it as keyed account data.
   * @param {object} [event] Event payload understood by widgets and orders.
   * @returns {void}
   */
  traderEvent(event = {}) {
    if (this.datums[TRADER_DATUM.TRADER]) {
      if (this.document.runtime === 'url') {
        // Optimization for Aspirant Worker runtimes.
        const M = {};
        let sender;

        for (const [source, field] of this.datums[TRADER_DATUM.TRADER].sources[
          TRADER_DATUM.TRADER
        ]) {
          if (this.datums[TRADER_DATUM.TRADER].filter(event, source)) {
            if (source.mainTrader === this) {
              source[field] = event;
            } else if (source.ws && !source.ws.closed && source.sourceID) {
              M[source.sourceID] = field;
              sender ??= source.ws;
            }
          }
        }

        if (sender) {
          sender.send(
            JSON.stringify([
              {
                T: 'a',
                M,
                v: event
              }
            ])
          );
        }
      } else {
        for (const [source, field] of this.datums[TRADER_DATUM.TRADER].sources[
          TRADER_DATUM.TRADER
        ]) {
          if (this.datums[TRADER_DATUM.TRADER].filter(event, source)) {
            this.assignSourceField(source, field, event);
          }
        }
      }
    }
  }

  /**
   * @param {number} relativePrice Bond price as percent of face value.
   * @param {import('../types.js').Instrument} instrument Nominal and tick metadata.
   * @returns {number} Absolute price rounded to an instrument tick.
   */
  relativeBondPriceToPrice(relativePrice, instrument) {
    return this.fixPrice(
      instrument,
      (relativePrice * instrument.nominal) / 100
    );
  }

  /**
   * @param {number} price Absolute bond price.
   * @param {import('../types.js').Instrument} instrument Bond nominal metadata.
   * @returns {number} Percentage of nominal rounded to two decimals.
   */
  bondPriceToRelativeBondPrice(price, instrument) {
    return +((price * 100) / instrument.nominal).toFixed(2);
  }

  /** @returns {string[]} Capabilities declared by the trader document. */
  caps() {
    return this.document.caps ?? [];
  }

  /**
   * @param {string | string[]} cap Required capability or capabilities.
   * @returns {boolean} Whether all are supported.
   */
  hasCap(cap) {
    const caps = this.caps();

    if (typeof cap === 'string') return caps.indexOf(cap) > -1;
    else if (Array.isArray(cap)) return cap.every((c) => caps.indexOf(c) > -1);
    else return false;
  }

  /**
   * @param {import('../types.js').Instrument} instrument Tick metadata.
   * @param {number | string} price Price, accepting comma-formatted input.
   * @returns {number} Price rounded to the nearest tick and its decimal precision.
   */
  fixPrice(instrument, price) {
    price = stringToFloat(price);

    const precision = getInstrumentPrecision(instrument, price);

    if (!price || isNaN(price)) price = 0;

    const mpi = getInstrumentMinPriceIncrement(instrument, price);

    price = Math.round(price / mpi) * mpi;

    return +price.toFixed(precision);
  }

  /**
   * @param {import('../types.js').Instrument} instrument Quantity step metadata.
   * @param {number | string} quantity Quantity, accepting comma-formatted input.
   * @returns {number} Quantity rounded to the nearest allowed step.
   */
  fixQuantity(instrument, quantity) {
    quantity = stringToFloat(quantity);

    const precision = getInstrumentQuantityPrecision(instrument, quantity);

    if (!quantity || isNaN(quantity)) quantity = 0;

    const mqi = instrument.minQuantityIncrement ?? 1;

    quantity = Math.round(quantity / mqi) * mqi;

    return +quantity.toFixed(precision);
  }

  /**
   * Applies absolute, percentage or tick distances without returning negative prices.
   * @param {import('../types.js').Instrument} instrument Tick metadata.
   * @param {number | string} price Starting price.
   * @param {import('../types.js').Distance} distance Positive offset and its unit.
   * @param {'down' | 'up'} [direction='down'] Offset direction.
   * @returns {number} Rounded target price, or zero for missing/invalid inputs.
   */
  calcDistantPrice(instrument, price, distance, direction = 'down') {
    if (direction !== 'down' && direction !== 'up') {
      direction = 'down';
    }

    if (!instrument) {
      return 0;
    }

    price = stringToFloat(price);

    if (!price || isNaN(price)) {
      return 0;
    }

    let newPrice = 0;

    if (distance.value > 0) {
      if (distance.unit === '+') {
        const pi =
          getInstrumentMinPriceIncrement(instrument, price) * distance.value;

        newPrice = direction === 'down' ? price - pi : price + pi;
      } else if (distance.unit === '%') {
        newPrice =
          direction === 'down'
            ? price - (price * distance.value) / 100
            : price + (price * distance.value) / 100;
      } else {
        newPrice = Math.max(
          0,
          direction === 'down' ? price - distance.value : price + distance.value
        );
      }

      if (newPrice > 0) {
        return this.fixPrice(instrument, newPrice);
      } else {
        return 0;
      }
    } else {
      return price;
    }
  }

  /**
   * @param {import('../types.js').Instrument} [instrument] Instrument metadata.
   * @returns {string} Symbol without a ~ suffix.
   */
  getSymbol(instrument = {}) {
    let symbol = instrument.symbol;

    if (!symbol) return '';

    if (/~/gi.test(symbol)) symbol = symbol.split('~')[0];

    return symbol;
  }

  // BRK A
  /**
   * @param {string} [symbol=''] Provider symbol.
   * @returns {string} Symbol with share-separator punctuation normalized to spaces.
   */
  symbolToCanonical(symbol = '') {
    return symbol.replace('.', ' ').replace('-', ' ').replace('/', ' ');
  }

  /**
   * Resolves an instrument against this trader's cache, keeping MOEX isolated.
   * @param {import('../types.js').Instrument | null} [instrument] Requested instrument.
   * @returns {import('../types.js').Instrument} Cached instrument, supported option or unsupported marker; empty input resolves to an empty object.
   */
  adoptInstrument(instrument = {}) {
    if (instrument?.type === 'option') {
      if (!this.#instruments.has(instrument.underlyingSymbol)) {
        return unsupportedInstrument(instrument.symbol);
      }

      return instrument;
    }

    // The default parameter does not cover null.
    const instrumentFromCache = this.#instruments.get(instrument?.symbol) ?? {};
    let canAdopt = instrument?.symbol === instrumentFromCache.symbol;

    // MOEX is not compatible with other exchanges.
    if (
      instrument?.exchange === EXCHANGE.MOEX &&
      instrumentFromCache.exchange !== EXCHANGE.MOEX
    ) {
      canAdopt = false;
    }

    if (
      instrumentFromCache.exchange === EXCHANGE.MOEX &&
      instrument?.exchange !== EXCHANGE.MOEX
    ) {
      canAdopt = false;
    }

    if (canAdopt) {
      return instrumentFromCache;
    } else {
      return unsupportedInstrument(instrument?.symbol);
    }
  }

  /**
   * @param {import('../types.js').Instrument} i1 First instrument.
   * @param {import('../types.js').Instrument} i2 Second instrument.
   * @returns {boolean} Whether adopted symbols and exchanges match.
   */
  instrumentsAreEqual(i1, i2) {
    const a1 = this.adoptInstrument(i1);
    const a2 = this.adoptInstrument(i2);

    return a1.symbol === a2.symbol && a1.exchange === a2.exchange;
  }

  /** @returns {string} Broker identifier, or * for an unspecified provider. */
  getBroker() {
    return '*';
  }

  /** @returns {string | null} Instrument dictionary identifier, when configured. */
  getDictionary() {
    return null;
  }

  /** @returns {string} Exchange identifier, or * for an unspecified exchange. */
  getExchange() {
    return '*';
  }

  /** @returns {string[]} Source attributes forwarded to the trader runtime. */
  getObservedAttributes() {
    return [];
  }

  /**
   * @param {object | unknown[]} trade Object or compact [id,symbol,side,condition,time,price,volume,pool] tuple.
   * @returns {object | undefined} Canonical market print; object input is retained as-is.
   */
  rawTradeToCanonicalTrade(trade) {
    if (Array.isArray(trade)) {
      return {
        tradeId: trade[0],
        symbol: trade[1],
        side: trade[2] === 1 ? 'buy' : trade[2] === 2 ? 'sell' : '',
        condition: trade[3],
        timestamp: trade[4],
        price: trade[5],
        volume: trade[6],
        pool: trade[7]
      };
    } else if (typeof trade === 'object') {
      return trade;
    }
  }

  /**
   * @param {import('../types.js').Instrument} instrument Instrument metadata.
   * @returns {string} Relative icon URL or fallback.
   */
  getInstrumentIconUrl(instrument) {
    if (!instrument || instrument?.symbol === 'PRN') {
      return 'static/instruments/unknown.svg';
    }

    if (instrument?.type === 'currency') {
      return `static/currency/${instrument.symbol.slice(0, 3)}.svg`;
    }

    let symbol = instrument?.symbol;

    if (symbol === 'TCS' && instrument.exchange === EXCHANGE.SPBX) {
      return 'static/instruments/stocks/rus/TCSG.svg';
    }

    if (
      (instrument.symbol === 'GOLD' || instrument.symbol === 'GOLD~MOEX') &&
      instrument.exchange === EXCHANGE.MOEX
    ) {
      return 'static/instruments/etfs/rus/GOLD.svg';
    }

    if (typeof symbol === 'string') {
      symbol = symbol.split('/')[0].split('-')[0].split('-RM')[0];

      if (
        symbol.endsWith('@GS') ||
        symbol.endsWith('@DE') ||
        symbol.endsWith('@GR') ||
        symbol.endsWith('@UR') ||
        symbol.endsWith('@KT')
      ) {
        return 'static/instruments/unknown.svg';
      }

      symbol = symbol.split('@US')[0];
    }

    if (instrument?.currency === 'HKD') {
      return `static/instruments/stocks/hk/${symbol.replace(' ', '-')}.svg`;
    }

    if (instrument?.currency === 'CNY') {
      return `static/instruments/${instrument?.type}s/cny/${symbol.replace(
        ' ',
        '-'
      )}.svg`;
    }

    const isRM = instrument?.symbol?.endsWith('-RM');

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

    if (instrument?.exchange === EXCHANGE.US) {
      return `static/instruments/stocks/us/${
        symbol.replace(' ', '-').split('~')[0]
      }.svg`;
    }

    return 'static/instruments/unknown.svg';
  }

  /**
   * Searches active instruments by symbol/name and alternate keyboard layout.
   * @param {string} [searchText=''] Query; unsupported punctuation is removed.
   * @returns {{exactSymbolMatch: import('../types.js').Instrument | null, startsWithSymbolMatches: import('../types.js').Instrument[], regexSymbolMatches: import('../types.js').Instrument[], startsWithFullNameMatches: import('../types.js').Instrument[], regexFullNameMatches: import('../types.js').Instrument[]}} Ranked groups, each limited to ten nonexact matches.
   */
  search(searchText = '') {
    let exactSymbolMatch = null;
    const startsWithSymbolMatches = [];
    const regexSymbolMatches = [];
    const startsWithFullNameMatches = [];
    const regexFullNameMatches = [];
    const text = searchText
      .trim()
      // biome-ignore lint/complexity/noUselessEscapeInRegex: OK
      .replaceAll(/[^~a-z0-9\.\s\u0400-\u04FF]/gi, '')
      .toUpperCase();
    const latin = cyrillicToLatin(text);
    const cyrillic = latinToCyrillic(text);

    if (typeof this.instrumentsSearchIndex === 'undefined') {
      this.instrumentsSearchIndex = [];

      for (const [symbol, instrument] of this.instruments) {
        // Bucket by length.
        if (symbol) {
          const symbolWithoutExchange = this.getSymbol(instrument);
          const sl = symbolWithoutExchange.length;

          this.instrumentsSearchIndex[sl] ??= {};
          this.instrumentsSearchIndex[sl][symbolWithoutExchange] ??= [];

          this.instrumentsSearchIndex[sl][symbolWithoutExchange].push(
            instrument
          );
        }
      }
    }

    if (text.length) {
      for (const bucket of this.instrumentsSearchIndex) {
        if (bucket) {
          for (const key in bucket) {
            for (const instrument of bucket[key]) {
              if (instrument.removed) continue;

              const symbol = instrument.symbol
                .replaceAll(/[^~a-z0-9\s\u0400-\u04FF]/gi, '')
                .toUpperCase();
              const symbolWithoutExchange = this.getSymbol(instrument);
              const fullName = (instrument.fullName ?? '').toUpperCase();

              if (
                (symbol === text || symbolWithoutExchange === text) &&
                exactSymbolMatch === null
              ) {
                exactSymbolMatch = instrument;
              }

              if (
                startsWithSymbolMatches.length < 10 &&
                (symbol.startsWith(text) ||
                  symbol.startsWith(latin) ||
                  symbol.startsWith(cyrillic))
              ) {
                startsWithSymbolMatches.push(instrument);
              }

              if (
                startsWithFullNameMatches.length < 10 &&
                (fullName.startsWith(text) ||
                  fullName.startsWith(latin) ||
                  fullName.startsWith(cyrillic))
              ) {
                startsWithFullNameMatches.push(instrument);
              }

              if (
                regexSymbolMatches.length < 10 &&
                (new RegExp(text, 'ig').test(symbol) ||
                  new RegExp(latin, 'ig').test(symbol) ||
                  new RegExp(cyrillic, 'ig').test(symbol))
              ) {
                regexSymbolMatches.push(instrument);
              }

              if (
                fullName &&
                regexFullNameMatches.length < 10 &&
                (new RegExp(text, 'ig').test(fullName) ||
                  new RegExp(latin, 'ig').test(fullName) ||
                  new RegExp(cyrillic, 'ig').test(fullName))
              ) {
                regexFullNameMatches.push(instrument);
              }
            }
          }
        }
      }
    }

    return {
      exactSymbolMatch,
      startsWithSymbolMatches,
      regexSymbolMatches: regexSymbolMatches.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      ),
      startsWithFullNameMatches: startsWithFullNameMatches.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      ),
      regexFullNameMatches: regexFullNameMatches.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      )
    };
  }
}

/** Common US-equity adoption rules, exchange exclusions and icon paths. */
class USTrader extends Trader {
  /** @override Resolves legacy US suffixes and protects against cross-exchange symbol collisions. */
  adoptInstrument(instrument = {}) {
    if (
      ![EXCHANGE.SPBX, EXCHANGE.US, EXCHANGE.UTEX_MARGIN_STOCKS].includes(
        instrument.exchange
      )
    ) {
      return unsupportedInstrument(instrument.symbol);
    }

    // SPB
    if (instrument.symbol === 'SPB@US') {
      return this.instruments.get('SPB');
    }

    // TCS
    if (instrument.symbol === 'TCS' && instrument.exchange === EXCHANGE.SPBX) {
      return unsupportedInstrument(instrument.symbol);
    }

    let canAdopt = true;

    // Possible collisions.
    ['FIVE', 'CARM', 'ASTR', 'GOLD'].forEach((ticker) => {
      if (
        this.getSymbol(instrument) === ticker &&
        instrument.exchange === EXCHANGE.MOEX
      ) {
        canAdopt = false;
      }
    });

    if (!canAdopt) {
      return unsupportedInstrument(instrument.symbol);
    }

    if (instrument.symbol?.endsWith('~US')) {
      return super.adoptInstrument({
        ...instrument,
        ...{ symbol: instrument.symbol.replace('~US', '') }
      });
    }

    return super.adoptInstrument(instrument);
  }

  /** @override Resolves US equity icons, including share separators and the reserved PRN filename. */
  getInstrumentIconUrl(instrument) {
    if (!instrument) {
      return 'static/instruments/unknown.svg';
    }

    if (instrument.symbol === 'PRN') {
      return 'static/instruments/stocks/us/PRN@US.svg';
    }

    if (instrument.currency === 'USD' || instrument.currency === 'USDT') {
      return `static/instruments/stocks/us/${instrument.symbol
        .replace(' ', '-')
        .replace('/', '-')}.svg`;
    }

    return super.getInstrumentIconUrl(instrument);
  }
}

/**
 * Registers a trader constructor with the active SharedWorker or Aspirant loader.
 * @param {typeof Trader} instance Provider constructor.
 * @returns {void}
 */
function pppTraderInstanceForWorkerIs(instance) {
  if (
    typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope
  ) {
    self.pppTraderInstance ??= instance;
  } else if (
    typeof process !== 'undefined' &&
    process.release.name === 'node'
  ) {
    // Aspirant Worker.
    globalThis.pppTraderInstanceForWorkerRecv?.(instance);
  }
}

/** DOM-like subscription source represented inside a worker. */
class RemoteSource {
  bus = new EventBus();

  port;

  sourceID;

  canChangeInstrument;

  /**
   * @param {string} sourceID Transport identifier assigned by the client.
   * @param {boolean} canChangeInstrument Whether instrument-change events can occur.
   * @param {MessagePort} port Channel used for assignments.
   */
  constructor(sourceID, canChangeInstrument, port) {
    this.sourceID = sourceID;
    this.canChangeInstrument = !!canChangeInstrument;
    this.port = port;
  }

  instrument;

  attributes = new Map();

  /**
   * @param {string} attribute Source attribute name.
   * @returns {unknown} Last forwarded value.
   */
  getAttribute(attribute) {
    return this.attributes.get(attribute);
  }

  /**
   * @param {string} event Event name.
   * @param {import('../event-bus.js').EventHandler} listener Callback.
   * @returns {boolean} Whether the listener was newly registered.
   */
  addEventListener(event, listener) {
    return this.bus.on(event, listener);
  }

  /**
   * @param {string} event Event name.
   * @param {import('../event-bus.js').EventHandler} listener Registered callback.
   * @returns {void}
   */
  removeEventListener(event, listener) {
    return this.bus.off(event, listener);
  }
}

// For using inside of a SharedWorker.
class RemoteTraderRuntime {
  document;

  #pendingTraderPromise;

  #pendingAWConnection;

  #worker;

  #awConnection;

  #awReconnectionTimeout;

  // Aspirant Worker URL.
  #awUrl;

  // For looking up sources by sourceID. Aspirant Worker communication only.
  // SharedWorker communication is based on an in-place MessageChannel event handler.
  #awSources = new Map();

  get worker() {
    return this.#worker;
  }

  constructor(document) {
    this.document = document;

    if (this.document.runtime === 'url') {
      const runtimeUrl = new URL(this.document.runtimeUrl);

      if (runtimeUrl.protocol === 'http:') {
        runtimeUrl.protocol = 'ws:';
      } else {
        runtimeUrl.protocol = 'wss:';
      }

      this.#awUrl = new URL(runtimeUrl).toString();
    }
  }

  #getAWReconnectionTimeout() {
    if (typeof this.#awReconnectionTimeout === 'undefined') {
      this.#awReconnectionTimeout = 100;
    } else {
      this.#awReconnectionTimeout += 100;

      if (this.#awReconnectionTimeout > 500) {
        this.#awReconnectionTimeout = 500;
      }
    }

    return this.#awReconnectionTimeout;
  }

  // The trader has to be initialized earlier.
  #connectToURLTraderFromSharedWorker(reconnect) {
    if (this.#awConnection?.readyState === WebSocket.OPEN) {
      return this.#awConnection;
    } else if (this.#pendingAWConnection && !reconnect) {
      return this.#pendingAWConnection;
    } else {
      this.#pendingAWConnection = new Promise((resolve) => {
        this.#awConnection = new WebSocket(this.#awUrl);

        this.#awConnection.onclose = async () => {
          await later(this.#getAWReconnectionTimeout());
          resolve(this.#connectToURLTraderFromSharedWorker(true));
        };
        this.#awConnection.onerror = () => this.#awConnection.close();
        this.#awConnection.onmessage = ({ data }) => {
          const messages = JSON.parse(data);

          if (Array.isArray(messages)) {
            for (const payload of messages) {
              if (payload.T === 'ready') {
                return resolve(this.#awConnection);
              } else if (
                payload.T === 'success' &&
                payload.msg === 'connected'
              ) {
                return this.#awConnection.send(
                  JSON.stringify({
                    T: 'connack',
                    _id: this.document._id
                  })
                );
              } else if (payload.T === 'a') {
                const source = this.#awSources.get(payload.SI);

                if (source?.sourceID === payload.SI) {
                  source[payload.f] = payload.v;
                }
              }
            }
          }
        };
      });

      return this.#pendingAWConnection;
    }
  }

  async subscribeField({ source, field, datum }) {
    if (this.document.runtime === 'shared-worker') {
      // For SharedWorker <-> SharedWorker communication.
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = ({ data }) => {
        if (data?.type === 'assign') {
          if (source.sourceID === data.sourceID) {
            source[data.field] = data.value;
          }
        }
      };

      // Will send 'source-changed' message before the subscription thru the main thread.
      self.pppPorts[0].postMessage(
        {
          type: 'shared-worker-subscribe-field',
          document: this.document,
          port2: messageChannel.port2,
          sourceID: source.sourceID,
          instrument: source.instrument,
          canChangeInstrument: source.canChangeInstrument,
          field,
          datum
        },
        [messageChannel.port2]
      );
    } else if (this.document.runtime === 'url') {
      // For SharedWorker <-> Aspirant Worker communication.
      await this.#connectToURLTraderFromSharedWorker();

      this.#awConnection.send(
        JSON.stringify({
          T: 'source-changed',
          sourceID: source.sourceID,
          reason: 'instrument',
          oldValue: null,
          newValue: source.instrument,
          canChangeInstrument: source.canChangeInstrument,
          doNotFire: true
        })
      );

      this.#awSources.set(source.sourceID, source);

      return this.#awConnection.send(
        JSON.stringify({
          T: 'subscribe-field',
          sourceID: source.sourceID,
          field,
          datum,
          canChangeInstrument: source.canChangeInstrument
        })
      );
    }
  }

  async subscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      if (typeof datum === 'string') {
        await this.subscribeField({ source, field, datum });
      } else if (typeof datum === 'object') {
        await this.subscribeField({
          source,
          field,
          datum: datum.datum
        });
      }
    }
  }

  async unsubscribeField({ source, field, datum }) {
    if (this.document.runtime === 'shared-worker') {
      return self.pppPorts[0].postMessage({
        type: 'shared-worker-unsubscribe-field',
        document: this.document,
        sourceID: source.sourceID,
        field,
        datum
      });
    } else if (this.document.runtime === 'url') {
      await this.#connectToURLTraderFromSharedWorker();

      return this.#awConnection.send(
        JSON.stringify({
          T: 'unsubscribe-field',
          sourceID: source.sourceID,
          field,
          datum
        })
      );
    }
  }

  async unsubscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.unsubscribeField({ source, field, datum });
    }
  }

  async resubscribe(onlyForDatums = []) {
    if (this.document.runtime === 'shared-worker') {
      return self.pppPorts[0].postMessage({
        type: 'shared-worker-resubscribe',
        document: this.document,
        onlyForDatums
      });
    } else if (this.document.runtime === 'url') {
      await this.#connectToURLTraderFromSharedWorker();

      return this.#awConnection.send(
        JSON.stringify({
          T: 'resubscribe',
          onlyForDatums
        })
      );
    }
  }

  async loadSharedOrRemoteTrader() {
    if (this.#pendingTraderPromise) {
      return this.#pendingTraderPromise;
    } else {
      switch (this.document.runtime) {
        case 'main-thread':
          return null;
        case 'shared-worker':
          if (this.document._id === self.pppTrader?.document?._id) {
            return self.pppTrader;
          }

          return (this.#pendingTraderPromise = new Promise((resolve) => {
            const channel = new MessageChannel();
            const bailOutTimer = setTimeout(() => resolve(null), 5000);

            channel.port1.onmessage = ({ data }) => {
              if (data.type === 'shared-worker-created') {
                clearTimeout(bailOutTimer);
                resolve(this);
              }
            };

            // Post to the first main thread port. Main thread will create the new shared worker.
            self.pppPorts[0].postMessage(
              {
                type: 'shared-worker-needed',
                document: this.document,
                port2: channel.port2
              },
              [channel.port2]
            );
          }));
        case 'url':
          await this.#connectToURLTraderFromSharedWorker();

          return this;
      }
    }
  }
}

class RemoteTradersFromSharedWorker {
  runtimes = new Map();

  async getOrCreateTrader(document) {
    if (document) {
      if (document.runtime === 'main-thread') {
        return null;
      }

      if (!this.runtimes.has(document._id)) {
        this.runtimes.set(document._id, new RemoteTraderRuntime(document));
      }

      return this.runtimes.get(document._id).loadSharedOrRemoteTrader();
    }
  }
}

// SharedWorker related section.
if (
  typeof WorkerGlobalScope !== 'undefined' &&
  self instanceof WorkerGlobalScope
) {
  self.ppp = new (class {
    traders = new RemoteTradersFromSharedWorker();

    async getOrCreateTrader(document) {
      return this.traders.getOrCreateTrader(document);
    }

    async fetch(url, options = {}, allowedHeaders = []) {
      const globalProxy = self.globalProxyUrl;

      if (globalProxy) {
        const urlObject = new URL(url);

        options.headers ??= {};
        options.headers['X-Host'] = urlObject.hostname;

        for (const h of Object.keys(options.headers)) {
          const lower = h.toLowerCase();

          if (lower === 'x-host') {
            continue;
          }

          if (!allowedHeaders.includes(lower)) {
            allowedHeaders.push(h);
          }
        }

        options.headers['X-Allowed-Headers'] = allowedHeaders.join(',');
        urlObject.hostname = new URL(globalProxy).hostname;

        return fetch(urlObject.toString(), options);
      } else {
        return fetch(url, options);
      }
    }
  })();

  // In-memory storage.
  self.sessionStorage = new (class {
    #storage = new Map();

    getItem(key) {
      return this.#storage.get(key);
    }

    setItem(key, value) {
      this.#storage.set(key, value);
    }

    removeItem(key) {
      this.#storage.delete(key);
    }
  })();

  // Every source has a string ID.
  // We collect them here (mapped to RemoteSource objects).
  self.pppSources = new Map();
  // Use this map when 'close' event is triggered to unsubscribe.
  self.pppPortSources = new WeakMap();
  self.pppPorts = [];
  self.onconnect = (e) => {
    const port = e.ports[0];

    self.pppPortSources.set(port, new Set());

    const multiPurposeEventListener = async ({ data }) => {
      // Called upon 'beforeunload' event, SharedWorker only.
      if (data?.type === 'close') {
        const portIndex = self.pppPorts.indexOf(port);

        if (portIndex > -1) {
          self.pppPorts.splice(portIndex, 1);
        }

        port.removeEventListener('message', multiPurposeEventListener);

        // The trader may not exist yet if the page closes before connack.
        if (self.pppPortSources.has(port) && self.pppTrader) {
          for (const source of self.pppPortSources.get(port)) {
            for (const datum in self.pppTrader.datums) {
              const sources = self.pppTrader.datums[datum].sources[datum];

              if (sources.has(source)) {
                await self.pppTrader.unsubscribeField({ source, datum });
              }
            }
          }

          self.pppPortSources.delete(port);
        }
      } else if (data?.type === 'connack') {
        if (typeof self.pppTrader === 'undefined') {
          self.pppTrader = new self.pppTraderInstance(data.document);
          self.globalProxyUrl = data.globalProxyUrl;
          self.rootUrl = data.rootUrl;

          await import(`${self.rootUrl}/lib/debug.js`);

          self.pppTrader.$$debug ??= globalThis.ppp.$debug(data.document._id);
          self.pppTrader.$$connection ??=
            self.pppTrader.$$debug.extend('connection');

          if (
            typeof self.pppTrader.oneTimeInitializationCallback === 'function'
          ) {
            await self.pppTrader.oneTimeInitializationCallback();
          }
        }

        port.postMessage({
          type: 'init'
        });
      } else if (data?.type === 'instruments') {
        if (typeof self.pppTrader !== 'undefined') {
          await self.pppTrader.instrumentsArrived?.(data.instruments);
          port.postMessage({
            type: 'ready'
          });
        }
      } else if (data?.type === 'rpc') {
        try {
          port.postMessage({
            type: `rpc-${data.rid}`,
            response: await self.pppTrader[data.method](...data.args)
          });
        } catch (exception) {
          port.postMessage({
            type: `rpc-${data.rid}`,
            exception: exception.serialize?.() ?? {
              name: exception.name ?? 'RemoteTraderError',
              args: {
                details: exception.name,
                message: exception.message
              }
            }
          });
        }
      } else if (data?.type === 'source-changed') {
        if (!self.pppSources.has(data.sourceID)) {
          // data.port2 is set when the request is originated from a shared worker.
          self.pppSources.set(
            data.sourceID,
            new RemoteSource(
              data.sourceID,
              data.canChangeInstrument,
              data.port2 ?? port
            )
          );

          if (!data.port2) {
            self.pppPortSources
              .get(port)
              .add(self.pppSources.get(data.sourceID));
          }
        }

        const source = self.pppSources.get(data.sourceID);

        switch (data.reason) {
          case 'attribute':
            source.attributes.set(data.attribute, data.value);

            break;
          case 'instrument':
            source.instrument = data.newValue;

            if (!data.doNotFire) {
              source.bus.emit('instrumentchange', {
                source,
                oldValue: data.oldValue,
                newValue: data.newValue
              });
            }

            break;
        }
      } else if (data?.type === 'subscribe-field') {
        const source = self.pppSources.get(data.sourceID);

        if (source) {
          try {
            await self.pppTrader.subscribeField({
              source,
              field: data.field,
              datum: data.datum
            });
          } catch (exception) {
            self.pppTrader.$$debug?.(
              'subscribeField %s:%s failed: %o',
              data.field,
              data.datum,
              exception
            );
            port.postMessage({
              type: 'subscription-exception',
              sourceKey: `${data.sourceID}:${data.field}`,
              exception: exception.serialize?.() ?? {
                name: exception.name ?? 'RemoteTraderError',
                args: {
                  details: exception.name,
                  message: exception.message
                }
              }
            });
          }
        }
      } else if (data?.type === 'unsubscribe-field') {
        const source = self.pppSources.get(data.sourceID);

        if (source) {
          self.pppTrader
            .unsubscribeField({
              source,
              field: data.field,
              datum: data.datum
            })
            .catch((e) =>
              self.pppTrader.$$debug?.(
                'unsubscribeField %s:%s failed: %o',
                data.field,
                data.datum,
                e
              )
            );
        }
      } else if (data?.type === 'resubscribe') {
        self.pppTrader
          .resubscribe(data.onlyForDatums ?? [])
          .catch((e) => self.pppTrader.$$debug?.('resubscribe failed: %o', e));
      } else if (data?.type === 'terminate') {
        port.removeEventListener('message', multiPurposeEventListener);
        self.close();
      }
    };

    port.addEventListener('message', multiPurposeEventListener);
    !self.pppPorts.includes(port) && self.pppPorts.push(port);

    port.start();
    port.postMessage({
      type: 'conn'
    });
  };
}

export {
  Trader,
  USTrader,
  TraderDatum,
  GlobalTraderDatum,
  TraderEventDatum,
  ConditionalOrderDatum,
  pppTraderInstanceForWorkerIs
};
