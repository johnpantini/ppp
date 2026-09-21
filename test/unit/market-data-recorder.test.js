import { afterEach, expect, mock, setSystemTime, spyOn, test } from 'bun:test';
import Recorder from '../../lib/orders/market-data-recorder/impl.js';
import { app } from '../setup.js';
import { captureTimeouts } from '../helpers/timers.js';

afterEach(() => setSystemTime());

/** @returns {Recorder} Recording order with no external execution connections. */
function recorder() {
  return new Recorder({
    nextConditionalOrderId: () => 'recording',
    datums: {}
  });
}

test('recorder construction forwards the owning trader and initializes counters', () => {
  const order = recorder();

  expect(order.orderId).toBe('recording');
  expect(order.eventCounter).toBe(0);
  expect(order.elapsedSeconds).toBe(0);
});

test('recorder captures compact market data only while working', () => {
  captureTimeouts();
  const order = recorder();

  order.status = 'working';
  order.orderbook = {
    bids: [{ price: 10, volume: 2, timestamp: 42 }],
    asks: []
  };
  order.printTrader = { rawTradeToCanonicalTrade: (trade) => trade };
  order.print = {
    symbol: 'AAPL',
    side: 'buy',
    timestamp: 43,
    price: 11,
    volume: 1
  };
  spyOn(Date, 'now').mockReturnValue(44);
  order.tradingStatus = 'normal-trading';
  expect(order.orderbooks).toEqual([[[[10, 2, [], 42, '']], []]]);
  expect(order.prints).toEqual([['AAPL', 'buy', [], 43, 11, 1, '']]);
  expect(order.tradingStatuses).toEqual([['normal-trading', 44]]);
  expect(order.eventCounter).toBe(3);
  order.status = 'paused';
  order.orderbook = { bids: [], asks: [] };
  order.tradingStatus = 'halted';
  expect(order.eventCounter).toBe(3);
});

test('start/pause tracks active time and stop releases sources before flushing', async () => {
  const order = recorder();
  const quotes = { subscribeFields: mock(), unsubscribeFields: mock() };
  app.getOrCreateTrader = mock(async () => quotes);

  try {
    await order.place({
      instrument: { symbol: 'AAPL' },
      direction: 'buy',
      payload: {
        autoStart: false,
        order: {},
        trader1: { _id: 'quotes' },
        trader2: { _id: 'prints' },
        trader3: { _id: 'status' }
      }
    });
    expect(order.status).toBe('paused');
    setSystemTime(new Date('2025-01-01T00:00:00Z'));
    await order.start();
    await order.start();
    expect(quotes.subscribeFields).toHaveBeenCalledTimes(3);
    setSystemTime(new Date('2025-01-01T00:00:05Z'));
    order.pause();
    order.pause();
    expect(order.elapsedSeconds).toBe(5);
    const flush = spyOn(order, 'flushDataToCloud').mockResolvedValue();
    await order.stop();
    expect(flush).toHaveBeenCalledTimes(1);
    expect(quotes.unsubscribeFields).toHaveBeenCalledTimes(3);
    expect(order.status).toBe('executed');
    expect(order.serialize()).toMatchObject({
      eventCounter: 0,
      elapsedSeconds: 5
    });
    order.cancel({ force: false });
    expect(order.status).toBe('canceled');
  } finally {
    delete app.getOrCreateTrader;
  }
});

test('active recording requires force to cancel and preserves upload failure status', async () => {
  const order = recorder();

  order.status = 'working';
  order.cancel({ force: false });
  expect(order.status).toBe('working');
  order.cancel({ force: true });
  expect(order.status).toBe('canceled');
  spyOn(order, 'flushDataToCloud').mockImplementation(async () => {
    order.status = 'failed';
  });
  await order.stop();
  expect(order.status).toBe('failed');
});
