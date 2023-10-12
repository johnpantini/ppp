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
  filter(data, instrument, source, datum) {
    if (
      [
        TRADER_DATUM.LAST_PRICE,
        TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
        TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
        TRADER_DATUM.BEST_BID,
        TRADER_DATUM.BEST_ASK,
        TRADER_DATUM.EXTENDED_LAST_PRICE,
        TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE,
        TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE
      ].includes(datum)
    ) {
      return [EXCHANGE.US, EXCHANGE.UTEX_MARGIN_STOCKS].includes(
        source?.instrument?.exchange
      );
    } else {
      return [EXCHANGE.SPBX, EXCHANGE.US, EXCHANGE.UTEX_MARGIN_STOCKS].includes(
        source?.instrument?.exchange
      );
    }
  }

  async subscribe(source, field, datum) {
    await this.trader.establishWebSocketConnection();

    return super.subscribe(source, field, datum);
  }
}

class ComboDatum extends AlpacaV2PlusTraderDatum {
  filter(data, instrument, source, datum) {
    const sup = super.filter(data, instrument, source, datum);

    if (sup) {
      if (data) {
        switch (data.T) {
          case 't':
            return datum === TRADER_DATUM.MARKET_PRINT;
          case 'bbo':
            return (
              datum === TRADER_DATUM.BEST_BID || datum === TRADER_DATUM.BEST_ASK
            );
          case 'pr':
            switch (datum) {
              case TRADER_DATUM.LAST_PRICE:
                return data.c !== null;
              case TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE:
                return data.ch !== null;
              case TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE:
                return data.chr !== null;
              case TRADER_DATUM.EXTENDED_LAST_PRICE:
                return data.pp !== null;
              case TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE:
                return data.pch !== null;
              case TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE:
                return data.pchr !== null;
            }
        }
      }
    }
  }

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
      symbol: data.S,
      side,
      condition: data.c?.join?.(' '),
      timestamp,
      price: data.p,
      volume: data.s,
      pool
    };
  }

  [TRADER_DATUM.BEST_BID](data) {
    return data.bp;
  }

  [TRADER_DATUM.BEST_ASK](data) {
    return data.ap;
  }

  [TRADER_DATUM.LAST_PRICE](data) {
    return data.c;
  }

  [TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE](data) {
    return data.ch;
  }

  [TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE](data) {
    return data.chr * 100;
  }

  [TRADER_DATUM.EXTENDED_LAST_PRICE](data) {
    return data.pp;
  }

  [TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE](data) {
    return data.pch;
  }

  [TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE](data) {
    return data.pchr * 100;
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

  [TRADER_DATUM.ORDERBOOK](orderbook, instrument) {
    const montage = {
      bids: [],
      asks: []
    };
    const orderbookMap = this.orderbooks.get(this.trader.getSymbol(instrument));
    const volumeCoefficient = this.trader.document.useLots ? 1 : 100;
    const iterable = Array.isArray(orderbook) ? orderbook : [orderbook];

    for (const data of iterable) {
      let bidKey = data.bx;

      if (this.trader.document.broker.type === BROKERS.PSINA) {
        bidKey = `${data.bx}|${data.bp}|${data.bs}|${data.level}`;
      }

      orderbookMap.bids.set(bidKey, {
        price: data.bp,
        volume: data.bs * volumeCoefficient,
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
        condition: data.c?.join?.(' '),
        timestamp: data.t ? new Date(data.t).valueOf() : null,
        pool: this.trader.alpacaExchangeToUTEXExchange(data.ax)
      });

      const nowHours = new Date().getUTCHours();

      montage.bids = [...orderbookMap.bids.values()].filter((b) => {
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
      });

      montage.asks = [...orderbookMap.asks.values()].filter((a) => {
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
      });
    }

    return montage;
  }
}

class NoiiDatum extends AlpacaV2PlusTraderDatum {
  filter(data, instrument, source) {
    if (!data) {
      return false;
    }

    if (!data.h) {
      const nowHours = new Date().getUTCHours();

      if (source.noiiClose && nowHours < 19) {
        return false;
      }

      if (!source.noiiClose && nowHours > 14) {
        return false;
      }
    }

    return super.filter(data, instrument, source);
  }

