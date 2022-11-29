import { isJWTTokenExpired, uuidv4 } from '../ppp-crypto.js';
import { TradingError } from '../trading-error.js';
import { TRADER_DATUM } from '../const.js';
import { later } from '../later.js';
import { TraderWithSimpleSearch } from './trader-with-simple-search.js';
import { Trader } from './common-trader.js';
import { applyMixins } from '../utilities/apply-mixins.js';
import { formatPrice } from '../intl.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} AlorOpenAPIV2Trader
 */

export default applyMixins(
  class extends Trader {
    #jwt;

    #slug = uuidv4().split('-')[0];

    #counter = Date.now();

    #pendingConnection;

    #pendingJWTRequest;

    document = {};

    subs = {
      quotes: new Map(),
      orderbook: new Map(),
      allTrades: new Map()
    };

    refs = {
      quotes: new Map(),
      orderbook: new Map(),
      allTrades: new Map()
    };

    #guids = new Map();

    connection;

    constructor(document) {
      super();

      this.document = document;
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
      if (this.document.exchange === 'SPBX' && instrument.spbexSymbol)
        return instrument.spbexSymbol;
      else return instrument.symbol;
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
          orderID: order.orderNumber
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
          orderID: order.orderNumber
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

                  this.refs.quotes[instrumentId.guid] = guid;
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

                  this.refs.orderbook[instrumentId.guid] = guid;
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

                  this.refs.allTrades[instrumentId.guid] = guid;
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

              resolve(this.connection);
            };

            this.connection.onclose = async () => {
              await later(
                Math.max(this.document.reconnectTimeout ?? 1000, 1000)
              );
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
        [TRADER_DATUM.MARKET_PRINT]: [this.subs.allTrades, this.refs.allTrades]
      }[datum];
    }

    async subscribeField({ source, field, datum }) {
      await this.syncAccessToken();
      await this.#connectWebSocket();

      return super.subscribeField({ source, field, datum });
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
      }
    }

    async removeLastRef(instrument, refs, ref) {
      if (this.connection.readyState === WebSocket.OPEN) {
        this.#guids.delete(ref.guid);

        if (
          refs === this.refs.quotes ||
          refs === this.refs.orderbook ||
          refs === this.refs.allTrades
        ) {
          this.connection.send(
            JSON.stringify({
              opcode: 'unsubscribe',
              token: this.#jwt,
              guid: ref.guid
            })
          );
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

      if (/PROHIBITION_CH/i.test(message))
        return 'Заявка заблокирована биржей.';

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
  },
  TraderWithSimpleSearch
);
