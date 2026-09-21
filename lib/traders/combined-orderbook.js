/** @decorator */

import { TRADER_DATUM, getInstrumentDictionaryMeta } from '../const.js';
import { observable } from '../fast/observable.js';
import { uuidv4 } from '../ppp-crypto.js';
import { Tmpl } from '../tmpl.js';
import {
  Trader,
  TraderDatum,
  pppTraderInstanceForWorkerIs
} from './trader-worker.js';

/** Holds up to ten visible providers' books and publishes a sorted montage. */
export class IndividualSymbolSource {
  sourceID = uuidv4();

  datum;

  symbol;

  instrument;

  /**
   * @param {OrderbookDatum} datum Owning combined datum.
   * @param {string} symbol Subscription key.
   * @param {import('../types.js').Instrument} instrument Instrument for published books.
   */
  constructor(datum, symbol, instrument) {
    this.datum = datum;
    this.instrument = instrument;
    this.symbol = symbol;
  }

  @observable
  book1;

  @observable
  book2;

  @observable
  book3;

  @observable
  book4;

  @observable
  book5;

  @observable
  book6;

  @observable
  book7;

  @observable
  book8;

  @observable
  book9;

  @observable
  book10;

  /** @type {import('../types.js').Orderbook} Most recent combined book. */
  @observable
  montage;

  /**
   * @param {import('../types.js').Orderbook} oldValue Previous combined book.
   * @param {import('../types.js').Orderbook} newValue Updated combined book.
   * @returns {void} Publishes the montage to instrument subscribers.
   */
  montageChanged(oldValue, newValue) {
    this.datum.dataArrived(newValue, this.instrument);
  }

  /**
   * Runs optional provider processors and sorts copied level arrays by price/volume.
   * Provider indices follow visible traders, so hidden entries do not shift processors.
   * @returns {void}
   */
  rebuildMontage() {
    const montage = {
      bids: [],
      asks: []
    };

    // Books are numbered over visible traders only (see firstReferenceAdded).
    const visibleTraders = this.datum.trader.document.traderList.filter(
      (t) => !t.hidden
    );

    for (let i = 1; i <= 10; i++) {
      const book = this[`book${i}`];
      const processor = this.datum[`processor${i}`];
      const originTrader = visibleTraders[i - 1];

      if (typeof processor === 'function') {
        if (book?.bids) {
          montage.bids.push(
            ...processor.call(
              this,
              originTrader.traderInstance,
              book.bids,
              true
            )
          );
        }

        if (book?.asks) {
          montage.asks.push(
            ...processor.call(
              this,
              originTrader.traderInstance,
              book.asks,
              false
            )
          );
        }
      } else {
        // No processor.
        if (book?.bids) {
          montage.bids.push(...book.bids);
        }

        if (book?.asks) {
          montage.asks.push(...book.asks);
        }
      }
    }

    this.montage = {
      bids: montage.bids.sort((a, b) => {
        return b.price - a.price || b.volume - a.volume;
      }),
      asks: montage.asks.sort((a, b) => {
        return a.price - b.price || b.volume - a.volume;
      })
    };
  }
}

for (let i = 1; i <= 10; i++) {
  IndividualSymbolSource.prototype[`book${i}Changed`] = function () {
    this.rebuildMontage();
  };
}

/** Manages provider book subscriptions and trusted per-provider processors. */
class OrderbookDatum extends TraderDatum {
  processor1;

  processor2;

  processor3;

  processor4;

  processor5;

  processor6;

  processor7;

  processor8;

  processor9;

  processor10;

  /** @type {Map<string, IndividualSymbolSource>} Active instrument montages. */
  sourcesBySymbol = new Map();

  /**
   * Compiles processors once and subscribes the instrument to each visible provider.
   * @param {import('../types.js').TraderSource} source Initial receiver.
   * @param {string} symbol Instrument key.
   * @returns {Promise<void>}
   */
  async firstReferenceAdded(source, symbol) {
    this.sourcesBySymbol.set(
      symbol,
      new IndividualSymbolSource(this, symbol, source.instrument)
    );

    let counter = 0;

    for (const t of this.trader.document.traderList) {
      if (t.hidden) {
        continue;
      }

      counter++;

      if (typeof this[`processor${counter}`] === 'undefined') {
        const { useProcessorFunc, processorFuncCode } = t;

        if (useProcessorFunc && processorFuncCode) {
          this[`processor${counter}`] = false;
          // Await.
          this[`processor${counter}`] = new Function(
            'trader',
            'prices',
            'isBidSide',
            await new Tmpl().render(this, processorFuncCode, {})
          );
        } else {
          this[`processor${counter}`] = false;
        }
      }

      const trader = await ppp.getOrCreateTrader(t.document);

      t.traderInstance = trader;

      // Main-thread traders are not available inside a worker.
      if (!trader) {
        continue;
      }

      await trader.subscribeField({
        source: this.sourcesBySymbol.get(symbol),
        field: `book${counter}`,
        datum: TRADER_DATUM.ORDERBOOK
      });
    }
  }

  /**
   * Releases the montage's upstream subscriptions after its final receiver leaves.
   * @param {import('../types.js').TraderSource} source Former receiver.
   * @param {string} symbol Instrument key.
   * @returns {Promise<void>}
   */
  async lastReferenceRemoved(source, symbol) {
    for (const t of this.trader.document.traderList) {
      if (t.hidden) {
        continue;
      }

      const trader = await ppp.getOrCreateTrader(t.document);

      await trader?.unsubscribeField({
        source: this.sourcesBySymbol.get(symbol),
        datum: TRADER_DATUM.ORDERBOOK
      });
    }

    this.sourcesBySymbol.delete(symbol);
  }

  [TRADER_DATUM.ORDERBOOK](data, instrument) {
    return data;
  }
}

/**
 * Presents several upstream books as one orderbook using a shared dictionary.
 */
class CombinedOrderbookTrader extends Trader {
  #dictionaryMeta;

  /** @param {import('../types.js').TraderDocument} document Dictionary, traderList and processor settings. */
  constructor(document) {
    super(document, [
      {
        type: OrderbookDatum,
        datums: [TRADER_DATUM.ORDERBOOK]
      }
    ]);

    this.#dictionaryMeta = getInstrumentDictionaryMeta(
      this.document.dictionary
    );
  }

  /** @returns {string | undefined} Exchange from the configured dictionary. */
  getExchange() {
    return this.#dictionaryMeta.exchange;
  }

  /** @returns {string[]} Source attributes forwarded through the runtime. */
  getObservedAttributes() {
    return ['balance'];
  }

  /** @returns {string} Configured dictionary identifier. */
  getDictionary() {
    return this.document.dictionary;
  }

  /** @returns {string | undefined} Broker from the configured dictionary. */
  getBroker() {
    return this.#dictionaryMeta.broker;
  }
}

pppTraderInstanceForWorkerIs(CombinedOrderbookTrader);

export default CombinedOrderbookTrader;
