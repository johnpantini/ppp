/** @decorator */

import { isJWTTokenExpired, uuidv4 } from '../ppp-crypto.js';
import { TradingError } from '../trading-error.js';
import { BROKERS, TRADER_DATUM } from '../const.js';
import { later } from '../later.js';
import { TraderWithSimpleSearch } from './trader-with-simple-search.js';
import { Trader } from './common-trader.js';
import { applyMixins } from '../utilities/apply-mixins.js';
import { formatPrice } from '../intl.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} AlorOpenAPIV2Trader
 */

class AlorOpenAPIV2Trader extends Trader {
  #jwt;

  #slug = uuidv4().split('-')[0];

  #counter = Date.now();

  #pendingConnection;

  #pendingJWTRequest;

  #cacheRequest;

  #cacheRequestPendingSuccess;

  document = {};

  positions = new Map();

  orders = new Map();

  subs = {
    quotes: new Map(),
    orders: new Map(),
    positions: new Map(),
    orderbook: new Map(),
    allTrades: new Map()
  };

  refs = {
    quotes: new Map(),
    orders: new Map(),
    positions: new Map(),
    orderbook: new Map(),
    allTrades: new Map()
  };

  // Key: Alor subscription guid; Value: {instrument, reference map}
  #guids = new Map();

  connection;

  constructor(document) {
    super();

    this.document = document;
    this.#cacheRequest = indexedDB.open('ppp', 1);
    this.#cacheRequestPendingSuccess = new Promise((resolve, reject) => {
      this.#cacheRequest.onupgradeneeded = () => {
        const db = this.#cacheRequest.result;

        if (!db.objectStoreNames.contains('instruments')) {
          db.createObjectStore('instruments', { keyPath: 'symbol' });
        }

        db.onerror = (event) => {
          console.error(event.target.error);
          reject(event.target.error);
        };
      };

