import { Page } from './page.js';
import { validate } from './validate.js';
import { TRADERS } from './const.js';
import { uuidv4 } from './ppp-crypto.js';
import { maybeFetchError } from './fetch-error.js';
import ppp from '../ppp.js';

export class TraderAlorOpenAPIV2Page extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.portfolio);

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
        exchange: this.exchange.value,
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        useWebsocket: this.useWebsocket.checked,
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: TRADERS.ALOR_OPENAPI_V2,
        createdAt: new Date()
      }
    };
  }
}
