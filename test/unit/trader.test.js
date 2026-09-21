import { expect, mock, test } from 'bun:test';
import {
  Trader,
  TraderDatum,
  unsupportedInstrument
} from '../../lib/traders/trader-worker.js';
import { EXCHANGE, TRADER_DATUM } from '../../lib/const.js';

const instrument = {
  symbol: 'AAPL',
  fullName: 'Apple',
  exchange: EXCHANGE.US,
  type: 'stock',
  minPriceIncrement: 0.05,
  minQuantityIncrement: 0.1
};

/** @returns {Trader} An offline trader with two known instruments. */
function createTrader() {
  const trader = new Trader({ caps: ['one', 'two'] });

  trader.instruments.set(instrument.symbol, instrument);
  trader.instruments.set('MSFT', {
    ...instrument,
    symbol: 'MSFT',
    fullName: 'Microsoft'
  });

  return trader;
}

test('rounds prices and quantities to increments, including comma input', () => {
  const trader = createTrader();

  expect(trader.fixPrice(instrument, '10,13')).toBe(10.15);
  expect(trader.fixPrice(instrument, 10.12)).toBe(10.1);
  expect(trader.fixPrice(instrument, NaN)).toBe(0);
  expect(trader.fixQuantity(instrument, '1,26')).toBe(1.3);
  expect(trader.fixQuantity(instrument, '')).toBe(0);
  expect(trader.fixPrice({ minPriceIncrement: 0.0001 }, 0.12345)).toBe(0.1235);
});

test.each([
  [{ value: 2, unit: '+' }, 'up', 10.1],
  [{ value: 2, unit: '+' }, 'down', 9.9],
  [{ value: 10, unit: '%' }, 'up', 11],
  [{ value: 10, unit: '%' }, 'down', 9],
  [{ value: 2, unit: '' }, 'up', 12],
  [{ value: 20, unit: '' }, 'down', 0],
  [{ value: 1, unit: '' }, 'invalid', 9],
  [{ value: 0, unit: '' }, 'up', 10]
])('distant price %p %s', (distance, direction, expected) => {
  expect(
    createTrader().calcDistantPrice(instrument, 10, distance, direction)
  ).toBe(expected);
});

test('distant prices reject missing inputs and bond prices convert nominal units', () => {
  const trader = createTrader();

  expect(trader.calcDistantPrice(null, 10, { value: 1 })).toBe(0);
  expect(trader.calcDistantPrice(instrument, NaN, { value: 1 })).toBe(0);
  expect(
    trader.relativeBondPriceToPrice(95.5, { ...instrument, nominal: 1000 })
  ).toBe(955);
  expect(trader.bondPriceToRelativeBondPrice(955, { nominal: 1000 })).toBe(
    95.5
  );
});

test('adoption uses the cached instrument and separates MOEX from other exchanges', () => {
  const trader = createTrader();

  expect(
    trader.adoptInstrument({ symbol: 'AAPL', exchange: EXCHANGE.US })
  ).toBe(instrument);
  expect(
    trader.adoptInstrument({ symbol: 'AAPL', exchange: EXCHANGE.MOEX })
  ).toEqual(unsupportedInstrument('AAPL'));
  expect(trader.adoptInstrument(null)).toEqual({});
  expect(
    trader.adoptInstrument({
      type: 'option',
      underlyingSymbol: 'unknown',
      symbol: 'OPT'
    }).notSupported
  ).toBe(true);
  const option = { type: 'option', underlyingSymbol: 'AAPL', symbol: 'OPT' };
  expect(trader.adoptInstrument(option)).toBe(option);
  expect(trader.getSymbol({ symbol: 'AAPL~US' })).toBe('AAPL');
  expect(trader.symbolToCanonical('BRK.B')).toBe('BRK B');
  expect(trader.instrumentsAreEqual(instrument, { ...instrument })).toBe(true);
});

