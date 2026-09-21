import { expect, mock, spyOn, test } from 'bun:test';
import PaperTradeTrader, {
  InstrumentSource
} from '../../lib/traders/paper-trade.js';
import {
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../../lib/const.js';
import { app } from '../setup.js';

const instrument = {
  symbol: 'AAPL',
  fullName: 'Apple',
  exchange: EXCHANGE.US,
  currency: 'USD',
  lot: 1,
  minPriceIncrement: 0.01,
  minQuantityIncrement: 0.1
};
const emptyBook = { bids: [], asks: [] };

/** @returns {PaperTradeTrader} Paper account with deterministic commission. */
function account() {
  const trader = new PaperTradeTrader({
    _id: 'paper',
    dictionary: INSTRUMENT_DICTIONARY.PSINA_US_STOCKS,
    initialDepositUSD: 10000,
    initialDepositRUB: 0
  });

  trader.instruments.set(instrument.symbol, instrument);
  trader.commissionFunc = () => 1;

  return trader;
}

test.each(['buy', 'sell'])(
  'limit %s sweeps eligible levels and stops at its quantity',
  (direction) => {
    const trader = account();
    const orderbook = {
      bids: [
        { price: 11, volume: 1 },
        { price: 10, volume: 5 }
      ],
      asks: [
        { price: 9, volume: 1 },
        { price: 10, volume: 5 }
      ]
    };
    const before = structuredClone(orderbook);
    const result = trader.placeLimitOrderWithOrderbook({
      instrument,
      direction,
      price: '10,00',
      quantity: '2,5',
      orderbook,
      options: { trackingId: 'tracking' }
    });
    const order = trader.orders.get('AAPL')[0];

    expect(result).toEqual({ orderId: 1, trackingId: 'tracking' });
    expect(order).toMatchObject({
      status: 'filled',
      filled: 2.5,
      quantity: 2.5,
      price: 10
    });
    expect(trader.timeline.map((execution) => execution.quantity)).toEqual([
      1, 1.5
    ]);
    expect(trader.timeline.map((execution) => execution.price)).toEqual(
      direction === 'buy' ? [9, 10] : [11, 10]
    );
    expect(trader.balances.get('USD')).toBe(direction === 'buy' ? 9974 : 10024);
    expect(orderbook).toEqual(before);
  }
);

test('partial execution ignores empty/ineligible levels and avoids fractional remainder drift', () => {
  const trader = account();

  trader.placeLimitOrderWithOrderbook({
    instrument,
    direction: 'buy',
    price: 10,
    quantity: 0.3,
    orderbook: {
      asks: [
        { price: 0, volume: 1 },
        { price: 9, volume: 0 },
        { price: 11, volume: 1 },
        { price: 10, volume: 0.1 }
      ],
      bids: []
    }
  });
  const order = trader.orders.get('AAPL')[0];
  expect(order).toMatchObject({ filled: 0.1, status: 'working' });
  trader.processAllOrdersWithOrderbook(instrument, {
    asks: [{ price: 10, volume: 0.2 }]
  });
  expect(order).toMatchObject({ filled: 0.3, status: 'filled' });
  expect(trader.getWorkingOrders()).toEqual([]);
});

test('modification retains previous fills, normalizes inputs and does not execute twice', () => {
  const trader = account();
  const { orderId } = trader.placeLimitOrderWithOrderbook({
    instrument,
    direction: 'buy',
    price: 10,
    quantity: 5,
    orderbook: { asks: [{ price: 10, volume: 2 }] }
  });

  trader.modifyRealOrderWithOrderbook({
    orderId,
    price: '9,999',
    quantity: '3',
    orderbook: { asks: [{ price: 10, volume: 10 }] }
  });
  expect(trader.orders.get('AAPL')[0]).toMatchObject({
    price: 10,
    quantity: 3,
    filled: 3,
    status: 'filled'
  });
  expect(trader.timeline.map((item) => item.quantity)).toEqual([2, 1]);
  expect(() =>
    trader.modifyRealOrderWithOrderbook({ orderId: 'missing' })
  ).toThrow('E_ORDER_NOT_FOUND');
});

test('cancelled orders cannot execute when a matching quote arrives', () => {
  const trader = account();

  trader.placeLimitOrderWithOrderbook({
    instrument,
    direction: 'buy',
    price: 10,
    quantity: 2,
    orderbook: emptyBook
  });
  const order = trader.orders.get('AAPL')[0];
  trader.cancelRealOrderWithOrderbook(order, emptyBook);
  trader.processOrder(order, { asks: [{ price: 9, volume: 10 }] });
  expect(order.status).toBe('canceled');
  expect(trader.timeline).toEqual([]);
  expect(trader.balances.get('USD')).toBe(10000);
});

test.each([
  [
    [
      ['buy', 10, 10],
      ['sell', 12, 4]
    ],
    6,
    10
  ],
  [
    [
      ['sell', 10, 10],
      ['buy', 8, 4]
    ],
    -6,
    10
  ],
  [
    [
      ['buy', 10, 10],
      ['buy', 20, 10]
    ],
    20,
    15
  ],
  [
    [
      ['buy', 10, 10],
      ['sell', 12, 15]
    ],
    -5,
    12
  ],
  [
    [
      ['sell', 10, 10],
      ['buy', 8, 15]
    ],
    5,
    8
  ],
  [
    [
      ['buy', 10, 10],
      ['sell', 12, 10]
    ],
    0,
    0
  ]
])('position accounting for %p', (executions, size, averagePrice) => {
  const trader = account();
  const arrived = spyOn(trader.datums[TRADER_DATUM.POSITION], 'dataArrived');

  for (const [side, price, quantity] of executions) {
    trader.createExecution({
      instrument,
      side,
      price,
      quantity,
      parentId: 'order'
    });
  }

  expect(arrived.mock.calls.at(-1)[0]).toMatchObject({
    size,
    averagePrice,
    instrument
  });
});

test.each([undefined, NaN, 'invalid'])(
  'invalid custom commission %p does not corrupt balances',
  (commission) => {
    const trader = account();

    trader.commissionFunc = () => commission;
    trader.createExecution({ instrument, side: 'buy', price: 10, quantity: 2 });
    expect(trader.balances.get('USD')).toBe(9980);
    expect(trader.timeline[0].commission).toBe(0);
  }
);

test('unsupported market orders reject instead of silently creating an order', async () => {
  const trader = account();

  await expect(trader.placeMarketOrder()).rejects.toMatchObject({
    details: { code: 'E_MARKET_ORDERS_NOT_SUPPORTED' }
  });
  expect(trader.orders.size).toBe(0);
});

test('quote sources sort levels, notify the account and release subscriptions', async () => {
  const parent = { processAllOrders: mock() };
  const trader = { subscribeFields: mock(), unsubscribeFields: mock() };
  const source = new InstrumentSource(instrument, parent, trader);

  await source.subscribe();
  source.orderbook = {
    bids: [
      { price: 9, volume: 1 },
      { price: 10, volume: 2 }
    ],
    asks: [
      { price: 12, volume: 1 },
      { price: 11, volume: 2 }
    ]
  };
  expect(source.orderbook.bids.map((level) => level.price)).toEqual([10, 9]);
  expect(source.orderbook.asks.map((level) => level.price)).toEqual([11, 12]);
  expect(parent.processAllOrders).toHaveBeenCalledWith(
    instrument,
    source.orderbook
  );
  await source.unsubscribe();
  expect(source.orderbook).toBeNull();
  expect(trader.unsubscribeFields).toHaveBeenCalledTimes(1);
});

/**
 * Attaches a deterministic upstream book without replacing execution/accounting.
 * @param {PaperTradeTrader} trader Account receiving market data.
 * @param {object} [book] Book returned by every subscription.
 * @returns {{subscribeFields: Function, unsubscribeFields: Function}}
 */
function attachBook(trader, book = emptyBook) {
  trader.$$debug = () => {};
  trader.bookTrader = {
    subscribeFields: mock(async ({ source }) => {
      source.orderbook = book;
    }),
    unsubscribeFields: mock(async () => {})
  };

  return trader.bookTrader;
}

test('async placement, partial fill, modification and cancellation keep one book source', async () => {
  const trader = account();
  const upstream = attachBook(trader);

  const { orderId } = await trader.placeLimitOrder({
    instrument,
    direction: 'buy',
    price: 10,
    quantity: 3
  });
  expect(trader.getWorkingOrders(instrument)).toHaveLength(1);
  expect(trader.sources.size).toBe(1);
  await trader.processAllOrders(instrument, {
    asks: [{ price: 9, volume: 1 }]
  });
  await trader.modifyRealOrder({ orderId, price: '9,00', quantity: 2 });
  const order = trader.orders.get(instrument.symbol)[0];
  expect(order).toMatchObject({
    status: 'working',
    price: 9,
    filled: 1,
    quantity: 2
  });
  await trader.cancelRealOrder(order);
  expect(order.status).toBe('canceled');
  expect(trader.timeline).toHaveLength(1);
  expect(trader.getWorkingOrders()).toEqual([]);
  expect(upstream.unsubscribeFields).toHaveBeenCalled();
  await expect(
    trader.modifyRealOrder({ orderId: -1, price: 1, quantity: 1 })
  ).rejects.toThrow('E_ORDER_NOT_FOUND');
});

test('bulk modification and cancellation respect side and instrument filters', async () => {
  const trader = account();
  attachBook(trader);
  const other = { ...instrument, symbol: 'MSFT' };
  trader.instruments.set(other.symbol, other);

  for (const [asset, direction] of [
    [instrument, 'buy'],
    [instrument, 'sell'],
    [other, 'buy']
  ]) {
    await trader.placeLimitOrder({
      instrument: asset,
      direction,
      price: 10,
      quantity: 2
    });
  }

  await trader.modifyRealOrders({ instrument, side: 'buy', value: 3 });
  expect(
    trader.getWorkingOrders(instrument).map((order) => order.price)
  ).toEqual([10.03, 10]);
  await trader.cancelAllRealOrders({ instrument, filter: 'buy' });
  expect(
    trader.getWorkingOrders(instrument).map((order) => order.side)
  ).toEqual(['sell']);
  expect(trader.getWorkingOrders(other)).toHaveLength(1);
  await trader.cancelAllRealOrders({ filter: 'sell' });
  expect(trader.getWorkingOrders().map((order) => order.symbol)).toEqual([
    'MSFT'
  ]);
});

test('clear resets balances, executions and positions and cancels working orders', async () => {
  const trader = account();
  attachBook(trader);
  const timeline = spyOn(
    trader.datums[TRADER_DATUM.TIMELINE_ITEM],
    'dataArrived'
  );
  const positions = spyOn(trader.datums[TRADER_DATUM.POSITION], 'dataArrived');

  trader.createExecution({ instrument, price: 10, quantity: 1, side: 'buy' });
  await trader.placeLimitOrder({
    instrument,
    direction: 'buy',
    price: 10,
    quantity: 2
  });
  await trader.call({ method: 'clear' });
  expect(trader.balances.get('USD')).toBe(10000);
  expect(trader.timeline).toEqual([]);
  expect(trader.positions.size).toBe(0);
  expect(trader.getWorkingOrders()).toEqual([]);
  expect(timeline).toHaveBeenCalledWith(
    { operationId: '@CLEAR' },
    { doNotSaveValue: true }
  );
  expect(positions).toHaveBeenCalledWith(
    { operationId: '@CLEAR' },
    { doNotSaveValue: true }
  );
  const serialized = trader.serialize();
  expect(serialized).toMatchObject({
    balances: { USD: 10000, RUB: 0 },
    orders: [],
    positions: {},
    timeline: []
  });
});

test('commission estimates receive direction and leave balances unchanged', async () => {
  const trader = account();
  trader.commissionFunc = mock(
    ({ price, quantity, side }) =>
      price * quantity * (side === 'buy' ? 0.01 : 0.02)
  );

  expect(await trader.estimate(instrument, 10, 2, false)).toEqual({
    marginSellingPowerQuantity: 0,
    marginBuyingPowerQuantity: 0,
    sellingPowerQuantity: 0,
    buyingPowerQuantity: 0,
    commission: 0.4
  });
  expect(trader.estimateCommission(instrument, 10, 2, true)).toBe(0.2);
  expect(trader.balances.get('USD')).toBe(10000);
  expect(trader.timeline).toEqual([]);
  expect(trader.trackingIdToOrderId('tracking')).toBe('tracking');
  expect(
    trader.getErrorI18nKey({ error: { details: { code: 'E_TEST' } } })
  ).toBe('E_TEST');
});

test('initialization compiles commission logic and rejects unavailable upstream traders', async () => {
  const trader = account();
  const upstream = { subscribeFields: mock(), unsubscribeFields: mock() };
  const previous = app.getOrCreateTrader;
  trader.document.commFunctionCode =
    'return trade.price * trade.quantity * 0.001;';
  trader.document.bookTrader = { _id: 'upstream' };
  app.getOrCreateTrader = mock(async () => upstream);

  try {
    await trader.oneTimeInitializationCallback();
    expect(trader.bookTrader).toBe(upstream);
    expect(trader.estimateCommission(instrument, 100, 10, true)).toBe(1);
    app.getOrCreateTrader = mock(async () => undefined);
    await expect(trader.oneTimeInitializationCallback()).rejects.toThrow(
      'E_BOOK_TRADER_UNAVAILABLE'
    );
  } finally {
    app.getOrCreateTrader = previous;
  }
});
