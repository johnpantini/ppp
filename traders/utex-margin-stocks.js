import ppp from '../ppp.js';
import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../lib/const.js';
import { later } from '../lib/ppp-decorators.js';
import { Trader } from './common-trader.js';
import { isJWTTokenExpired } from '../lib/ppp-crypto.js';
import {
  AuthorizationError,
  TradingError,
  UTEXBlockError
} from '../lib/ppp-errors.js';
import { OperationType } from '../vendor/tinkoff/definitions/operations.js';

export function generateTraceId() {
  let result = '';

  for (let t = 0; t < 16; t++)
    result += '0123456789abcdef'[Math.floor(16 * Math.random())];

  return result;
}

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} UtexMarginStocksTrader
 */
class UtexMarginStocksTrader extends Trader {
  #pendingJWTRequest;

  #jwt;

  #heartbeatInterval;

  #pendingConnection;

  connection;

  leftMarginBP = 0;

  usedMarginBP = 0;

  #symbols = new Map();

  #tradeCounter = 0;

  subs = {
    positions: new Map(),
    orders: new Map(),
    timeline: new Map(),
    trader: new Map()
  };

  refs = {
    positions: new Map(),
    orders: new Map(),
    timeline: new Map(),
    trader: new Map()
  };

  orders = new Map();

  positions = new Map();

  balance = {
    amount: 0,
    currency: 'USDT'
  };

  timeline = [];

  onCacheInstrument(instrument) {
    if (typeof instrument.utexSymbolID === 'number') {
      this.#symbols.set(instrument.utexSymbolID, instrument);
    }
  }

