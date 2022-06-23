import { Page } from '../page.js';
import { invalidate, validate } from '../validate.js';
import { SUPPORTED_APIS } from '../const.js';
import { maybeFetchError } from '../fetch-error.js';

export async function checkAstraDbCredentials({
  dbUrl,
  dbToken,
  dbKeyspace,
  serviceMachineUrl
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: new URL(
        `/api/rest/v2/namespaces/${dbKeyspace}/collections`,
        dbUrl
      ).toString(),
      headers: {
        'X-Cassandra-Token': dbToken
      }
    })
  });
}

export class ApiAstraDbPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.dbID);
    await validate(this.dbRegion);
    await validate(this.dbKeyspace);
    await validate(this.dbToken);

    let r;

    if (
      !(r = await checkAstraDbCredentials({
        dbUrl: `https://${this.dbID.value.trim()}-${this.dbRegion.value.trim()}.apps.astra.datastax.com`,
        dbKeyspace: this.dbKeyspace.value.trim(),
        dbToken: this.dbToken.value.trim(),
        serviceMachineUrl: this.app.ppp.keyVault.getKey('service-machine-url')
      })).ok
    ) {
      invalidate(this.dbToken, {
        errorMessage: 'Неверный токен'
      });

      await maybeFetchError(r, 'Неверный токен.');
    }
  }

  async read() {
    return {
      type: SUPPORTED_APIS.ASTRADB
    };
  }

  async find() {
    return {
      type: SUPPORTED_APIS.ASTRADB,
      name: this.name.value.trim()
    };
  }

  async upsert() {
    return {
      $set: {
        name: this.name.value.trim(),
        dbID: this.dbID.value.trim(),
        dbRegion: this.dbRegion.value.trim(),
        dbKeyspace: this.dbKeyspace.value.trim(),
        dbToken: this.dbToken.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: SUPPORTED_APIS.ASTRADB,
        createdAt: new Date()
      }
    };
  }
}
