import { TRADER_DATUM, EXCHANGE } from '../const.js';
import {
  getInstrumentPrecision,
  latinToCyrillic,
  cyrillicToLatin,
  stringToFloat,
  getInstrumentMinPriceIncrement
} from '../intl.js';
import { EventBus } from '../event-bus.js';

export function unsupportedInstrument(symbol = '') {
  return {
    symbol,
    fullName: 'Инструмент не поддерживается',
    notSupported: true
  };
}

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

  constructor(trader) {
    this.trader = trader;
  }

  filter(data, instrument, source, datum) {
    return true;
  }

  hasSource(source) {
    for (const key in this.sources) {
      if (this.sources[key].has(source)) {
        return true;
      }
    }

    return false;
  }

  dataArrived(data, instrument, options = {}) {
    if (!instrument) {
      return;
    }

    if (this.doNotSaveValue !== true && options.doNotSaveValue !== true) {
      if (typeof options.saveSlot === 'undefined') {
        // One centralized data source.
        this.values.set(instrument.symbol, data);
      } else if (options.saveSlot >= 0) {
        // Many concurrent sources.
        const slots = this.values.get(instrument.symbol) ?? [];

        slots[options.saveSlot] = data;

        this.values.set(instrument.symbol, slots);
      }
    }

    for (const datum in this.sources) {
      for (const [source, field] of this.sources[datum]) {
        if (
          this.trader.instrumentsAreEqual(source.instrument, instrument) &&
          this.filter(data, instrument, source, datum)
        ) {
          this.trader.assignSourceField(
            source,
            field,
            this?.[datum]?.(data, instrument, source) ??
              this.emptyValue(datum) ??
              '—'
          );
        }
      }
    }
  }

  emptyValue(datum) {
    switch (datum) {
      case TRADER_DATUM.CANDLE:
      case TRADER_DATUM.MARKET_PRINT:
      case TRADER_DATUM.ORDERBOOK:
      case TRADER_DATUM.NOII:
        return {};
    }

    return '—';
  }

  async subscribe(source, field, datum) {
    // Columns do not change instruments.
    if (!this.#listeners.has(source) && source.canChangeInstrument) {
      const listener = async ({ detail }) => {
        const { source, oldValue } = detail;

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

      return this.firstReferenceAdded?.(source, symbol);
    } else {
      this.refs.set(symbol, refCount + 1);

      // The source needs our saved data here. Please, set it!
      const slots = this.values.get(symbol);

      if (!Array.isArray(slots)) {
        if (typeof slots !== 'undefined') {
          if (this.filter(slots, source.instrument, source, datum)) {
            if (source.instrument) {
              this.trader.assignSourceField(
                source,
                field,
                this?.[datum]?.(slots, source.instrument, source) ??
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
          if (this.filter(value, source.instrument, source, datum)) {
            if (source.instrument && typeof value !== 'undefined') {
              this.trader.assignSourceField(
                source,
                field,
                this?.[datum]?.(slots, source.instrument, source) ??
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
    }
  }

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
    }
  }
}

// Positions (portfolio), orders, timeline, trader events.
class GlobalTraderDatum {
  // Maps for every possible subdatum (source => field).
  sources = {};

  refCount = 0;

  trader;

  value = new Map();

  // "instrumentchange" event listeners.
  #listeners = new Map();

  constructor(trader) {
    this.trader = trader;
  }

  filter(data, source, key, datum) {
    return true;
  }

  dataArrived(data) {
    const key = this.valueKeyForData(data);

    if (typeof key !== 'undefined') {
      this.value.set(key, data);

      for (const datum in this.sources) {
        for (const [source, field] of this.sources[datum]) {
          if (this.filter(data, source, key, datum)) {
            if (this.manualAssignment !== true) {
              this.trader.assignSourceField(
                source,
                field,
                this?.[datum]?.(data, source, key, field) ??
                  this.emptyValue(datum) ??
                  '—'
              );
            } else {
              // The datum method will take care of any assignments.
              this?.[datum]?.(data, source, key, field);
            }
          }
        }
      }
    } else {
      console.log('No key for data: ', data);
    }
  }

  emptyValue(datum) {
    switch (datum) {
      case TRADER_DATUM.POSITION_SIZE:
        return 0;
      case TRADER_DATUM.POSITION_AVERAGE:
        return 0;
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.ACTIVE_ORDER:
      case TRADER_DATUM.TIMELINE_ITEM:
      case TRADER_DATUM.TRADER:
        return {};
    }

    return '—';
  }

  valueKeyForData(data) {
    return data?.symbol;
  }

  async subscribe(source, field, datum) {
    // Columns and orders do not change instruments.
    if (!this.#listeners.has(source) && source.canChangeInstrument) {
      const listener = async ({ detail }) => {
        const { source } = detail;

        for (const d of Object.keys(this.sources)) {
          if (this.sources[d].has(source)) {
            const f = this.sources[d].get(source);

            // Cleanup should be done only once per field:datum pair.
            this.trader.assignSourceField(source, f, this.emptyValue(d));

            // Propagate keyed data in an array-like style.
            for (const [key, data] of this.value) {
              if (this.filter(data, source, key, d)) {
                if (this.manualAssignment !== true) {
                  this.trader.assignSourceField(
                    source,
                    f,
                    this?.[d]?.(data, source, key, f) ??
                      this.emptyValue(d) ??
                      '—'
                  );
                } else {
                  this?.[d]?.(data, source, key, f);
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

      // The source needs our saved data here. Please, set it!
      for (const [key, data] of this.value) {
        if (this.filter(data, source, key, datum)) {
          if (this.manualAssignment !== true) {
            this.trader.assignSourceField(
              source,
              field,
              this?.[datum]?.(data, source, key, field) ??
                this.emptyValue(datum) ??
                '—'
            );
          } else {
            this?.[datum]?.(data, source, key, field);
          }
        }
      }
    }
  }

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
    }
  }
}

class TraderEventDatum extends GlobalTraderDatum {}

GlobalTraderDatum.prototype.hasSource = TraderDatum.prototype.hasSource;

class Trader {
  datums = {};

  document = {};

  #instruments = new Map();

  get instruments() {
    return this.#instruments;
  }

  #instances = [];

  constructor(document, typeWithDatums = []) {
    this.document = document;

    typeWithDatums.forEach(({ type, datums }) => {
      const instance = new type(this);

      datums.forEach((datum) => {
        instance.sources[datum] = new Map();

        this.datums[datum] = instance;
      });

      this.#instances.push(instance);
    });
  }

  async instrumentsArrived(instruments) {
    this.#instruments = instruments;
  }

  async subscribeField({ source, field, datum }) {
    const traderDatum = this.datums[datum];

    if (typeof traderDatum !== 'undefined') {
      if (!traderDatum.sources[datum].has(source)) {
        traderDatum.sources[datum].set(source, field);

        return traderDatum.subscribe(source, field, datum);
      }
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
    const traderDatum = this.datums[datum];

    if (typeof traderDatum !== 'undefined') {
      if (traderDatum.sources[datum].has(source)) {
        traderDatum.sources[datum].delete(source);

        return traderDatum.unsubscribe(source);
      }
    }
  }

  async unsubscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.unsubscribeField({ source, field, datum });
    }
  }

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

  async estimate() {
    return {};
  }

  assignSourceField(source, field, value) {
    switch (this.document.runtime) {
      case 'main-thread':
        source[field] = value;

        break;
      case 'shared-worker':
        if (typeof self !== 'undefined') {
          source.port.postMessage({
            type: 'assign',
            sourceID: source.sourceID,
            field,
            value
          });
        }

        break;
      case 'aspirant-worker':
        break;
    }
  }

  traderEvent(event = {}) {
    for (const [source, field] of this.datums[TRADER_DATUM.TRADER].sources[
      TRADER_DATUM.TRADER
    ]) {
      this.assignSourceField(source, field, event);
    }
  }

  relativeBondPriceToPrice(relativePrice, instrument) {
    return +this.fixPrice(
      instrument,
      (relativePrice * instrument.nominal) / 100
    );
  }

  bondPriceToRelativeBondPrice(price, instrument) {
    return +((price * 100) / instrument.nominal).toFixed(2);
  }

  caps() {
    return this.document.caps ?? [];
  }

  hasCap(cap) {
    const caps = this.caps();

    if (typeof cap === 'string') return caps.indexOf(cap) > -1;
    else if (Array.isArray(cap)) return cap.every((c) => caps.indexOf(c) > -1);
    else return false;
  }

  fixPrice(instrument, price) {
    const precision = getInstrumentPrecision(instrument, price);

    price = stringToFloat(price);

    if (!price || isNaN(price)) price = 0;

    return price.toFixed(precision).toString();
  }

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
        return +this.fixPrice(instrument, newPrice);
      } else {
        return 0;
      }
    } else {
      return price;
    }
  }

  getSymbol(instrument = {}) {
    let symbol = instrument.symbol;

    if (!symbol) return '';

    if (/~/gi.test(symbol)) symbol = symbol.split('~')[0];

    return symbol;
  }

  adoptInstrument(instrument = {}, options = {}) {
    const instrumentFromCache = this.#instruments.get(instrument.symbol) ?? {};
    let canAdopt = instrument.symbol === instrumentFromCache.symbol;

    // MOEX is not compatible with other exchanges.
    if (
      instrument.exchange === EXCHANGE.MOEX &&
      instrumentFromCache.exchange !== EXCHANGE.MOEX
    ) {
      canAdopt = false;
    }

    if (
      instrumentFromCache.exchange === EXCHANGE.MOEX &&
      instrument.exchange !== EXCHANGE.MOEX
    ) {
      canAdopt = false;
    }

    if (canAdopt) {
      return instrumentFromCache;
    } else {
      return unsupportedInstrument(instrument.symbol);
    }
  }

  instrumentsAreEqual(i1, i2) {
    const a1 = this.adoptInstrument(i1);
    const a2 = this.adoptInstrument(i2);

    return a1.symbol === a2.symbol && a1.exchange === a2.exchange;
  }

  getBroker() {
    return '*';
  }

  getDictionary() {
    return null;
  }

  getExchange() {
    return '*';
  }

  getExchangeForDBRequest() {
    return this.getExchange();
  }

  getObservedAttributes() {
    return [];
  }

  getInstrumentIconUrl(instrument) {
    if (!instrument || instrument?.symbol === 'PRN') {
      return 'static/instruments/unknown.svg';
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

  search(searchText = '') {
    let exactSymbolMatch = null;
    const startsWithSymbolMatches = [];
    const regexSymbolMatches = [];
    const startsWithFullNameMatches = [];
    const regexFullNameMatches = [];
    const text = searchText
      .trim()
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

              let symbol = instrument.symbol
                .replaceAll(/[^~a-z0-9\s\u0400-\u04FF]/gi, '')
                .toUpperCase();

              const symbolWithoutExchange = this.getSymbol(instrument);
              const fullName = instrument.fullName.toUpperCase();

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

class USTrader extends Trader {
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

function pppTraderInstanceForWorkerIs(instance) {
  if (typeof self !== 'undefined') {
    self.pppTraderInstance ??= instance;
  }
}

class RemoteSource {
  bus = new EventBus();

  port;

  sourceID;

  canChangeInstrument;

  constructor(sourceID, canChangeInstrument, port) {
    this.sourceID = sourceID;
    this.canChangeInstrument = !!canChangeInstrument;
    this.port = port;
  }

  instrument;

  attributes = new Map();

  getAttribute(attribute) {
    return this.attributes.get(attribute);
  }

  addEventListener(event, listener) {
    return this.bus.on(event, listener);
  }

  removeEventListener(event, listener) {
    return this.bus.off(event, listener);
  }
}

// SharedWorker related section.
if (typeof self !== 'undefined') {
  self.pppSources = new Map();
  self.pppPorts = [];
  self.onconnect = (e) => {
    const port = e.ports[0];

    const multiPurposeEventListener = async ({ data }) => {
      if (data?.type === 'close') {
        const portIndex = self.pppPorts.indexOf(port);

        if (portIndex > -1) {
          self.pppPorts.splice(portIndex, 1);
        }

        port.removeEventListener('message', multiPurposeEventListener);
      } else if (data?.type === 'connack') {
        if (typeof self.pppTrader === 'undefined') {
          self.pppTrader = new self.pppTraderInstance(data.document);

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
        if (
          typeof self.pppTrader !== 'undefined' &&
          typeof self.pppTrader.instrumentsArrived === 'function'
        ) {
          await self.pppTrader.instrumentsArrived(data.instruments);
          port.postMessage({
            type: 'ready'
          });
        }
      } else if (data?.type === 'rpc') {
        try {
          port.postMessage({
            type: `rpc-${data.requestId}`,
            response: await self.pppTrader[data.method](...data.args)
          });
        } catch (exception) {
          port.postMessage({
            type: `rpc-${data.requestId}`,
            exception: exception.serialize()
          });
        }
      } else if (data?.type === 'source-changed') {
        if (!self.pppSources.has(data.sourceID)) {
          self.pppSources.set(
            data.sourceID,
            new RemoteSource(data.sourceID, data.canChangeInstrument, port)
          );
        }

        const source = self.pppSources.get(data.sourceID);

        switch (data.reason) {
          case 'attribute':
            source.attributes.set(data.attribute, data.value);

            break;
          case 'instrument':
            source.instrument = data.newValue;

            source.bus.emit('instrumentchange', {
              source,
              oldValue: data.oldValue,
              newValue: data.newValue
            });

            break;
        }
      } else if (data?.type === 'subscribe-field') {
        if (!self.pppSources.has(data.sourceID)) {
          self.pppSources.set(
            data.sourceID,
            new RemoteSource(data.sourceID, data.canChangeInstrument, port)
          );
        }

        const source = self.pppSources.get(data.sourceID);

        await self.pppTrader.subscribeField({
          source,
          field: data.field,
          datum: data.datum
        });
      } else if (data?.type === 'unsubscribe-field') {
        const source = self.pppSources.get(data.sourceID);

        if (source) {
          await self.pppTrader.unsubscribeField({
            source,
            field: data.field,
            datum: data.datum
          });
        }
      } else if (data?.type === 'resubscribe') {
        await self.pppTrader.resubscribe(data.onlyForDatums ?? []);
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
  pppTraderInstanceForWorkerIs
};
