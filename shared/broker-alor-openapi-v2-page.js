import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { BROKERS } from './const.js';
import ppp from '../ppp.js';

export async function checkAlorOAPIV2RefreshToken({ refreshToken }) {
  return fetch(`https://oauth.alor.ru/refresh?token=${refreshToken}`, {
    cache: 'no-cache',
    method: 'POST'
  });
}

export class BrokerAlorOpenAPIV2Page extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.refreshToken);

    if (
      !(
        await checkAlorOAPIV2RefreshToken({
          refreshToken: this.refreshToken.value.trim()
        })
      ).ok
    ) {
      invalidate(this.refreshToken, {
        errorMessage: 'Неверный токен',
        raiseException: true
      });
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import('./const.js')).BROKERS.ALOR_OPENAPI_V2%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.ALOR_OPENAPI_V2,
      name: this.name.value.trim()
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        refreshToken: this.refreshToken.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: BROKERS.ALOR_OPENAPI_V2,
        createdAt: new Date()
      }
    };
  }
}
