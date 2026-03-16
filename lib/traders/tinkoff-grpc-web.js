/** @decorator */

import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM
} from '../const.js';
import {
  GlobalTraderDatum,
  Trader,
  TraderDatum,
  TraderEventDatum,
  unsupportedInstrument,
  pppTraderInstanceForWorkerIs,
  ConditionalOrderDatum
} from './trader-worker.js';
import { debounce } from '../ppp-decorators.js';
import { createClient } from '../../vendor/nice-grpc-web/client/ClientFactory.js';
import { createChannel } from '../../vendor/nice-grpc-web/client/channel.js';
import { Metadata } from '../../vendor/nice-grpc-web/nice-grpc-common/Metadata.js';
import {
  CandleInterval,
  MarketDataServiceDefinition,
  MarketDataStreamServiceDefinition,
  SubscriptionAction,
  SubscriptionInterval,
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
import { TradingError } from '../ppp-exceptions.js';
import { uuidv4 } from '../ppp-crypto.js';
import {
  OperationsServiceDefinition,
  OperationsStreamServiceDefinition,
  OperationState,
  OperationType
} from '../../vendor/tinkoff/definitions/operations.js';
import { getInstrumentPrecision } from '../intl.js';

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

class TinkoffTraderDatum extends TraderDatum {
  filter(data, instrument, source, datum) {
    if (instrument.exchange === EXCHANGE.SPBX) {
      return [EXCHANGE.SPBX, EXCHANGE.US, EXCHANGE.UTEX_MARGIN_STOCKS].includes(
        source?.instrument?.exchange
      );
    }

    return source?.instrument?.exchange === instrument.exchange;
  }
}

class OrderbookDatum extends TinkoffTraderDatum {
  async firstReferenceAdded(source) {
    const instrument = this.trader.adoptInstrument(source.instrument);

    if (!instrument.notSupported && instrument.tinkoffFigi) {
      this.dataArrived(
        await this.trader
          .getOrCreateClient(MarketDataServiceDefinition)
          .getOrderBook({
            instrumentId: instrument.tinkoffFigi,
            depth: 50
          }),
        instrument
      );
    }

    return this.trader.resubscribeToMarketDataStream();
  }

  async lastReferenceRemoved() {
    return this.trader.resubscribeToMarketDataStream();
  }

  [TRADER_DATUM.ORDERBOOK](data, instrument) {
    let limitDownPrice = +toNumber(data.limitDown).toFixed(
      getInstrumentPrecision(instrument)
    );
    let limitUpPrice = +toNumber(data.limitUp).toFixed(
      getInstrumentPrecision(instrument)
    );

    if (instrument.type === 'bond') {
      limitDownPrice = this.trader.relativeBondPriceToPrice(
        limitDownPrice,
        instrument
      );
      limitUpPrice = this.trader.relativeBondPriceToPrice(
        limitUpPrice,
        instrument
      );
    }

    return {
      bids: (
        data?.bids?.map?.((b) => {
          if (b.pool) {
            return b;
          }

          const p = +toNumber(b.price).toFixed(
            getInstrumentPrecision(instrument)
          );

          return {
            price:
              instrument.type === 'bond'
                ? this.trader.relativeBondPriceToPrice(p, instrument)
                : p,
            volume: b.quantity,
            pool: instrument.exchange
          };
        }) ?? []
      )
        .concat([
          {
            price: limitDownPrice,
            pool: 'LD',
            volume: 0
          }
        ])
        .sort((a, b) => b.price - a.price),
      asks: (
        data?.asks?.map?.((a) => {
          if (a.pool) {
            return a;
          }

          const p = +toNumber(a.price).toFixed(
            getInstrumentPrecision(instrument)
          );

          return {
            price:
              instrument.type === 'bond'
                ? this.trader.relativeBondPriceToPrice(p, instrument)
                : p,
            volume: a.quantity,
            pool: instrument.exchange
          };
        }) ?? []
      )
        .concat({
          price: limitUpPrice,
          pool: 'LU',
          volume: 0
        })
        .sort((a, b) => a.price - b.price)
    };
  }
}

class TimeAndSalesDatum extends TinkoffTraderDatum {
  async firstReferenceAdded() {
    return this.trader.resubscribeToMarketDataStream();
  }

  async lastReferenceRemoved() {
    return this.trader.resubscribeToMarketDataStream();
  }

  [TRADER_DATUM.MARKET_PRINT](print, instrument) {
    const timestamp = print.time.valueOf();
    const price =
      instrument.type === 'bond'
        ? this.trader.relativeBondPriceToPrice(
            toNumber(print.price),
            instrument
          )
        : +toNumber(print.price).toFixed(getInstrumentPrecision(instrument));

    return {
      tradeId: `${instrument.symbol}|${print.direction}|${price}|${print.quantity}|${timestamp}`,
      side:
        print.direction === TradeDirection.TRADE_DIRECTION_BUY
          ? 'buy'
          : print.direction === TradeDirection.TRADE_DIRECTION_SELL
            ? 'sell'
            : '',
      timestamp,
      symbol: instrument.symbol,
      price,
      volume: print.quantity,
      pool: instrument.exchange
    };
  }
}

class CandleDatum extends TinkoffTraderDatum {
  filter(data, instrument, source, datum) {
    const sup = super.filter(data, instrument, source, datum);

    if (sup) {
      if (datum === TRADER_DATUM.CANDLE && typeof data.interval === 'number') {
        return (data.interval * 60).toString() === source.getAttribute('tf');
      }
    }

    return sup;
  }

  async firstReferenceAdded() {
    return this.trader.resubscribeToMarketDataStream();
  }

  async lastReferenceRemoved() {
    return this.trader.resubscribeToMarketDataStream();
  }

  [TRADER_DATUM.CANDLE](candle, instrument) {
    if (instrument.type === 'bond') {
      return {
        symbol: instrument.symbol,
        // In seconds.
        tf: 60,
        open: this.trader.relativeBondPriceToPrice(
          toNumber(candle.open),
          instrument
        ),
        high: this.trader.relativeBondPriceToPrice(
          toNumber(candle.high),
          instrument
        ),
        low: this.trader.relativeBondPriceToPrice(
          toNumber(candle.low),
          instrument
        ),
        close: this.trader.relativeBondPriceToPrice(
          toNumber(candle.close),
          instrument
        ),
        timestamp: candle.time.valueOf(),
        volume: candle.volume
      };
    } else {
      return {
        symbol: instrument.symbol,
        tf: 60,
        open: +toNumber(candle.open).toFixed(
          getInstrumentPrecision(instrument)
        ),
        high: +toNumber(candle.high).toFixed(
          getInstrumentPrecision(instrument)
        ),
        low: +toNumber(candle.low).toFixed(getInstrumentPrecision(instrument)),
        close: +toNumber(candle.close).toFixed(
          getInstrumentPrecision(instrument)
        ),
        timestamp: candle.time.valueOf(),
        volume: candle.volume
      };
    }
  }
}

class PositionsDatum extends GlobalTraderDatum {
  portfolio;

  positions = {
    money: new Map(),
    blockedMoney: new Map(),
    securities: new Map(),
    futures: new Map(),
    options: new Map()
  };

  onPortfolio(portfolio) {
    if (portfolio) {
      this.portfolio = portfolio;
      this.portfolio.positionsMap = new Map();

      this.portfolio.positions.forEach((position) =>
        this.portfolio.positionsMap.set(position.figi, position)
      );

      this.broadcastPortfolio();
    }
  }

  onPositions(position) {
    if (position) {
      const { money, blocked, securities, futures, options } = position;

      for (const m of money) {
        this.positions.money.set(m.currency.toUpperCase(), toNumber(m));
      }

      for (const b of blocked) {
        this.positions.blockedMoney.set(b.currency.toUpperCase(), toNumber(b));
      }

      for (const s of securities) {
        if (
          s.instrumentType === 'share' ||
          s.instrumentType === 'bond' ||
          s.instrumentType === 'etf'
        ) {
          this.positions.securities.set(s.figi, s);
        }
      }

      for (const f of futures) {
        this.positions.futures.set(f.figi, f);
      }
    }

    this.broadcastPortfolio();
  }

  @debounce(100)
  broadcastPortfolio() {
    if (typeof this.portfolio === 'undefined') {
      return;
    }

    for (const [currency, size] of this.positions.money) {
      this.dataArrived({
        symbol: currency,
        isCurrency: true,
        isBalance: true,
        lot: 1,
        size,
        accountId: this.trader.document.account
      });
    }

    for (const [figi, security] of this.positions.securities) {
      const instrument = this.trader.figis.get(figi);
      const portfolioPosition = this.portfolio.positionsMap.get(figi);

      if (instrument) {
        if (
          security.instrumentType === 'share' ||
          security.instrumentType === 'bond' ||
          security.instrumentType === 'etf'
        ) {
          this.dataArrived({
            figi,
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
            accountId: this.trader.document.account
          });
        }
      }
    }

    for (const [figi, future] of this.positions.futures) {
      const instrument = this.trader.figis.get(figi);
      const portfolioPosition = this.portfolio.positionsMap.get(figi);

      if (instrument) {
        this.dataArrived({
          figi,
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
          accountId: this.trader.document.account
        });
      }
    }
  }

  valueKeyForData(data) {
    return data?.figi ?? data?.symbol;
  }

  filter(data, source, key, datum) {
    if (datum !== TRADER_DATUM.POSITION) {
      if (data.isBalance) {
        return data.symbol === source.getAttribute('balance');
      }

      return data.figi === source.instrument?.tinkoffFigi;
    } else {
      return true;
    }
  }

  async firstReferenceAdded() {
    this.portfolio = await this.trader
      .getOrCreateClient(OperationsServiceDefinition)
      .getPortfolio({
        accountId: this.trader.document.account
      });

    // No direct assignment - it's a map collection!
    this.onPositions(
      await this.trader
        .getOrCreateClient(OperationsServiceDefinition)
        .getPositions({
          accountId: this.trader.document.account
        })
    );

    this.onPortfolio(this.portfolio);
    await this.trader.resubscribeToPortfolioStream();

    return this.trader.resubscribeToPositionsStream();
  }

  async lastReferenceRemoved() {
    await this.trader.resubscribeToPortfolioStream();

    return this.trader.resubscribeToPositionsStream();
  }

  [TRADER_DATUM.POSITION](data) {
    return data;
  }

  #getPositionByFigi(data) {
    switch (data.instrument.type) {
      case 'stock':
      case 'etf':
      case 'bond':
        return this.positions.securities.get(data.figi);
      case 'future':
        return this.positions.futures.get(data.figi);
    }
  }

  [TRADER_DATUM.POSITION_SIZE](data) {
    if (data.isBalance) {
      return data.size;
    } else if (data.instrument) {
      const position = this.#getPositionByFigi(data);

      if (!position || +(position?.balance + position?.blocked) === 0) {
        return 0;
      } else {
        return (position.balance + position.blocked) / data.instrument.lot;
      }
    }
  }

  [TRADER_DATUM.POSITION_AVERAGE](data) {
    if (!data.isBalance) {
      if (data.instrument) {
        const position = this.#getPositionByFigi(data);

        if (!position || +(position?.balance + position?.blocked) === 0) {
          return 0;
        } else {
          const portfolioPosition = this.portfolio.positionsMap?.get(data.figi);

          if (portfolioPosition) {
            return +toNumber(portfolioPosition.averagePositionPrice).toFixed(
              getInstrumentPrecision(data.instrument)
            );
          } else {
            return 0;
          }
        }
      }
    }
  }
}

