/** @decorator */

import { TRADER_DATUM, WIDGET_TYPES } from '../const.js';
import { Trader } from './common-trader.js';
import { cyrillicToLatin } from '../intl.js';
import { debounce } from '../ppp-throttle.js';
import { createClient } from '../../vendor/nice-grpc-web/client/ClientFactory.js';
import { createChannel } from '../../vendor/nice-grpc-web/client/channel.js';
import { Metadata } from '../../vendor/nice-grpc-web/nice-grpc-common/Metadata.js';
import {
  MarketDataServiceDefinition,
  MarketDataStreamServiceDefinition,
  SubscriptionAction,
  TradeDirection
} from '../../vendor/tinkoff/definitions/market-data.js';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrdersServiceDefinition,
  OrderType,
  PriceType
} from '../../vendor/tinkoff/definitions/orders.js';
import { isAbortError } from '../../vendor/abort-controller-x.js';
import { TradingError } from '../trading-error.js';
import { uuidv4 } from '../ppp-crypto.js';
import ppp from '../../ppp.js';

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
  return value ? value.units + value.nano / 1000000000 : value;
}

class TinkoffGrpcWebTrader extends Trader {
  #instruments = new Map();

  #clients = new Map();

  #metadata;

  #marketDataAbortController;

  #pendingInstrumentCachePromise;

  // Key: figi ; Value: instrument object
  #figis = new Map();

  orders = new Map();

  // Key: widget instance; Value: [{ field, datum }] array
  subs = {
    orderbook: new Map(),
    allTrades: new Map(),
    orders: new Map()
  };

  // Key: instrumentId; Value: { instrument, refCount }
  // Value contains lastOrderbookData for orderbook
  refs = {
    orderbook: new Map(),
    allTrades: new Map(),
    orders: new Map()
  };

