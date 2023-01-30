import { Page } from './page.js';
import { validate } from './validate.js';
import { TRADER_CAPS, TRADERS } from './const.js';
import { uuidv4 } from './ppp-crypto.js';
import { maybeFetchError } from './fetch-error.js';
import ppp from '../ppp.js';

export class TraderAlorOpenAPIV2Page extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.portfolio);

    if (this.flatCommissionRate.value.trim()) {
      await validate(this.flatCommissionRate, {
        hook: async (value) => +value > 0 + value <= 100,
        errorMessage: 'Введите значение в диапазоне от 0 до 100'
      });
    }

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: 'Введите значение в диапазоне от 100 до 10000'
      });
    }

    const broker = this.brokerId.datum();
    const jwtRequest = await fetch(
      `https://oauth.alor.ru/refresh?token=${broker.refreshToken}`,
      {
        method: 'POST'
      }
    );

    await maybeFetchError(jwtRequest, 'Неверный токен Alor.');

    const { AccessToken } = await jwtRequest.json();
    const summaryRequest = await fetch(
      `https://api.alor.ru/md/v2/Clients/${
        this.exchange.value
      }/${this.portfolio.value.trim()}/summary`,
      {
        headers: {
          'X-ALOR-REQID': uuidv4(),
          Authorization: `Bearer ${AccessToken}`
        }
      }
    );

    await maybeFetchError(
      summaryRequest,
      'Не удаётся получить информацию о портфеле.'
    );
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import('./const.js')).TRADERS.ALOR_OPENAPI_V2%]`
            }
          },
          {
            $lookup: {
              from: 'brokers',
              localField: 'brokerId',
              foreignField: '_id',
              as: 'broker'
            }
          },
          {
            $unwind: '$broker'
          }
        ]);
    };
  }

  async find() {
    return {
      type: TRADERS.ALOR_OPENAPI_V2,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        brokerId: this.brokerId.value,
        portfolio: this.portfolio.value.trim(),
        portfolioType: this.portfolioType.value,
        exchange: this.exchange.value,
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        flatCommissionRate: this.flatCommissionRate.value
          ? Math.abs(
              parseFloat(this.flatCommissionRate.value.replace(',', '.'))
            )
          : void 0,
        useWebsocket: this.useWebsocket.checked,
        version: 1,
        caps: [
          TRADER_CAPS.CAPS_LIMIT_ORDERS,
          TRADER_CAPS.CAPS_MARKET_ORDERS,
          TRADER_CAPS.CAPS_STOP_ORDERS,
          TRADER_CAPS.CAPS_ACTIVE_ORDERS,
          TRADER_CAPS.CAPS_ORDERBOOK,
          TRADER_CAPS.CAPS_TIME_AND_SALES,
          TRADER_CAPS.CAPS_POSITIONS,
          TRADER_CAPS.CAPS_TIMELINE,
          TRADER_CAPS.CAPS_LEVEL1,
          TRADER_CAPS.CAPS_CHARTS
        ],
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: TRADERS.ALOR_OPENAPI_V2,
        createdAt: new Date()
      }
    };
  }
}
