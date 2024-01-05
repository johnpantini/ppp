import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM,
  OPERATION_TYPE
} from '../const.js';
import {
  GlobalTraderDatum,
  USTrader,
  pppTraderInstanceForWorkerIs
} from './trader-worker.js';
import { ConnectionError, TradingError } from '../ppp-exceptions.js';
import { later } from '../ppp-decorators.js';

export let ConnectionState;
(function (ConnectionState) {
  /** Disconnected from TWS / IB Gateway. */
  ConnectionState[(ConnectionState['Disconnected'] = 0)] = 'Disconnected';
  /** Current connecting to TWS / IB Gateway. */
  ConnectionState[(ConnectionState['Connecting'] = 1)] = 'Connecting';
  /** Connected to TWS / IB Gateway. */
  ConnectionState[(ConnectionState['Connected'] = 2)] = 'Connected';
})(ConnectionState || (ConnectionState = {}));

export let SecType;
(function (SecType) {
  /** Stock (or ETF) */
  SecType['STK'] = 'STK';
  /* Option. */
  SecType['OPT'] = 'OPT';
  /* Future */
  SecType['FUT'] = 'FUT';
  /* Index. */
  SecType['IND'] = 'IND';
  /** Futures option. */
  SecType['FOP'] = 'FOP';
  /** Contract for Difference. */
  SecType['CFD'] = 'CFD';
  /** Forex pair. */
  SecType['CASH'] = 'CASH';
  /** Combo. */
  SecType['BAG'] = 'BAG';
  /** Warrant. */
  SecType['WAR'] = 'WAR';
  /** Bond. */
  SecType['BOND'] = 'BOND';
  /** Commodity. */
  SecType['CMDTY'] = 'CMDTY';
  /** News. */
  SecType['NEWS'] = 'NEWS';
  /** Mutual fund. */
  SecType['FUND'] = 'FUND';
  /** Cryptocurrency. */
  SecType['CRYPTO'] = 'CRYPTO ';
})(SecType || (SecType = {}));

export let OrderAction;
(function (OrderAction) {
  OrderAction['BUY'] = 'BUY';
  OrderAction['SELL'] = 'SELL';
})(OrderAction || (OrderAction = {}));

export let OrderStatus;
(function (OrderStatus) {
  OrderStatus['ApiPending'] = 'ApiPending';
  OrderStatus['ApiCancelled'] = 'ApiCancelled';
  OrderStatus['PreSubmitted'] = 'PreSubmitted';
  OrderStatus['PendingCancel'] = 'PendingCancel';
  OrderStatus['Cancelled'] = 'Cancelled';
  OrderStatus['Submitted'] = 'Submitted';
  OrderStatus['Filled'] = 'Filled';
  OrderStatus['Inactive'] = 'Inactive';
  OrderStatus['PendingSubmit'] = 'PendingSubmit';
  OrderStatus['Unknown'] = 'Unknown';
})(OrderStatus || (OrderStatus = {}));

