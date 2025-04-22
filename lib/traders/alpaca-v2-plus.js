import {
  TraderDatum,
  USTrader,
  pppTraderInstanceForWorkerIs
} from './trader-worker.js';
import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  TRADER_DATUM,
  TRADING_STATUS
} from '../const.js';
import { later } from '../ppp-decorators.js';
import { isDST } from '../intl.js';
import {
  AuthorizationError,
  ConnectionLimitExceededError
} from '../ppp-exceptions.js';
import { uuidv4 } from '../ppp-crypto.js';

export function comboStatusToTradingStatus(tradingStatus = '') {
  switch (tradingStatus.toString()) {
    // WILL_OPEN
    case 'W':
      return TRADING_STATUS.OPENING_PERIOD;
    // AUCTION
    case 'C':
      return TRADING_STATUS.DISCRETE_AUCTION;
    // OPENING
    case 'T':
      return TRADING_STATUS.NORMAL_TRADING;
    // PRE_TRADE
    case 'F':
      return TRADING_STATUS.PREMARKET;
    // AFTER_TRADE
    case 'A':
      return TRADING_STATUS.AFTER_HOURS;
    // NOON_CLOSED
    case 'M':
      return TRADING_STATUS.BREAK_IN_TRADING;
    // CLOSED
    case 'B':
      return TRADING_STATUS.NOT_AVAILABLE_FOR_TRADING;
    // HAS_CLOSED
    case 'D':
      return TRADING_STATUS.NOT_AVAILABLE_FOR_TRADING;
    // NOT_OPEN
    case 'H':
      return TRADING_STATUS.NOT_AVAILABLE_FOR_TRADING;
    // SUSPENSION
    case 'P':
      return TRADING_STATUS.TRADING_SUSPENDED;
    // DELISTED
    case '3':
      return TRADING_STATUS.DELISTED;
    // IPO_TODAY
    case '5':
      return TRADING_STATUS.IPO_TODAY;
  }

  return TRADING_STATUS.UNSPECIFIED;
}

class AlpacaV2PlusTraderDatum extends TraderDatum {
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
        TRADER_DATUM.DAY_VOLUME,
        TRADER_DATUM.TRADING_STATUS,
        TRADER_DATUM.STATUS
      ].includes(datum)
    ) {
      return [EXCHANGE.US, EXCHANGE.UTEX_MARGIN_STOCKS].includes(
        source?.instrument?.exchange
      );
    } else {
      return [EXCHANGE.SPBX, EXCHANGE.US, EXCHANGE.UTEX_MARGIN_STOCKS].includes(
        source?.instrument?.exchange
      );
    }
  }

  async subscribe(source, field, datum) {
    await this.trader.establishWebSocketConnection();

    return super.subscribe(source, field, datum);
  }
}

class CandleDatum extends AlpacaV2PlusTraderDatum {
  filter(data, instrument, source, datum) {
    const sup = super.filter(data, instrument, source, datum);

    if (sup) {
      if (
        datum === TRADER_DATUM.CANDLE &&
        (typeof data.tf === 'number' || typeof data.tf === 'string')
      ) {
        return data.tf.toString() === source.getAttribute('tf');
      }
    }

    return sup;
  }

  async firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'subscribe',
          candles: [symbol]
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'unsubscribe',
          candles: [symbol]
        })
      );
    }
  }

  [TRADER_DATUM.CANDLE](data) {
    return {
      symbol: data.S,
      tf: data.tf,
      open: data.o,
      high: data.h,
      low: data.l,
      close: data.c,
      volume: data.v,
      timestamp: new Date(data.t).valueOf(),
      customValues: data.cv
    };
  }
}

class ComboDatum extends AlpacaV2PlusTraderDatum {
  filter(data, instrument, source, datum) {
    const sup = super.filter(data, instrument, source, datum);

    if (sup) {
      if (data) {
        // Prevent unplanned data overwriting (data comes in slots).
        switch (data.T) {
          case 't':
            return datum === TRADER_DATUM.MARKET_PRINT;
          case 'bbo':
            return (
              datum === TRADER_DATUM.BEST_BID || datum === TRADER_DATUM.BEST_ASK
            );
          case 'st':
            if (datum === TRADER_DATUM.STATUS) {
              return typeof data.st === 'string';
            } else if (datum === TRADER_DATUM.TRADING_STATUS) {
              return typeof data.tst === 'string';
            } else {
              return [TRADER_DATUM.DAY_VOLUME].includes(datum);
            }

          case 'pr':
            switch (datum) {
              case TRADER_DATUM.LAST_PRICE:
                return typeof data.c === 'number';
              case TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE:
                return typeof data.ch === 'number';
              case TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE:
                return typeof data.chr === 'number';
              case TRADER_DATUM.EXTENDED_LAST_PRICE:
                return typeof data.pp === 'number';
              case TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE:
                return typeof data.pch === 'number';
              case TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE:
                return typeof data.pchr === 'number';
            }
        }
      }
    }
  }

