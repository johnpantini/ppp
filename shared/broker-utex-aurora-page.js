import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { BROKERS } from './const.js';
import ppp from '../ppp.js';

export async function checkUtexAuroraCredentials({
  serviceMachineUrl,
  login,
  password
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'POST',
      url: 'https://api.utex.io/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.authorizeByFirstFactor',
      headers: {
        'User-Agent': navigator.userAgent,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        realm: 'aurora',
        clientId: 'utexweb',
        loginOrEmail: login,
        password,
        product: 'UTEX',
        locale: 'ru'
      })
    })
  });
}

export class BrokerUtexAuroraPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.login);
    await validate(this.password);

    const request = await checkUtexAuroraCredentials({
      serviceMachineUrl: ppp.keyVault.getKey('service-machine-url'),
      login: this.login.value.trim(),
      password: this.password.value.trim()
    });
    const json = await request.json();

    if (/UserSoftBlockedException/i.test(json?.type)) {
      invalidate(this.login, {
        errorMessage: 'Учётная запись временно заблокирована',
        raiseException: true
      });
    } else if (!request.ok) {
      invalidate(this.login, {
        errorMessage: 'Неверный логин или пароль',
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
          type: `[%#(await import('./const.js')).BROKERS.UTEX_AURORA%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.UTEX_AURORA,
      name: this.name.value.trim()
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        login: this.login.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: BROKERS.UTEX_AURORA,
        createdAt: new Date()
      }
    };
  }
}
