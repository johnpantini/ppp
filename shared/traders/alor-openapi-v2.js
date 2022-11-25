import { isJWTTokenExpired, uuidv4 } from '../ppp-crypto.js';
import { TradingError } from '../trading-error.js';
import { TRADER_DATUM } from '../const.js';
import { later } from '../later.js';
import {
  getInstrumentPrecision,
  cyrillicToLatin,
  formatPrice
} from '../intl.js';
import ppp from '../../ppp.js';

// noinspection JSUnusedGlobalSymbols
/**
 * @typedef {Object} AlorOpenAPIV2Trader
 */
export default class {
  #jwt;

  #slug = uuidv4().split('-')[0];

  #counter = Date.now();

  #pendingConnection;

  #pendingJWTRequest;

  document = {};

  subs = {
    quotes: new Map()
  };

  refs = {
    quotes: new Map()
  };

  connection;

  subsAndRefs = {
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
    [TRADER_DATUM.BEST_ASK]: [this.subs.quotes, this.refs.quotes]
  };

  constructor(document) {
    this.document = document;
  }

  async syncAccessToken() {
    try {
      if (this.#jwt && !isJWTTokenExpired(this.#jwt)) return true;
      else if (this.#pendingJWTRequest) return this.#pendingJWTRequest;

      this.#pendingJWTRequest = fetch(
        `https://oauth.alor.ru/refresh?token=${this.document.broker.refreshToken}`,
        {
          method: 'POST'
        }
      );

      const { AccessToken } = await (await this.#pendingJWTRequest).json();

      this.#jwt = AccessToken;

      this.#pendingJWTRequest = null;

      return false;
    } catch (e) {
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

  #fixPrice(instrument, price) {
    const precision = getInstrumentPrecision(instrument);

    price = parseFloat(price?.replace(',', '.'));

    if (!price || isNaN(price)) price = 0;

    return price.toFixed(precision).toString();
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
          price: this.#fixPrice(instrument, price),
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
            for (const [instrumentId, { instrument, guid, refCount }] of this
              .refs.quotes) {
              if (refCount > 0) {
                const guid = this.#reqId();

                this.refs.quotes[instrumentId.guid] = guid;

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

            resolve(this.connection);
          };

          this.connection.onclose = async () => {
            await later(Math.max(this.document.reconnectTimeout ?? 1000, 1000));
            await this.syncAccessToken();

            this.#pendingConnection = null;

            await this.#connectWebSocket(true);
          };

          this.connection.onerror = () => this.connection.close();

          this.connection.onmessage = ({ data }) => {
            const payload = JSON.parse(data);

            if (payload.data && payload.data.last_price) {
              return this.onQuotesMessage({ data: payload.data });
            }
          };
        }
      }));
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    await this.syncAccessToken();

    if (this.subs.quotes.has(source)) {
      for (const { field } of this.subs.quotes.get(source)) {
        source[field] = '—';

        if (oldValue) {
          this.removeRef(oldValue, this.refs.quotes);
        }

        if (newValue) {
          this.addRef(newValue, this.refs.quotes);
        }
      }
    }

    if (newValue?._id) {
      // Handle no real subscription case
      this.onQuotesMessage({
        data: this.refs.quotes.get(newValue._id)?.lastData
      });
    }
  }

  onQuotesMessage({ data }) {
    if (data) {
      for (const [source, fields] of this.subs.quotes) {
        for (const { field, datum } of fields) {
          if (data.symbol === this.#getSymbol(source.instrument)) {
            if (source.instrument?._id) {
              const ref = this.refs.quotes.get(source.instrument._id);

              ref.lastData = data;
            }

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

  addRef(instrument, refs) {
    if (instrument?._id && refs) {
      const ref = refs.get(instrument._id);

      if (typeof ref === 'undefined') {
        const guid = this.#reqId();

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
        }
      } else {
        ref.refCount++;
      }
    }
  }

  removeRef(instrument, refs) {
    if (instrument?._id && refs) {
      const ref = refs.get(instrument._id);

      if (typeof ref !== 'undefined') {
        if (ref.refCount > 0) {
          ref.refCount--;
        }

        if (ref.refCount === 0) {
          if (this.connection.readyState === WebSocket.OPEN) {
            if (refs === this.refs.quotes) {
              this.connection.send(
                JSON.stringify({
                  opcode: 'unsubscribe',
                  token: this.#jwt,
                  guid: ref.guid
                })
              );
            }
          }

          refs.delete(instrument._id);
        }
      }
    }
  }

  async subscribeField({ source, field, datum }) {
    const [subs, refs] = this.subsAndRefs[datum];

    if (subs) {
      const array = subs.get(source);

      if (Array.isArray(array)) {
        if (!array.find((e) => e.field === field)) array.push({ field, datum });
      } else {
        subs.set(source, [{ field, datum }]);
      }

      await this.syncAccessToken();
      await this.#connectWebSocket();

      this.addRef(source?.instrument, refs);
    }
  }

  async subscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.subscribeField({ source, field, datum });
    }
  }

  async unsubscribeField({ source, field, datum }) {
    const [subs, refs] = this.subsAndRefs[datum];

    if (subs) {
      const array = subs.get(source);
      const index = array?.findIndex?.(
        (e) => e.field === field && e.datum === datum
      );

      if (index > -1) {
        array.splice(index, 1);

        if (!array.length) {
          subs.delete(source);
        }

        await this.syncAccessToken();
        this.removeRef(source?.instrument, refs);
      }
    }
  }

  async unsubscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.unsubscribeField({ source, field, datum });
    }
  }

  #getExchange(traderExchange) {
    switch (traderExchange) {
      case 'SPBX':
        return 'spbex';
      case 'MOEX':
        return 'moex';
      default:
        return '';
    }
  }

  async search(searchText) {
    if (searchText?.trim()) {
      searchText = searchText.trim();

      const lines = ((context) => {
        const collection = context.services
          .get('mongodb-atlas')
          .db('ppp')
          .collection('instruments');

        const exactSymbolMatch = collection
          .find({
            $and: [
              {
                exchange: '$exchange'
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
              {
                exchange: '$exchange'
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
              {
                exchange: '$exchange'
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
          .replaceAll('$exchange', this.#getExchange(this.document.exchange))
          .replaceAll('$text', searchText.toUpperCase())
          .replaceAll('$latin', cyrillicToLatin(searchText).toUpperCase())
      );
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

    if (/PROHIBITION_CH/i.test(message)) return 'Заявка заблокирована биржей.';

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
}
