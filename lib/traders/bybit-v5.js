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
  ConditionalOrderDatum,
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

  [TRADER_DATUM.MARKET_PRINT](data) {
    return {
      tradeId: data.i,
      side: data.S.toLowerCase(),
      timestamp: data.T,
      symbol: data.s,
      price: parseFloat(data.p),
      volume: parseFloat(data.v),
      pool: 'BY'
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
      },
      {
        type: ConditionalOrderDatum,
        datums: [TRADER_DATUM.CONDITIONAL_ORDER]
      }
    ]);
  }

  getTimeframeList() {
    return [
      {
        name: 'Sec',
        values: []
      },
      {
        name: 'Min',
        values: [1, 3, 5, 15, 30]
      },
      {
        name: 'Hour',
        values: [1, 2, 4, 6, 12]
      },
      {
        name: 'Day',
        values: [1]
      },
      {
        name: 'Week',
        values: [1]
      },
      {
        name: 'Month',
        values: [1]
      }
    ];
  }

  async establishPublicWebSocketConnection(reconnect) {
    if (this.publicConnection?.readyState === WebSocket.OPEN) {
      return this.publicConnection;
    } else if (
      // Any pending connection, including a delayed reconnect, is reused.
      this.#pendingPublicConnection &&
      !reconnect
    ) {
      return this.#pendingPublicConnection;
    } else {
      this.#pendingPublicConnection = new Promise((resolve) => {
        const ws = new WebSocket(
          `wss://stream.bybit.com/v5/public/${this.document.productLine}`
        );

        this.publicConnection = ws;

        // Events of a socket that has already been replaced are ignored,
        // so an orphaned socket can neither feed data nor close the new one.
        const isCurrent = () => this.publicConnection === ws;

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
          ).then(() => this.establishPublicWebSocketConnection(true));

          this.#pendingPublicConnection = next;
          // A failed reconnect must not stay cached forever.
          next.catch(() => {
            if (this.#pendingPublicConnection === next)
              this.#pendingPublicConnection = void 0;
          });
          resolve(next);
        };

        ws.onerror = () => ws.close();

        ws.onmessage = ({ data }) => {
          if (!isCurrent()) return;

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
      });

      return this.#pendingPublicConnection;
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
