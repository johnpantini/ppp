/** @decorator */

import { BasePage } from '../page.js';
import { validate } from '../validate.js';
import { FetchError } from '../fetch-error.js';
import { generateIV, uuidv4, bufferToString } from '../ppp-crypto.js';
import { SUPPORTED_APIS } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';

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

    const api = this.app.params()?.api;

    if (api) {
      this.beginOperation();

      try {
        this.api = await this.app.ppp.user.functions.findOne(
          {
            collection: 'apis'
          },
          {
            uuid: api
          }
        );

        if (!this.api) {
          this.failOperation(404);
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

      const r1 = await checkSupabaseCredentials({
        apiUrl: this.apiUrl.value.trim(),
        apiKey: this.apiKey.value.trim()
      });

      if (!r1.ok)
        // noinspection ExceptionCaughtLocallyJS
        throw new FetchError({ ...r1, ...{ message: await r1.text() } });

      const { hostname } = new URL(this.apiUrl.value);

      const r2 = await checkPostgreSQLCredentials({
        url: new URL(
          'pg',
          this.app.ppp.keyVault.getKey('service-machine-url')
        ).toString(),
        connectionString: `postgres://${this.dbUser.value.trim()}:${encodeURIComponent(
          this.dbPassword.value
        )}@db.${hostname}:${this.dbPort.value.trim()}/${this.dbName.value.trim()}`
      });

      if (!r2.ok)
        // noinspection ExceptionCaughtLocallyJS
        throw new FetchError({ ...r2, ...{ message: await r2.text() } });

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
            _id: this.apiName.value.trim()
          },
          {
            $set: {
              url: this.apiUrl.value.trim(),
              version: 1,
              iv: bufferToString(iv),
              key: encryptedKey,
              db: this.dbName.value.trim(),
              port: +Math.abs(this.dbPort.value),
              user: this.dbUser.value.trim(),
              password: encryptedPassword,
              updated_at: new Date()
            }
          }
        );
      } else {
        await this.app.ppp.user.functions.insertOne(
          {
            collection: 'apis'
          },
          {
            _id: this.apiName.value.trim(),
            version: 1,
            uuid: uuidv4(),
            type: SUPPORTED_APIS.SUPABASE,
            created_at: new Date(),
            updated_at: new Date(),
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
