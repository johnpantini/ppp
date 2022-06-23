import { Page } from '../page.js';
import { invalidate, validate } from '../validate.js';
import { SUPPORTED_APIS } from '../const.js';
import { maybeFetchError } from '../fetch-error.js';

export async function checkPusherCredentials({
  serviceMachineUrl,
  appid,
  key,
  secret,
  cluster
}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const hmacKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {
      name: 'HMAC',
      hash: { name: 'SHA-256' }
    },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    hmacKey,
    new TextEncoder().encode(
      [
        'GET',
        `/apps/${appid}/channels`,
        `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0`
      ].join('\n')
    )
  );
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const params = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&auth_signature=${signature}`;

  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: new URL(
        `/apps/${appid}/channels?${params}`,
        `https://api-${cluster}.pusher.com`
      ).toString()
    })
  });
}

export class ApiPusherPage extends Page {
  collection = 'apis';

  excludeFromEncryption = ['key'];

  async validate() {
    await validate(this.name);
    await validate(this.appid);
    await validate(this.key);
    await validate(this.secret);
    await validate(this.cluster);

    let r;

    if (
      !(r = await checkPusherCredentials({
        appid: this.appid.value.trim(),
        key: this.key.value.trim(),
        secret: this.secret.value.trim(),
        cluster: this.cluster.value.trim(),
        serviceMachineUrl: this.app.ppp.keyVault.getKey('service-machine-url')
      })).ok
    ) {
      invalidate(this.secret, {
        errorMessage: 'Неверные учётные данные'
      });

      await maybeFetchError(r, 'Неверные учётные данные.');
    }
  }

  async read() {
    return {
      type: SUPPORTED_APIS.PUSHER
    };
  }

  async find() {
    return {
      type: SUPPORTED_APIS.PUSHER,
      name: this.name.value.trim()
    };
  }

  async upsert() {
    return {
      $set: {
        name: this.name.value.trim(),
        appid: this.appid.value.trim(),
        key: this.key.value.trim(),
        secret: this.secret.value.trim(),
        cluster: this.cluster.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: SUPPORTED_APIS.PUSHER,
        createdAt: new Date()
      }
    };
  }
}
