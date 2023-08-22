import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../lib/const.js';
import { later } from '../lib/ppp-decorators.js';
import { isDST } from '../lib/intl.js';
import { Trader, TraderDatum } from './common-trader.js';

class AlpacaV2PlusTraderDatum extends TraderDatum {
  filter(data, instrument, source) {
    return (
      [EXCHANGE.US, EXCHANGE.UTEX_MARGIN_STOCKS, EXCHANGE.SPBX].indexOf(
        source?.instrument?.exchange
      ) !== -1
    );
  }

  async subscribe(source, field, datum) {
    await this.trader.establishWebSocketConnection();

    return super.subscribe(source, field, datum);
  }
}

class AllTradesDatum extends AlpacaV2PlusTraderDatum {
  doNotSaveValue = true;

  async firstReferenceAdded(source, symbol) {
    if (!this.trader.supportsInstrument(source?.instrument)) {
      return;
    }

    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'subscribe',
          trades: [symbol]
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (!this.trader.supportsInstrument(source?.instrument)) {
      return;
    }

    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'unsubscribe',
          trades: [symbol]
        })
      );
    }
  }

  [TRADER_DATUM.MARKET_PRINT](data) {
    const timestamp = new Date(data.t).valueOf();
    const side = this.trader.hitToSide(data.h);
    const pool = this.trader.alpacaExchangeToUTEXExchange(data.x);

    return {
      orderId: `${data.S}|${side}|${data.p}|${data.s}|${pool}|${timestamp}`,
      side,
      condition: data.c?.join?.(' '),
      timestamp,
      symbol: data.S,
      price: data.p,
      volume: data.s,
      pool
    };
  }
}

class OrderbookDatum extends AlpacaV2PlusTraderDatum {
  orderbooks = new Map();

  async firstReferenceAdded(source, symbol) {
    if (!this.trader.supportsInstrument(source?.instrument)) {
      return;
    }

    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.orderbooks.set(symbol, {
        bids: new Map(),
        asks: new Map()
      });

      this.trader.connection.send(
        JSON.stringify({
          action: 'subscribe',
          quotes: [symbol]
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (!this.trader.supportsInstrument(source?.instrument)) {
      return;
    }

    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'unsubscribe',
          quotes: [symbol]
        })
      );
    }

    this.orderbooks.delete(symbol);
  }

  [TRADER_DATUM.ORDERBOOK](data, instrument) {
    const orderbookMap = this.orderbooks.get(this.trader.getSymbol(instrument));
    const volumeCoefficient = this.trader.document.useLots ? 1 : 100;
    let bidKey = data.bx;

    if (this.trader.document.broker.type === BROKERS.PSINA) {
      bidKey = `${data.bx}|${data.bp}|${data.bs}|${data.level}`;
    }

    orderbookMap.bids.set(bidKey, {
      price: data.bp,
      volume: data.bs * volumeCoefficient,
      time: data.t,
      condition: data.c?.join?.(' '),
      timestamp: data.t ? new Date(data.t).valueOf() : null,
      pool: this.trader.alpacaExchangeToUTEXExchange(data.bx)
    });

    let askKey = data.ax;

    if (this.trader.document.broker.type === BROKERS.PSINA) {
      askKey = `${data.ax}|${data.ap}|${data.as}|${data.level}`;
    }

    orderbookMap.asks.set(askKey, {
      price: data.ap,
      volume: data.as * volumeCoefficient,
      time: data.t,
      condition: data.c?.join?.(' '),
      timestamp: data.t ? new Date(data.t).valueOf() : null,
      pool: this.trader.alpacaExchangeToUTEXExchange(data.ax)
    });

    const montage = {
      bids: [],
      asks: []
    };
    const nowHours = new Date().getUTCHours();

    montage.bids = [...orderbookMap.bids.values()]
      .filter((b) => {
        if (this.trader.document.broker.type === BROKERS.UTEX) {
          // Fix for invalid NYSE pool data
          if (
            (nowHours >= (isDST() ? 20 : 21) ||
              nowHours < (isDST() ? 10 : 11)) &&
            b.pool === 'N'
          )
            return false;
        }

        return b.price > 0 && (b.volume > 0 || b.pool === 'LULD');
      })
      .sort((a, b) => {
        return b.price - a.price || b.volume - a.volume;
      });

    montage.asks = [...orderbookMap.asks.values()]
      .filter((a) => {
        if (this.trader.document.broker.type === BROKERS.UTEX) {
          // Fix for invalid NYSE pool data
          if (
            (nowHours >= (isDST() ? 20 : 21) ||
              nowHours < (isDST() ? 10 : 11)) &&
            a.pool === 'N'
          )
            return false;
        }

        return a.price > 0 && (a.volume > 0 || a.pool === 'LULD');
      })
      .sort((a, b) => {
        return a.price - b.price || b.volume - a.volume;
      });

    return montage;
  }
}

