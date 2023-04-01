import { isJWTTokenExpired, uuidv4 } from '../lib/ppp-crypto.js';
import { TradingError } from '../lib/ppp-errors.js';
import { TRADER_DATUM, TIMELINE_OPERATION_TYPE } from '../lib/const.js';
import { later } from '../lib/ppp-decorators.js';
import { Trader } from './common-trader.js';
import { cyrillicToLatin } from '../lib/intl.js';
import ppp from '../../ppp.js';

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

  #futures = new Map();

  positions = new Map();

  orders = new Map();

  timeline = new Map();

  // Key: widget instance; Value: [{ field, datum }] array
  subs = {
    quotes: new Map(),
    orders: new Map(),
    positions: new Map(),
    orderbook: new Map(),
    timeline: new Map(),
    allTrades: new Map()
  };

  // Key: instrumentId; Value: { instrument, refCount, guid }
  // Value contains lastQuotesData for quotes & lastOrderbookData for orderbook
  refs = {
    quotes: new Map(),
    orders: new Map(),
    positions: new Map(),
    orderbook: new Map(),
    timeline: new Map(),
    allTrades: new Map()
  };

  // Key: Alor subscription guid; Value: {instrument, reference map}
  #guids = new Map();

  connection;

  constructor(document) {
    super(document);

    if (!this.document.portfolioType) {
      this.document.portfolioType = 'stock';
    }
  }

  async ensureAccessTokenIsOk() {
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
                await this.ensureAccessTokenIsOk();

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
          await this.ensureAccessTokenIsOk();

          resolve();
        }, Math.max(this.document.reconnectTimeout ?? 1000, 1000));
      });
    }
  }

  #reqId() {
    return `${this.document.portfolio};${this.#slug}-${++this.#counter}`;
  }

  getSymbol(instrument = {}) {
    if (instrument.type === 'future')
      return instrument.fullName.split(/\s+/)[0];

    let symbol;

    if (this.document.exchange === 'SPBX' && instrument.spbxSymbol)
      symbol = instrument.spbxSymbol;
    else symbol = instrument.symbol;

    if (/~/gi.test(symbol)) symbol = symbol.split('~')[0];

    return symbol;
  }

  async placeMarketOrder({ instrument, quantity, direction }) {
    await this.ensureAccessTokenIsOk();

    const orderRequest = await fetch(
      'https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/actions/market',
      {
        method: 'POST',
        body: JSON.stringify({
          instrument: {
            symbol: this.getSymbol(instrument),
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
    await this.ensureAccessTokenIsOk();

    const orderRequest = await fetch(
      'https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/actions/limit',
      {
        method: 'POST',
        body: JSON.stringify({
          instrument: {
            symbol: this.getSymbol(instrument),
            exchange: this.document.exchange
          },
          side: direction.toLowerCase(),
          type: 'limit',
          price:
            instrument.type === 'bond'
              ? this.bondPriceToRelativeBondPrice(
                  +this.fixPrice(instrument, price),
                  instrument
                )
              : +this.fixPrice(instrument, price),
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
    await this.ensureAccessTokenIsOk();

    const qs = `format=Simple&take=${parseInt(depth)}&descending=true`;
    const request = await fetch(
      `https://api.alor.ru/md/v2/Securities/${
        this.document.exchange
      }/${encodeURIComponent(this.getSymbol(instrument))}/alltrades?${qs}`,
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
          price:
            instrument.type === 'bond'
              ? this.relativeBondPriceToPrice(t.price, instrument)
              : t.price,
          volume: t.qty
        };
      });
    else {
      throw new TradingError({
        message: await (await request).text()
      });
    }
  }

  async estimate(instrument, price, quantity) {
    await this.ensureAccessTokenIsOk();

    if (instrument.type === 'future') return {};

    const request = await fetch(
      'https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/estimate',
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.#jwt}`
        },
        body: JSON.stringify({
          portfolio: this.document.portfolio,
          ticker: this.getSymbol(instrument),
          exchange: this.document.exchange,
          price,
          lotQuantity: quantity
        })
      }
    );

    if (request.status === 200) {
      const response = await request.json();

      return {
        marginSellingPowerQuantity: response.quantityToSell,
        marginBuyingPowerQuantity: response.quantityToBuy,
        sellingPowerQuantity: response.notMarginQuantityToSell,
        buyingPowerQuantity: response.notMarginQuantityToBuy,
        commission: response.commission
      };
    } else {
      throw new TradingError({
        message: await (await request).text()
      });
    }
  }

  async modifyLimitOrders({ instrument, side, value }) {
    await this.ensureAccessTokenIsOk();

    const ordersRequest = await fetch(
      `https://api.alor.ru/md/v2/clients/${this.document.exchange}/${this.document.portfolio}/orders?format=Simple`,
      {
        headers: {
          Authorization: `Bearer ${this.#jwt}`
        }
      }
    );

    if (ordersRequest.status === 200) {
      const orders = await ordersRequest.json();

      for (const o of orders) {
        if (o.status === 'working' && o.side === side) {
          if (instrument && o.symbol !== this.getSymbol(instrument)) continue;

          let orderInstrument;

          if (this.document.portfolioType === 'futures') {
            orderInstrument = this.#futures.get(o.symbol);
          } else {
            orderInstrument = await this.findInstrumentInCache(o.symbol);
          }

          if (
            orderInstrument?.symbol ??
            orderInstrument.minPriceIncrement > 0
          ) {
            let price = +this.fixPrice(
              orderInstrument,
              o.price + orderInstrument.minPriceIncrement * value
            );

            if (orderInstrument.type === 'bond') {
              price = +(o.price + 0.01 * value).toFixed(2);
            }

            const modifyOrderRequest = await fetch(
              `https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/actions/limit/${o.id}`,
              {
                method: 'PUT',
                body: JSON.stringify({
                  instrument: {
                    symbol: this.getSymbol(orderInstrument),
                    exchange: this.document.exchange
                  },
                  side,
                  type: 'limit',
                  price,
                  quantity: o.qty - o.filled,
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

            if (modifyOrderRequest.status !== 200) {
              throw new TradingError({
                message: await (await modifyOrderRequest).text()
              });
            }
          }
        }
      }
    } else {
      throw new TradingError({
        message: await (await ordersRequest).text()
      });
    }
  }

  async cancelLimitOrder(order) {
    if (order.orderType === 'limit') {
      await this.ensureAccessTokenIsOk();

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

  async cancelAllLimitOrders({ instrument }) {
    await this.ensureAccessTokenIsOk();

    const request = await fetch(
      `https://api.alor.ru/md/v2/clients/${this.document.exchange}/${this.document.portfolio}/orders?format=Simple`,
      {
        headers: {
          Authorization: `Bearer ${this.#jwt}`
        }
      }
    );

    if (request.status === 200) {
      const orders = await request.json();

      for (const o of orders) {
        if (o.status === 'working') {
          if (instrument && o.symbol !== this.getSymbol(instrument)) continue;

          o.orderType = o.type;
          o.orderId = o.id;

          await this.cancelLimitOrder(o);
        }
      }
    } else {
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

                this.refs.quotes.get(instrumentId).guid = guid;
                this.#guids.set(guid, {
                  instrument,
                  refs: this.refs.quotes
                });

                this.connection.send(
                  JSON.stringify({
                    opcode: 'QuotesSubscribe',
                    code: this.getSymbol(instrument),
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
                    code: this.getSymbol(instrument),
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
                    code: this.getSymbol(instrument),
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

            // 6. Timeline
            for (const [instrumentId, { instrument, refCount }] of this.refs
              .timeline) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.timeline.get(instrumentId).guid = guid;
                this.#guids.set(guid, {
                  instrument,
                  refs: this.refs.timeline
                });

                this.connection.send(
                  JSON.stringify({
                    opcode: 'TradesGetAndSubscribeV2',
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
            await this.ensureAccessTokenIsOk();

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
            } else if (payload.data && refs === this.refs.timeline) {
              return this.onTimelineMessage({ data: payload.data });
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
      [TRADER_DATUM.CURRENT_ORDER]: [this.subs.orders, this.refs.orders],
      [TRADER_DATUM.TIMELINE_ITEM]: [this.subs.timeline, this.refs.timeline]
    }[datum];
  }

  async subscribeField({ source, field, datum }) {
    await this.ensureAccessTokenIsOk();
    await this.#connectWebSocket();
    await super.subscribeField({ source, field, datum });

    // Broadcast data for instrument-agnostic global datum subscriptions.
    switch (datum) {
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.POSITION_SIZE:
      case TRADER_DATUM.POSITION_AVERAGE: {
        for (const [_, data] of this.positions) {
          await this.onPositionsMessage({
            data,
            fromCache: true
          });
        }

        break;
      }
      case TRADER_DATUM.CURRENT_ORDER: {
        for (const [_, data] of this.orders) {
          await this.onOrdersMessage({
            data,
            fromCache: true
          });
        }

        break;
      }
      case TRADER_DATUM.TIMELINE_ITEM: {
        for (const [_, data] of this.timeline) {
          await this.onTimelineMessage({
            data,
            fromCache: true
          });
        }

        break;
      }
    }
  }

  async unsubscribeField({ source, field, datum }) {
    await this.ensureAccessTokenIsOk();

    return super.unsubscribeField({ source, field, datum });
  }

  async addFirstRef(instrument, refs) {
    if (this.connection.readyState === WebSocket.OPEN) {
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
            code: this.getSymbol(instrument),
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
            code: this.getSymbol(instrument),
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
            code: this.getSymbol(instrument),
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
      } else if (refs === this.refs.timeline) {
        this.timeline.clear();

        this.connection.send(
          JSON.stringify({
            opcode: 'TradesGetAndSubscribeV2',
            portfolio: this.document.portfolio,
            exchange: this.document.exchange,
            format: 'Simple',
            token: this.#jwt,
            guid
          })
        );
      }
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
        refs === this.refs.orders ||
        refs === this.refs.timeline
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

      if (refs === this.refs.timeline) {
        this.timeline.clear();
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await this.ensureAccessTokenIsOk();
    await super.instrumentChanged(source, oldValue, newValue);

    if (newValue?._id) {
      // Handle no real subscription case for quotes and orderbook.
      // Use saved snapshot data for new widgets.
      // Time and sales uses allTrades REST API call,
      // so no special handling needed.
      this.onQuotesMessage({
        data: this.refs.quotes.get(newValue._id)?.lastQuotesData
      });

      this.onOrderbookMessage({
        data: this.refs.orderbook.get(newValue._id)?.lastOrderbookData
      });
    }

    // Broadcast positions for order widgets (at least).
    if (this.subs.positions.has(source)) {
      for (const [symbol, data] of this.positions) {
        await this.onPositionsMessage({
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
        if (instrument.type === 'bond') {
          data.bids = data.bids.map((b) => {
            if (b.processed) return b;

            return {
              price: this.relativeBondPriceToPrice(b.price, instrument),
              volume: b.volume,
              processed: true
            };
          });

          data.asks = data.asks.map((a) => {
            if (a.processed) return a;

            return {
              price: this.relativeBondPriceToPrice(a.price, instrument),
              volume: a.volume,
              processed: true
            };
          });
        }

        for (const [source, fields] of this.subs.orderbook) {
          if (instrument._id === source.instrument?._id) {
            const ref = this.refs.orderbook.get(source.instrument?._id);

            if (ref) {
              ref.lastOrderbookData = data;

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
  }

  onQuotesMessage({ data }) {
    if (data) {
      const instrument = this.#guids.get(data.guid)?.instrument;

      if (instrument) {
        for (const [source, fields] of this.subs.quotes) {
          if (instrument._id === source.instrument?._id) {
            const ref = this.refs.quotes.get(source.instrument?._id);

            if (ref) ref.lastQuotesData = data;

            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.LAST_PRICE:
                  source[field] = data.last_price;

                  if (instrument.type === 'bond') {
                    source[field] = this.relativeBondPriceToPrice(
                      data.last_price,
                      instrument
                    );
                  }

                  break;
                case TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE:
                  source[field] = data.change;

                  if (instrument.type === 'bond') {
                    source[field] = this.relativeBondPriceToPrice(
                      data.change,
                      instrument
                    );
                  }

                  break;
                case TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE:
                  source[field] = data.change_percent;

                  break;
                case TRADER_DATUM.BEST_BID:
                  source[field] = data.bid;

                  if (instrument.type === 'bond') {
                    source[field] = this.relativeBondPriceToPrice(
                      data.bid,
                      instrument
                    );
                  }

                  break;
                case TRADER_DATUM.BEST_ASK:
                  source[field] = data.ask;

                  if (instrument.type === 'bond') {
                    source[field] = this.relativeBondPriceToPrice(
                      data.ask,
                      instrument
                    );
                  }

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
                    timestamp: data.timestamp,
                    symbol: data.symbol,
                    price:
                      instrument.type === 'bond'
                        ? this.relativeBondPriceToPrice(data.price, instrument)
                        : data.price,
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

  async onPositionsMessage({ data, fromCache }) {
    if (data) {
      if (!fromCache) this.positions.set(data.symbol, data);

      for (const [source, fields] of this.subs.positions) {
        for (const { field, datum } of fields) {
          if (datum === TRADER_DATUM.POSITION) {
            const isBalance =
              data.isCurrency && this.document.portfolioType !== 'currency';

            const payload = {
              symbol: data.symbol,
              lot: data.lotSize,
              exchange: data.exchange,
              averagePrice: data.avgPrice,
              isCurrency: data.isCurrency,
              isBalance,
              size: data.qty,
              accountId: data.portfolio,
              dailyUnrealizedProfit: '—',
              unrealizedProfit: '—'
            };

            if (isBalance) {
              source[field] = payload;
            } else {
              if (this.document.portfolioType === 'futures') {
                payload.instrument = this.#futures.get(data.symbol);
              } else {
                payload.instrument = await this.findInstrumentInCache(
                  data.symbol
                );
              }

              if (payload.instrument?.type === 'bond') {
                payload.averagePrice = this.relativeBondPriceToPrice(
                  payload.averagePrice,
                  payload.instrument
                );
              }

              source[field] = payload;
            }
          } else if (data.symbol === this.getSymbol(source.instrument)) {
            switch (datum) {
              case TRADER_DATUM.POSITION_SIZE:
                source[field] = data.qty;

                break;
              case TRADER_DATUM.POSITION_AVERAGE:
                source[field] = data.avgPrice;

                if (source.instrument.type === 'bond') {
                  source[field] = this.relativeBondPriceToPrice(
                    data.avgPrice,
                    source.instrument
                  );
                }

                break;
            }
          }
        }
      }
    }
  }

  async onOrdersMessage({ data, fromCache }) {
    if (data) {
      if (!fromCache) this.orders.set(data.id, data);

      for (const [source, fields] of this.subs.orders) {
        for (const { field, datum } of fields) {
          if (datum === TRADER_DATUM.CURRENT_ORDER) {
            const payload = {
              orderId: data.id,
              symbol: data.symbol,
              exchange: [data.exchange],
              orderType: data.type,
              side: data.side,
              status: data.status,
              placedAt: data.transTime,
              endsAt: data.endTime,
              quantity: data.qty,
              filled: data.filled,
              price: data.price
            };

            if (this.document.portfolioType === 'futures') {
              payload.instrument = this.#futures.get(data.symbol);
            } else {
              payload.instrument = await this.findInstrumentInCache(
                data.symbol
              );
            }

            if (payload.instrument?.type === 'bond') {
              payload.price = this.relativeBondPriceToPrice(
                payload.price,
                payload.instrument
              );
            }

            source[field] = payload;
          }
        }
      }
    }
  }

  async onTimelineMessage({ data, fromCache }) {
    if (data) {
      if (!fromCache) this.timeline.set(data.id, data);

      for (const [source, fields] of this.subs.timeline) {
        for (const { field, datum } of fields) {
          if (datum === TRADER_DATUM.TIMELINE_ITEM) {
            const payload = {
              operationId: data.id,
              accruedInterest: data.accruedInt,
              commission: data.commission,
              parentId: data.orderno,
              symbol: data.symbol,
              type:
                data.side === 'buy'
                  ? TIMELINE_OPERATION_TYPE.BUY
                  : TIMELINE_OPERATION_TYPE.SELL,
              exchange: data.exchange,
              quantity: data.qty,
              price: data.price,
              createdAt: data.date
            };

            if (this.document.portfolioType === 'futures') {
              payload.instrument = this.#futures.get(data.symbol);
            } else {
              payload.instrument = await this.findInstrumentInCache(
                data.symbol
              );
            }

            if (payload.instrument?.type === 'bond') {
              payload.price = this.relativeBondPriceToPrice(
                payload.price,
                payload.instrument
              );
            }

            source[field] = payload;
          }
        }
      }
    }
  }

  getExchange() {
    return this.document.exchange;
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

    if (/Неизвестный инструмент в заявке/i.test(message))
      return 'Неизвестный инструмент в заявке.';

    if (/Нехватка средств по лимитам клиента/i.test(message))
      return 'Нехватка средств по лимитам клиента.';

    return 'Неизвестная ошибка, смотрите консоль браузера.';
  }
}

export default AlorOpenAPIV2Trader;
