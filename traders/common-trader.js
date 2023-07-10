import ppp from '../ppp.js';
import {
  getInstrumentPrecision,
  latinToCyrillic,
  cyrillicToLatin
} from '../lib/intl.js';
import { TRADER_DATUM } from '../lib/const.js';
import {
  NoInstrumentsError,
  StaleInstrumentCacheError
} from '../lib/ppp-errors.js';

export class Trader {
  #instruments = new Map();

  #pendingInstrumentCachePromise;

  get instruments() {
    return this.#instruments;
  }

  document = {};

  constructor(document) {
    this.document = document;
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

                    if (typeof this.onCacheInstrument === 'function') {
                      this.onCacheInstrument(instrument);
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

  valueForEmptyDatum(datum) {
    switch (datum) {
      case TRADER_DATUM.POSITION_SIZE:
        return 0;
      case TRADER_DATUM.POSITION_AVERAGE:
        return 0;
      case TRADER_DATUM.CANDLE:
        return {};
    }

    return '—';
  }

  getDatumGlobalReferenceName(datum) {
    switch (datum) {
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.POSITION_SIZE:
      case TRADER_DATUM.POSITION_AVERAGE:
        return '@@POSITIONS';
      case TRADER_DATUM.CURRENT_ORDER:
        return '@@ORDERS';
      case TRADER_DATUM.TIMELINE_ITEM:
        return '@@TIMELINE';
      case TRADER_DATUM.TRADER:
        return '@@TRADER';
    }
  }

  fixPrice(instrument, price) {
    const precision = getInstrumentPrecision(instrument, price);

    price = parseFloat(price?.toString?.()?.replace(',', '.'));

    if (!price || isNaN(price)) price = 0;

    return price.toFixed(precision).toString();
  }

  async subscribeField({ source, field, datum, condition, options }) {
    const [subs, refs] = this.subsAndRefs?.(datum) ?? [];

    if (subs) {
      const array = subs.get(source);

      if (Array.isArray(array)) {
        if (!array.find((e) => e.field === field)) {
          array.push({ field, datum, condition, options });
        } else return;
      } else {
        subs.set(source, [{ field, datum, condition, options }]);
      }

      const globalRefName = this.getDatumGlobalReferenceName(datum);

      if (globalRefName) {
        // This reference is instrument-agnostic.
        await this.addRef(
          {
            symbol: globalRefName
          },
          refs
        );
      } else {
        await this.addRef(source?.instrument, refs);
      }
    }
  }

  async subscribeFields({ source, fieldDatumPairs = {}, condition, options }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      if (typeof datum === 'string') {
        await this.subscribeField({ source, field, datum, condition, options });
      } else if (typeof datum === 'object') {
        await this.subscribeField({
          source,
          field,
          datum: datum.datum,
          condition: datum.condition ?? condition,
          option: datum.options ?? options
        });
      }
    }
  }

  async unsubscribeField({ source, field, datum }) {
    const [subs, refs] = this.subsAndRefs?.(datum) ?? [];

    if (subs) {
      const array = subs.get(source);
      const index = array?.findIndex?.(
        (e) => e.field === field && e.datum === datum
      );

      if (index > -1) {
        array.splice(index, 1);

        if (!array.length) {
          subs.delete(source);
        }

        const globalRefName = this.getDatumGlobalReferenceName(datum);

        if (globalRefName) {
          await this.removeRef(
            {
              symbol: globalRefName
            },
            refs
          );
        } else {
          await this.removeRef(source?.instrument, refs);
        }
      }
    }
  }

  async unsubscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.unsubscribeField({ source, field, datum });
    }
  }

  async addRef(instrument, refs) {
    const isGlobal = instrument?.symbol?.startsWith?.('@@');

    if (!isGlobal) {
      instrument = this.adoptInstrument(instrument);
    }

    if (typeof instrument?.symbol === 'string' && refs) {
      const ref = refs.get(instrument.symbol);

      if (
        typeof ref === 'undefined' &&
        // Global instrument-agnostic datum
        (isGlobal || this.supportsInstrument(instrument))
      ) {
        refs.set(instrument.symbol, {
          refCount: 1,
          instrument
        });

        await this.addFirstRef?.(instrument, refs);
      } else if (ref) {
        ref.refCount++;
      }
    }
  }

  async removeRef(instrument, refs, key) {
    const isGlobal = instrument?.symbol?.startsWith?.('@@');

    if (!isGlobal) {
      instrument = this.adoptInstrument(instrument);
    }

    if (instrument?.symbol && refs) {
      const ref = refs.get(instrument.symbol);

      if (typeof ref !== 'undefined') {
        if (ref.refCount > 0) {
          ref.refCount--;
        }

        if (ref.refCount === 0) {
          refs.delete(instrument.symbol);
          await this.removeLastRef?.(instrument, refs, ref, key);
        }
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    for (const key of Object.keys(this.subs)) {
      const sub = this.subs[key];

      if (sub.has(source)) {
        for (const { field, datum } of sub.get(source)) {
          source[field] = this.valueForEmptyDatum?.(datum) ?? '—';

          // Skip sub/unsub cycle for instrument-agnostic datum.
          if (this.getDatumGlobalReferenceName(datum)) continue;

          if (oldValue) {
            await this.removeRef(oldValue, this.refs[key], key);
          }

          if (newValue && this.supportsInstrument(newValue)) {
            await this.addRef(newValue, this.refs[key], key);
          }
        }
      }
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

  getInstrumentIconUrl() {
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
      .replaceAll(/[^a-z0-9\u0400-\u04FF]/gi, '')
      .toUpperCase();
    const latin = cyrillicToLatin(text);
    const cyrillic = latinToCyrillic(text);

    if (text.length) {
      for (let [symbol, instrument] of this.instruments) {
        if (instrument.removed) continue;

        symbol = symbol
          .replaceAll(/[^a-z0-9\u0400-\u04FF]/gi, '')
          .toUpperCase();

        const fullName = instrument.fullName.toUpperCase();

        if (symbol === text && exactSymbolMatch === null) {
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
