import { TRADER_DATUM } from '../const.js';
import { later } from '../later.js';
import { Trader } from './common-trader.js';
import { cyrillicToLatin } from '../intl.js';
import ppp from '../../ppp.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} BinanceTrader
 */

class BinanceTrader extends Trader {
  #idCounter = 0;

  #instruments = new Map();

  #pendingInstrumentCachePromise;

  #pendingConnection;

  // Key: widget instance; Value: [{ field, datum }] array
  subs = {
    orderbook: new Map(),
    allTrades: new Map()
  };

  // Key: instrumentId; Value: { instrument, refCount }
  // Value contains lastOrderbook for orderbook
  refs = {
    orderbook: new Map(),
    allTrades: new Map()
  };

  connection;

  async #buildInstrumentCache() {
    await this.waitForInstrumentCache();

    return (
      this.#pendingInstrumentCachePromise ??
      (this.#pendingInstrumentCachePromise = new Promise((resolve, reject) => {
        const tx = this.cacheRequest.result.transaction(
          'instruments',
          'readonly'
        );

        const store = tx.objectStore('instruments');
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = (event) => {
          const result = event.target.result;

          if (result?.value) {
            if (result.value.broker?.indexOf?.(this.getBrokerType()) > -1) {
              this.#instruments.set(result.value.symbol, result.value);
            }

            result['continue']();
          }
        };

        tx.oncomplete = () => {
          resolve(this.#instruments);
        };

        tx.onerror = () => reject();
      }))
    );
  }

  async #connectWebSocket(reconnect) {
    if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve) => {
        if (!reconnect && this.connection) {
          resolve(this.connection);
        } else {
          this.connection = new WebSocket(
            new URL(`stream`, this.document.wsUrl).toString()
          );

          this.connection.onopen = () => {
            const params = [];

            // 1. Orderbook
            for (const [instrumentId, { instrument, refCount }] of this.refs
              .orderbook) {
              if (refCount > 0) {
                params.push(
                  `${this.getSymbol(instrument).toLowerCase()}@depth20@${
                    this.document.orderbookUpdateInterval
                  }`
                );
              }
            }

            // 2. All trades
            for (const [instrumentId, { instrument, refCount }] of this.refs
              .allTrades) {
              if (refCount > 0) {
                params.push(
                  `${this.getSymbol(instrument).toLowerCase()}@aggTrade`
                );
              }
            }

            if (params.length > 0) {
              this.connection.send(
                JSON.stringify({
                  method: 'SUBSCRIBE',
                  params,
                  id: ++this.#idCounter
                })
              );
            }

            resolve(this.connection);
          };

          this.connection.onclose = async () => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));

            this.#pendingConnection = null;

            await this.#connectWebSocket(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = ({ data }) => {
            const payload = JSON.parse(data);

            if (/depth20/i.test(payload?.stream)) {
              this.onOrderbookMessage({
                orderbook: payload.data,
                instrument: this.#instruments.get(
                  payload.stream.split('@')[0].toUpperCase()
                )
              });
            } else if (/aggTrade/i.test(payload?.stream)) {
              this.onTradeMessage({
                trade: payload.data,
                instrument: this.#instruments.get(
                  payload.stream.split('@')[0].toUpperCase()
                )
              });
            }
          };
        }
      }));
    }
  }

  async onTradeMessage({ trade, instrument }) {
    if (trade && instrument) {
      for (const [source, fields] of this.subs.allTrades) {
        if (
          source.instrument?.symbol &&
          this.getSymbol(instrument) === this.getSymbol(source.instrument)
        ) {
          for (const { field, datum } of fields) {
            switch (datum) {
              case TRADER_DATUM.MARKET_PRINT:
                source[field] = {
                  orderId: trade.a,
                  side: trade.m ? 'sell' : 'buy',
                  timestamp: trade.E,
                  symbol: instrument.symbol,
                  price: parseFloat(trade.p),
                  volume: parseFloat(trade.q)
                };

                break;
            }
          }
        }
      }
    }
  }

  async onOrderbookMessage({ orderbook, instrument }) {
    if (orderbook && instrument) {
      for (const [source, fields] of this.subs.orderbook) {
        if (
          source.instrument?.symbol &&
          this.getSymbol(instrument) === this.getSymbol(source.instrument)
        ) {
          const ref = this.refs.orderbook.get(source.instrument?._id);

          if (ref) {
            const lastOrderbook = (ref.lastOrderbook = {
              bids: orderbook.bids.map((b) => {
                return {
                  price: parseFloat(b[0]),
                  volume: parseFloat(b[1])
                };
              }),
              asks: orderbook.asks.map((a) => {
                return {
                  price: parseFloat(a[0]),
                  volume: parseFloat(a[1])
                };
              })
            });

            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.ORDERBOOK:
                  source[field] = lastOrderbook;

                  break;
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
    await this.#buildInstrumentCache();
    await this.#connectWebSocket();
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
            method: 'SUBSCRIBE',
            params: [`${this.getSymbol(instrument).toLowerCase()}@aggTrade`],
            id: ++this.#idCounter
          })
        );
      } else if (refs === this.refs.orderbook) {
        this.connection.send(
          JSON.stringify({
            method: 'SUBSCRIBE',
            params: [
              `${this.getSymbol(instrument).toLowerCase()}@depth20@${
                this.document.orderbookUpdateInterval
              }`
            ],
            id: ++this.#idCounter
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
            method: 'UNSUBSCRIBE',
            params: [`${this.getSymbol(instrument).toLowerCase()}@aggTrade`],
            id: ++this.#idCounter
          })
        );
      } else if (refs === this.refs.orderbook) {
        this.connection.send(
          JSON.stringify({
            method: 'UNSUBSCRIBE',
            params: [
              `${this.getSymbol(instrument).toLowerCase()}@depth20@${
                this.document.orderbookUpdateInterval
              }`
            ],
            id: ++this.#idCounter
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
                )?.lastOrderbook;

                break;
            }
          }
        }
      }
    }
  }

  getExchange() {
    return ['binance'];
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
                type: 'cryptocurrency'
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
                type: 'cryptocurrency'
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
                type: 'cryptocurrency'
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

export default BinanceTrader;
