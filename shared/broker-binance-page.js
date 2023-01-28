import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { BROKERS } from './const.js';
import ppp from '../ppp.js';

export async function checkBinanceCredentials({
  serviceMachineUrl,
  apiKey,
  secret
}) {
  const stringifyKeyValuePair = ([key, value]) => {
    const valueString = Array.isArray(value)
      ? `["${value.join('","')}"]`
      : value;

    return `${key}=${encodeURIComponent(valueString)}`;
  };

  const buildQueryString = (params) => {
    if (!params) return '';

    return Object.entries(params).map(stringifyKeyValuePair).join('&');
  };

  const timestamp = Date.now();
  const queryString = buildQueryString({ timestamp });
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = Array.from(
    new Uint8Array(
      await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(queryString)
      )
    )
  )
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return await fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
      headers: {
        'X-MBX-APIKEY': apiKey,
        'User-Agent': `${ppp.keyVault.getKey('github-login')}.ppp`
      }
    })
  });
}

export class BrokerBinancePage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.apiKey);
    await validate(this.secret);

    const request = await checkBinanceCredentials({
      serviceMachineUrl: ppp.keyVault.getKey('service-machine-url'),
      apiKey: this.apiKey.value.trim(),
      secret: this.secret.value.trim()
    });

    if (!request.ok) {
      console.error(await request.json());

      invalidate(this.apiKey, {
        errorMessage: 'Неверный ключ или секрет',
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
          type: `[%#(await import('./const.js')).BROKERS.BINANCE%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.BINANCE,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        apiKey: this.apiKey.value.trim(),
        secret: this.secret.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: BROKERS.BINANCE,
        createdAt: new Date()
      }
    };
  }
}
