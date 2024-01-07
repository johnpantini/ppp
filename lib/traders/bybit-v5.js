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

class BybitPublicTraderDatum extends TraderDatum {
  filter(data, instrument, source) {
    return CRYPTO_EXCHANGES.includes(source?.instrument?.exchange);
  }

  async subscribe(source, field, datum) {
    await this.trader.establishPublicWebSocketConnection();

    return super.subscribe(source, field, datum);
  }
}

class OrderbookDatum extends BybitPublicTraderDatum {
  async firstReferenceAdded(source, symbol) {
    if (this.trader.publicConnection.readyState === WebSocket.OPEN) {
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (this.trader.publicConnection.readyState === WebSocket.OPEN) {
    }
  }

  [TRADER_DATUM.ORDERBOOK](data) {}
}

class TimeAndSalesDatum extends BybitPublicTraderDatum {
  doNotSaveValue = true;

  async firstReferenceAdded(source, symbol) {
    if (this.trader.publicConnection.readyState === WebSocket.OPEN) {
      this.trader.publicConnection.send(
        JSON.stringify({
          op: 'subscribe',
          args: [`publicTrade.${symbol}`]
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (this.trader.publicConnection.readyState === WebSocket.OPEN) {
      this.trader.publicConnection.send(
        JSON.stringify({
          op: 'unsubscribe',
          args: [`publicTrade.${symbol}`]
        })
      );
    }
  }

  [TRADER_DATUM.MARKET_PRINT](data, instrument) {
    return {
      tradeId: data.i,
      side: data.S.toLowerCase(),
      timestamp: data.T,
      symbol: data.s,
      price: parseFloat(data.p),
      volume: parseFloat(data.v)
    };
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} BybitTrader
 */
class BybitTrader extends Trader {
  #pendingPublicConnection;

  publicConnection;

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

  async establishPublicWebSocketConnection(reconnect) {
    if (this.publicConnection?.readyState === WebSocket.OPEN) {
      this.#pendingPublicConnection = void 0;

      return this.publicConnection;
    } else if (this.#pendingPublicConnection) {
      return this.#pendingPublicConnection;
    } else {
      return (this.#pendingPublicConnection = new Promise((resolve) => {
        if (!reconnect && this.publicConnection) {
          resolve(this.publicConnection);
        } else {
          this.publicConnection = new WebSocket(
            `wss://stream.bybit.com/v5/public/${this.document.productLine}`
          );

          this.publicConnection.onopen = async () => {
            if (reconnect) {
              await this.resubscribe();
            }

            resolve(this.publicConnection);
          };

          this.publicConnection.onclose = async () => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));

            this.#pendingPublicConnection = void 0;

            await this.establishPublicWebSocketConnection(true);
          };

          this.publicConnection.onerror = () => this.publicConnection.close();

          this.publicConnection.onmessage = ({ data }) => {
            const payload = JSON.parse(data);

            if (/^publicTrade/i.test(payload?.topic)) {
              for (const print of payload.data ?? []) {
                this.datums[TRADER_DATUM.MARKET_PRINT].dataArrived(
                  print,
                  this.instruments.get(print.s)
                );
              }
            }
          };
        }
      }));
    }
  }

  getBroker() {
    return BROKERS.BYBIT;
  }

  getDictionary() {
    if (this.document.productLine === 'spot') {
      return INSTRUMENT_DICTIONARY.BYBIT_SPOT;
    } else if (this.document.productLine === 'linear') {
      return INSTRUMENT_DICTIONARY.BYBIT_LINEAR;
    }
  }

  getExchange() {
    if (this.document.productLine === 'spot') {
      return EXCHANGE.BYBIT_SPOT;
    } else if (this.document.productLine === 'linear') {
      return EXCHANGE.BYBIT_LINEAR;
    }
  }

  getInstrumentIconUrl(instrument) {
    return instrument?.baseCryptoAsset
      ? `static/instruments/crypto/${instrument.baseCryptoAsset}.svg`
      : super.getInstrumentIconUrl(instrument);
  }
}

pppTraderInstanceForWorkerIs(BybitTrader);

export default BybitTrader;