class TimelineDatum extends GlobalTraderDatum {
  // Timeline data needs special handling.
  // Trades are arrays inside actual data items.
  manualAssignment = true;

  disableOptimizations = true;

  // Internal history for diffing.
  #timelineHistory = [];

  #timer;

  #shouldLoop = false;

  async #fetchTimelineLoop() {
    if (this.#shouldLoop) {
      try {
        if (!this.#timelineHistory.length) {
          this.#timelineHistory = (
            await this.trader.historicalTimeline({
              cursor: ''
            })
          ).items;

          for (const item of this.#timelineHistory) {
            this.dataArrived(item);
          }
        } else {
          const history = await this.trader.historicalTimeline({
            cursor: '',
            limit: 10
          });
          const newItems = [];

          for (const i of history.items) {
            if (i.id && i.id !== this.#timelineHistory[0]?.id) {
              newItems.push(i);
            } else {
              break;
            }
          }

          this.#timelineHistory.unshift(...newItems);

          for (const item of newItems) {
            this.dataArrived(item);
          }
        }

        this.#timer = setTimeout(() => {
          this.#fetchTimelineLoop();
        }, 750);
      } catch (e) {
        this.trader.$$debug('#fetchTimelineLoop failed: %s', e.message);

        this.#timer = setTimeout(() => {
          this.#fetchTimelineLoop();
        }, 750);
      }
    }
  }

  firstReferenceAdded() {
    this.#timelineHistory = [];

    clearTimeout(this.#timer);

    this.#shouldLoop = true;

    return this.#fetchTimelineLoop();
  }

  lastReferenceRemoved() {
    this.#timelineHistory = [];

    clearTimeout(this.#timer);

    this.#shouldLoop = false;
  }

  valueKeyForData(data) {
    return data.id;
  }

  [TRADER_DATUM.TIMELINE_ITEM](data, { source, field }) {
    const instrument = this.trader.figis.get(data.figi);

    if (instrument && Array.isArray(data.tradesInfo?.trades)) {
      for (const trade of data.tradesInfo.trades) {
        this.trader.assignSourceField(source, field, {
          instrument,
          operationId: trade.num,
          accruedInterest: toNumber(data.accruedInt),
          commission: toNumber(data.commission),
          parentId: data.id,
          symbol: instrument.symbol,
          cursor: data.cursor,
          type: data.type,
          exchange: instrument.exchange,
          quantity: trade.quantity / instrument.lot,
          price: +toNumber(trade.price).toFixed(
            getInstrumentPrecision(instrument)
          ),
          createdAt: trade.date.toISOString(),
          parentCreatedAt: data.date.toISOString()
        });
      }
    }
  }
}

class RealOrderDatum extends GlobalTraderDatum {
  #timer;

  #shouldLoop = false;

  orders = new Map();

  async #fetchOrdersLoop() {
    if (this.#shouldLoop) {
      try {
        const client = this.trader.getOrCreateClient(OrdersServiceDefinition);
        const { orders } = await this.trader.getOrders(client);
        const newOrders = new Set();

        for (const o of orders) {
          newOrders.add(
            `${o.orderId}|${toNumber(o.initialSecurityPrice)}|${
              o.lotsExecuted
            }|${o.lotsRequested}`
          );

          if (!this.orders.has(o.orderId)) {
            this.orders.set(o.orderId, o);
            this.dataArrived(o);
          }
        }

        for (const [orderId, order] of this.orders) {
          if (
            !newOrders.has(
              `${orderId}|${toNumber(order.initialSecurityPrice)}|${
                order.lotsExecuted
              }|${order.lotsRequested}`
            )
          ) {
            // Order is absent, hide it from the listing.
            order.executionReportStatus =
              OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_UNSPECIFIED;

            this.dataArrived(order);
            this.orders.delete(orderId);
          }
        }

        this.#timer = setTimeout(() => {
          this.#fetchOrdersLoop();
        }, 750);
      } catch (e) {
        this.trader.$$debug('#fetchOrdersLoop failed: %s', e.message);

        this.#timer = setTimeout(() => {
          this.#fetchOrdersLoop();
        }, 750);
      }
    }
  }

  firstReferenceAdded() {
    this.orders.clear();

    clearTimeout(this.#timer);

    this.#shouldLoop = true;

    return this.#fetchOrdersLoop();
  }

  lastReferenceRemoved() {
    this.orders.clear();
    clearTimeout(this.#timer);

    this.#shouldLoop = false;
  }

  valueKeyForData(data) {
    return data.orderId;
  }

  [TRADER_DATUM.REAL_ORDER](order, { origin }) {
    const instrument = this.trader.figis.get(order.figi);

    if (instrument) {
      return {
        instrument,
        orderId: order.orderId,
        symbol: order.figi,
        exchange: instrument.exchange,
        orderType:
          order.orderType === OrderType.ORDER_TYPE_LIMIT ? 'limit' : 'market',
        side:
          order.direction === OrderDirection.ORDER_DIRECTION_BUY
            ? 'buy'
            : 'sell',
        status: this.trader.getOrderStatus(order),
        placedAt: order.orderDate.toISOString(),
        endsAt: null,
        quantity: order.lotsRequested,
        filled: order.lotsExecuted,
        price:
          instrument.type === 'bond'
            ? this.trader.relativeBondPriceToPrice(
                toNumber(order.initialSecurityPrice),
                instrument
              )
            : +toNumber(order.initialSecurityPrice).toFixed(
                getInstrumentPrecision(instrument)
              ),
        origin
      };
    }
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} TinkoffGrpcWebTrader
 */
class TinkoffGrpcWebTrader extends Trader {
  #clients = new Map();

  #metadata;

  #marketDataAbortController;

  #portfolioAbortController;

  #positionsAbortController;

  // Key: figi ; Value: instrument object.
  #figis = new Map();

  get figis() {
    return this.#figis;
  }

  // Key: ticker ; Value: minPriceIncrementAmount.
  #futureMinPriceIncrementAmount = new Map();

  constructor(document) {
    super(document, [
      {
        type: OrderbookDatum,
        datums: [TRADER_DATUM.ORDERBOOK]
      },
      {
        type: TimeAndSalesDatum,
        datums: [TRADER_DATUM.MARKET_PRINT]
      },
      {
        type: CandleDatum,
        datums: [TRADER_DATUM.CANDLE]
      },
      {
        type: PositionsDatum,
        datums: [
          TRADER_DATUM.POSITION,
          TRADER_DATUM.POSITION_SIZE,
          TRADER_DATUM.POSITION_AVERAGE
        ]
      },
      {
        type: RealOrderDatum,
        datums: [TRADER_DATUM.REAL_ORDER]
      },
      {
        type: TimelineDatum,
        datums: [TRADER_DATUM.TIMELINE_ITEM]
      },
      {
        type: TraderEventDatum,
        datums: [TRADER_DATUM.TRADER]
      },
      {
        type: ConditionalOrderDatum,
        datums: [TRADER_DATUM.CONDITIONAL_ORDER]
      }
    ]);

    this.#metadata = new Metadata({
      Authorization: `Bearer ${this.document.broker.apiToken}`,
      'x-app-name': 'johnpantini.ppp'
    });
  }

  getTimeframeList() {
    return [
      {
        name: 'Sec',
        values: []
      },
      {
        name: 'Min',
        values: [1, 2, 3, 5, 10, 15, 30]
      },
      {
        name: 'Hour',
        values: [1, 2, 4]
      },
      {
        name: 'Day',
        values: [1]
      },
      {
        name: 'Week',
        values: [1]
      },
      {
        name: 'Month',
        values: [1]
      }
    ];
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

  async instrumentsArrived(instruments) {
    for (const [, instrument] of instruments) {
      if (instrument.tinkoffFigi) {
        this.#figis.set(instrument.tinkoffFigi, instrument);
      }
    }

    return super.instrumentsArrived(instruments);
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

  @debounce(100)
  resubscribeToMarketDataStream() {
    return this.#resubscribeToMarketDataStream();
  }

  @debounce(100)
  resubscribeToPortfolioStream() {
    return this.#resubscribeToPortfolioStream();
  }

  @debounce(100)
  resubscribeToPositionsStream() {
    return this.#resubscribeToPositionsStream();
  }

  async #resubscribeToMarketDataStream() {
    if (
      !this.datums[TRADER_DATUM.ORDERBOOK].refs.size &&
      !this.datums[TRADER_DATUM.MARKET_PRINT].refs.size &&
      !this.datums[TRADER_DATUM.CANDLE].refs.size
    ) {
      return;
    }

    const marketDataServerSideStreamRequest = {};
    const orderbookSymbolsArray = [];
    const timeAndSalesSymbolsArray = [];
    const candleSymbolsArray = [];

    for (const [symbol, refCount] of this.datums[TRADER_DATUM.ORDERBOOK].refs) {
      if (refCount > 0) {
        orderbookSymbolsArray.push(symbol);
      }
    }

    for (const [symbol, refCount] of this.datums[TRADER_DATUM.MARKET_PRINT]
      .refs) {
      if (refCount > 0) {
        timeAndSalesSymbolsArray.push(symbol);
      }
    }

    for (const [symbol, refCount] of this.datums[TRADER_DATUM.CANDLE].refs) {
      if (refCount > 0) {
        candleSymbolsArray.push(symbol);
      }
    }

    if (orderbookSymbolsArray.length) {
      marketDataServerSideStreamRequest.subscribeOrderBookRequest = {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: []
      };

      orderbookSymbolsArray.forEach((symbol) => {
        const instrument = this.instruments.get(symbol);

        if (instrument) {
          marketDataServerSideStreamRequest.subscribeOrderBookRequest.instruments.push(
            {
              instrumentId: instrument.tinkoffFigi,
              depth: 50
            }
          );
        }
      });
    }

    if (timeAndSalesSymbolsArray.length) {
      marketDataServerSideStreamRequest.subscribeTradesRequest = {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: []
      };

      timeAndSalesSymbolsArray.forEach((symbol) => {
        const instrument = this.instruments.get(symbol);

        if (instrument) {
          marketDataServerSideStreamRequest.subscribeTradesRequest.instruments.push(
            {
              instrumentId: instrument.tinkoffFigi
            }
          );
        }
      });
    }

    if (candleSymbolsArray.length) {
      marketDataServerSideStreamRequest.subscribeCandlesRequest = {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: [],
        waitingClose: false
      };

      candleSymbolsArray.forEach((symbol) => {
        const instrument = this.instruments.get(symbol);

        if (instrument) {
          marketDataServerSideStreamRequest.subscribeCandlesRequest.instruments.push(
            {
              instrumentId: instrument.tinkoffFigi,
              interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
            }
          );
        }
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
      for await (const data of stream) {
        if (data.orderbook) {
          this.datums[TRADER_DATUM.ORDERBOOK].dataArrived(
            data.orderbook,
            this.#figis.get(data.orderbook.figi)
          );
        } else if (data.trade) {
          this.datums[TRADER_DATUM.MARKET_PRINT].dataArrived(
            data.trade,
            this.#figis.get(data.trade.figi)
          );
        } else if (data.candle) {
          this.datums[TRADER_DATUM.CANDLE].dataArrived(
            data.candle,
            this.#figis.get(data.candle.figi)
          );
        }
      }

      await this.resubscribe([TRADER_DATUM.ORDERBOOK]);
      this.resubscribeToMarketDataStream();
      this.traderEvent({ event: 'reconnect' });
    } catch (e) {
      if (!isAbortError(e)) {
        this.$$debug('#resubscribeToMarketDataStream failed: %s', e.message);

        setTimeout(
          async () => {
            await this.resubscribe([TRADER_DATUM.ORDERBOOK]);
            this.resubscribeToMarketDataStream();
            this.traderEvent({ event: 'reconnect' });
          },
          Math.max(this.document.reconnectTimeout ?? 1000, 1000)
        );
      }
    }
  }

  async #resubscribeToPortfolioStream() {
    if (this.datums[TRADER_DATUM.POSITION].refCount < 1) {
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
      for await (const data of stream) {
        if (data.portfolio) {
          this.datums[TRADER_DATUM.POSITION].onPortfolio(data.portfolio);
        }
      }

      this.resubscribeToPortfolioStream();
    } catch (e) {
      if (!isAbortError(e)) {
        this.$$debug('#resubscribeToPortfolioStream failed: %s', e.message);

        setTimeout(
          () => {
            this.resubscribeToPortfolioStream();
          },
          Math.max(this.document.reconnectTimeout ?? 1000, 1000)
        );
      }
    }
  }

  async #resubscribeToPositionsStream() {
    if (this.datums[TRADER_DATUM.POSITION].refCount < 1) {
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
      for await (const data of stream) {
        if (data.position) {
          const money = [];
          const blocked = [];

          (data.position.money ?? []).forEach((m) => {
            money.push(m.availableValue);
            blocked.push(m.blockedValue);
          });

          this.datums[TRADER_DATUM.POSITION].onPositions({
            money,
            blocked,
            securities: data.position.securities,
            futures: data.position.futures,
            options: data.position.options
          });
        }
      }

      this.resubscribeToPositionsStream();
    } catch (e) {
      if (!isAbortError(e)) {
        this.$$debug('#resubscribeToPositionsStream failed: %s', e.message);

        setTimeout(
          () => {
            this.resubscribeToPositionsStream();
          },
          Math.max(this.document.reconnectTimeout ?? 1000, 1000)
        );
      }
    }
  }

  async historicalTimeline({ cursor, from, to, limit = 100 }) {
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

  async historicalTimeAndSales({ instrument, depth }) {
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
            tradeId: `${instrument.symbol}|${trade.direction}|${price}|${trade.quantity}|${timestamp}`,
            side:
              trade.direction === TradeDirection.TRADE_DIRECTION_BUY
                ? 'buy'
                : trade.direction === TradeDirection.TRADE_DIRECTION_SELL
                  ? 'sell'
                  : '',
            timestamp,
            symbol: instrument.symbol,
            price,
            volume: trade.quantity,
            pool: instrument.exchange
          };
        });
    }

    return [];
  }

  async historicalCandles({ instrument, unit, value, cursor }) {
    const to = cursor ?? new Date();
    const from = new Date(to);
    let tf;

    switch (unit) {
      case 'Sec':
        return {
          candles: []
        };
      case 'Min':
        if (![1, 2, 3, 5, 10, 15, 30].includes(value)) {
          return {
            candles: []
          };
        }

        tf = {
          1: CandleInterval.CANDLE_INTERVAL_1_MIN,
          2: CandleInterval.CANDLE_INTERVAL_2_MIN,
          3: CandleInterval.CANDLE_INTERVAL_3_MIN,
          5: CandleInterval.CANDLE_INTERVAL_5_MIN,
          10: CandleInterval.CANDLE_INTERVAL_10_MIN,
          15: CandleInterval.CANDLE_INTERVAL_15_MIN,
          30: CandleInterval.CANDLE_INTERVAL_30_MIN
        }[value];

        switch (tf) {
          // 1 min-1 day.
          case CandleInterval.CANDLE_INTERVAL_1_MIN:
          // 2 mins-1 day.
          case CandleInterval.CANDLE_INTERVAL_2_MIN:
          // 3 mins-1 day.
          case CandleInterval.CANDLE_INTERVAL_3_MIN:
          // 5 mins-1 day.
          case CandleInterval.CANDLE_INTERVAL_5_MIN:
          // 10 mins-1 day.
          case CandleInterval.CANDLE_INTERVAL_10_MIN:
          // 15 mins-1 day.
          case CandleInterval.CANDLE_INTERVAL_15_MIN:
            from.setTime(to.getTime() - 24 * 3600 * 1000);

            break;
          // 30 mins-2 days.
          case CandleInterval.CANDLE_INTERVAL_30_MIN:
            from.setTime(to.getTime() - 2 * 24 * 3600 * 1000);

            break;
        }

        break;
      case 'Hour':
        if (![1, 2, 4].includes(value)) {
          return {
            candles: []
          };
        }

        tf = {
          1: CandleInterval.CANDLE_INTERVAL_HOUR,
          2: CandleInterval.CANDLE_INTERVAL_2_HOUR,
          4: CandleInterval.CANDLE_INTERVAL_4_HOUR
        }[value];

        switch (tf) {
          // 1 hour-1 week.
          case CandleInterval.CANDLE_INTERVAL_HOUR:
            from.setTime(to.getTime() - 7 * 24 * 3600 * 1000);

            break;

          // 2 hours-1 month.
          case CandleInterval.CANDLE_INTERVAL_2_HOUR:
          // 4 hours-1 month.
          case CandleInterval.CANDLE_INTERVAL_4_HOUR:
            from.setTime(to.getTime() - 28 * 24 * 3600 * 1000);

            break;
        }

        break;
      case 'Day':
        if (value !== 1) {
          return {
            candles: []
          };
        }

        tf = CandleInterval.CANDLE_INTERVAL_DAY;

        // 1 day-1 year.
        from.setTime(to.getTime() - 12 * 28 * 24 * 3600 * 1000);

        break;
      case 'Week':
        if (value !== 1) {
          return {
            candles: []
          };
        }

        tf = CandleInterval.CANDLE_INTERVAL_WEEK;

        // 1 week-2 years.
        from.setTime(to.getTime() - 24 * 28 * 24 * 3600 * 1000);

        break;
      case 'Month':
        if (value !== 1) {
          return {
            candles: []
          };
        }

        tf = CandleInterval.CANDLE_INTERVAL_MONTH;

        // 1 month-10 years.
        from.setTime(to.getTime() - 10 * 12 * 28 * 24 * 3600 * 1000);
    }

    if (instrument?.tinkoffFigi) {
      const { candles } = await this.getOrCreateClient(
        MarketDataServiceDefinition
      ).getCandles({
        instrumentId: instrument.tinkoffFigi,
        interval: tf,
        from,
        to
      });

      // To is inclusive.
      if (cursor && candles.length > 0) {
        candles.pop();
      }

      return {
        cursor: candles[0]?.time,
        candles: candles.map((c) => {
          if (instrument.type === 'bond') {
            return {
              open: this.relativeBondPriceToPrice(toNumber(c.open), instrument),
              high: this.relativeBondPriceToPrice(toNumber(c.high), instrument),
              low: this.relativeBondPriceToPrice(toNumber(c.low), instrument),
              close: this.relativeBondPriceToPrice(
                toNumber(c.close),
                instrument
              ),
              time: c.time.toISOString(),
              volume: c.volume
            };
          }

          return {
            open: +toNumber(c.open).toFixed(getInstrumentPrecision(instrument)),
            high: +toNumber(c.high).toFixed(getInstrumentPrecision(instrument)),
            low: +toNumber(c.low).toFixed(getInstrumentPrecision(instrument)),
            close: +toNumber(c.close).toFixed(
              getInstrumentPrecision(instrument)
            ),
            time: c.time.toISOString(),
            volume: c.volume
          };
        })
      };
    }

    return {
      candles: []
    };
  }

  async getOrders(client) {
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

  #orderId() {
    return uuidv4();
  }

  async placeLimitOrder({ instrument, price, quantity, direction }) {
    try {
      const orderId = this.#orderId();
      const response = await this.getOrCreateClient(
        OrdersServiceDefinition
      ).postOrder({
        instrumentId: instrument.tinkoffFigi,
        quantity,
        price: toQuotation(this.fixPrice(instrument, price)),
        direction:
          direction.toLowerCase() === 'buy'
            ? OrderDirection.ORDER_DIRECTION_BUY
            : OrderDirection.ORDER_DIRECTION_SELL,
        accountId: this.document.account,
        orderType: OrderType.ORDER_TYPE_LIMIT,
        orderId
      });

      return {
        orderId: response.orderId
      };
    } catch (e) {
      this.$$debug('placeLimitOrder failed: %s', e.message);

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

  async cancelRealOrder(order) {
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

  async cancelAllRealOrders({ instrument, filter } = {}) {
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

      const { orders } = await this.getOrders(client);

      for (const o of orders) {
        const status = this.getOrderStatus(o);

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

  async modifyRealOrders({ instrument, side, value }) {
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

      const { orders } = await this.getOrders(client);

      for (const o of orders) {
        const status = this.getOrderStatus(o);
        const orderSide =
          o.direction === OrderDirection.ORDER_DIRECTION_BUY ? 'buy' : 'sell';

        if (status === 'working' && (orderSide === side || side === 'all')) {
          if (instrument && o.figi !== instrument.tinkoffFigi) continue;

          const orderInstrument = this.#figis.get(o.figi);

          if (orderInstrument?.minPriceIncrement > 0) {
            let price;

            if (orderInstrument.type === 'bond') {
              price = this.fixPrice(
                orderInstrument,
                this.relativeBondPriceToPrice(
                  toNumber(o.initialSecurityPrice) +
                    orderInstrument.minPriceIncrement * value,
                  orderInstrument
                )
              );
            } else {
              price = this.fixPrice(
                orderInstrument,
                +toNumber(o.initialSecurityPrice).toFixed(
                  getInstrumentPrecision(orderInstrument)
                ) +
                  orderInstrument.minPriceIncrement * value
              );
            }

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

              await this.cancelRealOrder({
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

  async estimate(instrument, price) {
    if (this.unsupportedInstrument) return {};

    const maxLots = await this.getOrCreateClient(
      OrdersServiceDefinition
    ).getMaxLots({
      accountId: this.document.account,
      instrumentId: instrument.tinkoffFigi,
      price: toQuotation(price)
    });

    return {
      marginSellingPowerQuantity: maxLots.sellMarginLimits.sellMaxLots,
      marginBuyingPowerQuantity: maxLots.buyMarginLimits.buyMaxLots,
      sellingPowerQuantity: maxLots.sellLimits.sellMaxLots,
      buyingPowerQuantity: maxLots.buyLimits.buyMaxLots
    };
  }

  getOrderStatus(o = {}) {
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

  getBroker() {
    return BROKERS.TINKOFF;
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.TINKOFF;
  }

  getExchange() {
    return EXCHANGE.RUS;
  }

  getObservedAttributes() {
    return ['balance', 'tf'];
  }

  getSymbol(instrument = {}) {
    if (
      instrument.symbol === 'ASTR~MOEX' ||
      instrument.symbol === 'GOLD~MOEX'
    ) {
      return instrument.symbol;
    }

    return super.getSymbol(instrument);
  }

  adoptInstrument(instrument = {}) {
    // SPB@US
    if (
      instrument.symbol === 'SPB' &&
      (instrument.currency === 'USD' || instrument.currency === 'USDT')
    ) {
      return this.instruments.get('SPB@US');
    }

    // ASTR
    if (
      instrument?.exchange === EXCHANGE.MOEX &&
      this.getSymbol(instrument) === 'ASTR'
    ) {
      return this.instruments.get('ASTR~MOEX');
    }

    // GOLD~MOEX
    if (
      instrument?.exchange === EXCHANGE.MOEX &&
      this.getSymbol(instrument) === 'GOLD'
    ) {
      return this.instruments.get('GOLD~MOEX');
    }

    let canAdopt = true;

    // Possible collisions.
    ['TCS', 'FIVE', 'CARM'].forEach((symbol) => {
      if (
        this.getSymbol(instrument) === symbol &&
        (instrument.exchange === EXCHANGE.US ||
          instrument.exchange === EXCHANGE.UTEX_MARGIN_STOCKS)
      ) {
        canAdopt = false;
      }
    });

    if (!canAdopt) {
      return unsupportedInstrument(instrument.symbol);
    }

    if (instrument.symbol?.endsWith('~US')) {
      return super.adoptInstrument({
        ...instrument,
        ...{ symbol: instrument.symbol.replace('~US', '') }
      });
    }

    return super.adoptInstrument(instrument);
  }

  getErrorI18nKey({ error }) {
    const details = +error.details;

    switch (details) {
      case 30042:
        return 'E_INSUFFICIENT_FUNDS';
      case 30052:
        return 'E_NO_API_AVAILABLE_FOR_INSTRUMENT';
      case 30068:
        return 'E_LIMIT_ORDERS_ONLY';
      case 30079:
        return 'E_INSTRUMENT_NOT_TRADEABLE';
      case 30081:
        return 'E_ACCOUNT_CLOSED';
      case 30082:
        return 'E_ACCOUNT_BLOCKED';
      case 30083:
        return 'E_WRONG_ORDER_TYPE';
      case 30097:
        return 'E_INACTIVE_TRADING_SESSION';
      case 30099:
        return 'E_PRICE_OUT_OF_LIMITS';
      case 30100:
        return 'E_PRICE_MUST_BE_POSITIVE';
      case 40002:
        return 'E_INSUFFICIENT_PRIVILEGES';
      case 40003:
        return 'E_NO_ACCESS_TOKEN';
      case 80002:
        return 'E_RATE_LIMIT_EXCEEDED';
      case 90001:
        return 'E_CONFIRMATION_NEEDED';
      case 90002:
        return 'E_NO_QUALIFICATION';
    }
  }
}

pppTraderInstanceForWorkerIs(TinkoffGrpcWebTrader);

export default TinkoffGrpcWebTrader;
