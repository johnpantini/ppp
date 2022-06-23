import { Page } from '../page.js';
import { invalidate, validate } from '../validate.js';
import { SUPPORTED_APIS } from '../const.js';
import { maybeFetchError } from '../fetch-error.js';

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

    let rSupabaseCredentials;

    if (
      !(rSupabaseCredentials = await checkSupabaseCredentials({
        url: this.url.value.trim(),
        key: this.key.value.trim(),
        serviceMachineUrl: this.app.ppp.keyVault.getKey('service-machine-url')
      })).ok
    ) {
      invalidate(this.key, {
        errorMessage: 'Неверный ключ проекта'
      });

      await maybeFetchError(rSupabaseCredentials, 'Неверный ключ проекта.');
    }

    let rPgSQLCredentials;
    const { hostname } = new URL(this.url.value);

    if (
      !(rPgSQLCredentials = await checkPostgreSQLCredentials({
        url: new URL(
          'pg',
          this.app.ppp.keyVault.getKey('service-machine-url')
        ).toString(),
        connectionString: `postgres://${this.user.value.trim()}:${encodeURIComponent(
          this.password.value
        )}@db.${hostname}:${this.port.value.trim()}/${this.db.value.trim()}`
      })).ok
    ) {
      invalidate(this.password, {
        errorMessage: 'Неверный пользователь или пароль'
      });

      await maybeFetchError(
        rPgSQLCredentials,
        'Неверный пользователь или пароль.'
      );
    }
  }

  async read() {
    return {
      type: SUPPORTED_APIS.SUPABASE
    };
  }

  async find() {
    return {
      type: SUPPORTED_APIS.SUPABASE,
      name: this.name.value.trim()
    };
  }

  async upsert() {
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
        type: SUPPORTED_APIS.SUPABASE,
        createdAt: new Date()
      }
    };
  }
}