  async ensureAccessTokenIsOk() {
    try {
      if (isJWTTokenExpired(this.#jwt)) this.#jwt = void 0;

      if (this.#jwt) return;

      if (this.#pendingJWTRequest) {
        await this.#pendingJWTRequest;
      } else {
        this.#pendingJWTRequest = new Promise(async (resolve, reject) => {
          let savedAccessToken = sessionStorage.getItem(
            `utex-access-token-${this.document._id}`
          );
          let savedRefreshToken = sessionStorage.getItem(
            `utex-refresh-token-${this.document._id}`
          );
          let tokensResponse;

          if (isJWTTokenExpired(savedAccessToken)) {
            if (isJWTTokenExpired(savedRefreshToken)) {
              const tokensRequest = await fetch(
                new URL(
                  'fetch',
                  ppp.keyVault.getKey('service-machine-url')
                ).toString(),
                {
                  cache: 'reload',
                  method: 'POST',
                  body: JSON.stringify({
                    method: 'POST',
                    url: 'https://api.utex.io/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.authorizeByFirstFactor',
                    headers: {
                      Origin: 'https://utex.io',
                      Referer: 'https://utex.io/',
                      'User-Agent': navigator.userAgent,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      realm: 'aurora',
                      clientId: 'utexweb',
                      loginOrEmail: this.document.broker.login,
                      password: this.document.broker.password,
                      product: 'UTEX',
                      locale: 'ru'
                    })
                  })
                }
              );

              tokensResponse = await tokensRequest.json();
            } else {
              // Refresh token is OK - try to refresh access token.
              const refreshAuthRequest = await fetch(
                new URL(
                  'fetch',
                  ppp.keyVault.getKey('service-machine-url')
                ).toString(),
                {
                  cache: 'reload',
                  method: 'POST',
                  body: JSON.stringify({
                    method: 'POST',
                    url: 'https://api.utex.io/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.refreshAuthorization',
                    headers: {
                      Origin: 'https://utex.io',
                      Referer: 'https://utex.io/',
                      'User-Agent': navigator.userAgent,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      realm: 'aurora',
                      clientId: 'utexweb',
                      refreshToken: savedRefreshToken
                    })
                  })
                }
              );

              tokensResponse = await refreshAuthRequest.json();

              if (tokensResponse.accessToken && tokensResponse.refreshToken) {
                tokensResponse.tokens = {
                  accessToken: tokensResponse.accessToken,
                  refreshToken: tokensResponse.refreshToken
                };
              }
            }

            if (tokensResponse.tokens) {
              savedAccessToken = tokensResponse.tokens.accessToken;
              savedRefreshToken = tokensResponse.tokens.refreshToken;

              sessionStorage.setItem(
                `utex-access-token-${this.document._id}`,
                savedAccessToken
              );
              sessionStorage.setItem(
                `utex-refresh-token-${this.document._id}`,
                savedRefreshToken
              );
            }
          } else {
            // Access token is OK.
            tokensResponse = {
              tokens: {
                accessToken: savedAccessToken,
                refreshToken: savedRefreshToken
              }
            };
          }

          if (
            !tokensResponse?.tokens ||
            /NoActiveSessionException|InvalidCredentialsException/i.test(
              tokensResponse?.type
            )
          ) {
            sessionStorage.removeItem(`utex-access-token-${this.document._id}`);
            sessionStorage.removeItem(
              `utex-refresh-token-${this.document._id}`
            );

            reject(new AuthorizationError({ details: tokensResponse }));
          } else if (/BlockingException/i.test(tokensResponse?.type)) {
            reject(new UTEXBlockError({ details: tokensResponse }));
          } else if (tokensResponse.tokens?.accessToken) {
            this.#jwt = tokensResponse.tokens.accessToken;

            resolve(this.#jwt);
          }
        }).then(() => (this.#pendingJWTRequest = void 0));

        await this.#pendingJWTRequest;
      }
    } catch (e) {
      console.error(e);

      this.#pendingJWTRequest = void 0;

      if (e instanceof AuthorizationError) {
        throw e;
      }

      return new Promise((resolve) => {
        setTimeout(async () => {
          await this.ensureAccessTokenIsOk();

          resolve();
        }, Math.max(this.document.reconnectTimeout ?? 1000, 1000));
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
          this.connection = new WebSocket('wss://ususdt-api-margin.utex.io/ws');

          this.connection.onopen = () => {
            this.connection.send('{"t":0,"d":{}}');

            clearInterval(this.#heartbeatInterval);

            this.#heartbeatInterval = setInterval(() => {
              if (this.connection.readyState === WebSocket.OPEN) {
                this.connection.send('{"t":8,"d":{}}');
              }
            }, 2000);

            resolve(this.connection);
          };

          this.connection.onclose = async ({ code }) => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));

            this.#jwt = void 0;
            this.#pendingJWTRequest = void 0;

            await this.ensureAccessTokenIsOk();

            this.#pendingConnection = void 0;

            clearInterval(this.#heartbeatInterval);

            await this.#connectWebSocket(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = async ({ data }) => {
            const payload = JSON.parse(data);

            if (payload.t === 12) {
              await this.ensureAccessTokenIsOk();

              this.connection.send(
                JSON.stringify({
                  t: 1,
                  d: {
                    topic:
                      'com.unitedtraders.luna.utex.protocol.mobile.MobileHistoryService.subscribePendingOrders',
                    i: 1,
                    accessToken: this.#jwt,
                    metadata: {
                      traceId: generateTraceId(),
                      spanId: generateTraceId()
                    },
                    parameters: {}
                  }
                })
              );

              this.connection.send(
                JSON.stringify({
                  t: 1,
                  d: {
                    topic:
                      'com.unitedtraders.luna.utex.protocol.mobile.MobileHistoryService.subscribeCompletedOrders',
                    i: 2,
                    accessToken: this.#jwt,
                    metadata: {
                      traceId: generateTraceId(),
                      spanId: generateTraceId()
                    },
                    parameters: {}
                  }
                })
              );

              this.connection.send(
                JSON.stringify({
                  t: 1,
                  d: {
                    topic:
                      'com.unitedtraders.luna.utex.protocol.mobile.MarginUserPositionService.subscribeMarginPositions',
                    i: 3,
                    accessToken: this.#jwt,
                    metadata: {
                      traceId: generateTraceId(),
                      spanId: generateTraceId()
                    },
                    parameters: {}
                  }
                })
              );

              this.connection.send(
                JSON.stringify({
                  t: 1,
                  d: {
                    topic:
                      'com.unitedtraders.luna.utex.protocol.mobile.MobileMarginalTradingBalanceService.subscribeTradingBalanceUpdateWithSnapshot',
                    i: 4,
                    accessToken: this.#jwt,
                    metadata: {
                      traceId: generateTraceId(),
                      spanId: generateTraceId()
                    },
                    parameters: {
                      market: 'UsEquitiesUsdt'
                    }
                  }
                })
              );

              this.connection.send(
                JSON.stringify({
                  t: 1,
                  d: {
                    topic:
                      'com.unitedtraders.luna.utex.protocol.mobile.MobileHistoryService.subscribeAllFilledExecutions',
                    i: 5,
                    accessToken: this.#jwt,
                    metadata: {
                      traceId: generateTraceId(),
                      spanId: generateTraceId()
                    },
                    parameters: {
                      depth: 100
                    }
                  }
                })
              );

              // Liquidation threshold
              // this.connection.send(
              //   JSON.stringify({
              //     t: 1,
              //     d: {
              //       topic:
              //         'com.unitedtraders.luna.utex.protocol.mobile.MobileMarginalTradingBalanceService.subscribeMaintenanceBalanceWithSnapshot',
              //       i: 6,
              //       accessToken: this.#jwt,
              //       metadata: {
              //         traceId: generateTraceId(),
              //         spanId: generateTraceId()
              //       },
              //       parameters: {
              //         market: 'UsEquitiesUsdt'
              //       }
              //     }
              //   })
              // );
            } else if (payload.t === 7) {
              const d = payload.d?.d;

              if (Array.isArray(d?.orders)) {
                for (const order of d.orders) {
                  this.orders.set(order.clientOrderId, order);

                  if (payload.d?.i === 1) {
                    this.onOrdersMessage({ order });
                  }
                }
              }

              if (d.marginBuyingPower) {
                this.leftMarginBP = +d.marginBuyingPower.left / 1e8;
                this.usedMarginBP = +d.marginBuyingPower.used / 1e8;

                for (const [source, fields] of this.subs.trader) {
                  for (const { field, datum } of fields) {
                    if (datum === TRADER_DATUM.TRADER) {
                      source[field] = {
                        event: 'estimate',
                        timestamp: Date.now(),
                        trader: this
                      };
                    }
                  }
                }
              }

              if (Array.isArray(d.positions)) {
                for (const position of d.positions) {
                  this.onPositionsMessage({ position });
                }

                // Update balance after positions
                this.onBalanceMessage({
                  amount: this.balance.amount,
                  currency: this.balance.currency,
                  fromCache: true
                });
              }

              if (payload.d?.i === 4) {
                const balance = payload.d?.d?.value;

                if (typeof balance === 'object') {
                  this.onBalanceMessage(balance);
                }
              }

              if (payload.d?.i === 5) {
                if (Array.isArray(d.executions)) {
                  for (const item of d.executions.sort(
                    (a, b) =>
                      new Date(a.moment / 1000) - new Date(b.moment / 1000)
                  )) {
                    this.onTimelineMessage({ item });
                  }
                }
              }
            }
          };
        }
      }));
    }
  }

  async removeLastRef(instrument, refs, ref) {
    if (refs === this.refs.positions) {
      this.positions.clear();
    }

    if (refs === this.refs.orders) {
      this.orders.clear();
    }

    if (refs === this.refs.timeline) {
      this.timeline = [];
    }
  }

  #getUTEXOrderStatus(order) {
    switch (order.status) {
      case 'NEW':
      case 'PART_FILLED':
        return 'working';
      case 'FILLED':
        return 'filled';
      case 'PART_CANCELED':
      case 'CANCELED':
        return 'canceled';
      case 'REJECTED':
        return 'rejected';
      case 'TRIGGERED':
        return 'triggered';
    }

    return 'unspecified';
  }

  onOrdersMessage({ order }) {
    for (const [source, fields] of this.subs.orders) {
      for (const { field, datum } of fields) {
        if (datum === TRADER_DATUM.CURRENT_ORDER) {
          const instrument = this.#symbols.get(order.symbolId);

          if (instrument) {
            source[field] = {
              instrument,
              orderId: order.exchangeOrderId,
              symbol: instrument.symbol,
              exchange: EXCHANGE.UTEX_MARGIN_STOCKS,
              orderType: order.type.toLowerCase(),
              side: order.side.toLowerCase(),
              status: this.#getUTEXOrderStatus(order),
              placedAt: new Date().toISOString(),
              endsAt: null,
              quantity: parseInt(order.qty),
              filled: parseInt(order.filled),
              price: parseFloat(order.price)
            };
          }
        }
      }
    }
  }

  onPositionsMessage({ position, fromCache }) {
    if (position.symbolId) {
      if (!fromCache) {
        this.positions.set(position.symbolId, position);
      }

      for (const [source, fields] of this.subs.positions) {
        for (const { field, datum } of fields) {
          const instrument = this.#symbols.get(position.symbolId);

          if (instrument) {
            if (datum === TRADER_DATUM.POSITION) {
              source[field] = {
                instrument,
                symbol: instrument.symbol,
                lot: instrument.lot,
                exchange: instrument.exchange,
                averagePrice: +position.averageInitialPrice / 1e8,
                isCurrency: false,
                isBalance: false,
                size: +position.qty / instrument.lot,
                accountId: null
              };
            } else if (
              this.instrumentsAreEqual(instrument, source.instrument)
            ) {
              switch (datum) {
                case TRADER_DATUM.POSITION_SIZE:
                  source[field] = +position.qty / instrument.lot;

                  break;
                case TRADER_DATUM.POSITION_AVERAGE:
                  source[field] = +position.averageInitialPrice / 1e8;

                  break;
              }
            }
          }
        }
      }
    }
  }

  onTimelineMessage({ item, fromCache }) {
    if (item.symbolId) {
      const instrument = this.#symbols.get(item.symbolId);

      if (instrument) {
        if (!fromCache) {
          this.timeline.push(item);
        }

        for (const [source, fields] of this.subs.timeline) {
          for (const { field, datum } of fields) {
            if (datum === TRADER_DATUM.TIMELINE_ITEM) {
              const commissionRate = this.document?.commissionRate ?? 0.04;
              const commission =
                ((item.price / 1e8) *
                  item.tradeQty *
                  instrument.lot *
                  commissionRate) /
                100;

              source[field] = {
                instrument,
                // UTEX trades are independent
                operationId: `${item.exchangeOrderId}-${this.#tradeCounter++}`,
                accruedInterest: null,
                commission,
                parentId: item.exchangeOrderId,
                symbol: instrument.symbol,
                type:
                  item.side.toLowerCase() === 'buy'
                    ? OperationType.OPERATION_TYPE_BUY
                    : OperationType.OPERATION_TYPE_SELL,
                exchange: EXCHANGE.UTEX_MARGIN_STOCKS,
                quantity: item.tradeQty / instrument.lot,
                price: item.tradePrice / 1e8,
                createdAt: new Date(item.moment / 1e6).toISOString()
              };
            }
          }
        }
      }
    }
  }

  onBalanceMessage({ amount, currency, fromCache }) {
    if (!fromCache) {
      this.balance.amount = amount;
      this.balance.currency = currency;
    }

    for (const [source, fields] of this.subs.positions) {
      for (const { field, datum } of fields) {
        if (datum === TRADER_DATUM.POSITION) {
          let profit = 0;

          for (const [, position] of this.positions) {
            profit += +position.netRealizedPnl / 1e8;
          }

          source[field] = {
            symbol: currency,
            lot: 1,
            exchange: EXCHANGE.UTEX_MARGIN_STOCKS,
            isCurrency: true,
            isBalance: true,
            size: +amount + profit,
            accountId: null
          };
        }
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await super.instrumentChanged(source, oldValue, newValue);

    // Broadcast positions for order widgets (at least).
    if (this.subs.positions.has(source)) {
      for (const [, position] of this.positions) {
        await this.onPositionsMessage({
          position,
          fromCache: true
        });
      }

      this.onBalanceMessage({
        amount: this.balance.amount,
        currency: this.balance.currency,
        fromCache: true
      });
    }
  }

  async subscribeField({ source, field, datum, condition }) {
    await this.ensureAccessTokenIsOk();
    await this.#connectWebSocket();
    await super.subscribeField({ source, field, datum, condition });

    switch (datum) {
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.POSITION_SIZE:
      case TRADER_DATUM.POSITION_AVERAGE: {
        for (const [_, position] of this.positions) {
          await this.onPositionsMessage({
            position,
            fromCache: true
          });
        }

        this.onBalanceMessage({
          amount: this.balance.amount,
          currency: this.balance.currency,
          fromCache: true
        });

        break;
      }
      case TRADER_DATUM.CURRENT_ORDER: {
        for (const [_, order] of this.orders) {
          this.onOrdersMessage({
            order
          });
        }

        break;
      }
      case TRADER_DATUM.TIMELINE_ITEM: {
        for (const item of this.timeline) {
          this.onTimelineMessage({
            item,
            fromCache: true
          });
        }

        break;
      }
    }
  }

  async unsubscribeField({ source, field, datum }) {
    await this.ensureAccessTokenIsOk();
    await super.unsubscribeField({ source, field, datum });
  }

  subsAndRefs(datum) {
    return {
      [TRADER_DATUM.POSITION]: [this.subs.positions, this.refs.positions],
      [TRADER_DATUM.POSITION_SIZE]: [this.subs.positions, this.refs.positions],
      [TRADER_DATUM.POSITION_AVERAGE]: [
        this.subs.positions,
        this.refs.positions
      ],
      [TRADER_DATUM.TRADER]: [this.subs.trader, this.refs.trader],
      [TRADER_DATUM.CURRENT_ORDER]: [this.subs.orders, this.refs.orders],
      [TRADER_DATUM.TIMELINE_ITEM]: [this.subs.timeline, this.refs.timeline]
    }[datum];
  }

  getExchange() {
    return EXCHANGE.UTEX_MARGIN_STOCKS;
  }

  getExchangeForDBRequest() {
    return EXCHANGE.UTEX_MARGIN_STOCKS;
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS;
  }

  getBroker() {
    return BROKERS.UTEX;
  }

  getInstrumentIconUrl(instrument) {
    if (!instrument) {
      return 'static/instruments/unknown.svg';
    }

    if (instrument.currency === 'USD' || instrument.currency === 'USDT') {
      return `static/instruments/stocks/us/${instrument.symbol
        .replace(' ', '-')
        .replace('/', '-')}.svg`;
    }

    return super.getInstrumentIconUrl(instrument);
  }

  async modifyLimitOrders({ instrument, side, value }) {
    await this.ensureAccessTokenIsOk();

    for (const [, o] of this.orders) {
      const status = this.#getUTEXOrderStatus(o);
      const orderInstrument = this.#symbols.get(o.symbolId);

      if (
        status === 'working' &&
        (o.side.toLowerCase() === side || side === 'all')
      ) {
        if (
          instrument &&
          !this.instrumentsAreEqual(instrument, orderInstrument)
        )
          continue;

        if (orderInstrument?.minPriceIncrement > 0) {
          const price = +this.fixPrice(
            orderInstrument,
            +o.price + orderInstrument.minPriceIncrement * value
          );

          o.instrument = orderInstrument;
          o.orderType = o.type.toLowerCase();
          o.orderId = o.exchangeOrderId;

          await this.cancelLimitOrder(o);
          await this.placeLimitOrder({
            instrument: orderInstrument,
            price,
            quantity: (+o.qty - +o.filled) / orderInstrument.lot,
            direction: o.side
          });
        }
      }
    }
  }

  async cancelAllLimitOrders({ instrument, filter } = {}) {
    await this.ensureAccessTokenIsOk();

    for (const [, o] of this.orders) {
      const status = this.#getUTEXOrderStatus(o);
      const orderInstrument = this.#symbols.get(o.symbolId);

      if (orderInstrument && status === 'working') {
        if (
          instrument &&
          !this.instrumentsAreEqual(instrument, orderInstrument)
        )
          continue;

        if (filter === 'buy' && o.side.toLowerCase() !== 'buy') {
          continue;
        }

        if (filter === 'sell' && o.side.toLowerCase() !== 'sell') {
          continue;
        }

        o.instrument = orderInstrument;
        o.orderType = o.type.toLowerCase();
        o.orderId = o.exchangeOrderId;

        await this.cancelLimitOrder(o);
      }
    }
  }

  async cancelLimitOrder(order) {
    if (order.orderType === 'limit') {
      await this.ensureAccessTokenIsOk();

      const request = await fetch(
        new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
        {
          cache: 'reload',
          method: 'POST',
          body: JSON.stringify({
            method: 'POST',
            url: 'https://ususdt-api-margin.utex.io/rest/grpc/com.unitedtraders.luna.utex.protocol.mobile.MobileExecutionService.cancelOrderByExchangeOrderId',
            body: JSON.stringify({
              exchangeOrderId: order.orderId,
              orderSymbolId: order.instrument.utexSymbolID
            }),
            headers: {
              Authorization: `Bearer ${this.#jwt}`,
              'Content-Type': 'application/json;charset=UTF-8',
              'User-Agent': navigator.userAgent,
              Origin: 'https://margin.utex.io',
              Referer: 'https://margin.utex.io/',
              'x-b3-spanid': generateTraceId(),
              'x-b3-traceid': generateTraceId()
            }
          })
        }
      );

      if (request.status === 200) return {};
      else {
        throw new TradingError({
          details: await (await request).json()
        });
      }
    }
  }

  async placeLimitOrder({ instrument, price, quantity, direction }) {
    await this.ensureAccessTokenIsOk();

    const orderRequest = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'POST',
          url: 'https://ususdt-api-margin.utex.io/rest/grpc/com.unitedtraders.luna.utex.protocol.mobile.MobileExecutionService.createLimitOrder',
          body: JSON.stringify({
            price: Math.round(
              +this.fixPrice(instrument, price) * 1e8
            ).toString(),
            side: direction.toUpperCase(),
            qty: (quantity * instrument.lot).toString(),
            symbolId: instrument.utexSymbolID,
            tif: 'GTC'
          }),
          headers: {
            Authorization: `Bearer ${this.#jwt}`,
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': navigator.userAgent,
            Origin: 'https://margin.utex.io',
            Referer: 'https://margin.utex.io/',
            'x-b3-spanid': generateTraceId(),
            'x-b3-traceid': generateTraceId()
          }
        })
      }
    );

    const order = await orderRequest.json();

    if (orderRequest.status !== 200) {
      throw new TradingError({
        details: order
      });
    } else {
      return {
        orderId: order.orderId
      };
    }
  }

  async placeMarketOrder({ instrument, quantity, direction }) {
    await this.ensureAccessTokenIsOk();

    const orderRequest = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'POST',
          url: 'https://ususdt-api-margin.utex.io/rest/grpc/com.unitedtraders.luna.utex.protocol.mobile.MobileExecutionService.createMarketOrder',
          body: JSON.stringify({
            qty: (quantity * instrument.lot).toString(),
            side: direction.toUpperCase(),
            symbolId: instrument.utexSymbolID
          }),
          headers: {
            Authorization: `Bearer ${this.#jwt}`,
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': navigator.userAgent,
            Origin: 'https://margin.utex.io',
            Referer: 'https://margin.utex.io/',
            'x-b3-spanid': generateTraceId(),
            'x-b3-traceid': generateTraceId()
          }
        })
      }
    );

    const order = await orderRequest.json();

    if (orderRequest.status !== 200) {
      throw new TradingError({
        details: order
      });
    } else {
      return {
        orderId: order.orderId
      };
    }
  }

  async estimate(instrument, price, quantity) {
    const commissionRate = this.document?.commissionRate ?? 0.04;
    const commission =
      (price * quantity * instrument.lot * commissionRate) / 100;
    const marginBPQuantity =
      Math.trunc(this.leftMarginBP / price / instrument.lot) * instrument.lot;

    return {
      marginSellingPowerQuantity: marginBPQuantity,
      marginBuyingPowerQuantity: marginBPQuantity,
      sellingPowerQuantity: null,
      buyingPowerQuantity: null,
      commission
    };
  }

  async formatError(instrument, error) {
    if (error instanceof AuthorizationError) {
      return 'Ошибка авторизации. Попробуйте обновить страницу.';
    }

    if (error instanceof UTEXBlockError) {
      return 'Найдена активная блокировка (должна быть снята в течение часа).';
    }

    const { details } = error;

    if (details?.error === 'Unauthorized') {
      return 'Не удалось авторизоваться.';
    }

    if (details?.details) {
      if (details?.type === 'aurora.grpc.luna.exception.RuntimeException') {
        return 'Неизвестная ошибка на стороне UTEX.';
      }

      const rejectReason = details.details.attributes?.rejectReason;

      if (rejectReason === 'LowAverageDayVolumeOnInstrument') {
        return 'Низколиквидный инструмент, заявка отклонена UTEX.';
      } else if (
        rejectReason === 'NotEnoughBP' ||
        rejectReason === 'NotEnoughNightBP'
      ) {
        return 'Недостаточно покупательской способности для открытия позиции.';
      } else if (rejectReason === 'MarketIsNotAvailable') {
        return 'Рынок сейчас закрыт.';
      }
    }
  }
}

export default UtexMarginStocksTrader;