test('capabilities, identifiers and canonical trade transport preserve their contracts', () => {
  const trader = createTrader();

  expect(trader.hasCap('one')).toBe(true);
  expect(trader.hasCap(['one', 'two'])).toBe(true);
  expect(trader.hasCap(['one', 'missing'])).toBe(false);
  expect(trader.hasCap(null)).toBe(false);
  expect(trader.nextConditionalOrderId()).not.toBe(
    trader.nextConditionalOrderId()
  );
  expect(
    trader.rawTradeToCanonicalTrade(['id', 'AAPL', 1, [], 1000, 10, 2, 'X'])
  ).toEqual({
    tradeId: 'id',
    symbol: 'AAPL',
    side: 'buy',
    condition: [],
    timestamp: 1000,
    price: 10,
    volume: 2,
    pool: 'X'
  });
  expect(trader.rawTradeToCanonicalTrade(['id', 'AAPL', 2]).side).toBe('sell');
  expect(trader.rawTradeToCanonicalTrade(['id', 'AAPL', 0]).side).toBe('');
  const trade = { price: 1 };
  expect(trader.rawTradeToCanonicalTrade(trade)).toBe(trade);
  expect(trader.serialize()).toMatchObject({
    document: trader.document,
    broker: '*',
    dictionary: null,
    exchange: '*',
    observedAttributes: []
  });
});

test('search prioritizes exact symbols, supports keyboard layouts and excludes removed instruments', () => {
  const trader = createTrader();

  trader.instruments.set('OLD', {
    symbol: 'OLD',
    fullName: 'Apple removed',
    removed: true
  });
  expect(trader.search(' aapl ').exactSymbolMatch).toBe(instrument);
  expect(trader.search('ффзд').startsWithSymbolMatches).toContain(instrument);
  expect(trader.search('Apple').startsWithFullNameMatches).toEqual([
    instrument
  ]);
  expect(trader.search('OLD').exactSymbolMatch).toBeNull();
  expect(trader.search().startsWithSymbolMatches).toEqual([]);
});

/** A quote datum exposing a single price through the real subscription engine. */
class QuoteDatum extends TraderDatum {
  firstReferenceAdded = mock();
  lastReferenceRemoved = mock();

  /**
   * @param {{price: number}} data Incoming quote.
   * @returns {number} Price.
   */
  [TRADER_DATUM.LAST_PRICE](data) {
    return data.price;
  }
}

test('quote subscriptions deduplicate, replay cached data, filter symbols and release the final reference', async () => {
  const trader = new Trader({ runtime: 'main-thread' }, [
    { type: QuoteDatum, datums: [TRADER_DATUM.LAST_PRICE] }
  ]);
  trader.instruments.set(instrument.symbol, instrument);
  trader.instruments.set('MSFT', { ...instrument, symbol: 'MSFT' });
  const datum = trader.datums[TRADER_DATUM.LAST_PRICE];
  const first = { instrument };
  const second = { instrument };
  const params = {
    source: first,
    field: 'price',
    datum: TRADER_DATUM.LAST_PRICE
  };

  await trader.subscribeField(params);
  await trader.subscribeField(params);
  expect(datum.refs.get('AAPL')).toBe(1);
  expect(datum.firstReferenceAdded).toHaveBeenCalledTimes(1);
  datum.dataArrived({ price: 10 }, instrument);
  expect(first.price).toBe(10);
  await trader.subscribeField({ ...params, source: second });
  expect(second.price).toBe(10);
  datum.dataArrived({ price: 20 }, { ...instrument, symbol: 'MSFT' });
  expect(first.price).toBe(10);
  await trader.unsubscribeField(params);
  expect(datum.refs.get('AAPL')).toBe(1);
  await trader.unsubscribeField({ ...params, source: second });
  expect(datum.refs.has('AAPL')).toBe(false);
  expect(datum.values.has('AAPL')).toBe(false);
  expect(datum.lastReferenceRemoved).toHaveBeenCalledTimes(1);
});