export let OrderType;
(function (OrderType) {
  OrderType['None'] = '';
  OrderType['MKT'] = 'MKT';
  OrderType['LMT'] = 'LMT';
  OrderType['STP'] = 'STP';
  OrderType['STP_LMT'] = 'STP LMT';
  OrderType['REL'] = 'REL';
  OrderType['TRAIL'] = 'TRAIL';
  OrderType['BOX_TOP'] = 'BOX TOP';
  OrderType['FIX_PEGGED'] = 'FIX PEGGED';
  OrderType['LIT'] = 'LIT';
  OrderType['LMT_PLUS_MKT'] = 'LMT + MKT';
  OrderType['LOC'] = 'LOC';
  OrderType['MIT'] = 'MIT';
  OrderType['MKT_PRT'] = 'MKT PRT';
  OrderType['MOC'] = 'MOC';
  OrderType['MTL'] = 'MTL';
  OrderType['PASSV_REL'] = 'PASSV REL';
  OrderType['PEG_BENCH'] = 'PEG BENCH';
  OrderType['PEG_MID'] = 'PEG MID';
  OrderType['PEG_MKT'] = 'PEG MKT';
  OrderType['PEG_PRIM'] = 'PEG PRIM';
  OrderType['PEG_STK'] = 'PEG STK';
  OrderType['REL_PLUS_LMT'] = 'REL + LMT';
  OrderType['REL_PLUS_MKT'] = 'REL + MKT';
  OrderType['SNAP_MID'] = 'SNAP MID';
  OrderType['SNAP_MKT'] = 'SNAP MKT';
  OrderType['SNAP_PRIM'] = 'SNAP PRIM';
  OrderType['STP_PRT'] = 'STP PRT';
  OrderType['TRAIL_LIMIT'] = 'TRAIL LIMIT';
  OrderType['TRAIL_LIT'] = 'TRAIL LIT';
  OrderType['TRAIL_LMT_PLUS_MKT'] = 'TRAIL LMT + MKT';
  OrderType['TRAIL_MIT'] = 'TRAIL MIT';
  OrderType['TRAIL_REL_PLUS_MKT'] = 'TRAIL REL + MKT';
  OrderType['VOL'] = 'VOL';
  OrderType['VWAP'] = 'VWAP';
  OrderType['QUOTE'] = 'QUOTE';
  OrderType['PEG_PRIM_VOL'] = 'PPV';
  OrderType['PEG_MID_VOL'] = 'PDV';
  OrderType['PEG_MKT_VOL'] = 'PMV';
  OrderType['PEG_SRF_VOL'] = 'PSV';
})(OrderType || (OrderType = {}));

class IbTraderGlobalDatum extends GlobalTraderDatum {
  async subscribe(source, field, datum) {
    await this.trader.establishWebSocketConnection();

    return super.subscribe(source, field, datum);
  }
}

class PositionDatum extends IbTraderGlobalDatum {
  // Do not clear.
  // The trader sends everything right after connection establishment.
  // These datums have no explicit on-demand subscriptions.
  // We have to explicitly feed the first subscribed source with the saved value.
  doNotClearValue = true;

  firstReferenceAdded(source, field, datum) {
    if (this.value.size) {
      for (const [key, data] of this.value) {
        if (this.filter(data, source, key, datum)) {
          source[field] =
            this[datum](data, source, key) ?? this.emptyValue(datum) ?? '—';
        }
      }
    }
  }

  filter(data, source, key, datum) {
    if (datum !== TRADER_DATUM.POSITION) {
      if (data.isBalance) {
        return data.position.currency === source.getAttribute('balance');
      }

      return (
        data.position.contract.symbol ===
        this.trader.getSymbol(source.instrument)
      );
    } else {
      return true;
    }
  }

  valueKeyForData(data) {
    if (data.isBalance) {
      // USD
      return data.position.currency;
    } else {
      return data.position.contract.conId;
    }
  }

  [TRADER_DATUM.POSITION](data) {
    if (data.isBalance) {
      return {
        symbol: data.position.currency,
        lot: 1,
        exchange: EXCHANGE.CUSTOM,
        isCurrency: true,
        isBalance: true,
        size: data.position.size,
        accountId: this.trader.document.account
      };
    } else {
      const instrument = this.trader.instruments.get(
        data.position.contract.symbol
      );

      if (instrument) {
        return {
          instrument,
          symbol: instrument.symbol,
          lot: instrument.lot,
          exchange: instrument.exchange,
          averagePrice: data.position.avgCost,
          isCurrency: false,
          isBalance: false,
          size: data.position.pos,
          accountId: data.position.account
        };
      }
    }
  }

  [TRADER_DATUM.POSITION_SIZE](data) {
    if (data.isBalance) {
      return data.position.size;
    } else {
      return data.position.pos;
    }
  }

  [TRADER_DATUM.POSITION_AVERAGE](data) {
    if (!data.isBalance) {
      return data.position.avgCost;
    }
  }
}

class ActiveOrderDatum extends IbTraderGlobalDatum {
  #timer;

  #shouldLoop = false;

  orders = new Map();

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