  async firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'subscribe',
          trades: [symbol]
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'unsubscribe',
          trades: [symbol]
        })
      );
    }
  }

  [TRADER_DATUM.MARKET_PRINT](data) {
    const timestamp = new Date(data.t).valueOf();
    const side = this.trader.hitToSide(data.h);
    const pool = this.trader.alpacaExchangeToUTEXExchange(data.x);

    return {
      tradeId: `${data.S}|${side}|${data.p}|${data.s}|${pool}|${timestamp}`,
      symbol: data.S,
      side,
      condition: data.c,
      timestamp,
      price: data.p,
      volume: data.s,
      pool
    };
  }

  [TRADER_DATUM.BEST_BID](data) {
    return data.bp;
  }

  [TRADER_DATUM.BEST_ASK](data) {
    return data.ap;
  }

  [TRADER_DATUM.LAST_PRICE](data) {
    return data.c;
  }

  [TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE](data) {
    return data.ch;
  }

  [TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE](data) {
    return data.chr * 100;
  }

  [TRADER_DATUM.EXTENDED_LAST_PRICE](data) {
    return data.pp;
  }

  [TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE](data) {
    return data.pch;
  }

  [TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE](data) {
    return data.pchr * 100;
  }

  [TRADER_DATUM.DAY_VOLUME](data) {
    return data.v;
  }

  [TRADER_DATUM.TRADING_STATUS](data) {
    return comboStatusToTradingStatus(data.tst);
  }

  [TRADER_DATUM.STATUS](data) {
    return comboStatusToTradingStatus(data.st);
  }
}

class OrderbookDatum extends AlpacaV2PlusTraderDatum {
  slotted = false;

  orderbooks = new Map();

  async firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.orderbooks.set(symbol, {
        bids: new Map(),
        asks: new Map()
      });

      if (this.trader.document.broker.type === BROKERS.ALPACA) {
        const lastQuoteResponse = await ppp.fetch(
          `https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest?feed=sip`,
          {
            headers: {
              'APCA-API-KEY-ID': this.trader.document.broker.login,
              'APCA-API-SECRET-KEY': this.trader.document.broker.password
            }
          }
        );

        if (lastQuoteResponse.ok) {
          const instrument = this.trader.adoptInstrument(source.instrument);

          this.dataArrived(
            [
              {
                T: 'q',
                ...(await lastQuoteResponse.json()).quote
              }
            ],
            instrument
          );
        }
      }

      this.trader.connection.send(
        JSON.stringify({
          action: 'subscribe',
          quotes: [symbol]
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'unsubscribe',
          quotes: [symbol]
        })
      );
    }

    this.orderbooks.delete(symbol);
  }

  [TRADER_DATUM.ORDERBOOK](orderbook, instrument) {
    const montage = {
      bids: [],
      asks: []
    };
    const orderbookMap = this.orderbooks.get(this.trader.getSymbol(instrument));
    const volumeCoefficient = this.trader.document.useLots ? 1 : 100;
    const iterable = Array.isArray(orderbook) ? orderbook : [orderbook];

    for (const data of iterable) {
      let bidKey = data.bx;

      if (this.trader.document.broker.type === BROKERS.PSINA) {
        bidKey = `${data.bx}|${data.bp}|${data.bs}|${data.level}`;
      } else if (this.trader.document.broker.type === BROKERS.ALPACA) {
        orderbookMap.bids.clear();
      }

      orderbookMap.bids.set(bidKey, {
        price: data.bp,
        volume: data.bs * volumeCoefficient,
        condition: data.c,
        timestamp: data.t ? new Date(data.t).valueOf() : null,
        pool: this.trader.alpacaExchangeToUTEXExchange(data.bx)
      });

      let askKey = data.ax;

      if (this.trader.document.broker.type === BROKERS.PSINA) {
        askKey = `${data.ax}|${data.ap}|${data.as}|${data.level}`;
      } else if (this.trader.document.broker.type === BROKERS.ALPACA) {
        orderbookMap.asks.clear();
      }

      orderbookMap.asks.set(askKey, {
        price: data.ap,
        volume: data.as * volumeCoefficient,
        condition: data.c,
        timestamp: data.t ? new Date(data.t).valueOf() : null,
        pool: this.trader.alpacaExchangeToUTEXExchange(data.ax)
      });

      const nowHours = new Date().getUTCHours();

      montage.bids = [...orderbookMap.bids.values()].filter((b) => {
        if (this.trader.document.broker.type === BROKERS.UTEX) {
          // Fix for invalid NYSE pool data.
          if (
            (nowHours >= (isDST() ? 20 : 21) ||
              nowHours < (isDST() ? 10 : 11)) &&
            b.pool === 'N'
          )
            return false;
        }

        return b.price > 0 && (b.volume > 0 || b.pool === 'LULD');
      });

      montage.asks = [...orderbookMap.asks.values()].filter((a) => {
        if (this.trader.document.broker.type === BROKERS.UTEX) {
          // Fix for invalid NYSE pool data.
          if (
            (nowHours >= (isDST() ? 20 : 21) ||
              nowHours < (isDST() ? 10 : 11)) &&
            a.pool === 'N'
          )
            return false;
        }

        return a.price > 0 && (a.volume > 0 || a.pool === 'LULD');
      });
    }

    return montage;
  }
}

