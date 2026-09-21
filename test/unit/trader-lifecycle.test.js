import { expect, mock, test } from 'bun:test';
import { ConditionalOrder } from '../../lib/conditional-order.js';
import {
  Trader,
  TraderDatum,
  GlobalTraderDatum,
  TraderEventDatum,
  USTrader
} from '../../lib/traders/trader-worker.js';
import { EXCHANGE, TRADER_DATUM } from '../../lib/const.js';

const apple = { symbol: 'AAPL', exchange: EXCHANGE.US, currency: 'USD' };
const microsoft = { ...apple, symbol: 'MSFT' };

/** Conditional order with an observable action result and no external side effects. */
class LocalOrder extends ConditionalOrder {
  cancel = mock(() => {
    this.status = 'canceled';
  });
  pause = mock((payload) => payload.reason);
}

/** @returns {Trader} Main-thread trader with two known instruments. */
function traderWithOrders() {
  const trader = new Trader({ runtime: 'main-thread' });
  trader.instruments.set(apple.symbol, apple);
  trader.instruments.set(microsoft.symbol, microsoft);

  return trader;
}

test.each(['global', 'instrument', undefined])(
  'conditional order singleton scope %p preserves placement identity',
  async (singleton) => {
    const trader = traderWithOrders();
    const options = {
      instrument: apple,
      direction: 'buy',
      payload: { orderId: 'template', order: { singleton } },
      instance: LocalOrder
    };

    await trader.pco(options);
    await trader.placeConditionalOrder(options);
    expect(trader.rawConditionalOrders).toHaveLength(singleton ? 1 : 2);
    await trader.placeConditionalOrder({ ...options, instrument: microsoft });
    expect(trader.rawConditionalOrders).toHaveLength(
      singleton === 'global' ? 1 : singleton === 'instrument' ? 2 : 3
    );
    const first = trader.rawConditionalOrders[0];
    expect(first.instrument).toBe(apple);
    expect(first.factory).toBe(LocalOrder);
    expect(trader.conditionalOrders(true)[0]).toBe(first);
    expect(trader.conditionalOrders()[0]).toMatchObject({
      orderId: first.orderId,
      instrument: apple,
      side: 'buy',
      isConditionalOrder: true
    });
  }
);

test('one-off orders run without entering the managed order collection', async () => {
  const trader = traderWithOrders();
  const placed = mock();
  class OneOffOrder extends LocalOrder {
    place(parameters) {
      super.place(parameters);
      placed(this);
    }
  }

  await trader.placeConditionalOrder({
    instrument: apple,
    direction: 'buy',
    payload: { orderId: 'once', order: { oneOff: true } },
    instance: OneOffOrder
  });
  expect(placed).toHaveBeenCalledTimes(1);
  expect(placed.mock.calls[0][0].instrument).toBe(apple);
  expect(trader.rawConditionalOrders).toEqual([]);
});

test('order actions and cancellation handle missing IDs without touching other orders', async () => {
  const trader = traderWithOrders();
  await trader.placeConditionalOrder({
    instrument: apple,
    direction: 'buy',
    payload: { orderId: 'template' },
    instance: LocalOrder
  });
  const order = trader.rawConditionalOrders[0];

  expect(await trader.pcoa(order.orderId, 'pause', { reason: 'user' })).toBe(
    'user'
  );
  expect(
    await trader.performConditionalOrderAction('missing', 'pause')
  ).toBeUndefined();
  expect(
    await trader.performConditionalOrderAction(order.orderId, 'missing')
  ).toBeUndefined();
  await trader.cco('missing');
  expect(trader.rawConditionalOrders).toHaveLength(1);
  await trader.cco(order.orderId, { force: true });
  expect(order.cancel).toHaveBeenCalledWith({ force: true });
  expect(trader.rawConditionalOrders).toEqual([]);
});

