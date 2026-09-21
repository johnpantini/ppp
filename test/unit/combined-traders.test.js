import { expect, mock, test } from 'bun:test';
import CombinedL1Trader, {
  flagsToDatums
} from '../../lib/traders/combined-l1.js';
import CombinedOrderbookTrader, {
  IndividualSymbolSource
} from '../../lib/traders/combined-orderbook.js';
import { INSTRUMENT_DICTIONARY, TRADER_DATUM } from '../../lib/const.js';
import { app } from '../setup.js';

test('L1 flags map in order, preserving duplicates and unknown flags', () => {
  expect(flagsToDatums()).toEqual([]);
  expect(flagsToDatums(['1', '4', '5', 'A', 'B', '1', '?'])).toEqual([
    TRADER_DATUM.LAST_PRICE,
    TRADER_DATUM.BEST_BID,
    TRADER_DATUM.BEST_ASK,
    TRADER_DATUM.TRADING_STATUS,
    TRADER_DATUM.DAY_VOLUME,
    TRADER_DATUM.LAST_PRICE,
    undefined
  ]);
});

test('combined L1 subscribes only visible compatible providers and tolerates unavailable ones', async () => {
  const upstream = { subscribeField: mock(), unsubscribeField: mock() };
  const document = {
    dictionary: INSTRUMENT_DICTIONARY.PSINA_US_STOCKS,
    traderList: [
      { document: 'hidden', hidden: true, flags: ['1'] },
      { document: 'quote', flags: ['1'] },
      { document: 'book', flags: ['4'] },
      { document: 'unavailable', flags: ['1'] }
    ]
  };
  app.getOrCreateTrader = mock(async (id) =>
    id === 'unavailable' ? undefined : upstream
  );

  try {
    const trader = new CombinedL1Trader(document);
    const source = {};
    await trader.subscribeField({
      source,
      field: 'last',
      datum: TRADER_DATUM.LAST_PRICE
    });
    expect(upstream.subscribeField).toHaveBeenCalledTimes(1);
    expect(upstream.subscribeField).toHaveBeenCalledWith({
      source,
      field: 'last',
      datum: TRADER_DATUM.LAST_PRICE
    });
    await trader.unsubscribeField({ source, datum: TRADER_DATUM.LAST_PRICE });
    expect(upstream.unsubscribeField).toHaveBeenCalledTimes(1);
    expect(app.getOrCreateTrader.mock.calls.flat()).not.toContain('hidden');
  } finally {
    delete app.getOrCreateTrader;
  }
});

test('orderbook montage sorts prices then volume without mutating source arrays', () => {
  const origin = {};
  const datum = {
    trader: {
      document: {
        traderList: [{ hidden: true }, { traderInstance: origin }, {}]
      }
    },
    dataArrived: mock(),
    processor1: mock((trader, prices) =>
      prices.map((price) => ({ ...price, pool: 'processed' }))
    )
  };
  const source = new IndividualSymbolSource(datum, 'AAPL', { symbol: 'AAPL' });
  const first = {
    bids: [
      { price: 10, volume: 1 },
      { price: 11, volume: 2 }
    ],
    asks: [{ price: 13, volume: 1 }]
  };
  const before = structuredClone(first);

  source.book1 = first;
  source.book2 = {
    bids: [{ price: 11, volume: 5 }],
    asks: [{ price: 12, volume: 3 }]
  };
  expect(
    source.montage.bids.map(({ price, volume }) => [price, volume])
  ).toEqual([
    [11, 5],
    [11, 2],
    [10, 1]
  ]);
  expect(source.montage.asks.map(({ price }) => price)).toEqual([12, 13]);
  expect(datum.processor1.mock.calls[0][0]).toBe(origin);
  expect(datum.dataArrived).toHaveBeenLastCalledWith(
    source.montage,
    source.instrument
  );
  expect(first).toEqual(before);
});

test('combined orderbook numbers visible sources consistently and releases them', async () => {
  const upstream = { subscribeField: mock(), unsubscribeField: mock() };
  const document = {
    dictionary: INSTRUMENT_DICTIONARY.PSINA_US_STOCKS,
    traderList: [
      { hidden: true, document: 'hidden' },
      { document: 'visible' },
      { document: 'unavailable' }
    ]
  };
  app.getOrCreateTrader = mock(async (id) =>
    id === 'unavailable' ? undefined : upstream
  );

  try {
    const trader = new CombinedOrderbookTrader(document);
    const datum = trader.datums[TRADER_DATUM.ORDERBOOK];
    const source = { instrument: { symbol: 'AAPL' } };

    await datum.firstReferenceAdded(source, 'AAPL');
    expect(upstream.subscribeField.mock.calls[0][0].field).toBe('book1');
    expect(datum.sourcesBySymbol.has('AAPL')).toBe(true);
    await datum.lastReferenceRemoved(source, 'AAPL');
    expect(datum.sourcesBySymbol.has('AAPL')).toBe(false);
    expect(upstream.unsubscribeField).toHaveBeenCalledTimes(1);
  } finally {
    delete app.getOrCreateTrader;
  }
});
