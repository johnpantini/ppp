import { expect, mock, spyOn, test } from 'bun:test';
import { ConditionalOrder } from '../../lib/conditional-order.js';
import StopLossTakeProfitOrder from '../../lib/orders/stop-loss-take-profit/impl.js';
import { TRADER_DATUM } from '../../lib/const.js';
import { app } from '../setup.js';
import { captureTimeouts } from '../helpers/timers.js';

/** @returns {object} An execution boundary that never contacts a broker. */
function mainTrader() {
  return {
    nextConditionalOrderId: mock(() => 'order-1'),
    traderEvent: mock(),
    datums: { [TRADER_DATUM.CONDITIONAL_ORDER]: { dataArrived: mock() } },
    fixPrice: mock((instrument, price) => price),
    placeMarketOrder: mock(async () => ({ orderId: 'market' })),
    placeLimitOrder: mock(async () => ({ orderId: 'limit' }))
  };
}

/**
 * Creates an inactive order so price fixtures cannot submit it prematurely.
 * @param {object} [options] Side, type, watched prices and payload overrides.
 * @returns {StopLossTakeProfitOrder} Offline conditional order.
 */
function stopOrder({
  side = 'sell',
  type = 'stop-loss',
  watchPrices = [TRADER_DATUM.LAST_PRICE],
  ...payload
} = {}) {
  const order = new StopLossTakeProfitOrder(mainTrader());

  ConditionalOrder.prototype.place.call(order, {
    instrument: { symbol: 'AAPL', minPriceIncrement: 0.01 },
    direction: side,
    payload: {
      stopPrice: '100',
      quantity: '2',
      limitPrice: '0',
      timeDelay: '0',
      ...payload,
      order: { orderType: type, watchPrices }
    }
  });

  return order;
}

test('base orders keep their identity and initial placement payload on subsequent placement', () => {
  const trader = mainTrader();
  const order = new ConditionalOrder(trader);
  const instrument = { symbol: 'AAPL' };
  const payload = { quantity: 1 };

  order.place({ instrument, direction: 'buy', payload });
  const placedAt = order.placedAt;
  order.place({
    instrument: { symbol: 'MSFT' },
    direction: 'sell',
    payload: {}
  });
  expect(order.serialize()).toMatchObject({
    instrument,
    payload,
    side: 'buy',
    orderId: 'order-1',
    sourceID: 'O1',
    placedAt,
    status: 'inactive',
    isConditionalOrder: true
  });
  expect(order.nextSourceID()).toBe('O2');
  order.traderEvent({ event: 'test' });
  expect(trader.traderEvent).toHaveBeenCalledWith({ event: 'test' });
  order.cancel();
  expect(order.status).toBe('canceled');
  expect(
    trader.datums[TRADER_DATUM.CONDITIONAL_ORDER].dataArrived
  ).toHaveBeenLastCalledWith(order.serialize(), undefined);
});

test.each([
  ['stop-loss', 'sell', 99, true],
  ['stop-loss', 'sell', 100, true],
  ['stop-loss', 'sell', 101, false],
  ['stop-loss', 'buy', 99, false],
  ['stop-loss', 'buy', 100, true],
  ['stop-loss', 'buy', 101, true],
  ['take-profit', 'sell', 99, false],
  ['take-profit', 'sell', 100, true],
  ['take-profit', 'sell', 101, true],
  ['take-profit', 'buy', 99, true],
  ['take-profit', 'buy', 100, true],
  ['take-profit', 'buy', 101, false]
])('%s %s at %s triggers: %s', (type, side, price, expected) => {
  const order = stopOrder({ type, side });

  order.lastPrice = price;
  expect(order.conditionsAreMet()).toBe(expected);
});

test.each([undefined, null, NaN, '99'])(
  'invalid watched price %p cannot trigger',
  (price) => {
    const order = stopOrder();

    order.lastPrice = price;
    expect(order.conditionsAreMet()).toBe(false);
  }
);

