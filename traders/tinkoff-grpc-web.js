/** @decorator */

import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../lib/const.js';
import { Trader } from './common-trader.js';
import { debounce } from '../lib/ppp-decorators.js';
import { createClient } from '../vendor/nice-grpc-web/client/ClientFactory.js';
import { createChannel } from '../vendor/nice-grpc-web/client/channel.js';
import { Metadata } from '../vendor/nice-grpc-web/nice-grpc-common/Metadata.js';
import {
  MarketDataServiceDefinition,
  MarketDataStreamServiceDefinition,
  SubscriptionAction,
  SubscriptionInterval,
  TradeDirection
} from '../vendor/tinkoff/definitions/market-data.js';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrdersServiceDefinition,
  OrderType,
  PriceType
} from '../vendor/tinkoff/definitions/orders.js';
import { isAbortError } from '../vendor/abort-controller-x.js';
import { TradingError } from '../lib/ppp-errors.js';
import { uuidv4 } from '../lib/ppp-crypto.js';
import {
  OperationsServiceDefinition,
  OperationsStreamServiceDefinition,
  OperationState,
  OperationType
} from '../vendor/tinkoff/definitions/operations.js';
import { getInstrumentPrecision } from '../lib/intl.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} TinkoffGrpcWebTrader
 */

export function toQuotation(value) {
  const sign = value < 0 ? -1 : 1;
  const absValue = Math.abs(value);
  const units = Math.floor(absValue);
  const nano = Math.round((absValue - units) * 1000000000);

  return {
    units: sign * units,
    nano: sign * nano
  };
}

export function toNumber(value) {
  return value ? +value.units + +value.nano / 1000000000 : value;
}

const TINKOFF_CURRENCIES = {
  BBG0013J7V24: 'AMD',
  BBG0013HG026: 'KZT',
  BBG0013J7Y00: 'KGS',
  BBG0013HQ310: 'UZS',
  BBG0013HGFT4: 'USD',
  BBG0013HRTL0: 'CNY',
  BBG0013J11P1: 'TJS',
  BBG00D87WQY7: 'BYN',
  BBG0013HSW87: 'HKD',
  BBG000VJ5YR4: 'XAU',
  BBG0013J12N1: 'TRY',
  BBG000VHQTD1: 'XAG',
  RUB000UTSTOM: 'RUB'
};

class TinkoffGrpcWebTrader extends Trader {
  #clients = new Map();

  #metadata;

  #marketDataAbortController;

  #portfolioAbortController;

  #positionsAbortController;

  #timelineHistory = [];

  // Key: figi ; Value: instrument object
  #figis = new Map();

  // Key: ticker ; Value: minPriceIncrementAmount
  #futureMinPriceIncrementAmount = new Map();

  orders = new Map();

  portfolio;

  positions = {
    money: new Map(),
    blockedMoney: new Map(),
    securities: new Map(),
    futures: new Map(),
    options: new Map()
  };

  #pendingPortfolioRequest;

  // Key: widget instance; Value: [{ field, datum }] array
  subs = {
    orderbook: new Map(),
    allTrades: new Map(),
    orders: new Map(),
    candles: new Map(),
    portfolio: new Map(),
    trader: new Map(),
    timeline: new Map()
  };

  // Key: instrumentId; Value: { instrument, refCount }
  // Value contains lastOrderbook for orderbook
  refs = {
    orderbook: new Map(),
    allTrades: new Map(),
    orders: new Map(),
    candles: new Map(),
    portfolio: new Map(),
    trader: new Map(),
    timeline: new Map()
  };

