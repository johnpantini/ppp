import {
  Trader,
  TraderDatum,
  TraderEventDatum,
  ConditionalOrderDatum,
  GlobalTraderDatum,
  unsupportedInstrument,
  pppTraderInstanceForWorkerIs
} from './trader-worker.js';
import { AuthorizationError, TradingError } from '../ppp-exceptions.js';
import { isJWTTokenExpired, uuidv4 } from '../ppp-crypto.js';
import {
  TRADER_DATUM,
  EXCHANGE,
  OPERATION_TYPE,
  INSTRUMENT_DICTIONARY,
  BROKERS
} from '../const.js';
import { formatPrice, getInstrumentPrecision } from '../intl.js';
import { later } from '../ppp-decorators.js';

class AlorTraderDatum extends TraderDatum {
  guids = new Map();

  filter(data, instrument, source, datum) {
    if (
      [
        TRADER_DATUM.LAST_PRICE,
        TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
        TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
        TRADER_DATUM.BEST_BID,
        TRADER_DATUM.BEST_ASK,
        TRADER_DATUM.EXTENDED_LAST_PRICE,
        TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE,
        TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE,
        TRADER_DATUM.DAY_VOLUME
      ].includes(datum)
    ) {
      return source?.instrument?.exchange === this.trader.document.exchange;
    } else if (this.trader.document.exchange === EXCHANGE.SPBX) {
      return [EXCHANGE.SPBX, EXCHANGE.US, EXCHANGE.UTEX_MARGIN_STOCKS].includes(
        source?.instrument?.exchange
      );
    } else if (this.trader.document.exchange === EXCHANGE.MOEX) {
      return source?.instrument?.exchange === EXCHANGE.MOEX;
    }
  }

  async subscribe(source, field, datum) {
    await this.trader.establishWebSocketConnection();

    return super.subscribe(source, field, datum);
  }

  firstReferenceAdded(source, symbol) {
    const guid = this.trader.generateRequestId(symbol);

    this.guids.set(symbol, guid);
    this.trader.guidToDatum.set(guid, this);

    return guid;
  }

  async lastReferenceRemoved(source, symbol) {
    const guid = this.guids.get(symbol);

    if (this.trader.connection.readyState === WebSocket.OPEN) {
      await this.trader.ensureAccessTokenIsOk();

      this.trader.connection.readyState === WebSocket.OPEN &&
        this.trader.connection.send(
          JSON.stringify({
            opcode: 'unsubscribe',
            token: this.trader.accessToken,
            guid
          })
        );
    }

    this.guids.delete(symbol);
    this.trader.guidToDatum.delete(guid);
  }
}

class QuotesDatum extends AlorTraderDatum {
  firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          opcode: 'QuotesSubscribe',
          code: symbol,
          exchange: this.trader.document.exchange,
          format: 'Simple',
          token: this.trader.accessToken,
          guid: super.firstReferenceAdded(source, symbol)
        })
      );
    }
  }

  [TRADER_DATUM.LAST_PRICE](data, instrument) {
    if (instrument.type === 'bond') {
      return this.trader.relativeBondPriceToPrice(data.last_price, instrument);
    } else {
      return data.last_price;
    }
  }

  [TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE](data) {
    return data.change_percent;
  }

  [TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE](data, instrument) {
    if (instrument.type === 'bond') {
      return this.trader.relativeBondPriceToPrice(data.change, instrument);
    } else {
      return data.change;
    }
  }

  [TRADER_DATUM.BEST_BID](data, instrument) {
    if (instrument.type === 'bond') {
      return this.trader.relativeBondPriceToPrice(data.bid, instrument);
    } else {
      return data.bid;
    }
  }

  [TRADER_DATUM.BEST_ASK](data, instrument) {
    if (instrument.type === 'bond') {
      return this.trader.relativeBondPriceToPrice(data.ask, instrument);
    } else {
      return data.ask;
    }
  }

  [TRADER_DATUM.DAY_VOLUME](data, instrument) {
    return data.volume;
  }
}

class TimeAndSalesDatum extends AlorTraderDatum {
  doNotSaveValue = true;

  firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          opcode: 'AllTradesGetAndSubscribe',
          code: symbol,
          exchange: this.trader.document.exchange,
          depth: 0,
          format: 'Simple',
          token: this.trader.accessToken,
          guid: super.firstReferenceAdded(source, symbol)
        })
      );
    }
  }

  [TRADER_DATUM.MARKET_PRINT](data, instrument) {
    return {
      tradeId: data.id,
      side: data.side,
      timestamp: data.timestamp,
      symbol: data.symbol,
      price:
        instrument.type === 'bond'
          ? this.trader.relativeBondPriceToPrice(data.price, instrument)
          : data.price,
      volume: data.qty,
      pool: this.trader.document.exchange
    };
  }
}

class OrderbookDatum extends AlorTraderDatum {
  firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          opcode: 'OrderBookGetAndSubscribe',
          code: symbol,
          exchange: this.trader.document.exchange,
          depth: this.trader.document.orderbookDepth || 20,
          format: 'Simple',
          token: this.trader.accessToken,
          guid: super.firstReferenceAdded(source, symbol)
        })
      );
    }
  }

  [TRADER_DATUM.ORDERBOOK](data, instrument) {
    data.bids = data.bids.map((b) => {
      if (b.pool) {
        return b;
      }

      return {
        price:
          instrument.type === 'bond'
            ? this.trader.relativeBondPriceToPrice(b.price, instrument)
            : b.price,
        volume: b.volume,
        pool: this.trader.document.exchange
      };
    });

    data.asks = data.asks.map((a) => {
      if (a.pool) {
        return a;
      }

      return {
        price:
          instrument.type === 'bond'
            ? this.trader.relativeBondPriceToPrice(a.price, instrument)
            : a.price,
        volume: a.volume,
        pool: this.trader.document.exchange
      };
    });

    return {
      bids: data.bids,
      asks: data.asks
    };
  }
}

class AlorTraderGlobalDatum extends GlobalTraderDatum {
  guid;

  async subscribe(source, field, datum) {
    await this.trader.establishWebSocketConnection();

    return super.subscribe(source, field, datum);
  }

  firstReferenceAdded() {
    this.guid = this.trader.generateRequestId();

    this.trader.guidToDatum.set(this.guid, this);

    return this.guid;
  }

  async lastReferenceRemoved() {
    const guid = this.guid;

    this.trader.guidToDatum.delete(guid);

    this.guid = null;

    if (this.trader.connection.readyState === WebSocket.OPEN) {
      await this.trader.ensureAccessTokenIsOk();

      this.trader.connection.readyState === WebSocket.OPEN &&
        this.trader.connection.send(
          JSON.stringify({
            opcode: 'unsubscribe',
            token: this.trader.accessToken,
            guid
          })
        );
    }
  }
}

class PositionsDatum extends AlorTraderGlobalDatum {
  valueKeyForData(data) {
    if (typeof data.balanceMoney !== 'undefined') {
      return data.portfolio;
    }

    return super.valueKeyForData(data);
  }

  filter(data, source, key, datum) {
    if (datum !== TRADER_DATUM.POSITION) {
      const isBalance = data.isCurrency;

      if (isBalance) {
        if (this.trader.document.portfolioType === 'futures') {
          return false;
        }

        return data.symbol === source.getAttribute('balance');
      }

      return data.symbol === this.trader.getSymbol(source.instrument);
    } else {
      if (this.trader.document.portfolioType === 'futures' && data.isCurrency) {
        return false;
      }

      return true;
    }
  }