  async firstReferenceAdded(source, symbol) {
    if (!this.trader.supportsInstrument(source?.instrument)) {
      return;
    }

    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'subscribe',
          noii: [symbol],
          // Opening cross by default.
          close: source.noiiClose ?? false
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
          noii: [symbol]
        })
      );
    }
  }

  [TRADER_DATUM.NOII](data) {
    return {
      symbol: data.S,
      timestamp: new Date(data.t).valueOf(),
      pairedShares: data.psh,
      imbShares: data.ish,
      side: data.is,
      imbRefPrice: data.irp,
      imbNearPrice: data.inp,
      imbFarPrice: data.ifp,
      imbVarIndicator: data.ivi,
      imbActTp: data.iatp
    };
  }
}

/**
 * @typedef {Object} AlpacaV2PlusTrader
 * @extends Trader
 */
// noinspection JSUnusedGlobalSymbols
class AlpacaV2PlusTrader extends Trader {
  #pendingConnection;

  authenticated = false;

  connection;

  constructor(document) {
    super(document, [
      {
        type: ComboDatum,
        datums: [
          TRADER_DATUM.MARKET_PRINT,
          TRADER_DATUM.BEST_BID,
          TRADER_DATUM.BEST_ASK,
          TRADER_DATUM.LAST_PRICE,
          TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
          TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
          TRADER_DATUM.EXTENDED_LAST_PRICE,
          TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE,
          TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE
        ]
      },
      {
        type: OrderbookDatum,
        datums: [TRADER_DATUM.ORDERBOOK]
      },
      {
        type: NoiiDatum,
        datums: [TRADER_DATUM.NOII]
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
    if (this.connection?.readyState === WebSocket.OPEN && this.authenticated) {
      this.#pendingConnection = void 0;

      return this.connection;
    } else if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve, reject) => {
        if (!reconnect && this.connection) {
          resolve(this.connection);
        } else {
          this.authenticated = false;
          this.connection = new WebSocket(this.document.wsUrl);

          this.connection.onclose = async () => {
            this.authenticated = false;

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

            // Optimize observable mutations
            if (this.document.broker.type === BROKERS.PSINA) {
              if (parsed[0]?.T === 'q') {
                this.datums[TRADER_DATUM.ORDERBOOK].dataArrived(
                  parsed,
                  this.instruments.get(parsed[0].S)
                );
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

                break;
              } else if (payload.msg === 'authenticated') {
                this.authenticated = true;
                this.#pendingConnection = void 0;

                if (reconnect) {
                  await this.resubscribe();
                }

                resolve(this.connection);

                break;
              } else if (payload.T === 't') {
                this.datums[TRADER_DATUM.MARKET_PRINT].dataArrived(
                  payload,
                  this.instruments.get(payload.S)
                );
              } else if (
                payload.T === 'q' &&
                this.document.broker.type !== BROKERS.PSINA
              ) {
                this.datums[TRADER_DATUM.ORDERBOOK].dataArrived(
                  payload,
                  this.instruments.get(payload.S)
                );
              } else if (payload.T === 'noii') {
                this.datums[TRADER_DATUM.NOII].dataArrived(
                  payload,
                  this.instruments.get(payload.S)
                );
              } else if (payload.T === 'bbo') {
                this.datums[TRADER_DATUM.BEST_BID].dataArrived(
                  payload,
                  this.instruments.get(payload.S)
                );
              } else if (payload.T === 'pr') {
                this.datums[TRADER_DATUM.LAST_PRICE].dataArrived(
                  payload,
                  this.instruments.get(payload.S)
                );
              } else if (payload.T === 'error') {
                console.error(payload);

                this.authenticated = false;

                reject(payload);

                break;
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

    const symbol = instrument.symbol.split('@')[0].split('~')[0];

    if (symbol === 'TCS' && instrument.exchange === EXCHANGE.SPBX) return false;

    if (instrument.exchange === EXCHANGE.MOEX) return false;

    return this.instruments.has(symbol);
  }

  adoptInstrument(instrument) {
    if (!this.supportsInstrument(instrument))
      return {
        symbol: instrument.symbol,
        fullName: 'Инструмент не поддерживается',
        notSupported: true
      };

    const symbol = instrument?.symbol.split('@')[0].split('~')[0];

    if (instrument) return this.instruments.get(symbol);
  }
}

export default AlpacaV2PlusTrader;
