import { isJWTTokenExpired, uuidv4 } from '../lib/ppp-crypto.js';
import { TradingError } from '../lib/ppp-errors.js';
import {
  TRADER_DATUM,
  EXCHANGE,
  BROKERS,
  INSTRUMENT_DICTIONARY
} from '../lib/const.js';
import { OperationType } from '../vendor/tinkoff/definitions/operations.js';
import { later } from '../lib/ppp-decorators.js';
import { Trader } from './common-trader.js';
import { formatPrice } from '../lib/intl.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} AlorOpenAPIV2Trader
 */

class AlorOpenAPIV2Trader extends Trader {
  #jwt;

  #pendingJWTRequest;

  #pendingConnection;

  connection;

  #slug = uuidv4().split('-')[0];

  #counter = Date.now();

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

  // Key: instrument symbol; Value: { instrument, refCount, guid }
  // Value contains lastQuotesData for quotes & lastOrderbook for orderbook
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

  constructor(document) {
    super(document);

    if (!this.document.portfolioType) {
      this.document.portfolioType = 'stock';
    }
  }

  onCacheInstrument(instrument) {
    this.#futures.set(
      instrument.fullName.split(/\s+/)[0].toUpperCase(),
      instrument
    );
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
            this.#pendingJWTRequest = void 0;
          })
          .catch((e) => {
            console.error(e);

            this.#pendingJWTRequest = void 0;

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

      this.#pendingJWTRequest = void 0;

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

    if (
      instrument?.currency === 'USD' &&
      instrument?.symbol === 'SPB' &&
      this.document.exchange === EXCHANGE.SPBX
    ) {
      return 'SPB@US';
    }

    let symbol = instrument.symbol;

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
        if (o.status === 'working' && (o.side === side || side === 'all')) {
          if (instrument && o.symbol !== this.getSymbol(instrument)) continue;

          let orderInstrument;

          if (this.document.portfolioType === 'futures') {
            orderInstrument = this.#futures.get(o.symbol);
          } else {
            orderInstrument = this.instruments.get(o.symbol);
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
                  side: o.side,
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

  async cancelAllLimitOrders({ instrument, filter } = {}) {
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

          if (filter === 'buy' && o.side !== 'buy') {
            continue;
          }

          if (filter === 'sell' && o.side !== 'sell') {
            continue;
          }

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
            for (const [instrumentSymbol, { instrument, refCount }] of this.refs
              .quotes) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.quotes.get(instrumentSymbol).guid = guid;
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
            for (const [instrumentSymbol, { instrument, refCount }] of this.refs
              .orderbook) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.orderbook.get(instrumentSymbol).guid = guid;
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
            for (const [instrumentSymbol, { instrument, refCount }] of this.refs
              .allTrades) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.allTrades.get(instrumentSymbol).guid = guid;
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

            for (const [instrumentSymbol, { instrument, refCount }] of this.refs
              .positions) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.positions.get(instrumentSymbol).guid = guid;
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
            for (const [instrumentSymbol, { instrument, refCount }] of this.refs
              .orders) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.orders.get(instrumentSymbol).guid = guid;
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
            for (const [instrumentSymbol, { instrument, refCount }] of this.refs
              .timeline) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.timeline.get(instrumentSymbol).guid = guid;
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

            this.#pendingConnection = void 0;

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

  async subscribeField({ source, field, datum, condition }) {
    await this.ensureAccessTokenIsOk();
    await this.#connectWebSocket();
    await super.subscribeField({ source, field, datum, condition });

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
          this.onOrdersMessage({
            data,
            fromCache: true
          });
        }

        break;
      }
      case TRADER_DATUM.TIMELINE_ITEM: {
        for (const [_, data] of this.timeline) {
          this.onTimelineMessage({
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

      refs.get(instrument.symbol).guid = guid;

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

  adoptInstrument(instrument) {
    if (
      instrument?.symbol === 'SPB' &&
      instrument?.currency === 'USD' &&
      this.document.exchange === EXCHANGE.SPBX
    ) {
      return this.instruments.get('SPB@US');
    }

    return super.adoptInstrument(instrument);
  }

  async instrumentChanged(source, oldValue, newValue) {
    await this.ensureAccessTokenIsOk();
    await super.instrumentChanged(source, oldValue, newValue);

    if (newValue?.symbol) {
      // Handle no real subscription case for quotes and orderbook.
      // Use saved snapshot data for new widgets.
      // Time and sales uses allTrades REST API call,
      // so no special handling needed.
      this.onQuotesMessage({
        data: this.refs.quotes.get(newValue.symbol)?.lastQuotesData
      });

      this.onOrderbookMessage({
        data: this.refs.orderbook.get(newValue.symbol)?.lastOrderbook
      });
    }

    // Broadcast positions for order widgets (at least).
    if (this.subs.positions.has(source)) {
      for (const [, data] of this.positions) {
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
          if (this.instrumentsAreEqual(instrument, source.instrument)) {
            const ref = this.refs.orderbook.get(source.instrument?.symbol);

            if (ref) {
              ref.lastOrderbook = data;

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
          if (this.instrumentsAreEqual(instrument, source.instrument)) {
            const ref = this.refs.quotes.get(source.instrument?.symbol);

            if (ref) ref.lastQuotesData = data;

            for (const { field, datum, condition } of fields) {
              if (typeof condition === 'function') {
                const conditionResult = condition.call(this, {
                  source,
                  instrument,
                  ref
                });

                if (!conditionResult) continue;
              }

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
          if (this.instrumentsAreEqual(instrument, source.instrument)) {
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

  onPositionsMessage({ data, fromCache }) {
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
              accountId: data.portfolio
            };

            if (isBalance) {
              source[field] = payload;
            } else {
              if (this.document.portfolioType === 'futures') {
                payload.instrument = this.#futures.get(data.symbol);
              } else {
                payload.instrument = this.instruments.get(data.symbol);
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

  onOrdersMessage({ data, fromCache }) {
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
              payload.instrument = this.instruments.get(data.symbol);
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

  onTimelineMessage({ data, fromCache }) {
    if (data) {
      if (!fromCache) this.timeline.set(data.id, data);

      for (const [source, fields] of this.subs.timeline) {
        for (const { field, datum } of fields) {
          if (datum === TRADER_DATUM.TIMELINE_ITEM) {
            const payload = {
              operationId: data.id,
              accruedInterest: data.accruedInt ?? 0,
              commission: data.commission,
              parentId: data.orderno,
              symbol: data.symbol,
              type:
                data.side === 'buy'
                  ? OperationType.OPERATION_TYPE_BUY
                  : OperationType.OPERATION_TYPE_SELL,
              exchange: data.exchange,
              quantity: data.qty,
              price: data.price,
              createdAt: data.date
            };

            if (this.document.portfolioType === 'futures') {
              payload.instrument = this.#futures.get(data.symbol);
            } else {
              payload.instrument = this.instruments.get(data.symbol);
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

  getDictionary() {
    if (this.document.exchange === EXCHANGE.SPBX)
      return INSTRUMENT_DICTIONARY.ALOR_SPBX;

    // MOEX
    switch (this.document.portfolioType) {
      case 'stock':
        return INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES;
      case 'futures':
        return INSTRUMENT_DICTIONARY.ALOR_FORTS;
      case 'currency':
        return null;
    }
  }

  getExchange() {
    if (this.document.exchange === EXCHANGE.SPBX) return EXCHANGE.SPBX;

    // MOEX
    switch (this.document.portfolioType) {
      case 'stock':
        return EXCHANGE.MOEX_SECURITIES;
      case 'futures':
        return EXCHANGE.MOEX_FORTS;
      case 'currency':
        return EXCHANGE.MOEX_CURRENCY;
    }
  }

  getExchangeForDBRequest() {
    return this.document.exchange;
  }

  getBroker() {
    return BROKERS.ALOR;
  }

  getInstrumentIconUrl(instrument) {
    if (!instrument) {
      return 'static/instruments/unknown.svg';
    }

    let symbol = instrument?.symbol;

    if (typeof symbol === 'string') {
      symbol = symbol.split('/')[0].split('-')[0].split('-RM')[0];

      if (
        symbol.endsWith('@GS') ||
        symbol.endsWith('@DE') ||
        symbol.endsWith('@GR') ||
        symbol.endsWith('@UR') ||
        symbol.endsWith('@KT')
      ) {
        return 'static/instruments/unknown.svg';
      }

      symbol = symbol.split('@US')[0];
    }

    if (instrument?.currency === 'HKD') {
      return `static/instruments/stocks/hk/${symbol.replace(' ', '-')}.svg`;
    }

    const isRM = instrument?.symbol.endsWith('-RM');

    if (!isRM) {
      if (
        instrument?.exchange === EXCHANGE.MOEX ||
        instrument?.currency === 'RUB'
      ) {
        return `static/instruments/${instrument?.type}s/rus/${symbol.replace(
          ' ',
          '-'
        )}.svg`;
      }
    }

    if ((instrument?.exchange === EXCHANGE.SPBX || isRM) && symbol !== 'TCS') {
      return `static/instruments/stocks/us/${symbol.replace(' ', '-')}.svg`;
    }

    return super.getInstrumentIconUrl(instrument);
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

    if (/Сейчас эта сессия не идет/i.test(message))
      return 'Сейчас эта сессия не идет.';

    return 'Неизвестная ошибка, смотрите консоль браузера.';
  }
}

export default AlorOpenAPIV2Trader;
