import { BROKERS, TRADER_DATUM } from '../const.js';
import { later } from '../later.js';
import { Trader } from './common-trader.js';
import { cyrillicToLatin } from '../intl.js';
import ppp from '../../ppp.js';

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
              if (typeof ref.lastOrderbookMontage === 'undefined') {
                ref.lastOrderbookMap = {
                  bids: new Map(),
                  asks: new Map()
                };
              }

              const lastOrderbookMap = ref.lastOrderbookMap;
              const coeff = this.document.useLots ? 1 : 100;

              lastOrderbookMap.bids.set(data.bx, {
                price: data.bp,
                volume: data.bs * coeff,
                time: data.t,
                condition: data.c?.join?.(' '),
                timestamp: new Date(data.t).valueOf(),
                pool: this.alpacaExchangeToUTEXExchange(data.bx)
              });

              lastOrderbookMap.asks.set(data.ax, {
                price: data.ap,
                volume: data.as * coeff,
                time: data.t,
                condition: data.c?.join?.(' '),
                timestamp: new Date(data.t).valueOf(),
                pool: this.alpacaExchangeToUTEXExchange(data.ax)
              });

              ref.lastOrderbookMontage = {
                bids: [],
                asks: []
              };

              const lastOrderbookMontage = ref.lastOrderbookMontage;
              const nowHours = new Date().getUTCHours();

              lastOrderbookMontage.bids = [...lastOrderbookMap.bids.values()]
                .filter((b) => {
                  if (this.document.broker.type === BROKERS.UTEX_AURORA) {
                    // Fix for invalid NYSE pool data
                    if ((nowHours >= 21 || nowHours < 11) && b.pool === 'N')
                      return false;
                  }

                  return b.price > 0 && b.volume > 0;
                })
                .sort((a, b) => {
                  return b.price - a.price || b.volume - a.volume;
                });

              lastOrderbookMontage.asks = [...lastOrderbookMap.asks.values()]
                .filter((a) => {
                  if (this.document.broker.type === BROKERS.UTEX_AURORA) {
                    // Fix for invalid NYSE pool data
                    if ((nowHours >= 21 || nowHours < 11) && a.pool === 'N')
                      return false;
                  }

                  return a.price > 0 && a.volume > 0;
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
            quotes: [this.getSymbol(instrument)]
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
                )?.lastOrderbookMontage;

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
        return ['spbex'];
      default:
        return [];
    }
  }

  getBrokerType() {
    return this.document.broker.type;
  }

  async search(searchText) {
    if (searchText?.trim()) {
      searchText = searchText.trim().replaceAll("'", "\\'");

      const lines = ((context) => {
        const collection = context.services
          .get('mongodb-atlas')
          .db('ppp')
          .collection('instruments');

        const exactSymbolMatch = collection
          .find({
            $and: [
              { removed: { $ne: true } },
              {
                type: 'stock'
              },
              {
                exchange: {
                  $in: '$exchange'
                }
              },
              {
                broker: '$broker'
              },
              {
                $or: [
                  {
                    symbol: '$text'
                  },
                  {
                    symbol: '$latin'
                  }
                ]
              }
            ]
          })
          .limit(1);

        const regexSymbolMatch = collection
          .find({
            $and: [
              { removed: { $ne: true } },
              {
                type: 'stock'
              },
              {
                exchange: {
                  $in: '$exchange'
                }
              },
              {
                broker: '$broker'
              },
              {
                symbol: { $regex: '(^$text|^$latin)', $options: 'i' }
              }
            ]
          })
          .limit(20);

        const regexFullNameMatch = collection
          .find({
            $and: [
              { removed: { $ne: true } },
              {
                type: 'stock'
              },
              {
                exchange: {
                  $in: '$exchange'
                }
              },
              {
                broker: '$broker'
              },
              {
                fullName: { $regex: '($text|$latin)', $options: 'i' }
              }
            ]
          })
          .limit(20);

        return { exactSymbolMatch, regexSymbolMatch, regexFullNameMatch };
      })
        .toString()
        .split(/\r?\n/);

      lines.pop();
      lines.shift();

      return ppp.user.functions.eval(
        lines
          .join('\n')
          .replaceAll("'$exchange'", JSON.stringify(this.getExchange()))
          .replaceAll('$broker', this.getBrokerType?.() ?? '')
          .replaceAll('$text', searchText.toUpperCase())
          .replaceAll('$latin', cyrillicToLatin(searchText).toUpperCase())
      );
    }
  }
}

export default AlpacaV2PlusTrader;
