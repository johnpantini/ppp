import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { APIS } from './const.js';
import ppp from '../ppp.js';

export async function checkSeatableCredentials({
  baseToken,
  serviceMachineUrl
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: 'https://cloud.seatable.io/api/v2.1/dtable/app-access-token/',
      headers: {
        Authorization: `Token ${baseToken}`
      }
    })
  });
}

export class ApiSeatablePage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.baseToken);

    if (
      !(
        await checkSeatableCredentials({
          baseToken: this.baseToken.value.trim(),
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url')
        })
      ).ok
    ) {
      invalidate(this.baseToken, {
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
          type: `[%#(await import('./const.js')).APIS.SEATABLE%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.SEATABLE,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        baseToken: this.baseToken.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.SEATABLE,
        createdAt: new Date()
      }
    };
  }
}
