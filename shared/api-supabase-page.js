import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { APIS } from './const.js';
import ppp from '../ppp.js';

export async function checkSupabaseCredentials({
  url,
  key,
  serviceMachineUrl
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'POST',
      url: new URL('rest/v1/rpc/get_size_by_bucket', url).toString(),
      headers: {
        apiKey: key,
        'Content-Profile': 'storage'
      }
    })
  });
}

export async function checkPostgreSQLCredentials({ url, connectionString }) {
  return fetch(url, {
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'select version();',
      connectionString
    })
  });
}

export class ApiSupabasePage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.url);
    await validate(this.key);
    await validate(this.db);
    await validate(this.port);
    await validate(this.user);
    await validate(this.password);

    if (
      !(
        await checkSupabaseCredentials({
          url: this.url.value.trim(),
          key: this.key.value.trim(),
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url')
        })
      ).ok
    ) {
      invalidate(this.key, {
        errorMessage: 'Неверный ключ проекта',
        raiseException: true
      });
    }

    const { hostname } = new URL(this.url.value);

    if (
      !(
        await checkPostgreSQLCredentials({
          url: new URL(
            'pg',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          connectionString: `postgres://${this.user.value.trim()}:${encodeURIComponent(
            this.password.value
          )}@db.${hostname}:${this.port.value.trim()}/${this.db.value.trim()}`
        })
      ).ok
    ) {
      invalidate(this.password, {
        errorMessage: 'Неверный пользователь или пароль',
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
          type: `[%#(await import('./const.js')).APIS.SUPABASE%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.SUPABASE,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        url: this.url.value.trim(),
        key: this.key.value.trim(),
        db: this.db.value.trim(),
        port: +Math.abs(this.port.value),
        user: this.user.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.SUPABASE,
        createdAt: new Date()
      }
    };
  }
}
