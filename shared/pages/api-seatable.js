import { Page } from '../page.js';
import { invalidate, validate } from '../validate.js';
import { SUPPORTED_APIS } from '../const.js';
import { maybeFetchError } from '../fetch-error.js';

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

    let r;

    if (
      !(r = await checkSeatableCredentials({
        baseToken: this.baseToken.value.trim(),
        serviceMachineUrl: this.app.ppp.keyVault.getKey('service-machine-url')
      })).ok
    ) {
      invalidate(this.baseToken, {
        errorMessage: 'Неверный токен'
      });

      await maybeFetchError(r, 'Неверный токен.');
    }
  }

  async read() {
    return {
      type: SUPPORTED_APIS.SEATABLE
    };
  }

  async find() {
    return {
      type: SUPPORTED_APIS.SEATABLE,
      name: this.name.value.trim()
    };
  }

  async upsert() {
    return {
      $set: {
        name: this.name.value.trim(),
        baseToken: this.baseToken.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: SUPPORTED_APIS.SEATABLE,
        createdAt: new Date()
      }
    };
  }
}