/**
 * @typedef {Object} AlpacaV2PlusTrader
 * @extends Trader
 */
// noinspection JSUnusedGlobalSymbols
class AlpacaV2PlusTrader extends Trader {
  #pendingConnection;

  connection;

  constructor(document) {
    super(document, [
      {
        type: AllTradesDatum,
        datums: [TRADER_DATUM.MARKET_PRINT]
      },
      {
        type: OrderbookDatum,
        datums: [TRADER_DATUM.ORDERBOOK]
      }
    ]);
  }

  alpacaExchangeToUTEXExchange(exchange) {
    switch (exchange) {
      case 'P':
        return 'PA';
      case 'J':
        return 'DA';
      case 'K':
        return 'DX';
      case 'Y':
        return 'BT';
      case 'M':
        return 'MW';
      case 'D':
        return 'QD';
    }

    return exchange;
  }

  hitToSide(hit) {
    return {
      // UnknownHitType
      0: '',
      // AtBid
      1: 'sell',
      // AtAsk
      2: 'buy',
      // AboveAsk
      3: 'buy',
      // BelowBid
      4: 'sell',
      // Between
      5: ''
    }[hit];
  }

  async establishWebSocketConnection(reconnect) {
    if (this.connection?.readyState === WebSocket.OPEN) {
      this.#pendingConnection = void 0;

      return this.connection;
    } else if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve, reject) => {
        if (!reconnect && this.connection) {
          resolve(this.connection);
        } else {
          this.connection = new WebSocket(this.document.wsUrl);

          this.connection.onclose = async () => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));

            this.#pendingConnection = void 0;

            await this.establishWebSocketConnection(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = async ({ data }) => {
            const parsed = JSON.parse(data) ?? [];

            // Psina DOM books come completed.
            if (this.document.broker.type === BROKERS.PSINA) {
              if (Array.isArray(parsed) && parsed[0]?.T === 'q') {
                const orderbookMap = this.datums[
                  TRADER_DATUM.ORDERBOOK
                ].orderbooks.get(parsed[0].S);

                if (typeof orderbookMap !== 'undefined') {
                  orderbookMap.bids.clear();
                  orderbookMap.asks.clear();
                }
              }
            }

            for (const payload of parsed) {
              if (payload.msg === 'connected') {
                this.connection.send(
                  JSON.stringify({
                    action: 'auth',
                    key: this.document.broker.login,
                    secret: this.document.broker.password
                  })
                );
              } else if (payload.msg === 'authenticated') {
                if (reconnect) {
                  await this.resubscribe();
                }

                resolve(this.connection);
              } else if (payload.T === 't') {
                this.datums[TRADER_DATUM.MARKET_PRINT].dataArrived(
                  payload,
                  this.instruments.get(payload.S)
                );
              } else if (payload.T === 'q') {
                this.datums[TRADER_DATUM.ORDERBOOK].dataArrived(
                  payload,
                  this.instruments.get(payload.S)
                );
              } else if (payload.T === 'error') {
                console.error(payload);

                reject(payload);
              }
            }
          };
        }
      }));
    }
  }

  getDictionary() {
    if (this.document.broker.type === BROKERS.PSINA) {
      return INSTRUMENT_DICTIONARY.PSINA_US_STOCKS;
    } else if (this.document.broker.type === BROKERS.UTEX) {
      return INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS;
    }

    return null;
  }

  getExchange() {
    if (this.document.broker.type === BROKERS.PSINA) {
      return EXCHANGE.US;
    } else if (this.document.broker.type === BROKERS.UTEX) {
      return EXCHANGE.UTEX_MARGIN_STOCKS;
    }

    return null;
  }

  getBroker() {
    return this.document.broker.type;
  }

  getInstrumentIconUrl(instrument) {
    if (instrument?.symbol === 'PRN') {
      return 'static/instruments/stocks/us/PRN@US.svg';
    }

    return instrument?.symbol
      ? `static/instruments/stocks/us/${instrument.symbol.replace(
          ' ',
          '-'
        )}.svg`
      : super.getInstrumentIconUrl(instrument);
  }

  supportsInstrument(instrument) {
    if (!instrument) return true;

    const symbol = instrument.symbol.split('@')[0];

    if (symbol === 'TCS' && instrument.exchange === EXCHANGE.SPBX) return false;

    if (symbol === 'FIVE' && instrument.exchange === EXCHANGE.MOEX)
      return false;

    return this.instruments.has(symbol);
  }

  adoptInstrument(instrument) {
    if (!this.supportsInstrument(instrument)) return instrument;

    const symbol = instrument?.symbol.split('@')[0];

    if (instrument) return this.instruments.get(symbol);
  }
}

export default AlpacaV2PlusTrader;