  async #fetchOrdersLoop() {
    if (this.#shouldLoop) {
      try {
        const orders = await this.trader.getAllOpenOrders();
        const newOrders = new Set();

        for (const o of orders) {
          if (
            (o.order.orderType !== OrderType.LMT &&
              o.order.orderType !== OrderType.MKT) ||
            o.contract.secType !== SecType.STK
          ) {
            continue;
          }

          newOrders.add(
            `${o.orderId}|${o.order.lmtPrice}|${o.orderStatus.filled}|${o.order.totalQuantity}`
          );

          if (!this.orders.has(o.orderId)) {
            this.orders.set(o.orderId, o);
            this.dataArrived(o);
          }
        }

        for (const [orderId, order] of this.orders) {
          if (
            !newOrders.has(
              `${orderId}|${order.order.lmtPrice}|${order.orderStatus.filled}|${order.order.totalQuantity}`
            )
          ) {
            // Order is absent, hide it from listing.
            order.orderStatus.status = OrderStatus.Unknown;

            this.dataArrived(order);
            this.orders.delete(orderId);
          }
        }

        this.#timer = setTimeout(() => {
          this.#fetchOrdersLoop();
        }, 500);
      } catch (e) {
        console.error(e);

        this.#timer = setTimeout(() => {
          this.#fetchOrdersLoop();
        }, 500);
      }
    }
  }

  [TRADER_DATUM.ACTIVE_ORDER](order) {
    const instrument = this.trader.instruments.get(order.contract.symbol);

    if (instrument) {
      return {
        instrument,
        orderId: order.orderId,
        symbol: order.contract.symbol,
        exchange: instrument.exchange,
        tif: order.order.tif,
        destination: order.contract.exchange,
        orderType: 'limit',
        side: order.order.action === OrderAction.BUY ? 'buy' : 'sell',
        status: this.trader.getOrderStatus(order),
        placedAt: new Date().toISOString(),
        endsAt: null,
        quantity: order.order.totalQuantity,
        filled: order.orderStatus.filled,
        price: order.order.lmtPrice
      };
    }
  }
}

class TimelineDatum extends IbTraderGlobalDatum {
  #timelineHistory = [];

  #timer;

  #shouldLoop = false;

  async #fetchTimelineLoop() {
    if (this.#shouldLoop) {
      try {
        const commissions = new Map();
        const commissionReport = await this.trader.getCommissionReport({
          acctCode: this.trader.document.account
        });

        if (commissionReport.ok) {
          for (const execution of commissionReport.result) {
            commissions.set(execution.execId, execution.commission);
          }
        }

        if (!this.#timelineHistory.length) {
          this.#timelineHistory = await this.trader.getExecutions();

          for (const item of this.#timelineHistory) {
            item.commission = commissions.get(item.execution.execId) ?? 0;

            this.dataArrived(item);
          }
        } else {
          const history = await this.trader.getExecutions();
          const newItems = [];

          for (const e of history) {
            if (
              e?.execution?.execId &&
              e.execution.execId !== this.#timelineHistory[0]?.execution?.execId
            ) {
              newItems.push(e);
            } else {
              break;
            }
          }

          this.#timelineHistory.unshift(...newItems);

          for (const item of newItems) {
            item.commission = commissions.get(item.execution.execId) ?? 0;

            this.dataArrived(item);
          }
        }

        this.#timer = setTimeout(() => {
          this.#fetchTimelineLoop();
        }, 500);
      } catch (e) {
        console.error(e);

        this.#timer = setTimeout(() => {
          this.#fetchTimelineLoop();
        }, 500);
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
    return data.execution.execId;
  }

  #formatExecutionTime(dateString) {
    const now = new Date();

    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);

    const time = dateString.split(/\s+/).at(-1).trim();
    const tzo = now.getTimezoneOffset() / 60;
    const sign = Math.sign(tzo);

    return `${year}-${month}-${day}T${time}${sign > 0 ? '-' : '+'}${Math.abs(
      tzo
    )
      .toString()
      .padStart(2, '0')}:00`;
  }

  [TRADER_DATUM.TIMELINE_ITEM](data) {
    return {
      instrument: this.trader.instruments.get(data.contract.symbol),
      operationId: data.execution.execId,
      accruedInterest: 0,
      commission: data.commission ?? 0,
      parentId: data.execution.permId,
      destination: data.execution.exchange,
      symbol: data.contract.symbol,
      type:
        data.execution.side === 'BOT'
          ? OPERATION_TYPE.OPERATION_TYPE_BUY
          : OPERATION_TYPE.OPERATION_TYPE_SELL,
      exchange: data.execution.exchange,
      quantity: data.execution.shares,
      price: data.execution.price,
      createdAt: this.#formatExecutionTime(data.execution.time)
    };
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} IbTrader
 */