test('extended hours take priority over last price and midpoint requires both sides', () => {
  const extended = stopOrder({
    watchPrices: [TRADER_DATUM.LAST_PRICE, TRADER_DATUM.EXTENDED_LAST_PRICE]
  });

  extended.lastPrice = 99;
  expect(extended.conditionsAreMet()).toBe(true);
  extended.extendedLastPrice = 101;
  expect(extended.conditionsAreMet()).toBe(false);
  const midpoint = stopOrder({ watchPrices: [TRADER_DATUM.MIDPOINT] });
  midpoint.bestBid = 98;
  expect(midpoint.conditionsAreMet()).toBe(false);
  midpoint.bestAsk = 102;
  expect(midpoint.conditionsAreMet()).toBe(true);
});

test.each(['0', '99,5'])(
  'trigger submits exactly one real order with limitPrice=%s',
  async (limitPrice) => {
    const order = stopOrder({ limitPrice });

    order.lastPrice = 99;
    order.status = 'working';
    order.update();
    order.update();
    await Promise.resolve();
    expect(order.status).toBe('executed');
    const method =
      limitPrice === '0'
        ? order.mainTrader.placeMarketOrder
        : order.mainTrader.placeLimitOrder;
    expect(method).toHaveBeenCalledTimes(1);
    expect(method.mock.calls[0][0]).toMatchObject({
      instrument: order.instrument,
      quantity: 2,
      direction: 'sell'
    });
    if (limitPrice !== '0') expect(method.mock.calls[0][0].price).toBe(99.5);
  }
);

test('broker rejections are recorded as a failed order', async () => {
  const order = stopOrder();

  order.mainTrader.placeMarketOrder.mockRejectedValue(
    new Error('broker rejected')
  );
  spyOn(console, 'error').mockImplementation(() => {});
  order.lastPrice = 99;
  order.status = 'working';
  order.update();
  await Promise.resolve();
  expect(order.status).toBe('failed');
});

test('delay cancels on price recovery and restarts before executing', async () => {
  const timers = captureTimeouts();
  const order = stopOrder({ timeDelay: '2' });

  order.status = 'working';
  order.lastPrice = 99;
  expect(order.status).toBe('pending');
  expect([...timers.pending.values()][0].delay).toBe(2000);
  order.lastPrice = 101;
  expect(order.status).toBe('working');
  expect(order.delayStartedAt).toBeUndefined();
  expect(timers.pending.size).toBe(0);
  order.lastPrice = 99;
  timers.runNext();
  await Promise.resolve();
  expect(order.status).toBe('executed');
  expect(order.mainTrader.placeMarketOrder).toHaveBeenCalledTimes(1);
});

test('cancel clears the pending timer and detaches subscribed quote traders', async () => {
  const timers = captureTimeouts();
  const order = stopOrder({ timeDelay: '2' });
  const quotes = {
    subscribeFields: mock(async () => {}),
    unsubscribeFields: mock()
  };
  app.getOrCreateTrader = mock(async () => quotes);

  try {
    order.payload.trader1 = { _id: 'quotes' };
    order.payload.order.watchPrices = [
      TRADER_DATUM.MIDPOINT,
      TRADER_DATUM.EXTENDED_LAST_PRICE,
      TRADER_DATUM.LAST_PRICE
    ];
    await order.place({
      instrument: order.instrument,
      direction: order.side,
      payload: order.payload
    });
    expect(quotes.subscribeFields).toHaveBeenCalledWith({
      source: order,
      fieldDatumPairs: {
        bestBid: TRADER_DATUM.BEST_BID,
        bestAsk: TRADER_DATUM.BEST_ASK,
        extendedLastPrice: TRADER_DATUM.EXTENDED_LAST_PRICE,
        lastPrice: TRADER_DATUM.LAST_PRICE
      }
    });
    order.lastPrice = 99;
    order.cancel();
    expect(timers.pending.size).toBe(0);
    expect(order.status).toBe('canceled');
    expect(quotes.unsubscribeFields).toHaveBeenCalledTimes(1);
    expect(order.mainTrader.placeMarketOrder).not.toHaveBeenCalled();
  } finally {
    delete app.getOrCreateTrader;
  }
});