  constructor(document) {
    super(document);

    this.#metadata = new Metadata({
      Authorization: `Bearer ${this.document.broker.apiToken}`,
      'x-app-name': 'johnpantini.ppp'
    });
  }

  async oneTimeInitializationCallback() {
    const { payload } = await (
      await fetch('https://api.tinkoff.ru/trading/futures/list')
    ).json();

    for (const f of payload.values) {
      this.#futureMinPriceIncrementAmount.set(
        f.instrumentInfo.ticker.toUpperCase(),
        f.orderInfo?.minPriceIncrementAmount?.value ?? 1
      );
    }
  }

  onCacheInstrument(instrument) {
    if (instrument.tinkoffFigi) {
      this.#figis.set(instrument.tinkoffFigi, instrument);
    }
  }

  getOrCreateClient(service) {
    if (!this.#clients.has(service)) {
      this.#clients.set(
        service,
        createClient(
          service,
          createChannel('https://invest-public-api.tinkoff.ru:443'),
          {
            '*': {
              metadata: this.#metadata
            }
          }
        )
      );
    }

    return this.#clients.get(service);
  }

  #orderId() {
    return uuidv4();
  }

  async placeLimitOrder({ instrument, price, quantity, direction }) {
    try {
      const response = await this.getOrCreateClient(
        OrdersServiceDefinition
      ).postOrder({
        instrumentId: instrument.tinkoffFigi,
        quantity,
        price: toQuotation(+this.fixPrice(instrument, price)),
        direction:
          direction.toLowerCase() === 'buy'
            ? OrderDirection.ORDER_DIRECTION_BUY
            : OrderDirection.ORDER_DIRECTION_SELL,
        accountId: this.document.account,
        orderType: OrderType.ORDER_TYPE_LIMIT,
        orderId: this.#orderId()
      });

      return {
        orderId: response.orderId
      };
    } catch (e) {
      throw new TradingError({
        message: e.message,
        details: e.details
      });
    }
  }

  async placeMarketOrder({ instrument, quantity, direction }) {
    try {
      const response = await this.getOrCreateClient(
        OrdersServiceDefinition
      ).postOrder({
        instrumentId: instrument.tinkoffFigi,
        quantity,
        direction:
          direction.toLowerCase() === 'buy'
            ? OrderDirection.ORDER_DIRECTION_BUY
            : OrderDirection.ORDER_DIRECTION_SELL,
        accountId: this.document.account,
        orderType: OrderType.ORDER_TYPE_MARKET,
        orderId: this.#orderId()
      });

      return {
        orderId: response.orderId
      };
    } catch (e) {
      throw new TradingError({
        message: e.message,
        details: e.details
      });
    }
  }

  async cancelLimitOrder(order) {
    try {
      if (order.orderType === 'limit') {
        const client = createClient(
          OrdersServiceDefinition,
          createChannel('https://invest-public-api.tinkoff.ru:443'),
          {
            '*': {
              metadata: this.#metadata
            }
          }
        );

        await client.cancelOrder({
          accountId: this.document.account,
          orderId: order.orderId
        });

        return {
          orderId: order.orderId
        };
      }
    } catch (e) {
      throw new TradingError({
        message: e.message,
        details: e.details
      });
    }
  }

  async cancelAllLimitOrders({ instrument, filter } = {}) {
    try {
      const client = createClient(
        OrdersServiceDefinition,
        createChannel('https://invest-public-api.tinkoff.ru:443'),
        {
          '*': {
            metadata: this.#metadata
          }
        }
      );

      const { orders } = await this.#getOrders(client);

      for (const o of orders) {
        const status = this.#getOrderStatus(o);

        if (status === 'working') {
          if (instrument && o.figi !== instrument.tinkoffFigi) continue;

          if (
            filter === 'buy' &&
            o.direction !== OrderDirection.ORDER_DIRECTION_BUY
          ) {
            continue;
          }

          if (
            filter === 'sell' &&
            o.direction !== OrderDirection.ORDER_DIRECTION_SELL
          ) {
            continue;
          }

          await client.cancelOrder({
            accountId: this.document.account,
            orderId: o.orderId
          });
        }
      }
    } catch (e) {
      throw new TradingError({
        message: e.message,
        details: e.details
      });
    }
  }

  async modifyLimitOrders({ instrument, side, value }) {
    try {
      const client = createClient(
        OrdersServiceDefinition,
        createChannel('https://invest-public-api.tinkoff.ru:443'),
        {
          '*': {
            metadata: this.#metadata
          }
        }
      );

      const { orders } = await this.#getOrders(client);

      for (const o of orders) {
        const status = this.#getOrderStatus(o);
        const orderSide =
          o.direction === OrderDirection.ORDER_DIRECTION_BUY ? 'buy' : 'sell';

        if (status === 'working' && (orderSide === side || side === 'all')) {
          if (instrument && o.figi !== instrument.tinkoffFigi) continue;

          const orderInstrument = this.#figis.get(o.figi);

          if (orderInstrument?.minPriceIncrement > 0) {
            const price = +this.fixPrice(
              orderInstrument,
              (orderInstrument.type === 'bond'
                ? this.relativeBondPriceToPrice(
                    toNumber(o.initialSecurityPrice),
                    orderInstrument
                  )
                : +toNumber(o.initialSecurityPrice).toFixed(
                    getInstrumentPrecision(orderInstrument)
                  )) +
                orderInstrument.minPriceIncrement * value
            );

            if (
              o.executionReportStatus ===
              OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_NEW
            ) {
              await client.replaceOrder({
                accountId: this.document.account,
                orderId: o.orderId,
                idempotencyKey: this.#orderId(),
                quantity: o.lotsRequested - o.lotsExecuted,
                price: toQuotation(price),
                priceType: PriceType.PRICE_TYPE_CURRENCY
              });
            } else if (
              o.executionReportStatus ===
              OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_PARTIALLYFILL
            ) {
              const quantity = o.lotsRequested - o.lotsExecuted;

              await this.cancelLimitOrder({
                orderId: o.orderId,
                orderType: 'limit'
              });
              await this.placeLimitOrder({
                instrument: orderInstrument,
                price,
                quantity,
                direction: orderSide
              });
            }
          }
        }
      }
    } catch (e) {
      throw new TradingError({
        message: e.message,
        details: e.details
      });
    }
  }

  @debounce(100)
  resubscribeToMarketDataStream(reconnect = false) {
    return this.#resubscribeToMarketDataStream(reconnect);
  }

  @debounce(100)
  resubscribeToPortfolioStream(reconnect = false) {
    return this.#resubscribeToPortfolioStream(reconnect);
  }

  @debounce(100)
  resubscribeToPositionsStream(reconnect = false) {
    return this.#resubscribeToPositionsStream(reconnect);
  }

  async #resubscribeToMarketDataStream(reconnect = false) {
    if (
      !this.refs.orderbook.size &&
      !this.refs.allTrades.size &&
      !this.refs.candles.size
    ) {
      return;
    }

    const marketDataServerSideStreamRequest = {};
    const orderbookRefsArray = [...this.refs.orderbook.values()];
    const allTradesRefsArray = [...this.refs.allTrades.values()];
    const candlesRefsArray = [...this.refs.candles.values()];

    if (orderbookRefsArray.length) {
      marketDataServerSideStreamRequest.subscribeOrderBookRequest = {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: []
      };

      [...this.refs.orderbook.values()].forEach(({ instrument }) => {
        marketDataServerSideStreamRequest.subscribeOrderBookRequest.instruments.push(
          {
            instrumentId: instrument.tinkoffFigi,
            depth: 50
          }
        );
      });
    }

    if (allTradesRefsArray.length) {
      marketDataServerSideStreamRequest.subscribeTradesRequest = {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: []
      };

      [...this.refs.allTrades.values()].forEach(({ instrument }) => {
        marketDataServerSideStreamRequest.subscribeTradesRequest.instruments.push(
          {
            instrumentId: instrument.tinkoffFigi
          }
        );
      });
    }

    if (candlesRefsArray.length) {
      marketDataServerSideStreamRequest.subscribeCandlesRequest = {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: [],
        waitingClose: false
      };

      [...this.refs.candles.values()].forEach(({ instrument }) => {
        marketDataServerSideStreamRequest.subscribeCandlesRequest.instruments.push(
          {
            instrumentId: instrument.tinkoffFigi,
            interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
          }
        );
      });
    }

    const client = createClient(
      MarketDataStreamServiceDefinition,
      createChannel('https://invest-public-api.tinkoff.ru:443'),
      {
        '*': {
          metadata: this.#metadata
        }
      }
    );

    this.#marketDataAbortController?.abort?.();

    this.#marketDataAbortController = new AbortController();

    const stream = client.marketDataServerSideStream(
      marketDataServerSideStreamRequest,
      {
        signal: this.#marketDataAbortController?.signal
      }
    );

    try {
      if (reconnect) {
        await Promise.all(
          [...this.refs.orderbook.values()].map(({ instrument }) => {
            return (async () => {
              this.onOrderbookMessage({
                orderbook: await this.getOrCreateClient(
                  MarketDataServiceDefinition
                ).getOrderBook({
                  instrumentId: instrument.tinkoffFigi,
                  depth: 50
                }),
                instrument
              });
            })();
          })
        );

        for (const [source, fields] of this.subs.trader) {
          for (const { field, datum } of fields) {
            if (datum === TRADER_DATUM.TRADER) {
              source[field] = {
                event: 'reconnect',
                timestamp: Date.now(),
                trader: this
              };
            }
          }
        }
      }

      for await (const data of stream) {
        if (data.orderbook) {
          this.onOrderbookMessage({
            orderbook: data.orderbook,
            instrument: this.#figis.get(data.orderbook.figi)
          });
        } else if (data.trade) {
          this.onTradeMessage({
            trade: data.trade,
            instrument: this.#figis.get(data.trade.figi)
          });
        } else if (data.candle) {
          this.onCandleMessage({
            candle: data.candle,
            instrument: this.#figis.get(data.candle.figi)
          });
        }
      }

      this.resubscribeToMarketDataStream(true);
    } catch (e) {
      if (!isAbortError(e)) {
        console.error(e);

        setTimeout(() => {
          this.resubscribeToMarketDataStream(true);
        }, Math.max(this.document.reconnectTimeout ?? 1000, 1000));
      }
    }
  }

  async #resubscribeToPortfolioStream(reconnect = false) {
    if (!this.refs.portfolio.size) {
      return;
    }

    const client = createClient(
      OperationsStreamServiceDefinition,
      createChannel('https://invest-public-api.tinkoff.ru:443'),
      {
        '*': {
          metadata: this.#metadata
        }
      }
    );

    this.#portfolioAbortController?.abort?.();

    this.#portfolioAbortController = new AbortController();

    const stream = client.portfolioStream(
      {
        accounts: [this.document.account]
      },
      {
        signal: this.#portfolioAbortController?.signal
      }
    );

    try {
      if (reconnect) {
        this.onPortfolioMessage(
          await this.getOrCreateClient(
            OperationsServiceDefinition
          ).getPortfolio({
            accountId: this.document.account
          })
        );

        this.onPositionsMessage(
          await this.getOrCreateClient(
            OperationsServiceDefinition
          ).getPositions({
            accountId: this.document.account
          })
        );
      }

      for await (const data of stream) {
        if (data.portfolio) {
          this.onPortfolioMessage(data.portfolio);
        }
      }

      this.resubscribeToPortfolioStream(true);
    } catch (e) {
      if (!isAbortError(e)) {
        console.error(e);

        setTimeout(() => {
          this.resubscribeToPortfolioStream(true);
        }, Math.max(this.document.reconnectTimeout ?? 1000, 1000));
      }
    }
  }

  async #resubscribeToPositionsStream(reconnect = false) {
    if (!this.refs.portfolio.size) {
      return;
    }

    const client = createClient(
      OperationsStreamServiceDefinition,
      createChannel('https://invest-public-api.tinkoff.ru:443'),
      {
        '*': {
          metadata: this.#metadata
        }
      }
    );

    this.#positionsAbortController?.abort?.();

    this.#positionsAbortController = new AbortController();

    const stream = client.positionsStream(
      {
        accounts: [this.document.account]
      },
      {
        signal: this.#positionsAbortController?.signal
      }
    );

    try {
      if (reconnect) {
        this.onPositionsMessage(
          await this.getOrCreateClient(
            OperationsServiceDefinition
          ).getPositions({
            accountId: this.document.account
          })
        );
      }

      for await (const data of stream) {
        if (data.position) {
          const money = [];
          const blocked = [];

          (data.position.money ?? []).forEach((m) => {
            money.push(m.availableValue);
            blocked.push(m.blockedValue);
          });

          this.onPositionsMessage({
            money,
            blocked,
            securities: data.position.securities,
            futures: data.position.futures,
            options: data.position.options
          });
        }
      }

      this.resubscribeToPositionsStream(true);
    } catch (e) {
      if (!isAbortError(e)) {
        console.error(e);

        setTimeout(() => {
          this.resubscribeToPositionsStream(true);
        }, Math.max(this.document.reconnectTimeout ?? 1000, 1000));
      }
    }
  }

  subsAndRefs(datum) {
    return {
      [TRADER_DATUM.ORDERBOOK]: [this.subs.orderbook, this.refs.orderbook],
      [TRADER_DATUM.MARKET_PRINT]: [this.subs.allTrades, this.refs.allTrades],
      [TRADER_DATUM.CURRENT_ORDER]: [this.subs.orders, this.refs.orders],
      [TRADER_DATUM.CANDLE]: [this.subs.candles, this.refs.candles],
      [TRADER_DATUM.TRADER]: [this.subs.trader, this.refs.trader],
      [TRADER_DATUM.POSITION]: [this.subs.portfolio, this.refs.portfolio],
      [TRADER_DATUM.POSITION_SIZE]: [this.subs.portfolio, this.refs.portfolio],
      [TRADER_DATUM.POSITION_AVERAGE]: [
        this.subs.portfolio,
        this.refs.portfolio
      ],
      [TRADER_DATUM.TIMELINE_ITEM]: [this.subs.timeline, this.refs.timeline]
    }[datum];
  }

  async subscribeField({ source, field, datum }) {
    await super.subscribeField({ source, field, datum });

    switch (datum) {
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.POSITION_SIZE:
      case TRADER_DATUM.POSITION_AVERAGE: {
        if (typeof this.portfolio === 'undefined') {
          if (this.#pendingPortfolioRequest) {
            await this.#pendingPortfolioRequest;
          } else {
            this.#pendingPortfolioRequest = this.getOrCreateClient(
              OperationsServiceDefinition
            ).getPortfolio({
              accountId: this.document.account
            });

            this.onPositionsMessage(
              await this.getOrCreateClient(
                OperationsServiceDefinition
              ).getPositions({
                accountId: this.document.account
              })
            );
          }

          this.portfolio = await this.#pendingPortfolioRequest;
        }

        this.onPortfolioMessage(this.portfolio);

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
        if (!this.#timelineHistory.length) {
          this.#timelineHistory = (
            await this.timelineHistory({
              cursor: ''
            })
          ).items;
        }

        this.onTimelineMessage({
          items: this.#timelineHistory
        });

        break;
      }
    }
  }

  async addFirstRef(instrument, refs) {
    if (instrument.tinkoffFigi && !this.#figis.has(instrument.tinkoffFigi)) {
      this.#figis.set(instrument.tinkoffFigi, instrument);
    }

    if (refs === this.refs.orderbook) {
      this.onOrderbookMessage({
        orderbook: await this.getOrCreateClient(
          MarketDataServiceDefinition
        ).getOrderBook({
          instrumentId: instrument.tinkoffFigi,
          depth: 50
        }),
        instrument
      });
    }

    if (
      refs === this.refs.orderbook ||
      refs === this.refs.allTrades ||
      refs === this.refs.candles
    ) {
      this.resubscribeToMarketDataStream();
    }

    if (refs === this.refs.portfolio) {
      this.resubscribeToPortfolioStream();
      this.resubscribeToPositionsStream();
    }

    if (refs === this.refs.timeline) {
      void this.#fetchTimelineLoop();
    }

    if (refs === this.refs.orders) {
      void this.#fetchOrdersLoop();
    }
  }

  async removeLastRef(instrument, refs) {
    if (refs === this.refs.orders) {
      this.orders.clear();
    }

    // Abort streams if refs are empty.
    if (!this.refs.orderbook.size && !this.refs.allTrades.size) {
      this.#marketDataAbortController?.abort?.();
    }

    if (!this.refs.portfolio.size) {
      this.#portfolioAbortController?.abort?.();
      this.#positionsAbortController?.abort?.();
    }
  }

  async timelineHistory({ cursor, from, to, limit = 100 }) {
    return this.getOrCreateClient(
      OperationsServiceDefinition
    ).getOperationsByCursor({
      accountId: this.document.account,
      instrumentId: '',
      from,
      to,
      // Inclusive
      cursor,
      limit,
      operationTypes: [
        OperationType.OPERATION_TYPE_BUY,
        OperationType.OPERATION_TYPE_SELL,
        OperationType.OPERATION_TYPE_BUY_CARD,
        OperationType.OPERATION_TYPE_BUY_MARGIN,
        OperationType.OPERATION_TYPE_SELL_MARGIN
      ],
      state: OperationState.OPERATION_STATE_EXECUTED,
      withoutCommissions: true
    });
  }

  onTimelineMessage({ items }) {
    for (const [source, fields] of this.subs.timeline) {
      for (const { field, datum } of fields) {
        if (datum === TRADER_DATUM.TIMELINE_ITEM) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const instrument = this.#figis.get(item.figi);

            if (instrument && Array.isArray(item.tradesInfo?.trades)) {
              for (const trade of item.tradesInfo.trades) {
                source[field] = {
                  instrument,
                  operationId: trade.num,
                  accruedInterest: toNumber(item.accruedInt),
                  commission: toNumber(item.commission),
                  parentId: item.id,
                  symbol: instrument.symbol,
                  cursor: item.cursor,
                  type: item.type,
                  exchange: instrument.exchange,
                  quantity: trade.quantity / instrument.lot,
                  price: +toNumber(trade.price).toFixed(
                    getInstrumentPrecision(instrument)
                  ),
                  createdAt: trade.date.toISOString(),
                  parentCreatedAt: item.date.toISOString()
                };
              }
            }
          }
        }
      }
    }
  }

  onOrderbookMessage({ orderbook, instrument }) {
    if (orderbook && instrument) {
      for (const [source, fields] of this.subs.orderbook) {
        if (this.instrumentsAreEqual(instrument, source.instrument)) {
          const ref = this.refs.orderbook.get(source.instrument.symbol);

          if (ref) {
            ref.lastOrderbook = orderbook;

            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.ORDERBOOK:
                  let limitDownPrice = +toNumber(orderbook.limitDown).toFixed(
                    getInstrumentPrecision(instrument)
                  );
                  let limitUpPrice = +toNumber(orderbook.limitUp).toFixed(
                    getInstrumentPrecision(instrument)
                  );

                  if (instrument.type === 'bond') {
                    limitDownPrice = this.relativeBondPriceToPrice(
                      limitDownPrice,
                      instrument
                    );
                    limitUpPrice = this.relativeBondPriceToPrice(
                      limitUpPrice,
                      instrument
                    );
                  }

                  source[field] = {
                    bids: (
                      orderbook?.bids?.map?.((b) => {
                        const p = +toNumber(b.price).toFixed(
                          getInstrumentPrecision(instrument)
                        );

                        return {
                          price:
                            instrument.type === 'bond' && !b.processed
                              ? this.relativeBondPriceToPrice(p, instrument)
                              : p,
                          volume: b.quantity,
                          processed: true
                        };
                      }) ?? []
                    )
                      .concat([
                        {
                          price: limitDownPrice,
                          pool: 'LD',
                          volume: 0,
                          processed: true
                        }
                      ])
                      .sort((a, b) => b.price - a.price),
                    asks: (
                      orderbook?.asks?.map?.((a) => {
                        const p = +toNumber(a.price).toFixed(
                          getInstrumentPrecision(instrument)
                        );

                        return {
                          price:
                            instrument.type === 'bond' && !a.processed
                              ? this.relativeBondPriceToPrice(p, instrument)
                              : p,
                          volume: a.quantity,
                          processed: true
                        };
                      }) ?? []
                    )
                      .concat({
                        price: limitUpPrice,
                        pool: 'LU',
                        volume: 0,
                        processed: true
                      })
                      .sort((a, b) => a.price - b.price)
                  };

                  break;
              }
            }
          }
        }
      }
    }
  }

  async allTrades({ instrument, depth }) {
    if (instrument) {
      const to = new Date();
      const from = new Date();

      to.setUTCHours(to.getUTCHours() + 1);
      from.setUTCHours(from.getUTCHours() - 1);

      const { trades } = await this.getOrCreateClient(
        MarketDataServiceDefinition
      ).getLastTrades({
        instrumentId: instrument.tinkoffFigi,
        from,
        to
      });

      return trades
        .slice(-depth)
        .reverse()
        .map((trade) => {
          const timestamp = trade.time.valueOf();
          const price =
            instrument.type === 'bond'
              ? this.relativeBondPriceToPrice(toNumber(trade.price), instrument)
              : +toNumber(trade.price).toFixed(
                  getInstrumentPrecision(instrument)
                );

          return {
            orderId: `${instrument.symbol}|${trade.direction}|${price}|${trade.quantity}|${timestamp}`,
            side:
              trade.direction === TradeDirection.TRADE_DIRECTION_BUY
                ? 'buy'
                : trade.direction === TradeDirection.TRADE_DIRECTION_SELL
                ? 'sell'
                : '',
            timestamp,
            symbol: instrument.symbol,
            price,
            volume: trade.quantity
          };
        });
    }

    return [];
  }

  async historicalCandles({ instrument, interval, from, to }) {
    if (instrument?.tinkoffFigi) {
      const { candles } = await this.getOrCreateClient(
        MarketDataServiceDefinition
      ).getCandles({
        instrumentId: instrument.tinkoffFigi,
        interval,
        from,
        to
      });

      return candles.map((c) => {
        if (instrument.type === 'bond') {
          return {
            open: this.relativeBondPriceToPrice(toNumber(c.open), instrument),
            high: this.relativeBondPriceToPrice(toNumber(c.high), instrument),
            low: this.relativeBondPriceToPrice(toNumber(c.low), instrument),
            close: this.relativeBondPriceToPrice(toNumber(c.close), instrument),
            time: c.time.toISOString(),
            volume: c.volume
          };
        }

        return {
          open: +toNumber(c.open).toFixed(getInstrumentPrecision(instrument)),
          high: +toNumber(c.high).toFixed(getInstrumentPrecision(instrument)),
          low: +toNumber(c.low).toFixed(getInstrumentPrecision(instrument)),
          close: +toNumber(c.close).toFixed(getInstrumentPrecision(instrument)),
          time: c.time.toISOString(),
          volume: c.volume
        };
      });
    }

    return [];
  }

  onTradeMessage({ trade, instrument }) {
    if (trade && instrument) {
      for (const [source, fields] of this.subs.allTrades) {
        if (this.instrumentsAreEqual(instrument, source.instrument)) {
          for (const { field, datum } of fields) {
            switch (datum) {
              case TRADER_DATUM.MARKET_PRINT:
                const timestamp = trade.time.valueOf();
                const price =
                  instrument.type === 'bond'
                    ? this.relativeBondPriceToPrice(
                        toNumber(trade.price),
                        instrument
                      )
                    : +toNumber(trade.price).toFixed(
                        getInstrumentPrecision(instrument)
                      );

                source[field] = {
                  orderId: `${instrument.symbol}|${trade.direction}|${price}|${trade.quantity}|${timestamp}`,
                  side:
                    trade.direction === TradeDirection.TRADE_DIRECTION_BUY
                      ? 'buy'
                      : trade.direction === TradeDirection.TRADE_DIRECTION_SELL
                      ? 'sell'
                      : '',
                  time: trade.time.toISOString(),
                  timestamp,
                  symbol: instrument.symbol,
                  price,
                  volume: trade.quantity
                };

                break;
            }
          }
        }
      }
    }
  }

  onCandleMessage({ candle, instrument }) {
    if (candle && instrument) {
      for (const [source, fields] of this.subs.candles) {
        if (this.instrumentsAreEqual(instrument, source.instrument)) {
          for (const { field, datum } of fields) {
            switch (datum) {
              case TRADER_DATUM.CANDLE:
                if (instrument.type === 'bond') {
                  source[field] = {
                    open: this.relativeBondPriceToPrice(
                      toNumber(candle.open),
                      instrument
                    ),
                    high: this.relativeBondPriceToPrice(
                      toNumber(candle.high),
                      instrument
                    ),
                    low: this.relativeBondPriceToPrice(
                      toNumber(candle.low),
                      instrument
                    ),
                    close: this.relativeBondPriceToPrice(
                      toNumber(candle.close),
                      instrument
                    ),
                    time: candle.time.toISOString(),
                    volume: candle.volume
                  };
                } else {
                  source[field] = {
                    open: +toNumber(candle.open).toFixed(
                      getInstrumentPrecision(instrument)
                    ),
                    high: +toNumber(candle.high).toFixed(
                      getInstrumentPrecision(instrument)
                    ),
                    low: +toNumber(candle.low).toFixed(
                      getInstrumentPrecision(instrument)
                    ),
                    close: +toNumber(candle.close).toFixed(
                      getInstrumentPrecision(instrument)
                    ),
                    time: candle.time.toISOString(),
                    volume: candle.volume
                  };
                }

                break;
            }
          }
        }
      }
    }
  }

  @debounce(100)
  broadcastPortfolio() {
    if (typeof this.portfolio === 'undefined') {
      return;
    }

    for (const [source, fields] of this.subs.portfolio) {
      for (const { field, datum } of fields) {
        if (datum === TRADER_DATUM.POSITION) {
          for (const [currency, size] of this.positions.money) {
            source[field] = {
              symbol: currency,
              isCurrency: true,
              isBalance: true,
              lot: 1,
              size,
              accountId: this.document.account
            };
          }

          for (const [figi, security] of this.positions.securities) {
            const instrument = this.#figis.get(figi);
            const portfolioPosition = this.portfolio.positionsMap.get(figi);

            if (instrument) {
              if (
                security.instrumentType === 'share' ||
                security.instrumentType === 'bond'
              ) {
                source[field] = {
                  instrument,
                  lot: instrument.lot,
                  symbol: instrument.symbol,
                  exchange: instrument.exchange,
                  isCurrency: false,
                  isBalance: false,
                  averagePrice: portfolioPosition
                    ? +toNumber(portfolioPosition.averagePositionPrice).toFixed(
                        getInstrumentPrecision(instrument)
                      )
                    : void 0,
                  size: (security.balance + security.blocked) / instrument.lot,
                  accountId: this.document.account
                };
              }
            }
          }

          for (const [figi, future] of this.positions.futures) {
            const instrument = this.#figis.get(figi);
            const portfolioPosition = this.portfolio.positionsMap.get(figi);

            if (instrument) {
              source[field] = {
                instrument,
                lot: instrument.lot,
                symbol: instrument.symbol,
                exchange: instrument.exchange,
                isCurrency: false,
                isBalance: false,
                averagePrice: portfolioPosition
                  ? +toNumber(portfolioPosition.averagePositionPrice).toFixed(
                      getInstrumentPrecision(instrument)
                    )
                  : void 0,
                size: (future.balance + future.blocked) / instrument.lot,
                accountId: this.document.account
              };
            }
          }
        } else {
          const sourceFigi = source.instrument?.tinkoffFigi;

          if (sourceFigi) {
            let position;

            switch (source.instrument?.type) {
              case 'stock':
              case 'bond':
                position = this.positions.securities.get(sourceFigi);

                break;

              case 'future':
                position = this.positions.futures.get(sourceFigi);

                break;
            }

            if (!position || +(position?.balance + position?.blocked) === 0) {
              source[field] = 0;
            } else {
              switch (datum) {
                case TRADER_DATUM.POSITION_SIZE:
                  source[field] =
                    (position.balance + position.blocked) /
                    source.instrument.lot;

                  break;
                case TRADER_DATUM.POSITION_AVERAGE:
                  const portfolioPosition =
                    this.portfolio.positionsMap.get(sourceFigi);

                  if (portfolioPosition) {
                    source[field] = +toNumber(
                      portfolioPosition.averagePositionPrice
                    ).toFixed(getInstrumentPrecision(source.instrument));
                  } else {
                    source[field] = 0;
                  }

                  break;
              }
            }
          }
        }
      }
    }
  }

  onPortfolioMessage(portfolio) {
    if (portfolio) {
      this.portfolio = portfolio;
      this.portfolio.positionsMap = new Map();

      this.portfolio.positions.forEach((position) =>
        this.portfolio.positionsMap.set(position.figi, position)
      );

      this.broadcastPortfolio();
    }
  }

  onPositionsMessage(position) {
    if (position) {
      const { money, blocked, securities, futures, options } = position;

      for (const m of money) {
        this.positions.money.set(m.currency.toUpperCase(), toNumber(m));
      }

      for (const b of blocked) {
        this.positions.blockedMoney.set(b.currency.toUpperCase(), toNumber(b));
      }

      for (const s of securities) {
        if (s.instrumentType === 'share' || s.instrumentType === 'bond') {
          this.positions.securities.set(s.figi, s);
        }
      }

      for (const f of futures) {
        this.positions.futures.set(f.figi, f);
      }
    }

    this.broadcastPortfolio();
  }

  async #getOrders(client) {
    const orders = [];

    for (const o of (
      await client.getOrders({
        accountId: this.document.account
      })
    ).orders) {
      const instrument = this.#figis.get(o.figi);

      if (instrument?.type === 'future') {
        const minPriceIncrementAmount = this.#futureMinPriceIncrementAmount.get(
          instrument.symbol
        );

        const { initialSecurityPrice } = o;
        const value = toNumber(initialSecurityPrice);
        let ptValue =
          (value * instrument.minPriceIncrement) / minPriceIncrementAmount;
        const precision = getInstrumentPrecision(instrument, ptValue);

        ptValue = parseFloat(ptValue.toFixed(precision));

        const money = toQuotation(ptValue);

        o.initialSecurityPrice.units = money.units;
        o.initialSecurityPrice.nano = money.nano;

        orders.push(o);
      } else {
        orders.push(o);
      }
    }

    return { orders };
  }

  async #fetchTimelineLoop() {
    if (this.refs.timeline.size) {
      try {
        if (!this.#timelineHistory.length) {
          this.#timelineHistory = (
            await this.timelineHistory({
              cursor: ''
            })
          ).items;

          this.onTimelineMessage({
            items: this.#timelineHistory
          });
        } else {
          const history = await this.timelineHistory({
            cursor: '',
            limit: 10
          });
          const newItems = [];

          for (const i of history.items) {
            if (i.id !== this.#timelineHistory[0].id) {
              newItems.push(i);
            } else {
              break;
            }
          }

          this.#timelineHistory.unshift(...newItems);

          this.onTimelineMessage({
            items: newItems
          });
        }

        setTimeout(() => {
          this.#fetchTimelineLoop();
        }, 750);
      } catch (e) {
        console.error(e);

        setTimeout(() => {
          this.#fetchTimelineLoop();
        }, 750);
      }
    }
  }

  async #fetchOrdersLoop() {
    if (this.refs.orders.size) {
      try {
        const client = this.getOrCreateClient(OrdersServiceDefinition);
        const { orders } = await this.#getOrders(client);
        const newOrders = new Set();

        for (const o of orders) {
          newOrders.add(o.orderId);

          if (!this.orders.has(o.orderId)) {
            this.orders.set(o.orderId, o);
            this.onOrdersMessage({ order: o });
          }
        }

        for (const [orderId, order] of this.orders) {
          if (!newOrders.has(orderId)) {
            order.executionReportStatus =
              OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_UNSPECIFIED;

            this.onOrdersMessage({ order });
            this.orders.delete(orderId);
          }
        }

        setTimeout(() => {
          this.#fetchOrdersLoop();
        }, 750);
      } catch (e) {
        console.error(e);

        setTimeout(() => {
          this.#fetchOrdersLoop();
        }, 750);
      }
    }
  }

  #getOrderStatus(o = {}) {
    switch (o.executionReportStatus) {
      case OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_CANCELLED:
        return 'canceled';
      case OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_REJECTED:
        return 'rejected';
      case OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_FILL:
        return 'filled';
      case OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_PARTIALLYFILL:
      case OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_NEW:
        return 'working';
      case OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_UNSPECIFIED:
        return 'unspecified';
    }
  }

  onOrdersMessage({ order }) {
    if (order) {
      for (const [source, fields] of this.subs.orders) {
        for (const { field, datum } of fields) {
          if (datum === TRADER_DATUM.CURRENT_ORDER) {
            const instrument = this.#figis.get(order.figi);

            if (!instrument) continue;

            source[field] = {
              instrument,
              orderId: order.orderId,
              symbol: order.figi,
              exchange: 0,
              orderType:
                order.orderType === OrderType.ORDER_TYPE_LIMIT
                  ? 'limit'
                  : 'market',
              side:
                order.direction === OrderDirection.ORDER_DIRECTION_BUY
                  ? 'buy'
                  : 'sell',
              status: this.#getOrderStatus(order),
              placedAt: order.orderDate.toISOString(),
              endsAt: null,
              quantity: order.lotsRequested,
              filled: order.lotsExecuted,
              price:
                instrument.type === 'bond'
                  ? this.relativeBondPriceToPrice(
                      toNumber(order.initialSecurityPrice),
                      instrument
                    )
                  : +toNumber(order.initialSecurityPrice).toFixed(
                      getInstrumentPrecision(instrument)
                    )
            };
          }
        }
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await super.instrumentChanged(source, oldValue, newValue);

    if (newValue?.symbol) {
      // Handle no real subscription case for orderbook, just broadcast.
      this.onOrderbookMessage({
        orderbook: this.refs.orderbook.get(newValue.symbol)?.lastOrderbook,
        instrument: newValue
      });
    }

    // Broadcast portfolio for order widgets (at least).
    if (this.subs.portfolio.has(source)) {
      this.onPortfolioMessage(this.portfolio);
    }
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.TINKOFF;
  }

  getExchange() {
    return EXCHANGE.RUS;
  }

  getExchangeForDBRequest() {
    return {
      $in: [EXCHANGE.SPBX, EXCHANGE.MOEX]
    };
  }

  getBroker() {
    return BROKERS.TINKOFF;
  }

  getInstrumentIconUrl(instrument) {
    if (!instrument) {
      return 'static/instruments/unknown.svg';
    }

    let symbol = instrument?.symbol;

    if (typeof symbol === 'string') {
      symbol = symbol.split('@')[0];
    }

    if (instrument?.currency === 'HKD') {
      return `static/instruments/stocks/hk/${symbol.replace(' ', '-')}.svg`;
    }

    if (
      instrument?.exchange === EXCHANGE.MOEX ||
      instrument?.currency === 'RUB'
    ) {
      return `static/instruments/${instrument.type}s/rus/${symbol.replace(
        ' ',
        '-'
      )}.svg`;
    }

    if (instrument?.exchange === EXCHANGE.SPBX && symbol !== 'TCS') {
      return `static/instruments/stocks/us/${symbol.replace(' ', '-')}.svg`;
    }

    return super.getInstrumentIconUrl(instrument);
  }

  supportsInstrument(instrument) {
    if (instrument?.symbol === 'FIVE' && instrument?.exchange === EXCHANGE.SPBX)
      return false;

    return super.supportsInstrument(instrument);
  }

  async formatError(instrument, error) {
    const details = +error.details;

    switch (details) {
      case 30042:
        return 'Недостаточно активов для маржинальной сделки.';
      case 30049:
        return 'Ошибка метода выставления торгового поручения.';
      case 30052:
        return 'Для данного инструмента недоступна торговля через API.';
      case 30055:
        return 'order_id не может быть длиннее 36 символов';
      case 30057:
        return 'Заявка является дублем, но отчет по заявке не найден.';
      case 30059:
        return 'Ошибка метода отмены заявки.';
      case 30068:
        return 'В настоящий момент возможно выставление только лимитного торгового поручения.';
      case 30079:
        return 'Инструмент недоступен для торгов.';
      case 30081:
        return 'Аккаунт закрыт.';
      case 30082:
        return 'Аккаунт заблокирован.';
      case 30083:
        return 'Некорректный тип заявки.';
      case 30097:
        return 'Торговая сессия не идёт.';
      case 30092:
        return 'Торги недоступны по нерабочим дням.';
      case 30099:
        return 'Цена вне лимитов по инструменту или цена сделки вне лимита.';
      case 30100:
        return 'Цена должна быть положительной.';
      case 40002:
        return 'Недостаточно прав для совершения операции. Токен доступа имеет уровень прав read-only.';
      case 40003:
        return 'Токен доступа не найден или не активен.';
      case 40004:
        return 'Выставление заявок недоступно с текущего аккаунта.';
      case 80002:
        return 'Превышен лимит запросов в минуту.';
      case 90001:
        return 'Требуется подтверждение операции.';
      case 90002:
        return 'Торговля этим инструментом доступна только квалифицированным инвесторам.';
    }

    return 'Неизвестная ошибка, смотрите консоль браузера.';
  }
}

export default TinkoffGrpcWebTrader;