      this.#cacheRequest.onsuccess = () => resolve(this.#cacheRequest.result);
    });
  }

  async syncAccessToken() {
    try {
      if (isJWTTokenExpired(this.#jwt)) this.#jwt = void 0;

      if (this.#jwt) return;

      if (this.#pendingJWTRequest) {
        await this.#pendingJWTRequest;
      } else {
        this.#pendingJWTRequest = fetch(
          `https://oauth.alor.ru/refresh?token=${this.document.broker.refreshToken}`,
          {
            method: 'POST'
          }
        )
          .then((request) => request.json())
          .then(({ AccessToken }) => {
            this.#jwt = AccessToken;
            this.#pendingJWTRequest = null;
          })
          .catch((e) => {
            console.error(e);

            this.#pendingJWTRequest = null;

            return new Promise((resolve) => {
              setTimeout(async () => {
                await this.syncAccessToken();

                resolve();
              }, Math.max(this.document.reconnectTimeout ?? 1000, 1000));
            });
          });

        await this.#pendingJWTRequest;
      }
    } catch (e) {
      console.error(e);

      this.#pendingJWTRequest = null;

      return new Promise((resolve) => {
        setTimeout(async () => {
          await this.syncAccessToken();

          resolve();
        }, Math.max(this.document.reconnectTimeout ?? 1000, 1000));
      });
    }
  }

  #reqId() {
    return `${this.document.portfolio};${this.#slug}-${++this.#counter}`;
  }

  #getSymbol(instrument = {}) {
    let symbol;

    if (this.document.exchange === 'SPBX' && instrument.spbexSymbol)
      symbol = instrument.spbexSymbol;
    else symbol = instrument.symbol;

    if (/~/gi.test(symbol)) symbol = symbol.split('~')[0];

    return symbol;
  }

  async placeMarketOrder({ instrument, quantity, direction }) {
    await this.syncAccessToken();

    const orderRequest = await fetch(
      'https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/actions/market',
      {
        method: 'POST',
        body: JSON.stringify({
          instrument: {
            symbol: this.#getSymbol(instrument),
            exchange: this.document.exchange
          },
          side: direction.toLowerCase(),
          type: 'market',
          quantity,
          user: {
            portfolio: this.document.portfolio
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-ALOR-REQID': this.#reqId(),
          Authorization: `Bearer ${this.#jwt}`
        }
      }
    );
    const order = await orderRequest.json();

    if (order.message === 'success') {
      return {
        orderId: order.orderNumber
      };
    } else {
      throw new TradingError({
        message: order.message
      });
    }
  }

  /**
   *
   * @param instrument
   * @param price
   * @param quantity
   * @param direction
   */
  async placeLimitOrder({ instrument, price, quantity, direction }) {
    await this.syncAccessToken();

    const orderRequest = await fetch(
      'https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/actions/limit',
      {
        method: 'POST',
        body: JSON.stringify({
          instrument: {
            symbol: this.#getSymbol(instrument),
            exchange: this.document.exchange
          },
          side: direction.toLowerCase(),
          type: 'limit',
          price: this.fixPrice(instrument, price),
          quantity,
          user: {
            portfolio: this.document.portfolio
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-ALOR-REQID': this.#reqId(),
          Authorization: `Bearer ${this.#jwt}`
        }
      }
    );
    const order = await orderRequest.json();

    if (order.message === 'success') {
      return {
        orderId: order.orderNumber
      };
    } else {
      throw new TradingError({
        message: order.message
      });
    }
  }

  async allTrades({ instrument, depth }) {
    await this.syncAccessToken();

    const qs = `format=Simple&take=${parseInt(depth)}&descending=true`;
    const request = await fetch(
      `https://api.alor.ru/md/v2/Securities/${
        this.document.exchange
      }/${encodeURIComponent(this.#getSymbol(instrument))}/alltrades?${qs}`,
      {
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${this.#jwt}`
        }
      }
    );

    if (request.status === 200)
      return (await request.json())?.map((t) => {
        return {
          orderId: t.id,
          side: t.side,
          time: t.time,
          timestamp: t.timestamp,
          symbol: t.symbol,
          price: t.price,
          volume: t.qty
        };
      });
    else {
      throw new TradingError({
        message: await (await request).text()
      });
    }
  }

  async cancelOrder(order) {
    if (order.orderType === 'limit') {
      await this.syncAccessToken();

      const qs = `portfolio=${this.document.portfolio}&exchange=${this.document.exchange}&stop=false&format=Simple`;
      const request = await fetch(
        `https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/${order.orderId}?${qs}`,
        {
          method: 'DELETE',
          cache: 'no-cache',
          headers: {
            Authorization: `Bearer ${this.#jwt}`
          }
        }
      );

      if (request.status === 200)
        return {
          orderId: order.orderId
        };
      else {
        throw new TradingError({
          message: await (await request).text()
        });
      }
    }
  }

  async cancelAllLimitOrders() {
    await this.syncAccessToken();
  }

  async #connectWebSocket(reconnect) {
    if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve) => {
        if (!reconnect && this.connection) {
          resolve(this.connection);
        } else {
          this.connection = new WebSocket('wss://api.alor.ru/ws');

          this.connection.onopen = () => {
            // 1. Quotes
            for (const [instrumentId, { instrument, refCount }] of this.refs
              .quotes) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.quotes.get(instrumentId).guid = guid;
                this.#guids.set(guid, {
                  instrument,
                  refs: this.refs.quotes
                });

                this.connection.send(
                  JSON.stringify({
                    opcode: 'QuotesSubscribe',
                    code: this.#getSymbol(instrument),
                    exchange: this.document.exchange,
                    format: 'Simple',
                    guid,
                    token: this.#jwt
                  })
                );
              }
            }

            // 2. Orderbook
            for (const [instrumentId, { instrument, refCount }] of this.refs
              .orderbook) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.orderbook.get(instrumentId).guid = guid;
                this.#guids.set(guid, {
                  instrument,
                  refs: this.refs.orderbook
                });

                this.connection.send(
                  JSON.stringify({
                    opcode: 'OrderBookGetAndSubscribe',
                    code: this.#getSymbol(instrument),
                    exchange: this.document.exchange,
                    depth: 20,
                    format: 'Simple',
                    token: this.#jwt,
                    guid
                  })
                );
              }
            }

            // 3. All trades
            for (const [instrumentId, { instrument, refCount }] of this.refs
              .allTrades) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.allTrades.get(instrumentId).guid = guid;
                this.#guids.set(guid, {
                  instrument,
                  refs: this.refs.allTrades
                });

                this.connection.send(
                  JSON.stringify({
                    opcode: 'AllTradesGetAndSubscribe',
                    code: this.#getSymbol(instrument),
                    exchange: this.document.exchange,
                    depth: 0,
                    format: 'Simple',
                    token: this.#jwt,
                    guid
                  })
                );
              }
            }

            // 4. Positions
            this.positions.clear();

            for (const [instrumentId, { instrument, refCount }] of this.refs
              .positions) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.positions.get(instrumentId).guid = guid;
                this.#guids.set(guid, {
                  instrument,
                  refs: this.refs.positions
                });

                this.connection.send(
                  JSON.stringify({
                    opcode: 'PositionsGetAndSubscribeV2',
                    portfolio: this.document.portfolio,
                    exchange: this.document.exchange,
                    format: 'Simple',
                    token: this.#jwt,
                    guid
                  })
                );
              }
            }

            // 5. Current orders
            for (const [instrumentId, { instrument, refCount }] of this.refs
              .orders) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.orders.get(instrumentId).guid = guid;
                this.#guids.set(guid, {
                  instrument,
                  refs: this.refs.orders
                });

                this.connection.send(
                  JSON.stringify({
                    opcode: 'OrdersGetAndSubscribeV2',
                    portfolio: this.document.portfolio,
                    exchange: this.document.exchange,
                    format: 'Simple',
                    token: this.#jwt,
                    guid
                  })
                );
              }
            }

            resolve(this.connection);
          };

          this.connection.onclose = async () => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));
            await this.syncAccessToken();

            this.#pendingConnection = null;

            await this.#connectWebSocket(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = ({ data }) => {
            const payload = JSON.parse(data);
            const refs = this.#guids.get(payload.guid)?.refs;

            if (payload.data) {
              payload.data.guid = payload.guid;
            }

            if (payload.data && refs === this.refs.quotes) {
              return this.onQuotesMessage({ data: payload.data });
            } else if (payload.data && refs === this.refs.orderbook) {
              return this.onOrderbookMessage({ data: payload.data });
            } else if (payload.data && refs === this.refs.allTrades) {
              return this.onAllTradesMessage({ data: payload.data });
            } else if (payload.data && refs === this.refs.positions) {
              return this.onPositionsMessage({ data: payload.data });
            } else if (payload.data && refs === this.refs.orders) {
              return this.onOrdersMessage({ data: payload.data });
            }
          };
        }
      }));
    }
  }

  subsAndRefs(datum) {
    return {
      [TRADER_DATUM.LAST_PRICE]: [this.subs.quotes, this.refs.quotes],
      [TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE]: [
        this.subs.quotes,
        this.refs.quotes
      ],
      [TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE]: [
        this.subs.quotes,
        this.refs.quotes
      ],
      [TRADER_DATUM.BEST_BID]: [this.subs.quotes, this.refs.quotes],
      [TRADER_DATUM.BEST_ASK]: [this.subs.quotes, this.refs.quotes],
      [TRADER_DATUM.ORDERBOOK]: [this.subs.orderbook, this.refs.orderbook],
      [TRADER_DATUM.MARKET_PRINT]: [this.subs.allTrades, this.refs.allTrades],
      [TRADER_DATUM.POSITION]: [this.subs.positions, this.refs.positions],
      [TRADER_DATUM.POSITION_SIZE]: [this.subs.positions, this.refs.positions],
      [TRADER_DATUM.POSITION_AVERAGE]: [
        this.subs.positions,
        this.refs.positions
      ],
      [TRADER_DATUM.CURRENT_ORDER]: [this.subs.orders, this.refs.orders]
    }[datum];
  }

  async subscribeField({ source, field, datum }) {
    await this.syncAccessToken();
    await this.#connectWebSocket();
    await super.subscribeField({ source, field, datum });

    if (
      datum === TRADER_DATUM.POSITION ||
      datum === TRADER_DATUM.CURRENT_ORDER
    ) {
      await this.#cacheRequestPendingSuccess;
    }

    switch (datum) {
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.POSITION_SIZE:
      case TRADER_DATUM.POSITION_AVERAGE: {
        for (const [symbol, data] of this.positions) {
          this.onPositionsMessage({
            data,
            fromCache: true
          });
        }

        break;
      }
      case TRADER_DATUM.CURRENT_ORDER: {
        for (const [symbol, data] of this.orders) {
          this.onOrdersMessage({
            data,
            fromCache: true
          });
        }

        break;
      }
    }
  }

  async unsubscribeField({ source, field, datum }) {
    await this.syncAccessToken();

    return super.unsubscribeField({ source, field, datum });
  }

  async addFirstRef(instrument, refs, ref) {
    const guid = this.#reqId();

    this.#guids.set(guid, {
      instrument,
      refs
    });

    refs.set(instrument._id, {
      refCount: 1,
      guid,
      instrument
    });

    if (refs === this.refs.quotes) {
      this.connection.send(
        JSON.stringify({
          opcode: 'QuotesSubscribe',
          code: this.#getSymbol(instrument),
          exchange: this.document.exchange,
          format: 'Simple',
          token: this.#jwt,
          guid
        })
      );
    } else if (refs === this.refs.orderbook) {
      this.connection.send(
        JSON.stringify({
          opcode: 'OrderBookGetAndSubscribe',
          code: this.#getSymbol(instrument),
          exchange: this.document.exchange,
          depth: 20,
          format: 'Simple',
          token: this.#jwt,
          guid
        })
      );
    } else if (refs === this.refs.allTrades) {
      this.connection.send(
        JSON.stringify({
          opcode: 'AllTradesGetAndSubscribe',
          code: this.#getSymbol(instrument),
          exchange: this.document.exchange,
          depth: 0,
          format: 'Simple',
          token: this.#jwt,
          guid
        })
      );
    } else if (refs === this.refs.positions) {
      this.positions.clear();

      this.connection.send(
        JSON.stringify({
          opcode: 'PositionsGetAndSubscribeV2',
          portfolio: this.document.portfolio,
          exchange: this.document.exchange,
          format: 'Simple',
          token: this.#jwt,
          guid
        })
      );
    } else if (refs === this.refs.orders) {
      this.orders.clear();

      this.connection.send(
        JSON.stringify({
          opcode: 'OrdersGetAndSubscribeV2',
          portfolio: this.document.portfolio,
          exchange: this.document.exchange,
          format: 'Simple',
          token: this.#jwt,
          guid
        })
      );
    }
  }

  async removeLastRef(instrument, refs, ref) {
    if (this.connection.readyState === WebSocket.OPEN) {
      this.#guids.delete(ref.guid);

      if (
        refs === this.refs.quotes ||
        refs === this.refs.orderbook ||
        refs === this.refs.allTrades ||
        refs === this.refs.positions ||
        refs === this.refs.orders
      ) {
        this.connection.send(
          JSON.stringify({
            opcode: 'unsubscribe',
            token: this.#jwt,
            guid: ref.guid
          })
        );
      }

      if (refs === this.refs.positions) {
        this.positions.clear();
      }

      if (refs === this.refs.orders) {
        this.orders.clear();
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await this.syncAccessToken();
    await super.instrumentChanged(source, oldValue, newValue);

    if (newValue?._id) {
      // Handle no real subscription case
      this.onQuotesMessage({
        data: this.refs.quotes.get(newValue._id)?.lastData
      });

      this.onOrderbookMessage({
        data: this.refs.orderbook.get(newValue._id)?.lastData
      });
    }

    // Broadcast positions for order widgets (at least).
    if (this.subs.positions.has(source)) {
      for (const [symbol, data] of this.positions) {
        this.onPositionsMessage({
          data,
          fromCache: true
        });
      }
    }
  }

  onOrderbookMessage({ data }) {
    if (data) {
      const instrument = this.#guids.get(data.guid)?.instrument;

      if (instrument) {
        for (const [source, fields] of this.subs.orderbook) {
          if (instrument._id === source.instrument?._id) {
            const ref = this.refs.orderbook.get(source.instrument?._id);

            if (ref) ref.lastData = data;

            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.ORDERBOOK:
                  source[field] = {
                    bids: data.bids,
                    asks: data.asks
                  };

                  break;
              }
            }
          }
        }
      }
    }
  }

  onQuotesMessage({ data }) {
    if (data) {
      const instrument = this.#guids.get(data.guid)?.instrument;

      if (instrument) {
        for (const [source, fields] of this.subs.quotes) {
          if (instrument._id === source.instrument?._id) {
            const ref = this.refs.quotes.get(source.instrument?._id);

            if (ref) ref.lastData = data;

            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.LAST_PRICE:
                  source[field] = data.last_price;

                  break;
                case TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE:
                  source[field] = data.change;

                  break;
                case TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE:
                  source[field] = data.change_percent;

                  break;
                case TRADER_DATUM.BEST_BID:
                  source[field] = data.bid;

                  break;
                case TRADER_DATUM.BEST_ASK:
                  source[field] = data.ask;

                  break;
              }
            }
          }
        }
      }
    }
  }

  onAllTradesMessage({ data }) {
    if (data) {
      const instrument = this.#guids.get(data.guid)?.instrument;

      if (instrument) {
        for (const [source, fields] of this.subs.allTrades) {
          if (instrument._id === source.instrument?._id) {
            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.MARKET_PRINT:
                  source[field] = {
                    orderId: data.id,
                    side: data.side,
                    time: data.time,
                    timestamp: data.timestamp,
                    symbol: data.symbol,
                    price: data.price,
                    volume: data.qty
                  };

                  break;
              }
            }
          }
        }
      }
    }
  }

  #findInstrumentInCacheAndPutToPayload(symbol, source, field, payload) {
    const tx = this.#cacheRequest.result.transaction('instruments', 'readonly');
    const store = tx.objectStore('instruments');
    const storeRequest = store.get(symbol);

    storeRequest.onsuccess = (event) => {
      if (event.target.result) {
        const instrument = event.target.result;

        if (
          instrument.exchange?.indexOf(
            this.getExchange(this.document.exchange)
          ) > -1
        ) {
          payload.instrument = instrument;
          source[field] = payload;
        } else {
          // Try with suffix
          const symbolWithSuffix = `${symbol}~${this.document.exchange}`;
          const storeRequestWithSuffix = store.get(symbolWithSuffix);

          storeRequestWithSuffix.onsuccess = (eventWithSuffix) => {
            if (eventWithSuffix.target.result) {
              payload.instrument = eventWithSuffix.target.result;
              source[field] = payload;
            } else {
              payload.instrument = {
                symbol: symbolWithSuffix
              };
              source[field] = payload;
            }
          };

          storeRequestWithSuffix.onerror = (eventWithSuffix) => {
            console.error(eventWithSuffix.target.error);

            payload.instrument = {
              symbol: symbolWithSuffix
            };
            source[field] = payload;

            this.onError?.(eventWithSuffix.target.error);
          };
        }
      } else {
        payload.instrument = {
          symbol
        };
        source[field] = payload;
      }
    };

    storeRequest.onerror = (event) => {
      console.error(event.target.error);

      payload.instrument = {
        symbol
      };
      source[field] = payload;

      this.onError?.(event.target.error);
    };
  }

  onPositionsMessage({ data, fromCache }) {
    if (data) {
      if (!fromCache) this.positions.set(data.symbol, data);

      for (const [source, fields] of this.subs.positions) {
        for (const { field, datum } of fields) {
          if (datum === TRADER_DATUM.POSITION) {
            const isBalance =
              data.isCurrency && !this.document.portfolio.startsWith('G');

            const payload = {
              symbol: data.symbol,
              lot: data.lotSize,
              exchange: data.exchange,
              averagePrice: data.avgPrice,
              isCurrency: data.isCurrency,
              isBalance,
              size: data.qty,
              accountId: data.portfolio,
              dailyUnrealizedProfit: data.dailyUnrealisedPl,
              unrealizedProfit: data.unrealisedPl
            };

            if (isBalance) {
              source[field] = payload;
            } else {
              this.#findInstrumentInCacheAndPutToPayload(
                data.symbol,
                source,
                field,
                payload
              );
            }
          } else if (data.symbol === this.#getSymbol(source.instrument)) {
            switch (datum) {
              case TRADER_DATUM.POSITION_SIZE:
                source[field] = data.qty;

                break;
              case TRADER_DATUM.POSITION_AVERAGE:
                source[field] = data.avgPrice;

                break;
            }
          }
        }
      }
    }
  }

  onOrdersMessage({ data, fromCache }) {
    if (data) {
      if (!fromCache) this.orders.set(data.symbol, data);

      for (const [source, fields] of this.subs.orders) {
        for (const { field, datum } of fields) {
          if (datum === TRADER_DATUM.CURRENT_ORDER) {
            const payload = {
              orderId: data.id,
              symbol: data.symbol,
              exchange: data.exchange,
              orderType: data.type,
              side: data.side,
              status: data.status,
              placedAt: data.transTime,
              endsAt: data.endTime,
              quantity: data.qty,
              filled: data.filled,
              price: data.price
            };

            this.#findInstrumentInCacheAndPutToPayload(
              data.symbol,
              source,
              field,
              payload
            );
          }
        }
      }
    }
  }

  getExchange() {
    switch (this.document.exchange) {
      case 'SPBX':
        return 'spbex';
      case 'MOEX':
        return 'moex';
      default:
        return '';
    }
  }

  getBroker() {
    return BROKERS.ALOR_OPENAPI_V2;
  }

  async formatError(instrument, error) {
    const message = error.message;

    if (/Invalid quantity/i.test(message) || /BAD_AMOUNT/i.test(message))
      return 'Указано неверное количество.';

    if (
      /(HALT_INSTRUMENT|INSTR_NOTRADE)/i.test(message) ||
      /Security is in break period/i.test(message) ||
      /Security is not currently trading/i.test(message)
    )
      return 'Инструмент сейчас не торгуется.';

    if (/BAD_FLAGS/i.test(message)) return 'Ошибка параметров заявки.';

    if (/Provided json can't be properly deserialised/i.test(message))
      return 'Неверная цена или количество.';

    if (/BAD_PRICE_LIMITS/i.test(message))
      return 'Цена вне лимитов по инструменту.';

    if (/PROHIBITION_CH/i.test(message)) return 'Заявка заблокирована биржей.';

    if (/Order was canceled before it was posted/i.test(message))
      return 'Заявка была отменена биржей.';

    if (/Command Timeout/i.test(message))
      return 'Время ожидания ответа истекло. Торги не проводятся?';

    let match = message.match(/can not be less than ([0-9.]+)/i)?.[1];

    if (match) {
      return `Для этого инструмента цена не может быть ниже ${formatPrice(
        +match,
        instrument
      )}`;
    }

    match = message.match(/can not be greater than ([0-9.]+)/i)?.[1];

    if (match) {
      return `Для этого инструмента цена не может быть выше ${formatPrice(
        +match,
        instrument
      )}`;
    }

    match = message.match(/Minimum price step: ([0-9.]+)/i)?.[1];

    if (match) {
      return `Минимальный шаг цены ${formatPrice(+match, instrument)}`;
    }

    if (/Заявка/i.test(message))
      return message.endsWith('.') ? message : message + '.';

    return 'Неизвестная ошибка, смотрите консоль браузера.';
  }
}

export default applyMixins(AlorOpenAPIV2Trader, TraderWithSimpleSearch);
