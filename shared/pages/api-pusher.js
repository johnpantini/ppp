/** @decorator */

import { BasePage } from '../page.js';
import { validate } from '../validate.js';
import { generateIV, bufferToString } from '../ppp-crypto.js';
import { SUPPORTED_APIS, SUPPORTED_SERVICES } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
import { maybeFetchError } from '../fetch-error.js';

export async function checkPusherCredentials({
  serviceMachineUrl,
  appId,
  apiKey,
  apiSecret,
  apiCluster
}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(apiSecret),
    {
      name: 'HMAC',
      hash: { name: 'SHA-256' }
    },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(
      [
        'GET',
        `/apps/${appId}/channels`,
        `auth_key=${apiKey}&auth_timestamp=${timestamp}&auth_version=1.0`
      ].join('\n')
    )
  );
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const params = `auth_key=${apiKey}&auth_timestamp=${timestamp}&auth_version=1.0&auth_signature=${signature}`;

  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: new URL(
        `/apps/${appId}/channels?${params}`,
        `https://api-${apiCluster}.pusher.com`
      ).toString()
    })
  });
}

export class ApiPusherPage extends BasePage {
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
            type: SUPPORTED_APIS.PUSHER
          }
        );

        if (!this.api) {
          this.failOperation(404);
          await this.notFound();
        } else {
          this.api.secret = await this.app.ppp.crypto.decrypt(
            this.api.iv,
            this.api.secret
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
      await validate(this.appId);
      await validate(this.apiKey);
      await validate(this.apiSecret);
      await validate(this.apiCluster);

      const rPusherCredentials = await checkPusherCredentials({
        serviceMachineUrl: this.app.ppp.keyVault.getKey('service-machine-url'),
        appId: this.appId.value.trim(),
        apiKey: this.apiKey.value.trim(),
        apiSecret: this.apiSecret.value.trim(),
        apiCluster: this.apiCluster.value.trim()
      });

      if (!rPusherCredentials.ok) {
        await maybeFetchError(rPusherCredentials);
      }

      const iv = generateIV();
      const encryptedSecret = await this.app.ppp.crypto.encrypt(
        iv,
        this.apiSecret.value.trim()
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
              appid: this.appId.value.trim(),
              version: 1,
              iv: bufferToString(iv),
              key: this.apiKey.value.trim(),
              secret: encryptedSecret,
              cluster: this.apiCluster.value.trim(),
              updatedAt: new Date()
            }
          }
        );
      } else {
        const existingPusherApi = await this.app.ppp.user.functions.findOne(
          {
            collection: 'apis'
          },
          {
            removed: { $not: { $eq: true } },
            type: SUPPORTED_APIS.PUSHER,
            name: this.apiName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingPusherApi) {
          return this.failOperation({
            href: `?page=api-${SUPPORTED_APIS.PUSHER}&api=${existingPusherApi._id}`,
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
            type: SUPPORTED_APIS.PUSHER,
            createdAt: new Date(),
            updatedAt: new Date(),
            appid: this.appId.value.trim(),
            iv: bufferToString(iv),
            key: this.apiKey.value.trim(),
            secret: encryptedSecret,
            cluster: this.apiCluster.value.trim()
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
