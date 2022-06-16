/** @decorator */

import { BasePage } from '../page.js';
import { invalidate, validate } from '../validate.js';
import { generateIV, bufferToString } from '../ppp-crypto.js';
import { SUPPORTED_APIS } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
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

export class ApiSeatablePage extends BasePage {
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
            type: SUPPORTED_APIS.SEATABLE
          }
        );

        if (!this.api) {
          this.failOperation(404);
          await this.notFound();
        } else {
          this.api.baseToken = await this.app.ppp.crypto.decrypt(
            this.api.iv,
            this.api.baseToken
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
      await validate(this.baseToken);

      const rSeatableCredentials = await checkSeatableCredentials({
        baseToken: this.baseToken.value.trim(),
        serviceMachineUrl: this.app.ppp.keyVault.getKey('service-machine-url')
      });

      if (!rSeatableCredentials.ok) {
        invalidate(this.baseToken, {
          errorMessage: 'Неверный токен',
          silent: true
        });

        await maybeFetchError(rSeatableCredentials);
      }

      const iv = generateIV();
      const encryptedToken = await this.app.ppp.crypto.encrypt(
        iv,
        this.baseToken.value.trim()
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
              baseToken: encryptedToken,
              updatedAt: new Date()
            }
          }
        );
      } else {
        const existingSeatableApi = await this.app.ppp.user.functions.findOne(
          {
            collection: 'apis'
          },
          {
            removed: { $not: { $eq: true } },
            type: SUPPORTED_APIS.SEATABLE,
            name: this.apiName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingSeatableApi) {
          return this.failOperation({
            href: `?page=api-${SUPPORTED_APIS.SEATABLE}&api=${existingSeatableApi._id}`,
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
            type: SUPPORTED_APIS.SEATABLE,
            createdAt: new Date(),
            updatedAt: new Date(),
            iv: bufferToString(iv),
            baseToken: encryptedToken
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