  firstReferenceAdded() {
    const guid = super.firstReferenceAdded();

    if (
      this.trader.document.portfolioType === 'futures' &&
      this.trader.connection.readyState === WebSocket.OPEN
    ) {
      this.trader.connection.send(
        JSON.stringify({
          opcode: 'SpectraRisksGetAndSubscribe',
          portfolio: this.trader.document.portfolio,
          exchange: this.trader.document.exchange,
          format: 'Simple',
          token: this.trader.accessToken,
          guid: `${guid};FORTS`
        })
      );
    }

    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          opcode: 'PositionsGetAndSubscribeV2',
          portfolio: this.trader.document.portfolio,
          exchange: this.trader.document.exchange,
          format: 'Simple',
          token: this.trader.accessToken,
          guid
        })
      );
    }
  }

  async lastReferenceRemoved() {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      if (this.trader.document.portfolioType === 'futures') {
        await this.trader.ensureAccessTokenIsOk();

        this.trader.connection.readyState === WebSocket.OPEN &&
          this.trader.connection.send(
            JSON.stringify({
              opcode: 'unsubscribe',
              token: this.trader.accessToken,
              guid: `${this.guid};FORTS`
            })
          );
      }
    }

    return super.lastReferenceRemoved();
  }

  [TRADER_DATUM.POSITION](data) {
    if (typeof data.balanceMoney !== 'undefined') {
      return {
        symbol: 'RUB',
        lot: 1,
        exchange: EXCHANGE.MOEX,
        averagePrice: null,
        isCurrency: true,
        isBalance: true,
        size: data.balanceMoney,
        accountId: this.trader.document.portfolio
      };
    }

    const isBalance = data.isCurrency;

    const result = {
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
      this.trader.traderEvent({ event: 'estimate' });

      return result;
    } else {
      if (this.trader.document.portfolioType === 'futures') {
        result.instrument = this.trader.futures.get(data.symbol.toUpperCase());
      } else {
        result.instrument = this.trader.instruments.get(data.symbol);
      }

      if (result.instrument?.type === 'bond') {
        result.averagePrice = this.trader.relativeBondPriceToPrice(
          result.averagePrice,
          result.instrument
        );
      }

      return result;
    }
  }

  [TRADER_DATUM.POSITION_SIZE](data) {
    if (typeof data.balanceMoney !== 'undefined') {
      return data.balanceMoney;
    }

    return data.qty;
  }

  [TRADER_DATUM.POSITION_AVERAGE](data, source) {
    if (typeof data.balanceMoney !== 'undefined') {
      return;
    }

    const isBalance = data.isCurrency;

    if (isBalance) {
      return;
    }

    if (source.instrument?.type === 'bond') {
      return this.trader.relativeBondPriceToPrice(
        data.avgPrice,
        source.instrument
      );
    } else return data.avgPrice;
  }
}

class TimelineDatum extends AlorTraderGlobalDatum {
  firstReferenceAdded() {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          opcode: 'TradesGetAndSubscribeV2',
          portfolio: this.trader.document.portfolio,
          exchange: this.trader.document.exchange,
          format: 'Simple',
          token: this.trader.accessToken,
          guid: super.firstReferenceAdded()
        })
      );
    }
  }

  valueKeyForData(data) {
    return data?.id;
  }

  [TRADER_DATUM.TIMELINE_ITEM](data) {
    const result = {
      operationId: data.id,
      accruedInterest: data.accruedInt ?? 0,
      commission: data.commission,
      parentId: data.orderno,
      symbol: data.symbol,
      type:
        data.side === 'buy'
          ? OPERATION_TYPE.OPERATION_TYPE_BUY
          : OPERATION_TYPE.OPERATION_TYPE_SELL,
      exchange: data.exchange,
      quantity: data.qty,
      price: data.price,
      createdAt: data.date
    };

    if (this.trader.document.portfolioType === 'futures') {
      result.instrument = this.trader.futures.get(data.symbol.toUpperCase());
    } else {
      result.instrument = this.trader.instruments.get(data.symbol);
    }

    if (result.instrument?.type === 'bond') {
      result.price = this.trader.relativeBondPriceToPrice(
        result.price,
        result.instrument
      );
    }

    return result;
  }
}

class ActiveOrderDatum extends AlorTraderGlobalDatum {
  firstReferenceAdded() {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          opcode: 'OrdersGetAndSubscribeV2',
          portfolio: this.trader.document.portfolio,
          exchange: this.trader.document.exchange,
          format: 'Simple',
          token: this.trader.accessToken,
          guid: super.firstReferenceAdded()
        })
      );
    }
  }

  valueKeyForData(data) {
    return data?.id;
  }

  [TRADER_DATUM.ACTIVE_ORDER](data) {
    const result = {
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

    if (this.trader.document.portfolioType === 'futures') {
      result.instrument = this.trader.futures.get(data.symbol.toUpperCase());
    } else {
      result.instrument = this.trader.instruments.get(data.symbol);
    }

    if (result.instrument?.type === 'bond') {
      result.price = this.trader.relativeBondPriceToPrice(
        result.price,
        result.instrument
      );
    }

    return result;
  }
}