  constructor(document) {
    super(document);

    this.#metadata = new Metadata({
      Authorization: `Bearer ${this.document.broker.apiToken}`,
      'x-app-name': `${ppp.keyVault.getKey('github-login')}.ppp`
    });
  }

  async sayHello(widget) {
    if (widget === WIDGET_TYPES.SCALPING_BUTTONS) {
      await this.#buildInstrumentCache();
    }

    return super.sayHello();
  }

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
            if (result.value.tinkoffFigi) {
              this.#instruments.set(result.value.tinkoffFigi, result.value);
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

  async cancelAllLimitOrders({ instrument }) {
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

      const { orders } = await client.getOrders({
        accountId: this.document.account
      });

      for (const o of orders) {
        const status = this.#getOrderStatus(o);

        if (status === 'working') {
          if (instrument && o.figi !== instrument.tinkoffFigi) continue;

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

      const { orders } = await client.getOrders({
        accountId: this.document.account
      });

      for (const o of orders) {
        const status = this.#getOrderStatus(o);
        const orderSide =
          o.direction === OrderDirection.ORDER_DIRECTION_BUY ? 'buy' : 'sell';

        if (status === 'working' && orderSide === side) {
          const orderInstrument = this.#instruments.get(o.figi);

          if (orderInstrument && orderInstrument.minPriceIncrement > 0) {
            await client.replaceOrder({
              accountId: this.document.account,
              orderId: o.orderId,
              idempotencyKey: this.#orderId(),
              quantity: o.lotsRequested - o.lotsExecuted,
              price: toQuotation(
                +this.fixPrice(
                  orderInstrument,
                  toNumber(o.initialSecurityPrice) +
                    orderInstrument.minPriceIncrement * value
                )
              ),
              priceType: PriceType.PRICE_TYPE_CURRENCY
            });
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

  async #resubscribeToMarketDataStream(reconnect = false) {
    if (!this.refs.orderbook.size && !this.refs.allTrades.size) {
      return;
    }

    const marketDataServerSideStreamRequest = {};
    const orderbookRefsArray = [...this.refs.orderbook.values()];
    const allTradesRefsArray = [...this.refs.allTrades.values()];

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

  getSymbol(instrument = {}) {
    let symbol = instrument.symbol;

    if (/~/gi.test(symbol)) symbol = symbol.split('~')[0];

    return symbol;
  }

  subsAndRefs(datum) {
    return {
      [TRADER_DATUM.ORDERBOOK]: [this.subs.orderbook, this.refs.orderbook],
      [TRADER_DATUM.MARKET_PRINT]: [this.subs.allTrades, this.refs.allTrades],
      [TRADER_DATUM.CURRENT_ORDER]: [this.subs.orders, this.refs.orders]
    }[datum];
  }

  async subscribeField({ source, field, datum }) {
    if (datum === TRADER_DATUM.CURRENT_ORDER) {
      await this.#buildInstrumentCache();
    }

    await super.subscribeField({ source, field, datum });

    switch (datum) {
      case TRADER_DATUM.CURRENT_ORDER: {
        for (const [_, order] of this.orders) {
          this.onOrdersMessage({
            order
          });
        }

        break;
      }
    }
  }

  async addFirstRef(instrument, refs) {
    refs.set(instrument._id, {
      refCount: 1,
      instrument
    });

    this.#figis.set(instrument.tinkoffFigi, instrument);

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

    if (refs === this.refs.orderbook || refs === this.refs.allTrades) {
      this.resubscribeToMarketDataStream();
    }

    if (refs === this.refs.orders) {
      void this.#fetchOrdersLoop();
    }
  }

  async removeLastRef(instrument, refs) {
    if (refs === this.refs.orderbook) {
      this.refs.orderbook.delete(instrument._id);
    }

    if (refs === this.refs.allTrades) {
      this.refs.allTrades.delete(instrument._id);
    }

    if (refs === this.refs.orders) {
      this.orders.clear();
    }

    if (!this.refs.orderbook.size && !this.refs.allTrades.size) {
      // Abort market data stream if everything is empty.
      this.#marketDataAbortController?.abort?.();
    }
  }

  onOrderbookMessage({ orderbook, instrument }) {
    if (orderbook && instrument) {
      for (const [source, fields] of this.subs.orderbook) {
        if (source.instrument?._id === instrument._id) {
          const ref = this.refs.orderbook.get(source.instrument._id);

          if (ref) {
            ref.lastOrderbookData = orderbook;

            for (const { field, datum } of fields) {
              switch (datum) {
                case TRADER_DATUM.ORDERBOOK:
                  source[field] = {
                    bids:
                      orderbook?.bids?.map?.((b) => {
                        return {
                          price: toNumber(b.price),
                          volume: b.quantity
                        };
                      }) ?? [],
                    asks:
                      orderbook?.asks?.map?.((a) => {
                        return {
                          price: toNumber(a.price),
                          volume: a.quantity
                        };
                      }) ?? []
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
          const price = toNumber(trade.price);

          return {
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
        });
    }

    return [];
  }

  onTradeMessage({ trade, instrument }) {
    if (trade && instrument) {
      for (const [source, fields] of this.subs.allTrades) {
        if (source.instrument?._id === instrument._id) {
          for (const { field, datum } of fields) {
            switch (datum) {
              case TRADER_DATUM.MARKET_PRINT:
                const timestamp = trade.time.valueOf();
                const price = toNumber(trade.price);

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

  async #fetchOrdersLoop() {
    if (this.refs.orders.size) {
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

        const { orders } = await client.getOrders({
          accountId: this.document.account
        });

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
            const instrument = this.#instruments.get(order.figi);

            source[field] = {
              instrument: instrument ?? {
                symbol: order.figi,
                currency: order.currency.toUpperCase(),
                lot: Math.round(
                  toNumber(order.initialOrderPrice) /
                    toNumber(order.initialSecurityPrice) /
                    order.lotsRequested
                )
              },
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
              price: toNumber(order.initialSecurityPrice)
            };
          }
        }
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await super.instrumentChanged(source, oldValue, newValue);

    if (newValue?._id) {
      // Handle no real subscription case for orderbook.
      this.onOrderbookMessage({
        orderbook: this.refs.orderbook.get(newValue._id)?.lastOrderbookData,
        instrument: newValue
      });
    }
  }

  getBrokerType() {
    return this.document.broker.type;
  }

  getExchange() {
    return ['moex', 'spbex'];
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
                tinkoffFigi: {
                  $exists: true,
                  $ne: null
                }
              },
              {
                type: {
                  $in: ['currency', 'bond', 'stock', 'future', 'option']
                }
              },
              {
                exchange: {
                  $in: ['spbex', 'moex']
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
                tinkoffFigi: {
                  $exists: true,
                  $ne: null
                }
              },
              {
                type: {
                  $in: ['currency', 'bond', 'stock', 'future', 'option']
                }
              },
              {
                exchange: {
                  $in: ['spbex', 'moex']
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
                tinkoffFigi: {
                  $exists: true,
                  $ne: null
                }
              },
              {
                type: {
                  $in: ['currency', 'bond', 'stock', 'future', 'option']
                }
              },
              {
                exchange: {
                  $in: ['spbex', 'moex']
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
          .replaceAll('$broker', this.getBrokerType?.() ?? '')
          .replaceAll('$text', searchText.toUpperCase())
          .replaceAll('$latin', cyrillicToLatin(searchText).toUpperCase())
      );
    }
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
      case 30092:
        return 'Торги недоступны по нерабочим дням.';
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
