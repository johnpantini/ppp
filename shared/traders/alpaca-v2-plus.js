/** @decorator */

import { TRADER_DATUM } from '../const.js';
import { later } from '../later.js';
import { TraderWithSimpleSearch } from './trader-with-simple-search.js';
import { Trader } from './common-trader.js';
import { applyMixins } from '../utilities/apply-mixins.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} AlpacaV2PlusTrader
 */

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

  getSymbol(instrument = {}) {
    let symbol = instrument.symbol;

    if (/~/gi.test(symbol)) symbol = symbol.split('~')[0];

    return symbol;
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
            for (const payload of JSON.parse(data) ?? []) {
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
                for (const [instrumentId, { instrument, refCount }] of this.refs
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
                for (const [instrumentId, { instrument, refCount }] of this.refs
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
                return this.onTradeMessage({ data: payload });
              } else if (payload.T === 'q') {
                return this.onOrderbookMessage({ data: payload });
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
      const instrument = await this.findInstrumentInCache(data.S);

      if (instrument) {
        for (const [source, fields] of this.subs.allTrades) {
          if (
            source.instrument?.symbol &&
            this.getSymbol(instrument) === this.getSymbol(source.instrument)
          ) {
            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.MARKET_PRINT:
                  const timestamp = new Date(data.t).valueOf();
                  const side = this.hitToSide(data.h);
                  const pool = this.alpacaExchangeToUTEXExchange(data.x);

                  source[field] = {
                    orderId: `${data.S}|${side}|${data.p}|${data.s}|${pool}|${timestamp}`,
                    side,
                    time: data.t,
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
      const instrument = await this.findInstrumentInCache(data.S);

      if (instrument) {
        for (const [source, fields] of this.subs.orderbook) {
          if (
            source.instrument?.symbol &&
            this.getSymbol(instrument) === this.getSymbol(source.instrument)
          ) {
            const ref = this.refs.orderbook.get(source.instrument?._id);

            if (ref) {
              if (typeof ref.lastOrderBookMontage === 'undefined') {
                ref.lastOrderBookMap = {
                  bids: new Map(),
                  asks: new Map()
                };
              }

              const lastOrderBookMap = ref.lastOrderBookMap;

              lastOrderBookMap.bids.set(data.bx, {
                price: data.bp,
                volume: data.bs * 100,
                time: data.t,
                condition: data.c?.join?.(' '),
                timestamp: new Date(data.t).valueOf(),
                pool: this.alpacaExchangeToUTEXExchange(data.bx)
              });

              lastOrderBookMap.asks.set(data.ax, {
                price: data.ap,
                volume: data.as * 100,
                time: data.t,
                condition: data.c?.join?.(' '),
                timestamp: new Date(data.t).valueOf(),
                pool: this.alpacaExchangeToUTEXExchange(data.ax)
              });

              ref.lastOrderBookMontage = {
                bids: [],
                asks: []
              };

              const lastOrderBookMontage = ref.lastOrderBookMontage;

              lastOrderBookMontage.bids = [...lastOrderBookMap.bids.values()]
                .filter((b) => b.price > 0 && b.volume > 0)
                .sort((a, b) => {
                  return b.price - a.price || b.volume - a.volume;
                });

              lastOrderBookMontage.asks = [...lastOrderBookMap.asks.values()]
                .filter((a) => a.price > 0 && a.volume > 0)
                .sort((a, b) => {
                  return a.price - b.price || b.volume - a.volume;
                });

              for (const { field, datum } of fields) {
                switch (datum) {
                  case TRADER_DATUM.ORDERBOOK:
                    source[field] = lastOrderBookMontage;

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
    await this.waitForInstrumentCache();
    await super.subscribeField({ source, field, datum });
  }

  async addFirstRef(instrument, refs) {
    if (this.connection.readyState === WebSocket.OPEN) {
      refs.set(instrument._id, {
        refCount: 1,
        instrument
      });

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
            trades: [this.getSymbol(instrument)]
          })
        );
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await super.instrumentChanged(source, oldValue, newValue);

    if (newValue?._id) {
      // Handle no real subscription case for orderbook.
      for (const [source, fields] of this.subs.orderbook) {
        if (
          source.instrument?.symbol &&
          this.getSymbol(newValue) === this.getSymbol(source.instrument)
        ) {
          for (const { field, datum } of fields) {
            switch (datum) {
              case TRADER_DATUM.ORDERBOOK:
                source[field] = this.refs.orderbook.get(
                  newValue._id
                )?.lastOrderBookMontage;

                break;
            }
          }
        }
      }
    }
  }

  getExchange() {
    switch (this.document.exchange) {
      case 'SPBX':
        return 'spbex';
      default:
        return '';
    }
  }

  getBroker() {
    return this.document.broker.type;
  }
}

export default applyMixins(AlpacaV2PlusTrader, TraderWithSimpleSearch);