class IbTrader extends USTrader {
  #key;

  #pendingConnection;

  connection;

  #twsConnectionState = ConnectionState.Disconnected;

  constructor(document) {
    super(document, [
      {
        type: PositionDatum,
        datums: [
          TRADER_DATUM.POSITION,
          TRADER_DATUM.POSITION_SIZE,
          TRADER_DATUM.POSITION_AVERAGE
        ]
      },
      {
        type: ActiveOrderDatum,
        datums: [TRADER_DATUM.ACTIVE_ORDER]
      },
      {
        type: TimelineDatum,
        datums: [TRADER_DATUM.TIMELINE_ITEM]
      }
    ]);

    this.#key = `${this.document.broker.twsHost}:${this.document.broker.twsPort}`;
    this.gatewayUrl = document.broker.ibGatewayUrl;

    const urlObject = new URL(this.gatewayUrl);

    urlObject.protocol = urlObject.protocol === 'http:' ? 'ws:' : 'wss:';

    this.wsUrl = urlObject.toString();
  }

  async establishWebSocketConnection(reconnect) {
    if (this.connection?.readyState === WebSocket.OPEN) {
      this.#pendingConnection = void 0;

      return this.connection;
    } else if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve, reject) => {
        if (!reconnect && this.connection) {
          resolve(this.connection);
        } else {
          this.connection = new WebSocket(this.wsUrl);
          this.connection.onopen = async () => {
            if (reconnect) {
              await this.resubscribe();
            }

            this.connection.send(this.#key);
          };

          this.connection.onclose = async () => {
            await later(1000);

            this.#pendingConnection = void 0;

            return this.establishWebSocketConnection(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = ({ data }) => {
            const { message, payload } = JSON.parse(data);

            if (message === 'subscription') {
              if (payload.subscribed) {
                fetch(`${this.gatewayUrl}call`, {
                  method: 'POST',
                  body: JSON.stringify({
                    method: 'connect',
                    key: this.#key,
                    body: {
                      host: this.document.broker.twsHost,
                      port: this.document.broker.twsPort
                    }
                  })
                });
              }
            } else if (message === 'connection') {
              if (
                payload.state === ConnectionState.Disconnected &&
                this.#twsConnectionState === ConnectionState.Connecting
              ) {
                reject(new ConnectionError({ details: payload }));
              } else if (payload.state === ConnectionState.Connected) {
                this.#twsConnectionState = payload.state;

                resolve(this.connection);
              } else if (
                payload.state === ConnectionState.Disconnected &&
                this.#twsConnectionState === ConnectionState.Connected
              ) {
                if (this.connection.readyState === WebSocket.OPEN) {
                  this.connection.close();
                }
              }

              this.#twsConnectionState = payload.state;
            } else if (message === 'summary') {
              const summary = payload[this.document.account] ?? {};

              if (summary.AvailableFunds) {
                for (const currency in summary.AvailableFunds) {
                  this.datums[TRADER_DATUM.POSITION].dataArrived({
                    isBalance: true,
                    position: {
                      currency,
                      size: parseFloat(summary.AvailableFunds[currency].value)
                    }
                  });
                }
              }
            } else if (message === 'positions') {
              const positions = payload[this.document.account] ?? [];

              for (const position of positions) {
                this.datums[TRADER_DATUM.POSITION].dataArrived({
                  isBalance: false,
                  position
                });
              }
            }
          };
        }
      }));
    }
  }

  async ensureTwsIsConnected() {
    await this.establishWebSocketConnection();
  }

  getOrderStatus(o = {}) {
    switch (o.orderStatus.status) {
      case OrderStatus.ApiCancelled:
      case OrderStatus.Cancelled:
        return 'canceled';
      case OrderStatus.ApiPending:
      case OrderStatus.PendingCancel:
      case OrderStatus.PendingSubmit:
      case OrderStatus.PreSubmitted:
      case OrderStatus.Submitted:
        return 'working';
      case OrderStatus.Filled:
        return 'filled';
      case OrderStatus.Inactive:
        return 'inactive';
      case OrderStatus.Unknown:
        return 'unspecified';
    }
  }

  getBroker() {
    return BROKERS.IB;
  }

  getDictionary() {
    return INSTRUMENT_DICTIONARY.IB;
  }

  getExchange() {
    return EXCHANGE.CUSTOM;
  }

  getExchangeForDBRequest() {
    return {
      $in: [EXCHANGE.US]
    };
  }

  getObservedAttributes() {
    return ['balance'];
  }

  async getAllOpenOrders() {
    const ordersResponse = await fetch(`${this.gatewayUrl}call`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'getAllOpenOrders',
        key: this.#key
      })
    });

    const ordersData = await ordersResponse.json();

    return ordersData.result ?? [];
  }

  async getCommissionReport() {
    const report = await fetch(`${this.gatewayUrl}call`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'getCommissionReport',
        key: this.#key
      })
    });

    return report.json();
  }

  async getExecutions() {
    const executionsResponse = await fetch(`${this.gatewayUrl}call`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'getExecutionDetails',
        key: this.#key
      })
    });

    const executionsData = await executionsResponse.json();

    return executionsData.result?.reverse() ?? [];
  }

  async modifyLimitOrders({ instrument, side, value }) {
    await this.ensureTwsIsConnected();

    const orders = this.datums[TRADER_DATUM.ACTIVE_ORDER].orders;

    for (const [, o] of orders) {
      const status = this.getOrderStatus(o);
      const orderInstrument = this.instruments.get(o.contract.symbol);

      if (
        status === 'working' &&
        (o.order.action.toLowerCase() === side || side === 'all')
      ) {
        if (
          instrument &&
          !this.instrumentsAreEqual(instrument, orderInstrument)
        )
          continue;

        if (orderInstrument?.minPriceIncrement >= 0) {
          // US stocks only.
          const minPriceIncrement = +o.order.lmtPrice < 1 ? 0.0001 : 0.01;
          const price = +this.fixPrice(
            orderInstrument,
            +o.order.lmtPrice + minPriceIncrement * value
          );

          await fetch(`${this.gatewayUrl}call`, {
            method: 'POST',
            body: JSON.stringify({
              method: 'modifyOrder',
              key: this.#key,
              body: {
                id: o.orderId,
                contract: {
                  symbol: o.contract.symbol,
                  exchange: o.contract.exchange,
                  currency: o.contract.currency,
                  secType: o.contract.secType
                },
                order: {
                  orderType: o.order.orderType,
                  action: o.order.action,
                  lmtPrice: price,
                  totalQuantity:
                    (+o.order.totalQuantity - +o.orderStatus.filled) /
                    orderInstrument.lot,
                  account: o.order.account,
                  tif: o.order.tif,
                  outsideRth: o.order.outsideRth,
                  transmit: true
                }
              }
            })
          });
        }
      }
    }
  }

  async cancelAllLimitOrders({ instrument, filter } = {}) {
    await this.ensureTwsIsConnected();

    const orders = this.datums[TRADER_DATUM.ACTIVE_ORDER].orders;

    for (const [, o] of orders) {
      const status = this.getOrderStatus(o);
      const orderInstrument = this.instruments.get(o.contract.symbol);

      if (orderInstrument && status === 'working') {
        if (
          instrument &&
          !this.instrumentsAreEqual(instrument, orderInstrument)
        )
          continue;

        if (filter === 'buy' && o.order.action !== OrderAction.BUY) {
          continue;
        }

        if (filter === 'sell' && o.order.action !== OrderAction.SELL) {
          continue;
        }

        await this.cancelLimitOrder(o);
      }
    }
  }

  async cancelLimitOrder(order) {
    await this.ensureTwsIsConnected();

    const orderResponse = await fetch(`${this.gatewayUrl}call`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'cancelOrder',
        key: this.#key,
        body: {
          id: order.orderId
        }
      })
    });

    const orderData = await orderResponse.json();

    if (orderResponse.ok) {
      return {
        orderId: orderData.result
      };
    } else {
      throw new TradingError({
        message: orderData.result
      });
    }
  }

  async placeLimitOrder({
    instrument,
    price,
    quantity,
    direction,
    destination,
    tif,
    displaySize
  }) {
    await this.ensureTwsIsConnected();

    if (this.connection.readyState === WebSocket.OPEN) {
      if (
        typeof displaySize !== 'number' ||
        displaySize > quantity ||
        displaySize % 100 !== 0
      ) {
        displaySize = void 0;
      }

      return new Promise(async (resolve, reject) => {
        try {
          const idResponse = await fetch(`${this.gatewayUrl}call`, {
            method: 'POST',
            body: JSON.stringify({
              method: 'getNextValidOrderId',
              key: this.#key
            })
          });
          const { result } = await idResponse.json();
          const temporaryListener = ({ data }) => {
            const parsed = JSON.parse(data);

            if (parsed.message === 'orderStatus') {
              if (
                parsed.reqId === result &&
                (parsed.status === OrderStatus.Submitted ||
                  parsed.status === OrderStatus.PreSubmitted ||
                  parsed.status === OrderStatus.Filled)
              ) {
                this.connection.removeEventListener(
                  'message',
                  temporaryListener
                );

                resolve({
                  orderId: parsed.reqId
                });
              }
            } else if (parsed.message === 'error') {
              reject(
                new TradingError({
                  message: parsed.payload.message,
                  details: {
                    code: parsed.payload.code,
                    reqId: parsed.payload.reqId
                  }
                })
              );
              this.connection.removeEventListener('message', temporaryListener);
            }
          };

          this.connection.addEventListener('message', temporaryListener);

          const order = {
            orderType: price ? OrderType.LMT : OrderType.MKT,
            action: direction === 'buy' ? OrderAction.BUY : OrderAction.SELL,
            totalQuantity: quantity,
            account: this.document.account,
            tif,
            displaySize,
            outsideRth: true,
            transmit: true
          };

          if (price) {
            order.lmtPrice = +this.fixPrice(instrument, price);
          }

          return fetch(`${this.gatewayUrl}call`, {
            method: 'POST',
            body: JSON.stringify({
              method: 'placeOrder',
              key: this.#key,
              body: {
                id: result,
                contract: {
                  symbol: this.getSymbol(instrument),
                  exchange: destination,
                  currency: instrument.currency,
                  secType: SecType.STK
                },
                order
              }
            })
          });
        } catch (e) {
          reject(e);
        }
      });
    } else {
      throw new TradingError({
        message: 'Нет соединения с шлюзом TWS.'
      });
    }
  }

  async placeMarketOrder({
    instrument,
    quantity,
    direction,
    destination,
    tif,
    displaySize
  }) {
    return this.placeLimitOrder({
      instrument,
      quantity,
      direction,
      destination,
      tif,
      displaySize
    });
  }

  formatError(instrument, error, defaultErrorMessage) {
    const message = error.message;

    if (/is not available for short sale/i.test(message))
      return 'Невозможно открыть короткую позицию по этому инструменту.';

    if (/The size value cannot be zero/i.test(message))
      return 'Невозможно открыть позицию с нулевым объёмом.';

    return defaultErrorMessage ?? 'Заявка не выставлена.';
  }
}

if (typeof self !== 'undefined') {
  pppTraderInstanceForWorkerIs(IbTrader);
}

export default IbTrader;
