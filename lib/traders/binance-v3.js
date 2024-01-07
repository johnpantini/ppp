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
      bids: data.bids.map((b) => {
        if (b.pool) {
          return b;
        }

        return {
          price: parseFloat(b[0]),
          volume: parseFloat(b[1]),
          pool: 'BN'
        };
      }),
      asks: data.asks.map((a) => {
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
      tradeId: data.a,
      side: data.m ? 'sell' : 'buy',
      timestamp: data.E,
      symbol: this.trader.getSymbol(instrument.symbol),
      price: parseFloat(data.p),
      volume: parseFloat(data.q)
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
      this.#pendingConnection = void 0;

      return this.connection;
    } else if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve) => {
        if (!reconnect && this.connection) {
          resolve(this.connection);
        } else {
          this.connection = new WebSocket(
            new URL(`stream`, this.document.wsUrl).toString()
          );

          this.connection.onopen = async () => {
            if (reconnect) {
              await this.resubscribe();
            }

            resolve(this.connection);
          };

          this.connection.onclose = async () => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));

            this.#pendingConnection = void 0;

            await this.establishWebSocketConnection(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = ({ data }) => {
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
        }
      }));
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
