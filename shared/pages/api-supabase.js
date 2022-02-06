/** @decorator */

import { BasePage } from '../page.js';
import { invalidate, validate } from '../validate.js';
import { generateIV, bufferToString } from '../ppp-crypto.js';
import { SUPPORTED_APIS } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
import { maybeFetchError } from '../fetch-error.js';

export async function checkSupabaseCredentials({ apiUrl, apiKey }) {
  return fetch(new URL('rest/v1/rpc/get_size_by_bucket', apiUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    headers: {
      apiKey,
      'Content-Profile': 'storage'
    }
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

export class ApiSupabasePage extends BasePage {
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
            type: SUPPORTED_APIS.SUPABASE
          }
        );

        if (!this.api) {
          this.failOperation(404);
          await this.notFound();
        } else {
          this.api.key = await this.app.ppp.crypto.decrypt(
            this.api.iv,
            this.api.key
          );

          this.api.password = await this.app.ppp.crypto.decrypt(
            this.api.iv,
            this.api.password
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
      await validate(this.apiUrl);
      await validate(this.apiKey);
      await validate(this.dbName);
      await validate(this.dbPort);
      await validate(this.dbUser);
      await validate(this.dbPassword);

      const rSupabaseCredentials = await checkSupabaseCredentials({
        apiUrl: this.apiUrl.value.trim(),
        apiKey: this.apiKey.value.trim()
      });

      if (!rSupabaseCredentials.ok) {
        invalidate(this.apiKey, {
          errorMessage: 'Неверный токен',
          silent: true
        });

        await maybeFetchError(rSupabaseCredentials);
      }

      const { hostname } = new URL(this.apiUrl.value);
      const rPgSQLCredentials = await checkPostgreSQLCredentials({
        url: new URL(
          'pg',
          this.app.ppp.keyVault.getKey('service-machine-url')
        ).toString(),
        connectionString: `postgres://${this.dbUser.value.trim()}:${encodeURIComponent(
          this.dbPassword.value
        )}@db.${hostname}:${this.dbPort.value.trim()}/${this.dbName.value.trim()}`
      });

      if (!rPgSQLCredentials.ok) {
        invalidate(this.dbPassword, {
          errorMessage: 'Неверный пользователь или пароль',
          silent: true
        });

        await maybeFetchError(rPgSQLCredentials);
      }

      const iv = generateIV();
      const encryptedKey = await this.app.ppp.crypto.encrypt(
        iv,
        this.apiKey.value.trim()
      );
      const encryptedPassword = await this.app.ppp.crypto.encrypt(
        iv,
        this.dbPassword.value
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
              url: this.apiUrl.value.trim(),
              version: 1,
              iv: bufferToString(iv),
              key: encryptedKey,
              db: this.dbName.value.trim(),
              port: +Math.abs(this.dbPort.value),
              user: this.dbUser.value.trim(),
              password: encryptedPassword,
              updatedAt: new Date()
            }
          }
        );
      } else {
        const existingSupabaseApi = await this.app.ppp.user.functions.findOne(
          {
            collection: 'apis'
          },
          {
            removed: { $not: { $eq: true } },
            type: SUPPORTED_APIS.SUPABASE,
            name: this.apiName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingSupabaseApi) {
          return this.failOperation({
            href: `?page=api-${SUPPORTED_APIS.SUPABASE}&api=${existingSupabaseApi._id}`,
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
            type: SUPPORTED_APIS.SUPABASE,
            createdAt: new Date(),
            updatedAt: new Date(),
            url: this.apiUrl.value.trim(),
            iv: bufferToString(iv),
            key: encryptedKey,
            db: this.dbName.value.trim(),
            port: +Math.abs(this.dbPort.value),
            user: this.dbUser.value.trim(),
            password: encryptedPassword
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