class AlorOpenAPIV2Trader extends Trader {
  #futures = new Map();

  get futures() {
    return this.#futures;
  }

  #pendingAccessTokenResponse;

  accessToken;

  #pendingConnection;

  connection;

  #slug = uuidv4().split('-')[0];

  #counter = Date.now();

  guidToDatum = new Map();

  constructor(document) {
    super(document, [
      {
        type: QuotesDatum,
        datums: [
          TRADER_DATUM.LAST_PRICE,
          TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
          TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
          TRADER_DATUM.BEST_BID,
          TRADER_DATUM.BEST_ASK,
          TRADER_DATUM.DAY_VOLUME
        ]
      },
      {
        type: TimeAndSalesDatum,
        datums: [TRADER_DATUM.MARKET_PRINT]
      },
      {
        type: OrderbookDatum,
        datums: [TRADER_DATUM.ORDERBOOK]
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
      },
      {
        type: ActiveOrderDatum,
        datums: [TRADER_DATUM.ACTIVE_ORDER]
      }
    ]);

    if (!this.document.portfolioType) {
      this.document.portfolioType = 'stock';
    }
  }

  async oneTimeInitializationCallback() {
    this.$$orders = this.$$debug.extend('orders');
    this.$$orders.log = console.log.bind(console);
    this.$$executions = this.$$debug.extend('executions');
    this.$$executions.log = console.log.bind(console);
    this.$$positions = this.$$debug.extend('positions');
    this.$$positions.log = console.log.bind(console);
    this.$$auth = this.$$debug.extend('auth');
    this.$$auth.log = console.log.bind(console);
  }

  getTimeframeList() {
    return [
      {
        name: 'Sec',
        values: [1, 5, 10]
      },
      {
        name: 'Min',
        values: [1, 5, 15]
      },
      {
        name: 'Hour',
        values: [1, 4]
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

  async ensureAccessTokenIsOk() {
    const timeout = Math.max(this.document.reconnectTimeout ?? 1000, 1000);

    try {
      if (isJWTTokenExpired(this.accessToken)) this.accessToken = void 0;

      if (typeof this.accessToken === 'string') return;

      if (this.#pendingAccessTokenResponse) {
        await this.#pendingAccessTokenResponse;
      } else {
        this.#pendingAccessTokenResponse = fetch(
          `https://oauth.alor.ru/refresh?token=${this.document.broker.refreshToken}`,
          {
            method: 'POST'
          }
        )
          .then((response) => response.json())
          .then(({ AccessToken, message }) => {
            if (!AccessToken && /token/i.test(message)) {
              this.accessToken = null;

              throw new AuthorizationError({ details: message });
            }

            this.accessToken = AccessToken;
            this.#pendingAccessTokenResponse = void 0;
          })
          .catch((e) => {
            this.$$auth('ensureAccessTokenIsOk failed: %o', e);

            if (e instanceof AuthorizationError) {
              throw e;
            }

            this.#pendingAccessTokenResponse = void 0;

            return new Promise((resolve) => {
              setTimeout(async () => {
                await this.ensureAccessTokenIsOk();
                resolve();
              }, timeout);
            });
          });

        await this.#pendingAccessTokenResponse;
      }
    } catch (e) {
      this.$$auth('ensureAccessTokenIsOk failed: %o', e);

      if (e instanceof AuthorizationError) {
        throw e;
      }

      this.#pendingAccessTokenResponse = void 0;

      return new Promise((resolve) => {
        setTimeout(async () => {
          await this.ensureAccessTokenIsOk();
          resolve();
        }, timeout);
      });
    }
  }

  async establishWebSocketConnection(reconnect) {
    await this.ensureAccessTokenIsOk();

    if (this.connection?.readyState === WebSocket.OPEN) {
      return this.connection;
    } else if (this.#pendingConnection && !reconnect) {
      return this.#pendingConnection;
    } else {
      this.#pendingConnection = new Promise((resolve) => {
        this.connection = new WebSocket(
          'wss://api.alor.ru/ws',
          typeof process !== 'undefined' && process.release.name === 'node'
            ? {
                perMessageDeflate: {
                  clientNoContextTakeover: true,
                  serverNoContextTakeover: true,
                  clientMaxWindowBits: 10,
                  serverMaxWindowBits: 10,
                  concurrencyLimit: 10,
                  threshold: 1024
                }
              }
            : void 0
        );
        this.connection.onopen = async () => {
          if (reconnect) {
            await this.resubscribe();
          }

          resolve(this.connection);
        };

        this.connection.onclose = async () => {
          await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));
          resolve(this.establishWebSocketConnection(true));
        };

        this.connection.onerror = () => this.connection.close();

        this.connection.onmessage = ({ data }) => {
          if (this.connection.readyState !== WebSocket.OPEN) {
            return;
          }

          const payload = JSON.parse(data);

          // Example: {"requestGuid":"","httpCode":401,"message":"Invalid JWT token!"}
          if (payload?.httpCode >= 400) {
            this.connection.close();

            return;
          }

          if (payload?.data && payload?.guid) {
            const datumInstance = this.guidToDatum.get(payload.guid);

            if (
              datumInstance instanceof QuotesDatum ||
              datumInstance instanceof TimeAndSalesDatum
            ) {
              let instrument = this.instruments.get(payload.data.symbol);

              if (this.document.portfolioType === 'futures') {
                instrument = this.futures.get(
                  payload.data.symbol.toUpperCase()
                );
              }

              this.guidToDatum
                .get(payload.guid)
                ?.dataArrived?.(payload.data, instrument);
            } else if (datumInstance instanceof OrderbookDatum) {
              const [symbol] = payload.guid.split(':');

              let instrument;

              if (this.document.portfolioType === 'futures') {
                instrument = this.futures.get(symbol);
              } else {
                instrument = this.instruments.get(symbol);
              }

              this.guidToDatum
                .get(payload.guid)
                ?.dataArrived?.(payload.data, instrument);
            } else if (
              datumInstance instanceof PositionsDatum ||
              datumInstance instanceof TimelineDatum ||
              datumInstance instanceof ActiveOrderDatum
            ) {
              this.guidToDatum.get(payload.guid)?.dataArrived?.(payload.data);
            } else if (payload.guid?.endsWith(';FORTS')) {
              this.datums[TRADER_DATUM.POSITION].dataArrived?.(payload.data);
            }
          }
        };
      });

