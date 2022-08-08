import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { APIS } from './const.js';
import ppp from '../ppp.js';

export async function checkNorthflankCredentials({ token, serviceMachineUrl }) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: 'https://api.northflank.com/v1/projects',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  });
}

export class ApiNorthflankPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.token);

    if (
      !(
        await checkNorthflankCredentials({
          token: this.token.value.trim(),
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url')
        })
      ).ok
    ) {
      invalidate(this.token, {
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
          type: `[%#(await import('./const.js')).APIS.NORTHFLANK%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.NORTHFLANK,
      name: this.name.value.trim()
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        token: this.token.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.NORTHFLANK,
        createdAt: new Date()
      }
    };
  }
}