class NoiiDatum extends AlpacaV2PlusTraderDatum {
  filter(data, instrument, source) {
    if (!data) {
      return false;
    }

    if (!data.h) {
      const nowHours = new Date().getUTCHours();

      if (source.getAttribute('noii') === 'close' && nowHours < 19) {
        return false;
      }

      if (source.getAttribute('noii') === 'open' && nowHours > 14) {
        return false;
      }
    } else {
      // From history.
      const noiiHours = new Date(data.t).getUTCHours();

      if (source.getAttribute('noii') === 'close' && noiiHours < 19) {
        return false;
      }

      if (source.getAttribute('noii') === 'open' && noiiHours > 14) {
        return false;
      }
    }

    return super.filter(data, instrument, source);
  }

  async firstReferenceAdded(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'subscribe',
          noii: [symbol],
          close: true
        })
      );

      this.trader.connection.send(
        JSON.stringify({
          action: 'subscribe',
          noii: [symbol],
          close: false
        })
      );
    }
  }

  async lastReferenceRemoved(source, symbol) {
    if (this.trader.connection.readyState === WebSocket.OPEN) {
      this.trader.connection.send(
        JSON.stringify({
          action: 'unsubscribe',
          noii: [symbol]
        })
      );
    }
  }

  [TRADER_DATUM.NOII](data) {
    return {
      symbol: data.S,
      timestamp: new Date(data.t).valueOf(),
      pairedShares: data.psh,
      imbShares: data.ish,
      side: data.is,
      imbRefPrice: data.irp,
      imbNearPrice: data.inp,
      imbFarPrice: data.ifp,
      imbVarIndicator: data.ivi,
      imbActTp: data.iatp
    };
  }
}

/**
 * @typedef {Object} AlpacaV2PlusTrader
 */
class AlpacaV2PlusTrader extends USTrader {
  #pendingConnection;

  authenticated = false;

  connection;

  constructor(document) {
    super(document, [
      {
        type: ComboDatum,
        datums: [
          TRADER_DATUM.MARKET_PRINT,
          TRADER_DATUM.BEST_BID,
          TRADER_DATUM.BEST_ASK,
          TRADER_DATUM.LAST_PRICE,
          TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
          TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
          TRADER_DATUM.EXTENDED_LAST_PRICE,
          TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE,
          TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE,
          TRADER_DATUM.DAY_VOLUME,
          TRADER_DATUM.TRADING_STATUS,
          TRADER_DATUM.STATUS
        ]
      },
      {
        type: OrderbookDatum,
        datums: [TRADER_DATUM.ORDERBOOK]
      },
      {
        type: NoiiDatum,
        datums: [TRADER_DATUM.NOII]
      },
      {
        type: CandleDatum,
        datums: [TRADER_DATUM.CANDLE]
      }
    ]);
  }

  getTimeframeList() {
    if (this.document.broker.type === BROKERS.PSINA) {
      return [
        {
          name: 'Sec',
          values: [1, 5, 15]
        },
        {
          name: 'Min',
          values: [1, 5, 15, 30]
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
          values: [1, 3, 12]
        }
      ];
    } else if (this.document.broker.type === BROKERS.ALPACA) {
      return [
        {
          name: 'Min',
          interval: [1, 59]
        },
        {
          name: 'Hour',
          interval: [1, 23]
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
          values: [1, 2, 3, 4, 6, 12]
        }
      ];
    } else {
      return [];
    }
  }

