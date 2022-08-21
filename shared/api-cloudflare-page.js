import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { APIS } from './const.js';
import ppp from '../ppp.js';

export async function checkCloudflareCredentials({
  serviceMachineUrl,
  accountID,
  email,
  apiKey
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: `https://api.cloudflare.com/client/v4/accounts/${accountID}`,
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': apiKey
      }
    })
  });
}

export class ApiCloudflarePage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.accountID);
    await validate(this.email);
    await validate(this.apiKey);

    if (
      !(
        await checkCloudflareCredentials({
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url'),
          accountID: this.accountID.value.trim(),
          email: this.email.value.trim(),
          apiKey: this.apiKey.value.trim()
        })
      ).ok
    ) {
      invalidate(this.apiKey, {
        errorMessage: 'Неверный ключ API, e-mail или ID учётной записи',
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
          type: `[%#(await import('./const.js')).APIS.CLOUDFLARE%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.CLOUDFLARE,
      name: this.name.value.trim()
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        accountID: this.accountID.value.trim(),
        email: this.email.value.trim(),
        apiKey: this.apiKey.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.CLOUDFLARE,
        createdAt: new Date()
      }
    };
  }
}
