import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { BROKERS } from './const.js';
import { createClient } from '../vendor/nice-grpc-web/client/ClientFactory.js';
import { createChannel } from '../vendor/nice-grpc-web/client/channel.js';
import { Metadata } from '../vendor/nice-grpc-web/nice-grpc-common/Metadata.js';
import { UsersServiceDefinition } from '../vendor/tinkoff/definitions/users.js';
import ppp from '../ppp.js';

export class BrokerTinkoffInvestApiPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.apiToken);

    const channel = createChannel('https://invest-public-api.tinkoff.ru:443');
    let client;

    try {
      client = createClient(UsersServiceDefinition, channel, {
        '*': {
          metadata: new Metadata({
            Authorization: `Bearer ${this.apiToken.value.trim()}`,
            'x-app-name': 'ppp'
          })
        }
      });
    } catch (e) {
      console.error(e);

      invalidate(this.apiToken, {
        errorMessage: 'Недопустимый токен',
        raiseException: true
      });
    }

    try {
      const response = await client.getAccounts();

      if (!response?.accounts?.length) {
        invalidate(this.apiToken, {
          errorMessage: 'Не найдены брокерские счета',
          raiseException: true
        });
      }
    } catch (e) {
      console.error(e);

      invalidate(this.apiToken, {
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
          type: `[%#(await import('./const.js')).BROKERS.TINKOFF_INVEST_API%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.TINKOFF_INVEST_API,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        apiToken: this.apiToken.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: BROKERS.TINKOFF_INVEST_API,
        createdAt: new Date()
      }
    };
  }
}
