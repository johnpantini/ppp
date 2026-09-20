import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM,
  CRYPTO_EXCHANGES
} from '../const.js';
import { later } from '../ppp-decorators.js';
import {
  Trader,
  TraderDatum,
  pppTraderInstanceForWorkerIs
} from './trader-worker.js';

class BinanceTraderDatum extends TraderDatum {
  filter(data, instrument, source) {
    return CRYPTO_EXCHANGES.includes(source?.instrument?.exchange);
  }

  async subscribe(source, field, datum) {
    await this.trader.establishWebSocketConnection();

    return super.subscribe(source, field, datum);
  }
}

class OrderbookDatum extends BinanceTraderDatum {
  async firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          method: 'SUBSCRIBE',
          params: [
            `${symbol.toLowerCase()}@depth20@${
              this.trader.document.orderbookUpdateInterval
            }`
          ],
          id: ++this.trader.idCounter
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          method: 'UNSUBSCRIBE',
          params: [
            `${symbol.toLowerCase()}@depth20@${
              this.trader.document.orderbookUpdateInterval
            }`
          ],
          id: ++this.trader.idCounter
        })
      );
    }
  }

  [TRADER_DATUM.ORDERBOOK](data) {
    return {
      bids: (data.bids ?? []).map((b) => {
        if (b.pool) {
          return b;
        }

        return {
          price: parseFloat(b[0]),
          volume: parseFloat(b[1]),
          pool: 'BN'
        };
      }),
      asks: (data.asks ?? []).map((a) => {
        if (a.pool) {
          return a;
        }

        return {
          price: parseFloat(a[0]),
          volume: parseFloat(a[1]),
          pool: 'BN'
        };
      })
    };
  }
}

class TimeAndSalesDatum extends BinanceTraderDatum {
  doNotSaveValue = true;

  async firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      const subType = this.trader.document.showAggTrades ? 'aggTrade' : 'trade';

      this.trader.connection.send(
        JSON.stringify({
          method: 'SUBSCRIBE',
          params: [`${symbol.toLowerCase()}@${subType}`],
          id: ++this.trader.idCounter
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      const subType = this.trader.document.showAggTrades ? 'aggTrade' : 'trade';

      this.trader.connection.send(
        JSON.stringify({
          method: 'UNSUBSCRIBE',
          params: [`${symbol.toLowerCase()}@${subType}`],
          id: ++this.trader.idCounter
        })
      );
    }
  }

  [TRADER_DATUM.MARKET_PRINT](data, instrument) {
    return {
      // aggTrade uses "a", the plain trade stream uses "t".
      tradeId: data.a ?? data.t,
      side: data.m ? 'sell' : 'buy',
      timestamp: data.E,
      symbol: this.trader.getSymbol(instrument),
      price: parseFloat(data.p),
      volume: parseFloat(data.q),
      pool: 'BN'
    };
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} BinanceTrader
 */
class BinanceTrader extends Trader {
  #pendingConnection;

  connection;

  idCounter = 0;

  constructor(document) {
    super(document, [
      {
        type: OrderbookDatum,
        datums: [TRADER_DATUM.ORDERBOOK]
      },
      {
        type: TimeAndSalesDatum,
        datums: [TRADER_DATUM.MARKET_PRINT]
      }
    ]);
  }

  async establishWebSocketConnection(reconnect) {
    if (this.connection?.readyState === WebSocket.OPEN) {
      return this.connection;
    } else if (
      // Any pending connection, including a delayed reconnect, is reused.
      this.#pendingConnection &&
      !reconnect
    ) {
      return this.#pendingConnection;
    } else {
      this.#pendingConnection = new Promise((resolve) => {
        let ws;

        if (typeof process !== 'undefined' && process.release.name === 'node') {
          ws = new WebSocket(
            new URL('stream', this.document.wsUrl).toString(),
            {
              followRedirects: true,
              perMessageDeflate: false,
              agent: new globalThis.https.Agent({
                keepAlive: true,
                family: 4
              })
            }
          );
        } else {
          ws = new WebSocket(new URL('stream', this.document.wsUrl).toString());
        }

        this.connection = ws;

        // Events of a socket that has already been replaced are ignored,
        // so an orphaned socket can neither feed data nor close the new one.
        const isCurrent = () => this.connection === ws;

        ws.onopen = async () => {
          if (!isCurrent()) return ws.close();

          if (reconnect) {
            await this.resubscribe();
          }

          resolve(ws);
        };

        ws.onclose = () => {
          if (!isCurrent()) return;

          // The promise of the next connection is created right away, so a
          // subscribe() during the delay waits for it instead of opening
          // a second socket.
          const next = later(
            Math.max(this.document.reconnectTimeout ?? 1000, 1000)
          ).then(() => this.establishWebSocketConnection(true));

          this.#pendingConnection = next;
          // A failed reconnect must not stay cached forever.
          next.catch(() => {
            if (this.#pendingConnection === next)
              this.#pendingConnection = void 0;
          });
          resolve(next);
        };

        ws.onerror = () => ws.close();

        ws.onmessage = ({ data }) => {
          if (!isCurrent()) return;

          const payload = JSON.parse(data);

          if (/depth20/i.test(payload?.stream)) {
            this.datums[TRADER_DATUM.ORDERBOOK].dataArrived(
              payload.data,
              this.instruments.get(payload.stream.split('@')[0].toUpperCase())
            );
          } else if (/@trade|@aggTrade/i.test(payload?.stream)) {
            this.datums[TRADER_DATUM.MARKET_PRINT].dataArrived(
              payload.data,
              this.instruments.get(payload.stream.split('@')[0].toUpperCase())
            );
          }
        };
      });

      return this.#pendingConnection;
    }
  }

  getBroker() {
    return BROKERS.BINANCE;
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.BINANCE;
  }

  getExchange() {
    return EXCHANGE.BINANCE;
  }

  getInstrumentIconUrl(instrument) {
    return instrument?.baseCryptoAsset
      ? `static/instruments/crypto/${instrument.baseCryptoAsset}.svg`
      : super.getInstrumentIconUrl(instrument);
  }
}

pppTraderInstanceForWorkerIs(BinanceTrader);

export default BinanceTrader;