  alpacaExchangeToUTEXExchange(exchange) {
    switch (exchange) {
      case 'P':
        return 'PA';
      case 'J':
        return 'DA';
      case 'K':
        return 'DX';
      case 'Y':
        return 'BT';
      case 'M':
        return 'MW';
      case 'D':
        return 'QD';
    }

    return exchange;
  }

  hitToSide(hit = 0) {
    return {
      // UnknownHitType
      0: '',
      // AtBid
      1: 'sell',
      // AtAsk
      2: 'buy',
      // AboveAsk
      3: 'buy',
      // BelowBid
      4: 'sell',
      // Between
      5: ''
    }[hit];
  }

  async establishWebSocketConnection(reconnect) {
    if (this.connection?.readyState === WebSocket.OPEN && this.authenticated) {
      return this.connection;
    } else if (
      this.#pendingConnection &&
      !reconnect &&
      this.connection?.readyState !== WebSocket.CLOSED
    ) {
      return this.#pendingConnection;
    } else {
      this.#pendingConnection = new Promise((resolve, reject) => {
        this.authenticated = false;
        this.connection = new WebSocket(this.document.wsUrl);

        this.connection.onclose = async () => {
          await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));
          resolve(this.establishWebSocketConnection(true));
        };

        this.connection.onerror = () => this.connection.close();

