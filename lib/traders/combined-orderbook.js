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

export class IndividualSymbolSource {
  sourceID = uuidv4();

  datum;

  symbol;

  instrument;

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

  @observable
  montage;

  montageChanged(oldValue, newValue) {
    this.datum.dataArrived(newValue, this.instrument);
  }

  rebuildMontage() {
    const montage = {
      bids: [],
      asks: []
    };

    for (let i = 1; i <= 10; i++) {
      const book = this[`book${i}`];
      const processor = this.datum[`processor${i}`];
      const originTrader = this.datum.trader.document.traderList[i - 1];

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
        // Bo processor.
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

  sourcesBySymbol = new Map();

  async firstReferenceAdded(source, symbol) {
    this.sourcesBySymbol.set(
      symbol,
      new IndividualSymbolSource(this, symbol, source.instrument)
    );

    let counter = 0;

    for (const t of this.trader.document.traderList) {
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

      await trader.subscribeField({
        source: this.sourcesBySymbol.get(symbol),
        field: `book${counter}`,
        datum: TRADER_DATUM.ORDERBOOK
      });
    }
  }

  async lastReferenceRemoved(source, symbol) {
    for (const t of this.trader.document.traderList) {
      const trader = await ppp.getOrCreateTrader(t.document);

      await trader.unsubscribeField({
        source: this.sourcesBySymbol.get(symbol),
        datum: TRADER_DATUM.ORDERBOOK
      });
    }
  }

  [TRADER_DATUM.ORDERBOOK](data, instrument) {
    return data;
  }
}

/**
 * @typedef {Object} CombinedOrderbookTrader
 */
class CombinedOrderbookTrader extends Trader {
  #dictionaryMeta;

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
}

pppTraderInstanceForWorkerIs(CombinedOrderbookTrader);

export default CombinedOrderbookTrader;