test('bulk conditional cancellation filters a snapshot without skipping adjacent orders', async () => {
  const trader = traderWithOrders();
  for (const [instrument, direction] of [
    [apple, 'buy'],
    [apple, 'buy'],
    [apple, 'sell'],
    [microsoft, 'buy']
  ]) {
    await trader.placeConditionalOrder({
      instrument,
      direction,
      payload: { orderId: 'template' },
      instance: LocalOrder
    });
  }
  const original = [...trader.rawConditionalOrders];
  await trader.cancelAllConditionalOrders({ instrument: apple, filter: 'buy' });
  expect(trader.rawConditionalOrders).toEqual(original.slice(2));
  expect(original[0].cancel).toHaveBeenCalledTimes(1);
  expect(original[1].cancel).toHaveBeenCalledTimes(1);
  await trader.cancelAllConditionalOrders();
  expect(trader.rawConditionalOrders).toEqual([]);
});

test('invalid conditional order requests fail explicitly', async () => {
  const trader = traderWithOrders();
  await expect(
    trader.placeConditionalOrder({ instrument: apple })
  ).rejects.toThrow('Missing payload.orderId.');
  await expect(
    trader.placeConditionalOrder({ payload: { orderId: 'missing-factory' } })
  ).rejects.toThrow('Missing orderInstance.');
  expect(trader.rawConditionalOrders).toEqual([]);
});

/** Global price-like value used to exercise the actual shared delivery machinery. */
class PortfolioDatum extends GlobalTraderDatum {
  firstReferenceAdded = mock();
  lastReferenceRemoved = mock();
  [TRADER_DATUM.POSITION_SIZE](data) {
    return data.size;
  }
}

test('global data replay, transient clear markers and final cleanup preserve cache contracts', async () => {
  const trader = new Trader({ runtime: 'main-thread' }, [
    { type: PortfolioDatum, datums: [TRADER_DATUM.POSITION_SIZE] }
  ]);
  const datum = trader.datums[TRADER_DATUM.POSITION_SIZE];
  const first = {};
  const second = {};
  const subscription = {
    source: first,
    field: 'size',
    datum: TRADER_DATUM.POSITION_SIZE
  };

  await trader.subscribeField(subscription);
  datum.dataArrived({ symbol: 'AAPL', size: 12 });
  expect(first.size).toBe(12);
  await trader.subscribeField({ ...subscription, source: second });
  expect(second.size).toBe(12);
  expect(datum.refCount).toBe(2);
  datum.dataArrived({ symbol: '@CLEAR', size: 0 }, { doNotSaveValue: true });
  expect(first.size).toBe(0);
  expect(datum.value.has('@CLEAR')).toBe(false);
  await trader.unsubscribeField(subscription);
  expect(datum.value.size).toBe(1);
  await trader.unsubscribeField({ ...subscription, source: second });
  expect(datum.value.size).toBe(0);
  expect(datum.refCount).toBe(0);
  expect(datum.firstReferenceAdded).toHaveBeenCalledTimes(1);
  expect(datum.lastReferenceRemoved).toHaveBeenCalledTimes(1);
});

test('global URL delivery batches open remote sources and updates local orders directly', async () => {
  const trader = new Trader({ runtime: 'url' }, [
    { type: PortfolioDatum, datums: [TRADER_DATUM.POSITION_SIZE] }
  ]);
  const socket = { closed: false, send: mock() };
  const closedSocket = { closed: true, send: mock() };
  const local = { mainTrader: trader };
  const sources = [
    local,
    { sourceID: 'first', ws: socket },
    { sourceID: 'second', ws: socket },
    { sourceID: 'closed', ws: closedSocket }
  ];

  for (const source of sources) {
    await trader.subscribeField({
      source,
      field: 'size',
      datum: TRADER_DATUM.POSITION_SIZE
    });
  }
  trader.datums[TRADER_DATUM.POSITION_SIZE].dataArrived({
    symbol: 'AAPL',
    size: 7
  });
  expect(local.size).toBe(7);
  expect(socket.send).toHaveBeenCalledTimes(1);
  expect(JSON.parse(socket.send.mock.calls[0][0])).toEqual([
    { T: 'a', M: { first: 'size', second: 'size' }, v: 7 }
  ]);
  expect(closedSocket.send).not.toHaveBeenCalled();
});