        this.connection.onmessage = async ({ data }) => {
          const parsed = JSON.parse(data) ?? [];

          // Psina DOM books come complete. Optimize observable mutations.
          if (this.document.broker.type === BROKERS.PSINA) {
            if (Array.isArray(parsed) && parsed[0]?.T === 'q') {
              const orderbookMap = this.datums[
                TRADER_DATUM.ORDERBOOK
              ].orderbooks.get(parsed[0].S);

              if (typeof orderbookMap !== 'undefined') {
                orderbookMap.bids.clear();
                orderbookMap.asks.clear();
              }

              return this.datums[TRADER_DATUM.ORDERBOOK].dataArrived(
                parsed,
                this.instruments.get(parsed[0].S)
              );
            }
          }

          for (const payload of parsed) {
            if (payload.msg === 'connected') {
              this.connection.send(
                JSON.stringify({
                  action: 'auth',
                  key: this.document.broker.login,
                  secret: this.document.broker.password
                })
              );

              break;
            } else if (payload.msg === 'authenticated') {
              this.authenticated = true;

              if (reconnect) {
                await this.resubscribe();
              }

              resolve(this.connection);

              break;
            } else if (payload.T === 't') {
              this.datums[TRADER_DATUM.MARKET_PRINT].dataArrived(
                payload,
                this.instruments.get(payload.S),
                { doNotSaveValue: true }
              );
            } else if (payload.T === 'q') {
              this.datums[TRADER_DATUM.ORDERBOOK].dataArrived(
                payload,
                this.instruments.get(payload.S)
              );
            } else if (payload.T === 'noii') {
              this.datums[TRADER_DATUM.NOII].dataArrived(
                payload,
                this.instruments.get(payload.S)
              );
            } else if (payload.T === 'c') {
              this.datums[TRADER_DATUM.CANDLE].dataArrived(
                payload,
                this.instruments.get(payload.S)
              );
            } else if (payload.T === 'bbo') {
              this.datums[TRADER_DATUM.BEST_BID].dataArrived(
                payload,
                this.instruments.get(payload.S),
                { saveSlot: 0 }
              );
            } else if (payload.T === 'pr') {
              const prices = {
                S: payload.S,
                T: payload.T,
                c: payload.c,
                ch: payload.ch,
                chr: payload.chr,
                mv: payload.mv
              };

              const extendedPrices = {
                S: payload.S,
                T: payload.T,
                pch: payload.pch,
                pchr: payload.pchr,
                pp: payload.pp,
                mv: payload.mv
              };

              if (typeof prices.c === 'number') {
                this.datums[TRADER_DATUM.LAST_PRICE].dataArrived(
                  prices,
                  this.instruments.get(payload.S),
                  { saveSlot: 1 }
                );
              }

              this.datums[TRADER_DATUM.LAST_PRICE].dataArrived(
                extendedPrices,
                this.instruments.get(payload.S),
                { saveSlot: 2 }
              );
            } else if (payload.T === 'st') {
              const realTimeData = {
                S: payload.S,
                T: payload.T,
                tst: payload.tst
              };

              this.datums[TRADER_DATUM.TRADING_STATUS].dataArrived(
                realTimeData,
                this.instruments.get(realTimeData.S),
                { saveSlot: 3 }
              );

              const fetchData = {
                S: payload.S,
                T: payload.T,
                st: payload.st
              };

              if (typeof fetchData.st !== 'undefined') {
                this.datums[TRADER_DATUM.STATUS].dataArrived(
                  fetchData,
                  this.instruments.get(fetchData.S),
                  { saveSlot: 4 }
                );
              }
            } else if (payload.T === 'error') {
              if (payload.code === 407) {
                continue;
              } else if (payload.code === 406) {
                this.authenticated = false;
                this.connection.onclose = null;

                reject(new ConnectionLimitExceededError({ details: payload }));

                break;
              } else {
                this.authenticated = false;
                this.connection.onclose = null;

                reject(new AuthorizationError({ details: payload }));

                break;
              }
            }
          }
        };
      });

      return this.#pendingConnection;
    }
  }

  getBroker() {
    return this.document.broker.type;
  }

  getDictionary() {
    if (this.document.broker.type === BROKERS.PSINA) {
      return INSTRUMENT_DICTIONARY.PSINA_US_STOCKS;
    } else if (this.document.broker.type === BROKERS.ALPACA) {
      return INSTRUMENT_DICTIONARY.ALPACA;
    } else if (this.document.broker.type === BROKERS.UTEX) {
      return INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS;
    }

    return null;
  }

  getExchange() {
    if (
      this.document.broker.type === BROKERS.PSINA ||
      this.document.broker.type === BROKERS.ALPACA
    ) {
      return EXCHANGE.US;
    } else if (this.document.broker.type === BROKERS.UTEX) {
      return EXCHANGE.UTEX_MARGIN_STOCKS;
    }

    return null;
  }

  getObservedAttributes() {
    return ['noii', 'tf'];
  }

  async historicalTimeAndSales({ instrument }) {
    if (this.document.broker.type === BROKERS.PSINA) {
      try {
        await this.establishWebSocketConnection();

        if (this.connection.readyState === WebSocket.OPEN) {
          const rid = uuidv4();
          const raw = await new Promise((resolve) => {
            const temporaryListener = ({ data }) => {
              const parsed = JSON.parse(data) ?? [];

              for (const payload of parsed) {
                if (payload.T === 'th' && payload.rid === rid) {
                  this.connection.removeEventListener(
                    'message',
                    temporaryListener
                  );

                  return resolve(payload.h);
                }
              }
            };

            this.connection.addEventListener('message', temporaryListener);
            this.connection.send(
              JSON.stringify({
                action: 'fetch',
                rid,
                trades: [this.getSymbol(instrument)]
              })
            );
          });

          const result = [];

          for (let i = 0; i < raw.length; i++) {
            result.push(
              this.datums[TRADER_DATUM.MARKET_PRINT][TRADER_DATUM.MARKET_PRINT](
                raw[raw.length - i - 1]
              )
            );
          }

          return result;
        } else {
          return [];
        }
      } catch (e) {
        return [];
      }
    }

    return [];
  }

  async historicalCandles({ instrument, unit, value, cursor }) {
    if (this.document.broker.type === BROKERS.PSINA) {
      try {
        await this.establishWebSocketConnection();

        if (this.connection.readyState === WebSocket.OPEN) {
          const rid = uuidv4();
          const raw = await new Promise((resolve) => {
            const temporaryListener = ({ data }) => {
              const parsed = JSON.parse(data) ?? [];

              for (const payload of parsed) {
                if (payload.T === 'ca' && payload.rid === rid) {
                  this.connection.removeEventListener(
                    'message',
                    temporaryListener
                  );

                  return resolve(payload.ca);
                }
              }
            };

            this.connection.addEventListener('message', temporaryListener);
            this.connection.send(
              JSON.stringify({
                action: 'fetch',
                rid,
                unit,
                value,
                cursor,
                candles: [this.getSymbol(instrument)]
              })
            );
          });

          return {
            cursor: raw?.cursor,
            candles: raw?.candles ?? []
          };
        } else {
          return {
            candles: []
          };
        }
      } catch (e) {
        return {
          candles: []
        };
      }
    } else {
      return {
        candles: []
      };
    }
  }
}

pppTraderInstanceForWorkerIs(AlpacaV2PlusTrader);

export default AlpacaV2PlusTrader;
