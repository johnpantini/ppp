import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { APIS } from './const.js';
import ppp from '../ppp.js';

export async function checkRedisCredentials({
  serviceMachineUrl,
  host,
  port,
  tls,
  username,
  database,
  password
}) {
  return fetch(new URL('redis', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      socket: {
        host,
        port,
        tls: !!tls
      },
      username,
      database: database ?? 0,
      password,
      command: ['PING']
    })
  });
}

export class ApiRedisPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.host);
    await validate(this.port);
    await validate(this.database);
    await validate(this.database, {
      hook: async (value) => +value >= 0 && +value <= 16,
      errorMessage: 'Введите значение в диапазоне от 0 до 16'
    });

    if (
      !(
        await checkRedisCredentials({
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url'),
          host: this.host.value.trim(),
          port: Math.abs(+this.port.value),
          tls: this.tls.checked,
          database: Math.abs(+this.database.value),
          username: this.username.value.trim(),
          password: this.password.value.trim()
        })
      ).ok
    ) {
      invalidate(this.host, {
        errorMessage: 'Ошибка соединения',
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
          type: `[%#(await import('./const.js')).APIS.REDIS%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.REDIS,
      name: this.name.value.trim()
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        host: this.host.value.trim(),
        port: Math.abs(this.port.value.trim()),
        tls: this.tls.checked,
        database: Math.abs(+this.database.value),
        username: this.username.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.REDIS,
        createdAt: new Date()
      }
    };
  }
}