test('instrument changes move reference counts and remove the event listener on final release', async () => {
  class PriceDatum extends TraderDatum {
    firstReferenceAdded = mock();
    lastReferenceRemoved = mock();
    [TRADER_DATUM.LAST_PRICE](data) {
      return data.price;
    }
  }
  const trader = new Trader({ runtime: 'main-thread' }, [
    { type: PriceDatum, datums: [TRADER_DATUM.LAST_PRICE] }
  ]);
  const listeners = new Map();
  const source = {
    instrument: apple,
    canChangeInstrument: true,
    addEventListener: mock((name, listener) => listeners.set(name, listener)),
    removeEventListener: mock((name) => listeners.delete(name))
  };
  const subscription = {
    source,
    field: 'price',
    datum: TRADER_DATUM.LAST_PRICE
  };
  await trader.subscribeField(subscription);
  source.instrument = microsoft;
  await listeners.get('instrumentchange')({
    detail: { source, oldValue: apple }
  });
  const datum = trader.datums[TRADER_DATUM.LAST_PRICE];
  expect([...datum.refs]).toEqual([['MSFT', 1]]);
  expect(datum.lastReferenceRemoved).toHaveBeenCalledWith(source, 'AAPL');
  expect(source.addEventListener).toHaveBeenCalledTimes(1);
  await trader.unsubscribeField(subscription);
  expect(listeners.size).toBe(0);
});

test('worker and URL assignments retain protocol shapes and skip closed sockets', () => {
  const workerTrader = new Trader({ runtime: 'shared-worker' });
  const port = { postMessage: mock() };
  workerTrader.assignSourceField(
    { sourceID: 'worker-source', port },
    'price',
    5
  );
  expect(port.postMessage).toHaveBeenCalledWith({
    type: 'assign',
    sourceID: 'worker-source',
    field: 'price',
    value: 5
  });
  const trader = new Trader({ runtime: 'url' });
  const ws = { closed: false, send: mock() };
  trader.assignSourceField({ sourceID: 'remote-source', ws }, 'price', 6);
  expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual([
    { T: 'a', SI: 'remote-source', f: 'price', v: 6 }
  ]);
  ws.closed = true;
  trader.assignSourceField({ sourceID: 'remote-source', ws }, 'price', 7);
  expect(ws.send).toHaveBeenCalledTimes(1);
});

test('trader events reach local and remote listeners without requiring a cache key', async () => {
  const trader = new Trader({ runtime: 'url' }, [
    { type: TraderEventDatum, datums: [TRADER_DATUM.TRADER] }
  ]);
  const local = { mainTrader: trader };
  const ws = { closed: false, send: mock() };
  const remote = { sourceID: 'remote', ws };
  for (const source of [local, remote]) {
    await trader.subscribeField({
      source,
      field: 'event',
      datum: TRADER_DATUM.TRADER
    });
  }
  const event = { event: 'reconnect' };
  trader.traderEvent(event);
  expect(local.event).toBe(event);
  expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual([
    { T: 'a', M: { remote: 'event' }, v: event }
  ]);
});

test('US instruments support legacy suffixes and reject incompatible exchanges', () => {
  const trader = new USTrader({});
  trader.instruments.set('AAPL', apple);
  const spb = { ...apple, symbol: 'SPB' };
  trader.instruments.set('SPB', spb);
  expect(trader.adoptInstrument({ ...apple, symbol: 'AAPL~US' })).toBe(apple);
  expect(trader.adoptInstrument({ ...apple, symbol: 'SPB@US' })).toBe(spb);
  expect(
    trader.adoptInstrument({ symbol: 'TCS', exchange: EXCHANGE.SPBX })
      .notSupported
  ).toBe(true);
  expect(
    trader.adoptInstrument({ ...apple, exchange: EXCHANGE.MOEX }).notSupported
  ).toBe(true);
  expect(trader.getInstrumentIconUrl({ ...apple, symbol: 'BRK/B' })).toBe(
    'static/instruments/stocks/us/BRK-B.svg'
  );
  expect(trader.getInstrumentIconUrl({ ...apple, symbol: 'PRN' })).toBe(
    'static/instruments/stocks/us/PRN@US.svg'
  );
  expect(trader.getInstrumentIconUrl(null)).toBe(
    'static/instruments/unknown.svg'
  );
});
