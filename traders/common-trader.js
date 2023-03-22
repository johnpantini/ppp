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

  async sayHello() {
    return 'Hi';
  }

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
        exchange,
        broker
      }
    );
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

        instruments.forEach((i) => instrumentsStore.put(i));

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

        const exchange = this.getExchange();
        const broker = this.getBroker();

        if (exchange === '*' || broker === '*') return;

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
            const cursorRequest = instrumentsStore.openCursor();

            cursorRequest.onsuccess = (event) => {
              const result = event.target.result;

              if (result?.value) {
                const instrument = result.value;

                if (
                  instrument.symbol === '@version' &&
                  typeof instrument.version === 'number'
                ) {
                  currentCacheVersion = instrument.version;
                } else {
                  this.#instruments.set(instrument.symbol, instrument);
                }

                result['continue']();
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
          throw new NoInstrumentsError({ trader: this });
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

  async waitForInstrumentCache() {}

  async findInstrumentInCache(symbol) {}

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
    }

    return '—';
  }

  getDatumGlobalReferenceName(datum) {
    switch (datum) {
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.POSITION_SIZE:
      case TRADER_DATUM.POSITION_AVERAGE:
        return '@POSITIONS';
      case TRADER_DATUM.CURRENT_ORDER:
        return '@ORDERS';
      case TRADER_DATUM.TIMELINE_ITEM:
        return '@TIMELINE';
    }
  }

  fixPrice(instrument, price) {
    const precision = getInstrumentPrecision(instrument);

    price = parseFloat(price?.toString?.()?.replace(',', '.'));

    if (!price || isNaN(price)) price = 0;

    return price.toFixed(precision).toString();
  }

  async subscribeField({ source, field, datum }) {
    const [subs, refs] = this.subsAndRefs?.(datum) ?? [];

    if (subs) {
      const array = subs.get(source);

      if (Array.isArray(array)) {
        if (!array.find((e) => e.field === field)) array.push({ field, datum });
      } else {
        subs.set(source, [{ field, datum }]);
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

  async subscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.subscribeField({ source, field, datum });
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
    if (instrument?.symbol && refs) {
      const ref = refs.get(instrument.symbol);

      if (typeof ref === 'undefined' && this.supportsInstrument(instrument)) {
        await this.addFirstRef?.(instrument, refs);
      } else {
        ref.refCount++;
      }
    }
  }

  async removeRef(instrument, refs) {
    if (instrument?.symbol && refs) {
      const ref = refs.get(instrument.symbol);

      if (typeof ref !== 'undefined') {
        if (ref.refCount > 0) {
          ref.refCount--;
        }

        if (ref.refCount === 0) {
          await this.removeLastRef?.(instrument, refs, ref);
          refs.delete(instrument.symbol);
        }
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    if (newValue && !this.supportsInstrument(newValue)) {
      return;
    }

    for (const key of Object.keys(this.subs)) {
      const sub = this.subs[key];

      if (sub.has(source)) {
        for (const { field, datum } of sub.get(source)) {
          source[field] = this.valueForEmptyDatum?.(datum) ?? '—';

          if (this.getDatumGlobalReferenceName(datum)) continue;

          if (oldValue) {
            await this.removeRef(oldValue, this.refs[key]);
          }

          if (newValue) {
            await this.addRef(newValue, this.refs[key]);
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

    return this.instruments.has(instrument.symbol);
  }

  adoptInstrument(instrument) {
    if (!this.supportsInstrument(instrument)) return;

    if (instrument) return this.instruments.get(instrument.symbol);
  }

  getExchange() {
    return '*';
  }

  getBroker() {
    return '*';
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
