import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../lib/const.js';
import { later } from '../lib/ppp-decorators.js';
import { isDST } from '../lib/intl.js';
import { Trader } from './common-trader.js';

/**
 * @typedef {Object} AlpacaV2PlusTrader
 * @extends Trader
 */
// noinspection JSUnusedGlobalSymbols
class AlpacaV2PlusTrader extends Trader {
  #pendingConnection;

  // Key: widget instance; Value: [{ field, datum }] array
  subs = {
    orderbook: new Map(),
    allTrades: new Map()
  };

  // Key: instrumentId; Value: { instrument, refCount }
  // Value contains lastOrderbookMontage for orderbook
  refs = {
    orderbook: new Map(),
    allTrades: new Map()
  };

  connection;

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

  async #connectWebSocket(reconnect) {
    if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve, reject) => {
        if (!reconnect && this.connection) {
          resolve(this.connection);
        } else {
          this.connection = new WebSocket(this.document.wsUrl);

          this.connection.onclose = async () => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));

            this.#pendingConnection = null;

            await this.#connectWebSocket(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = ({ data }) => {
            const parsed = JSON.parse(data) ?? [];

            if (this.document.broker.type === BROKERS.PSINA) {
              if (Array.isArray(parsed) && parsed[0]?.T === 'q') {
                const ref = this.refs.orderbook.get(parsed[0].S);

                if (ref && typeof ref.lastOrderbookMap !== 'undefined') {
                  ref.lastOrderbookMap.bids.clear();
                  ref.lastOrderbookMap.asks.clear();
                }
              }
            }

            let levelCounter = 0;

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
                // 1. All trades
                for (const [, { instrument, refCount }] of this.refs
                  .allTrades) {
                  if (refCount > 0) {
                    this.connection.send(
                      JSON.stringify({
                        action: 'subscribe',
                        trades: [this.getSymbol(instrument)]
                      })
                    );
                  }
                }

                // 2. Orderbook
                for (const [, { instrument, refCount }] of this.refs
                  .orderbook) {
                  if (refCount > 0) {
                    this.connection.send(
                      JSON.stringify({
                        action: 'subscribe',
                        quotes: [this.getSymbol(instrument)]
                      })
                    );
                  }
                }

                resolve(this.connection);
              } else if (payload.T === 't') {
                this.onTradeMessage({ data: payload });
              } else if (payload.T === 'q') {
                payload.level = levelCounter;

                this.onOrderbookMessage({ data: payload });

                levelCounter++;
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

  async onTradeMessage({ data }) {
    if (data) {
      const instrument = this.instruments.get(data.S);

      if (instrument) {
        for (const [source, fields] of this.subs.allTrades) {
          if (this.instrumentsAreEqual(instrument, source.instrument)) {
            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.MARKET_PRINT:
                  const timestamp = new Date(data.t).valueOf();
                  const side = this.hitToSide(data.h);
                  const pool = this.alpacaExchangeToUTEXExchange(data.x);

                  source[field] = {
                    orderId: `${data.S}|${side}|${data.p}|${data.s}|${pool}|${timestamp}`,
                    side,
                    condition: data.c?.join?.(' '),
                    timestamp,
                    symbol: data.S,
                    price: data.p,
                    volume: data.s,
                    pool
                  };

                  break;
              }
            }
          }
        }
      }
    }
  }

  async onOrderbookMessage({ data }) {
    if (data) {
      const instrument = this.instruments.get(data.S);

      if (instrument) {
        for (const [source, fields] of this.subs.orderbook) {
          if (this.instrumentsAreEqual(instrument, source.instrument)) {
            const ref = this.refs.orderbook.get(source.instrument?.symbol);

            if (ref) {
              if (typeof ref.lastOrderbookMontage === 'undefined') {
                ref.lastOrderbookMap = {
                  bids: new Map(),
                  asks: new Map()
                };
              }

              const lastOrderbookMap = ref.lastOrderbookMap;
              const volumeCoefficient = this.document.useLots ? 1 : 100;

              lastOrderbookMap.bids.set(
                `${data.bx}|${data.bp}|${data.bs}|${data.level}`,
                {
                  price: data.bp,
                  volume: data.bs * volumeCoefficient,
                  time: data.t,
                  condition: data.c?.join?.(' '),
                  timestamp: data.t ? new Date(data.t).valueOf() : null,
                  pool: this.alpacaExchangeToUTEXExchange(data.bx)
                }
              );

              lastOrderbookMap.asks.set(
                `${data.bx}|${data.ap}|${data.as}|${data.level}`,
                {
                  price: data.ap,
                  volume: data.as * volumeCoefficient,
                  time: data.t,
                  condition: data.c?.join?.(' '),
                  timestamp: data.t ? new Date(data.t).valueOf() : null,
                  pool: this.alpacaExchangeToUTEXExchange(data.ax)
                }
              );

              ref.lastOrderbookMontage = {
                bids: [],
                asks: []
              };

              const lastOrderbookMontage = ref.lastOrderbookMontage;
              const nowHours = new Date().getUTCHours();

              lastOrderbookMontage.bids = [...lastOrderbookMap.bids.values()]
                .filter((b) => {
                  if (this.document.broker.type === BROKERS.UTEX) {
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

              lastOrderbookMontage.asks = [...lastOrderbookMap.asks.values()]
                .filter((a) => {
                  if (this.document.broker.type === BROKERS.UTEX) {
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

              for (const { field, datum } of fields) {
                switch (datum) {
                  case TRADER_DATUM.ORDERBOOK:
                    source[field] = lastOrderbookMontage;

                    break;
                }
              }
            }
          }
        }
      }
    }
  }

  subsAndRefs(datum) {
    return {
      [TRADER_DATUM.ORDERBOOK]: [this.subs.orderbook, this.refs.orderbook],
      [TRADER_DATUM.MARKET_PRINT]: [this.subs.allTrades, this.refs.allTrades]
    }[datum];
  }

  async subscribeField({ source, field, datum }) {
    await this.#connectWebSocket();
    await super.subscribeField({ source, field, datum });
  }

  async addFirstRef(instrument, refs) {
    if (this.connection.readyState === WebSocket.OPEN) {
      if (refs === this.refs.allTrades) {
        this.connection.send(
          JSON.stringify({
            action: 'subscribe',
            trades: [this.getSymbol(instrument)]
          })
        );
      } else if (refs === this.refs.orderbook) {
        this.connection.send(
          JSON.stringify({
            action: 'subscribe',
            quotes: [this.getSymbol(instrument)]
          })
        );
      }
    }
  }

  async removeLastRef(instrument, refs) {
    if (this.connection.readyState === WebSocket.OPEN) {
      if (refs === this.refs.allTrades) {
        this.connection.send(
          JSON.stringify({
            action: 'unsubscribe',
            trades: [this.getSymbol(instrument)]
          })
        );
      } else if (refs === this.refs.orderbook) {
        this.connection.send(
          JSON.stringify({
            action: 'unsubscribe',
            quotes: [this.getSymbol(instrument)]
          })
        );
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await super.instrumentChanged(source, oldValue, newValue);

    if (newValue?.symbol) {
      // Handle no real subscription case for orderbook.
      for (const [source, fields] of this.subs.orderbook) {
        if (this.instrumentsAreEqual(newValue, source.instrument)) {
          for (const { field, datum } of fields) {
            switch (datum) {
              case TRADER_DATUM.ORDERBOOK:
                source[field] = this.refs.orderbook.get(
                  newValue.symbol
                )?.lastOrderbookMontage;

                break;
            }
          }
        }
      }
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
