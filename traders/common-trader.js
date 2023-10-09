import ppp from '../ppp.js';
import {
  getInstrumentPrecision,
  latinToCyrillic,
  cyrillicToLatin,
  stringToFloat,
  getInstrumentMinPriceIncrement
} from '../lib/intl.js';
import { EXCHANGE, TRADER_DATUM } from '../lib/const.js';
import {
  NoInstrumentsError,
  StaleInstrumentCacheError
} from '../lib/ppp-errors.js';
import { Column } from '../elements/widgets/columns/column.js';

class TraderDatum {
  // Maps for every possible subdatum (source => field).
  sources = {};

  refs = new Map();

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

  dataArrived(data, instrument) {
    if (!instrument) {
      return;
    }

    if (this.doNotSaveValue !== true) {
      this.values.set(instrument.symbol, data);
    }

    for (const datum in this.sources) {
      for (const [source, field] of this.sources[datum]) {
        if (
          this.trader.instrumentsAreEqual(source.instrument, instrument) &&
          this.filter(data, instrument, source, datum)
        ) {
          source[field] =
            this?.[datum]?.(data, instrument, source) ??
            this.emptyValue(datum) ??
            '—';
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
    if (!this.#listeners.has(source) && !(source instanceof Column)) {
      const listener = async ({ detail }) => {
        const { source, oldValue } = detail;

        // Unsub/sub for every subdatum.
        for (const d of Object.keys(this.sources)) {
          if (this.sources[d].has(source)) {
            const f = this.sources[d].get(source);

            source[f] = this.emptyValue(d);

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

    const symbol = source.instrument.symbol;
    const refCount = this.refs.get(symbol) ?? 0;

    if (refCount === 0) {
      this.refs.set(symbol, 1);

      return this.firstReferenceAdded?.(source, symbol);
    } else {
      this.refs.set(symbol, refCount + 1);

      const value = this.values.get(symbol);

      // The source needs our saved data here. Please, set it!
      if (this.filter(value, source.instrument, source, datum)) {
        if (source.instrument && typeof value !== 'undefined') {
          source[field] =
            this?.[datum]?.(value, source.instrument, source) ??
            this.emptyValue(datum) ??
            '—';
        } else {
          source[field] = this.emptyValue(datum) ?? '—';
        }
      }
    }
  }

  async unsubscribe(source, oldInstrument) {
    if (!this.hasSource(source) && !(source instanceof Column)) {
      const listener = this.#listeners.get(source);

      if (listener) {
        source.removeEventListener('instrumentchange', listener);
        this.#listeners.delete(source);
      }
    }

    if (!oldInstrument && !source.instrument) {
      return;
    }

    const symbol = oldInstrument?.symbol ?? source.instrument.symbol;
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
              source[field] =
                this?.[datum]?.(data, source, key, field) ??
                this.emptyValue(datum) ??
                '—';
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
    // Columns do not change instruments.
    if (!this.#listeners.has(source) && !(source instanceof Column)) {
      const listener = async ({ detail }) => {
        const { source } = detail;

        for (const d of Object.keys(this.sources)) {
          if (this.sources[d].has(source)) {
            const f = this.sources[d].get(source);

            // Cleanup should be done only once per field:datum pair.
            source[f] = this.emptyValue(d);

            // Propagate keyed data in an array-like style.
            for (const [key, data] of this.value) {
              if (this.filter(data, source, key, d)) {
                if (this.manualAssignment !== true) {
                  source[f] =
                    this?.[d]?.(data, source, key, f) ??
                    this.emptyValue(d) ??
                    '—';
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
            source[field] =
              this?.[datum]?.(data, source, key, field) ??
              this.emptyValue(datum) ??
              '—';
          } else {
            this?.[datum]?.(data, source, key, field);
          }
        }
      }
    }
  }

  async unsubscribe(source, field, datum) {
    if (!this.hasSource(source) && !(source instanceof Column)) {
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

  #pendingInstrumentCachePromise;

  #instruments = new Map();

  #instances = [];

  get instruments() {
    return this.#instruments;
  }

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

  traderEvent(event = {}) {
    for (const [source, field] of this.datums[TRADER_DATUM.TRADER].sources[
      TRADER_DATUM.TRADER
    ]) {
      source[field] = event;
    }
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

  async resubscribe(predicate = () => true) {
    const sfd = [];

    if (typeof predicate !== 'function') {
      predicate = () => true;
    }

    for (const i of this.#instances) {
      for (const sd of Object.keys(i.sources)) {
        for (const [source, field] of i.sources[sd]) {
          if (predicate(source, field, sd)) {
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

  async syncInstrumentCache({ lastCacheVersion }) {
    const exchange = this.getExchange();
    const broker = this.getBroker();
    const instruments = await ppp.user.functions.find(
      {
        collection: 'instruments'
      },
      {
        exchange: this.getExchangeForDBRequest(),
        broker
      }
    );

    if (!instruments.length) {
      return;
    }

    const cache = await ppp.openInstrumentCache({
      exchange,
      broker
    });

    try {
      await new Promise((resolve, reject) => {
        const storeName = `${exchange}:${broker}`;
        const tx = cache.transaction(storeName, 'readwrite');
        const instrumentsStore = tx.objectStore(storeName);

        instrumentsStore.put({
          symbol: '@version',
          version: lastCacheVersion
        });

        instruments.forEach((i) => {
          const stripped = {};

          for (const k in i) {
            if (k !== '_id') {
              stripped[k] = i[k];
            }
          }

          instrumentsStore.put(stripped);
        });

        tx.oncomplete = () => {
          resolve();
        };

        tx.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } finally {
      cache.close();
    }
  }

  async buildInstrumentCache() {
    if (this.#pendingInstrumentCachePromise) {
      return this.#pendingInstrumentCachePromise;
    } else {
      return (this.#pendingInstrumentCachePromise = (async () => {
        this.#instruments.clear();

        if (typeof this.oneTimeInitializationCallback === 'function') {
          await this.oneTimeInitializationCallback();
        }

        const exchange = this.getExchange();
        const broker = this.getBroker();
        const dictionary = this.getDictionary();

        if (exchange === '*' || broker === '*' || !dictionary) return this;

        const cache = await ppp.openInstrumentCache({
          exchange,
          broker
        });

        const lastCacheVersion = ppp.settings.get(
          `instrumentCache:${exchange}:${broker}`
        );
        let currentCacheVersion = 0;

        try {
          await new Promise((resolve, reject) => {
            const storeName = `${exchange}:${broker}`;
            const tx = cache.transaction(storeName, 'readonly');
            const instrumentsStore = tx.objectStore(storeName);
            const cursorRequest = instrumentsStore.getAll();

            cursorRequest.onsuccess = (event) => {
              const result = event.target.result;

              if (Array.isArray(result)) {
                for (const instrument of result) {
                  if (
                    instrument.symbol === '@version' &&
                    typeof instrument.version === 'number'
                  ) {
                    currentCacheVersion = instrument.version;
                  } else {
                    this.#instruments.set(instrument.symbol, instrument);

                    if (typeof this.instrumentCacheCallback === 'function') {
                      this.instrumentCacheCallback(instrument);
                    }
                  }
                }
              }
            };

            tx.oncomplete = () => {
              resolve();
            };

            tx.onerror = (event) => {
              reject(event.target.error);
            };
          });
        } finally {
          cache.close();
        }

        if (!this.#instruments.size) {
          throw new NoInstrumentsError({
            trader: this,
            currentCacheVersion,
            lastCacheVersion
          });
        }

        if (currentCacheVersion < lastCacheVersion) {
          throw new StaleInstrumentCacheError({
            trader: this,
            currentCacheVersion,
            lastCacheVersion
          });
        }

        return this;
      })());
    }
  }

  getSymbol(instrument = {}) {
    let symbol = instrument.symbol;

    if (!symbol) return '';

    if (/~/gi.test(symbol)) symbol = symbol.split('~')[0];

    return symbol;
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

  instrumentsAreEqual(i1, i2) {
    if (!this.supportsInstrument(i1) || !this.supportsInstrument(i2))
      return false;

    return (
      i1?.symbol && i2?.symbol && this.getSymbol(i1) === this.getSymbol(i2)
    );
  }

  supportsInstrument(instrument) {
    if (!instrument) return true;

    if (!instrument.type) {
      return false;
    }

    return this.instruments.has(instrument.symbol);
  }

  adoptInstrument(instrument) {
    if (!instrument?.type) return instrument;

    if (!this.supportsInstrument(instrument)) return instrument;

    if (instrument) return this.instruments.get(instrument.symbol);
  }

  getExchangeForDBRequest() {
    return this.getExchange();
  }

  getExchange() {
    return '*';
  }

  getBroker() {
    return '*';
  }

  getDictionary() {
    return null;
  }

  getInstrumentIconUrl(instrument) {
    if (!instrument || instrument?.symbol === 'PRN') {
      return 'static/instruments/unknown.svg';
    }

    let symbol = instrument?.symbol;

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
      .replaceAll(/[^a-z0-9\.\s\u0400-\u04FF]/gi, '')
      .toUpperCase();
    const latin = cyrillicToLatin(text);
    const cyrillic = latinToCyrillic(text);

    if (text.length) {
      for (let [symbol, instrument] of this.instruments) {
        if (instrument.removed) continue;

        symbol = instrument.symbol
          .replaceAll(/[^a-z0-9\s\u0400-\u04FF]/gi, '')
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

    return {
      exactSymbolMatch,
      startsWithSymbolMatches: startsWithSymbolMatches.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      ),
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

export { Trader, TraderDatum, GlobalTraderDatum, TraderEventDatum };
