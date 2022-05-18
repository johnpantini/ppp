/** @decorator */

import { BasePage } from '../page.js';
import { invalidate, validate } from '../validate.js';
import { generateIV, bufferToString } from '../ppp-crypto.js';
import { SUPPORTED_APIS } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
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

export class ApiAstraDbPage extends BasePage {
  @observable
  api;

  async connectedCallback() {
    super.connectedCallback();

    const apiId = this.app.params()?.api;

    if (apiId) {
      this.beginOperation();

      try {
        this.api = await this.app.ppp.user.functions.findOne(
          {
            collection: 'apis'
          },
          {
            _id: apiId,
            type: SUPPORTED_APIS.ASTRADB
          }
        );

        if (!this.api) {
          this.failOperation(404);
          await this.notFound();
        } else {
          this.api.dbToken = await this.app.ppp.crypto.decrypt(
            this.api.iv,
            this.api.dbToken
          );

          Observable.notify(this, 'api');
        }
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
  }

  async connectApi() {
    this.beginOperation();

    try {
      await validate(this.apiName);
      await validate(this.dbID);
      await validate(this.dbRegion);
      await validate(this.dbKeyspace);
      await validate(this.dbToken);

      const rAstraDbCredentials = await checkAstraDbCredentials({
        dbUrl: `https://${this.dbID.value.trim()}-${this.dbRegion.value.trim()}.apps.astra.datastax.com`,
        dbKeyspace: this.dbKeyspace.value.trim(),
        dbToken: this.dbToken.value.trim(),
        serviceMachineUrl: this.app.ppp.keyVault.getKey('service-machine-url')
      });

      if (!rAstraDbCredentials.ok) {
        invalidate(this.dbToken, {
          errorMessage: 'Неверный токен',
          silent: true
        });

        await maybeFetchError(rAstraDbCredentials);
      }

      const iv = generateIV();
      const encryptedToken = await this.app.ppp.crypto.encrypt(
        iv,
        this.dbToken.value.trim()
      );

      if (this.api) {
        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'apis'
          },
          {
            _id: this.api._id
          },
          {
            $set: {
              name: this.apiName.value.trim(),
              version: 1,
              iv: bufferToString(iv),
              dbToken: encryptedToken,
              dbID: this.dbID.value.trim(),
              dbRegion: this.dbRegion.value.trim(),
              dbKeyspace: this.dbKeyspace.value.trim(),
              updatedAt: new Date()
            }
          }
        );
      } else {
        const existingAstraDbApi = await this.app.ppp.user.functions.findOne(
          {
            collection: 'apis'
          },
          {
            removed: { $not: { $eq: true } },
            type: SUPPORTED_APIS.ASTRADB,
            name: this.apiName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingAstraDbApi) {
          return this.failOperation({
            href: `?page=api-${SUPPORTED_APIS.ASTRADB}&api=${existingAstraDbApi._id}`,
            error: 'E11000'
          });
        }

        await this.app.ppp.user.functions.insertOne(
          {
            collection: 'apis'
          },
          {
            name: this.apiName.value.trim(),
            version: 1,
            type: SUPPORTED_APIS.ASTRADB,
            createdAt: new Date(),
            updatedAt: new Date(),
            iv: bufferToString(iv),
            dbToken: encryptedToken,
            dbID: this.dbID.value.trim(),
            dbRegion: this.dbRegion.value.trim(),
            dbKeyspace: this.dbKeyspace.value.trim()
          }
        );
      }

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