      return this.#pendingConnection;
    }
  }

  generateRequestId(symbol) {
    if (!symbol) {
      return `${this.document.portfolio};${this.#slug}-${++this.#counter}`;
    } else {
      return `${symbol}:${this.document.portfolio};${this.#slug}-${++this
        .#counter}`;
    }
  }

  async placeMarketOrder({ instrument, quantity, direction }) {
    await this.ensureAccessTokenIsOk();

    const symbol = this.getSymbol(instrument);
    const orderResponse = await fetch(
      'https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/actions/market',
      {
        method: 'POST',
        body: JSON.stringify({
          instrument: {
            symbol,
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
          'X-ALOR-REQID': this.generateRequestId(symbol),
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );
    const order = await orderResponse.json();

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

  async placeLimitOrder({ instrument, price, quantity, direction }) {
    await this.ensureAccessTokenIsOk();

    const symbol = this.getSymbol(instrument);
    const orderResponse = await fetch(
      'https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/actions/limit',
      {
        method: 'POST',
        body: JSON.stringify({
          instrument: {
            symbol,
            exchange: this.document.exchange
          },
          side: direction.toLowerCase(),
          type: 'limit',
          price:
            instrument.type === 'bond'
              ? this.bondPriceToRelativeBondPrice(
                  this.fixPrice(instrument, price),
                  instrument
                )
              : this.fixPrice(instrument, price),
          quantity,
          user: {
            portfolio: this.document.portfolio
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-ALOR-REQID': this.generateRequestId(symbol),
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );
    const order = await orderResponse.json();

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

  async historicalTimeAndSales({ instrument, depth }) {
    await this.ensureAccessTokenIsOk();

    const qs = `format=Simple&take=${parseInt(depth)}&descending=true`;
    const response = await fetch(
      `https://api.alor.ru/md/v2/Securities/${
        this.document.exchange
      }/${encodeURIComponent(this.getSymbol(instrument))}/alltrades?${qs}`,
      {
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );

    if (response.ok)
      return (await response.json())?.map((t) => {
        return {
          tradeId: t.id,
          side: t.side,
          time: t.time,
          timestamp: t.timestamp,
          symbol: t.symbol,
          price:
            instrument.type === 'bond'
              ? this.relativeBondPriceToPrice(t.price, instrument)
              : t.price,
          volume: t.qty,
          pool: this.document.exchange
        };
      });
    else {
      throw new TradingError({
        message: await response.text()
      });
    }
  }

  async historicalCandles({ instrument, unit, value, cursor }) {
    await this.ensureAccessTokenIsOk();

    let tf;
    const to = cursor ?? Math.trunc(Date.now() / 1000);
    let from;

    switch (unit) {
      case 'Sec':
        tf = value;
        from = to - 7 * 24 * 3600;

        break;
      case 'Min':
        tf = value * 60;
        from = to - 7 * 24 * 3600;

        break;
      case 'Hour':
        tf = value * 3600;
        from = to - 800 * 3600;

        break;
      case 'Day':
        if (value !== 1) {
          return {
            candles: []
          };
        }

        tf = 'D';
        from = to - 800 * 3600 * 24;

        break;
      case 'Week':
        if (value !== 1) {
          return {
            candles: []
          };
        }

        tf = 'W';
        from = to - 800 * 3600 * 24 * 7;

        break;
      case 'Month':
        if (value !== 1 && value !== 12) {
          return {
            candles: []
          };
        }

        tf = 'M';
        from = to - 12 * 3600 * 24 * 7 * 31;

        if (value === 12) {
          tf = 'Y';
          from = to - 12 * 5 * 3600 * 24 * 7 * 31;
        }

        break;
    }

    const response = await fetch(
      `https://api.alor.ru/md/v2/history?symbol=${this.getSymbol(
        instrument
      )}&exchange=${this.document.exchange}&tf=${tf}&from=${from}&to=${to}`,
      {
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      return {
        candles: []
      };
    }

    const data = await response.json();

    const candles = data.history.map((c) => {
      if (instrument.type === 'bond') {
        return {
          open: this.relativeBondPriceToPrice(c.open, instrument),
          high: this.relativeBondPriceToPrice(c.high, instrument),
          low: this.relativeBondPriceToPrice(c.low, instrument),
          close: this.relativeBondPriceToPrice(c.close, instrument),
          time: new Date(c.time * 1000).toISOString(),
          volume: c.volume
        };
      }

      return {
        open: +c.open.toFixed(getInstrumentPrecision(instrument)),
        high: +c.high.toFixed(getInstrumentPrecision(instrument)),
        low: +c.low.toFixed(getInstrumentPrecision(instrument)),
        close: +c.close.toFixed(getInstrumentPrecision(instrument)),
        time: new Date(c.time * 1000).toISOString(),
        volume: c.volume
      };
    });

    return {
      cursor: data.prev,
      candles
    };
  }

  async estimate(instrument, price, quantity) {
    if (this.unsupportedInstrument) return {};

    await this.ensureAccessTokenIsOk();

    if (instrument.type === 'future') return {};

    const response = await fetch(
      'https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/estimate',
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          portfolio: this.document.portfolio,
          ticker: this.getSymbol(instrument),
          exchange: this.document.exchange,
          price,
          lotQuantity: quantity || 1
        })
      }
    );

    if (response.status === 200) {
      const json = await response.json();

      let commission = json.commission;
      const flatCommissionRate = this.document?.flatCommissionRate ?? void 0;

      if (typeof flatCommissionRate !== 'undefined') {
        commission =
          (price * quantity * instrument.lot * flatCommissionRate) / 100;
      }

      return {
        marginSellingPowerQuantity: json.quantityToSell,
        marginBuyingPowerQuantity: json.quantityToBuy,
        sellingPowerQuantity: json.notMarginQuantityToSell,
        buyingPowerQuantity: json.notMarginQuantityToBuy,
        commission
      };
    } else {
      throw new TradingError({
        message: await response.text()
      });
    }
  }

  async modifyRealOrders({ instrument, side, value }) {
    await this.ensureAccessTokenIsOk();

    const ordersResponse = await fetch(
      `https://api.alor.ru/md/v2/clients/${this.document.exchange}/${this.document.portfolio}/orders?format=Simple`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );

    if (ordersResponse.status === 200) {
      const orders = await ordersResponse.json();

      for (const o of orders) {
        if (o.status === 'working' && (o.side === side || side === 'all')) {
          if (instrument && o.symbol !== this.getSymbol(instrument)) continue;

          let orderInstrument;

          if (this.document.portfolioType === 'futures') {
            orderInstrument = this.futures.get(o.symbol.toUpperCase());
          } else {
            orderInstrument = this.instruments.get(o.symbol);
          }

          if (orderInstrument?.minPriceIncrement > 0) {
            let price = this.fixPrice(
              orderInstrument,
              o.price + orderInstrument.minPriceIncrement * value
            );

            if (orderInstrument.type === 'bond') {
              price = +(o.price + 0.01 * value).toFixed(2);
            }

            const symbol = this.getSymbol(orderInstrument);

            // Async way.
            fetch(
              `https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/actions/limit/${o.id}`,
              {
                method: 'PUT',
                body: JSON.stringify({
                  instrument: {
                    symbol,
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
                  'X-ALOR-REQID': this.generateRequestId(symbol),
                  Authorization: `Bearer ${this.accessToken}`
                }
              }
            ).then(async (response) => {
              if (!response.ok) {
                this.$$orders(
                  'error modifying order: %o',
                  await response.text()
                );
              }
            });
          }
        }
      }
    } else {
      throw new TradingError({
        message: await ordersResponse.text()
      });
    }
  }

  async cancelRealOrder(order) {
    if (order.orderType === 'limit') {
      await this.ensureAccessTokenIsOk();

      const qs = `portfolio=${this.document.portfolio}&exchange=${this.document.exchange}&stop=false&format=Simple`;
      const response = await fetch(
        `https://api.alor.ru/commandapi/warptrans/TRADE/v2/client/orders/${order.orderId}?${qs}`,
        {
          method: 'DELETE',
          cache: 'no-cache',
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      );

      if (response.status === 200)
        return {
          orderId: order.orderId
        };
      else {
        throw new TradingError({
          message: await response.text()
        });
      }
    }
  }

  async cancelAllRealOrders({ instrument, filter } = {}) {
    await this.ensureAccessTokenIsOk();

    const response = await fetch(
      `https://api.alor.ru/md/v2/clients/${this.document.exchange}/${this.document.portfolio}/orders?format=Simple`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );

    if (response.status === 200) {
      const orders = await response.json();

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

          // Async way.
          this.cancelRealOrder(o);
        }
      }
    } else {
      throw new TradingError({
        message: await response.text()
      });
    }
  }

  async instrumentsArrived(instruments) {
    if (this.document.portfolioType === 'futures') {
      for (const [, instrument] of instruments) {
        this.#futures.set(
          instrument.fullName.split(/\s+/)[0].toUpperCase(),
          instrument
        );
      }
    }

    return super.instrumentsArrived(instruments);
  }

  getBroker() {
    return BROKERS.ALOR;
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
        return INSTRUMENT_DICTIONARY.ALOR_MOEX_FX_METALS;
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
        return EXCHANGE.MOEX_FX_METALS;
    }
  }

  getObservedAttributes() {
    return ['balance'];
  }

  getSymbol(instrument = {}) {
    if (instrument.type === 'future') {
      return instrument.fullName.split(/\s+/)[0].toUpperCase();
    }

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

  instrumentsAreEqual(i1, i2) {
    const specialCase = ['SPB', 'SPB@US'];

    if (specialCase.includes(i1?.symbol) && specialCase.includes(i2?.symbol))
      return true;

    return super.instrumentsAreEqual(i1, i2);
  }

  adoptInstrument(instrument = {}) {
    if (
      this.document.exchange === EXCHANGE.MOEX &&
      instrument.exchange !== EXCHANGE.MOEX
    ) {
      return unsupportedInstrument(instrument.symbol);
    }

    // ASTR
    if (
      this.document.exchange === EXCHANGE.MOEX &&
      instrument?.exchange === EXCHANGE.MOEX &&
      this.getSymbol(instrument) === 'ASTR'
    ) {
      return this.instruments.get('ASTR');
    }

    // FIVE
    if (
      this.document.exchange === EXCHANGE.MOEX &&
      instrument?.exchange === EXCHANGE.MOEX &&
      this.getSymbol(instrument) === 'FIVE'
    ) {
      return this.instruments.get('FIVE');
    }

    // GOLD
    if (
      this.document.exchange === EXCHANGE.MOEX &&
      instrument?.exchange === EXCHANGE.MOEX &&
      this.getSymbol(instrument) === 'GOLD'
    ) {
      return this.instruments.get('GOLD');
    }

    // SPB@US
    if (
      instrument.symbol === 'SPB' &&
      (instrument.currency === 'USD' || instrument.currency === 'USDT') &&
      this.document.exchange === EXCHANGE.SPBX
    ) {
      return this.instruments.get('SPB@US');
    }

    let canAdopt = true;

    if (
      this.getSymbol(instrument) === 'TCS' &&
      (instrument.exchange === EXCHANGE.US ||
        instrument.exchange === EXCHANGE.UTEX_MARGIN_STOCKS)
    ) {
      canAdopt = false;
    }

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

  async serialize() {
    await this.ensureAccessTokenIsOk();

    return {
      ...super.serialize(),
      accessToken: this.accessToken
    };
  }

  getErrorI18nKey({ instrument, error }) {
    const message = error.message;

    if (/Invalid quantity/i.test(message) || /BAD_AMOUNT/i.test(message))
      return 'E_INCORRECT_QUANTITY';

    if (/Price may not be 0 for a limit order/i.test(message)) {
      return 'E_INCORRECT_PRICE';
    }

    if (/Нехватка средств по лимитам клиента/i.test(message)) {
      return 'E_INSUFFICIENT_FUNDS';
    }

    if (
      /(HALT_INSTRUMENT|INSTR_NOTRADE)/i.test(message) ||
      /Security is in break period/i.test(message) ||
      /Security is not currently trading/i.test(message)
    )
      return 'E_INSTRUMENT_NOT_TRADEABLE';

    if (/BAD_FLAGS/i.test(message)) return 'E_WRONG_ORDER_PARAMETERS';

    if (/Provided json can't be properly deserialised/i.test(message))
      return 'E_INCORRECT_PRICE_OR_QUANTITY';

    if (
      /BAD_PRICE_LIMITS/i.test(message) ||
      /Цена сделки вне лимита/i.test(message)
    )
      return 'E_PRICE_OUT_OF_LIMITS';

    if (/PROHIBITION_CH/i.test(message)) return 'E_ORDER_BLOCKED_BY_EXCHANGE.';

    if (
      /BAD_INSTRUMENT/i.test(message) ||
      /Неизвестный инструмент в заявке/i.test(message)
    )
      return 'E_UNSUPPORTED_INSTRUMENT';

    if (/Order was canceled before it was posted/i.test(message))
      return 'E_ORDER_REJECTED_BY_EXCHANGE';

    if (/Сейчас эта сессия не идет/i.test(message))
      return 'E_INACTIVE_TRADING_SESSION';

    if (/Command Timeout/i.test(message)) return 'E_REQUEST_TIMEOUT';

    if (
      /Minimum available value of the quantity is: 100 of lots/i.test(message)
    )
      return {
        key: 'E_QUANTITY_MUST_BE_GE_$VALUE',
        options: {
          value: 100
        }
      };

    let match = message.match(/can not be less than ([0-9.]+)/i)?.[1];

    if (match) {
      return {
        key: 'E_PRICE_MUST_BE_GE_$VALUE',
        options: {
          value: formatPrice(+match, instrument)
        }
      };
    }

    match = message.match(/can not be greater than ([0-9.]+)/i)?.[1];

    if (match) {
      return {
        key: 'E_PRICE_MUST_BE_LE_$VALUE',
        options: {
          value: formatPrice(+match, instrument)
        }
      };
    }

    match = message.match(/Minimum price step: ([0-9.]+)/i)?.[1];

    if (match) {
      return {
        key: 'E_MIN_PRICE_STEP_MUST_BE_$VALUE',
        value: formatPrice(+match, instrument)
      };
    }
  }
}

pppTraderInstanceForWorkerIs(AlorOpenAPIV2Trader);

export default AlorOpenAPIV2Trader;
