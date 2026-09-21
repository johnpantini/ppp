import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import BinanceTrader from '../../lib/traders/binance-v3.js';
import BybitTrader from '../../lib/traders/bybit-v5.js';
import { EXCHANGE, TRADER_DATUM } from '../../lib/const.js';
import { captureTimeouts } from '../helpers/timers.js';

const originalSocket = globalThis.WebSocket;
const originalHttps = globalThis.https;

afterEach(() => {
  globalThis.WebSocket = originalSocket;
  if (originalHttps === undefined) delete globalThis.https;
  else globalThis.https = originalHttps;
});

/** WebSocket test boundary with explicit open/close and no network capability. */
class Socket {
  static OPEN = 1;
  static instances = [];
  readyState = 0;
  send = mock();

  /** @param {string} url Requested endpoint. */
  constructor(url) {
    this.url = url;
    Socket.instances.push(this);
  }
  /**
   * Signals a successful transport connection.
   * @returns {unknown}
   */
  open() {
    this.readyState = Socket.OPEN;
    return this.onopen?.();
  }
  /**
   * Signals transport closure.
   * @returns {unknown}
   */
  close() {
    this.readyState = 3;
    return this.onclose?.();
  }
}

describe.each([
  ['Binance', BinanceTrader, 'establishWebSocketConnection', 'connection'],
  [
    'Bybit',
    BybitTrader,
    'establishPublicWebSocketConnection',
    'publicConnection'
  ]
])('%s connection lifecycle', (name, TraderType, connect, connectionField) => {
  test('concurrent subscriptions reuse the connection and reconnect delay; stale events are ignored', async () => {
    const timers = captureTimeouts();
    Socket.instances = [];
    globalThis.WebSocket = Socket;
    globalThis.https = { Agent: class {} };
    const trader = new TraderType({
      wsUrl: 'wss://stream.example.test/',
      productLine: 'spot',
      reconnectTimeout: 1000
    });
    const resubscribe = spyOn(trader, 'resubscribe').mockResolvedValue();

    const first = trader[connect]();
    const concurrent = trader[connect]();
    expect(Socket.instances.length).toBe(1);
    const oldSocket = Socket.instances[0];
    await oldSocket.open();
    expect(await first).toBe(oldSocket);
    expect(await concurrent).toBe(oldSocket);
    oldSocket.close();
    const duringReconnect = trader[connect]();
    expect(Socket.instances.length).toBe(1);
    expect([...timers.pending.values()][0].delay).toBe(1000);
    timers.runNext();
    await new Promise(setImmediate);
    expect(Socket.instances.length).toBe(2);
    const replacement = Socket.instances[1];
    await replacement.open();
    expect(await duringReconnect).toBe(replacement);
    expect(trader[connectionField]).toBe(replacement);
    expect(resubscribe).toHaveBeenCalledTimes(1);
    expect(() =>
      oldSocket.onmessage({ data: 'invalid-json-from-stale-socket' })
    ).not.toThrow();
    oldSocket.onclose();
    expect(timers.pending.size).toBe(0);
  });
});

test('Binance normalizes orderbook tuples while retaining already-normalized levels', () => {
  const trader = new BinanceTrader({});
  const datum = trader.datums[TRADER_DATUM.ORDERBOOK];
  const native = { price: 10, volume: 1, pool: 'CUSTOM' };
  const book = datum[TRADER_DATUM.ORDERBOOK]({
    bids: [['9.5', '2'], native],
    asks: [['11', '3']]
  });

  expect(book).toEqual({
    bids: [{ price: 9.5, volume: 2, pool: 'BN' }, native],
    asks: [{ price: 11, volume: 3, pool: 'BN' }]
  });
  expect(book.bids[1]).toBe(native);
  expect(datum[TRADER_DATUM.ORDERBOOK]({})).toEqual({ bids: [], asks: [] });
});

test.each([true, false])(
  'Binance trade stream uses aggregate flag=%s for subscriptions and IDs',
  async (aggregate) => {
    const trader = new BinanceTrader({
      showAggTrades: aggregate,
      orderbookUpdateInterval: '100ms'
    });
    const datum = trader.datums[TRADER_DATUM.MARKET_PRINT];
    trader.connection = { readyState: WebSocket.OPEN, send: mock() };

    await datum.firstReferenceAdded({}, 'BTCUSDT');
    expect(JSON.parse(trader.connection.send.mock.calls[0][0])).toEqual({
      method: 'SUBSCRIBE',
      params: [`btcusdt@${aggregate ? 'aggTrade' : 'trade'}`],
      id: 1
    });
    await datum.lastReferenceRemoved({}, 'BTCUSDT');
    expect(JSON.parse(trader.connection.send.mock.calls[1][0]).method).toBe(
      'UNSUBSCRIBE'
    );
    expect(
      datum[TRADER_DATUM.MARKET_PRINT](
        {
          [aggregate ? 'a' : 't']: 42,
          m: aggregate,
          E: 1000,
          p: '12.5',
          q: '0.1'
        },
        { symbol: 'BTCUSDT' }
      )
    ).toEqual({
      tradeId: 42,
      side: aggregate ? 'sell' : 'buy',
      timestamp: 1000,
      symbol: 'BTCUSDT',
      price: 12.5,
      volume: 0.1,
      pool: 'BN'
    });
    expect(
      datum.filter({}, {}, { instrument: { exchange: EXCHANGE.BINANCE } })
    ).toBe(true);
    expect(
      datum.filter({}, {}, { instrument: { exchange: EXCHANGE.MOEX } })
    ).toBe(false);
  }
);

test('Bybit canonical prints and subscription messages retain the broker contract', async () => {
  const trader = new BybitTrader({ productLine: 'spot' });
  trader.publicConnection = { readyState: WebSocket.OPEN, send: mock() };
  const datum = trader.datums[TRADER_DATUM.MARKET_PRINT];

  await datum.firstReferenceAdded({}, 'BTCUSDT');
  await datum.lastReferenceRemoved({}, 'BTCUSDT');
  expect(
    trader.publicConnection.send.mock.calls.map(([data]) => JSON.parse(data))
  ).toEqual([
    { op: 'subscribe', args: ['publicTrade.BTCUSDT'] },
    { op: 'unsubscribe', args: ['publicTrade.BTCUSDT'] }
  ]);
  expect(
    datum[TRADER_DATUM.MARKET_PRINT]({
      i: 'id',
      S: 'Buy',
      T: 1000,
      s: 'BTCUSDT',
      p: '12.5',
      v: '0.1'
    })
  ).toEqual({
    tradeId: 'id',
    side: 'buy',
    timestamp: 1000,
    symbol: 'BTCUSDT',
    price: 12.5,
    volume: 0.1,
    pool: 'BY'
  });
});
