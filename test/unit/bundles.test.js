import { expect, mock, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../../lib/const.js';

/**
 * Loads the actual deployed CommonJS bundle in a fresh worker-like realm.
 * @param {string} relativePath Bundle path relative to the repository root.
 * @returns {Function} Constructor registered by the worker entry point.
 */
function loadBundle(relativePath) {
  const file = fileURLToPath(new URL(`../../${relativePath}`, import.meta.url));
  let registered;
  const context = {
    module: { exports: {} },
    exports: {},
    require: createRequire(file),
    __dirname: dirname(file),
    __filename: file,
    process,
    console,
    Buffer,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    AbortController,
    AbortSignal,
    Headers,
    Request,
    Response,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    crypto: globalThis.crypto,
    fetch: globalThis.fetch,
    WebSocket: globalThis.WebSocket,
    ppp: globalThis.ppp,
    pppTraderInstanceForWorkerRecv: (constructor) => {
      registered = constructor;
    },
    pppOrderInstanceForWorkerRecv: (constructor) => {
      registered = constructor;
    }
  };

  runInNewContext(readFileSync(file, 'utf8'), context, {
    filename: file,
    timeout: 5000
  });
  expect(typeof registered).toBe('function');

  return registered;
}

const traders = [
  'alor-openapi-v2',
  'alpaca-v2-plus',
  'binance-v3',
  'bybit-v5',
  'capitalcom',
  'ib',
  'paper-trade',
  'combined-l1',
  'combined-orderbook',
  'tinkoff-grpc-web',
  'utex-margin-stocks'
];

test.each(traders)(
  '%s source and deployed bundle retain provider and instrument contracts',
  async (name) => {
    const { default: SourceTrader } = await import(
      `../../lib/traders/${name}.js`
    );
    const BundleTrader = loadBundle(`lib/traders/build/${name}.min.js`);
    const document = {
      _id: 'fixture',
      runtime: 'main-thread',
      exchange: EXCHANGE.MOEX,
      dictionary: INSTRUMENT_DICTIONARY.PSINA_US_STOCKS,
      connectorUrl: 'https://connector.test/',
      productLine: 'spot',
      initialDepositUSD: 10000,
      initialDepositRUB: 0,
      broker: {
        type: 'alpaca',
        apiToken: 'test-only',
        twsHost: 'localhost',
        twsPort: 4001,
        ibGatewayUrl: 'https://gateway.test/'
      }
    };
    const source = new SourceTrader(structuredClone(document));
    const bundle = new BundleTrader(structuredClone(document));
    const instrument = {
      symbol: 'AAPL',
      exchange: EXCHANGE.US,
      currency: 'USD',
      minPriceIncrement: 0.05,
      minQuantityIncrement: 0.1
    };

    expect(bundle.getBroker()).toBe(source.getBroker());
    expect(bundle.getExchange()).toBe(source.getExchange());
    expect(bundle.getDictionary()).toBe(source.getDictionary());
    expect(bundle.getObservedAttributes()).toEqual(
      source.getObservedAttributes()
    );
    expect(Object.keys(bundle.datums).sort()).toEqual(
      Object.keys(source.datums).sort()
    );
    expect(bundle.fixPrice(instrument, '10,126')).toBe(10.15);
    expect(bundle.fixQuantity(instrument, '2,26')).toBe(2.3);
    expect(bundle.fixPrice(instrument, '10,126')).toBe(
      source.fixPrice(instrument, '10,126')
    );
    expect(bundle.bus.on('constructor', () => {})).toBe(true);
  }
);

test('deployed paper trader preserves partial fills when an order is modified', () => {
  const PaperTrader = loadBundle('lib/traders/build/paper-trade.min.js');
  const trader = new PaperTrader({
    dictionary: INSTRUMENT_DICTIONARY.PSINA_US_STOCKS,
    initialDepositUSD: 100,
    initialDepositRUB: 0
  });
  const instrument = {
    symbol: 'AAPL',
    exchange: EXCHANGE.US,
    currency: 'USD',
    minQuantityIncrement: 0.1,
    minPriceIncrement: 0.01
  };
  trader.commissionFunc = () => 0;
  trader.instruments.set(instrument.symbol, instrument);
  const { orderId } = trader.placeLimitOrderWithOrderbook({
    instrument,
    direction: 'buy',
    price: 10,
    quantity: 3,
    orderbook: { asks: [{ price: 10, volume: 1 }] }
  });
  trader.modifyRealOrderWithOrderbook({
    orderId,
    price: 10,
    quantity: 2,
    orderbook: { asks: [{ price: 10, volume: 5 }] }
  });
  expect(trader.timeline.map((trade) => trade.quantity)).toEqual([1, 1]);
  expect(trader.balances.get('USD')).toBe(80);
});

test.each(['stop-loss-take-profit', 'market-data-recorder'])(
  '%s deployed order retains its parent and broadcasts status',
  (name) => {
    const Order = loadBundle(`lib/orders/${name}/impl.min.js`);
    const dataArrived = mock();
    const parent = {
      nextConditionalOrderId: () => 'order-1',
      datums: { [TRADER_DATUM.CONDITIONAL_ORDER]: { dataArrived } }
    };
    const order = new Order(parent);
    expect(order.mainTrader).toBe(parent);
    expect(order.orderId).toBe('order-1');
    order.status = 'inactive';
    expect(dataArrived).toHaveBeenCalled();
    expect(order.serialize()).toMatchObject({
      orderId: 'order-1',
      status: 'inactive',
      isConditionalOrder: true
    });
  }
);
