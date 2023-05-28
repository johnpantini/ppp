import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { APIS } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../text-field.js';

export const apiSupabasePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название подключения</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Supabase"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>URL проекта</h5>
          <p class="description">
            Можно найти в панели управления проектом Supabase в подразделе API
            раздела Settings. Смотрите секцию Config, поле URL.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="https://ppp.supabase.co"
            value="${(x) => x.document.url}"
            ${ref('url')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ проекта</h5>
          <p class="description">
            Можно найти в панели управления проектом Supabase в подразделе API
            раздела Settings. Смотрите секцию Project API keys, поле anon
            public. Будет сохранён в зашифрованном виде.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Ключ API"
            value="${(x) => x.document.key}"
            ${ref('key')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>База данных</h5>
          <p class="description">Название базы данных для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="postgres"
            value="${(x) => x.document.db ?? 'postgres'}"
            ${ref('db')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Порт</h5>
          <p class="description">Порт для подключения к базе данных.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="5432"
            value="${(x) => x.document.port ?? '5432'}"
            ${ref('port')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Пользователь</h5>
          <p class="description">
            Имя пользователя для подключения к базе данных.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="postgres"
            value="${(x) => x.document.user ?? 'postgres'}"
            ${ref('user')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Пароль</h5>
          <p class="description">
            Пароль для подключения к базе данных. Будет сохранён в зашифрованном
            виде.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Пароль"
            value="${(x) => x.document.password}"
            ${ref('password')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const apiSupabasePageStyles = css`
  ${pageStyles}
`;

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
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.SUPABASE%]`
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

  async submit() {
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

export default ApiSupabasePage.compose({
  template: apiSupabasePageTemplate,
  styles: apiSupabasePageStyles
}).define();
