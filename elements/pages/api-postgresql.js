import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { APIS } from '../../lib/const.js';
import { checkPostgreSQLCredentials } from './api-supabase.js';
import '../button.js';
import '../text-field.js';

export const apiPostgreSqlPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Внешние API - PostgreSQL - ${x.document.name}`
            : 'Внешние API - PostgreSQL'}
      </ppp-page-header>
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
            placeholder="PostgreSQL"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Хост для подключения</h5>
          <p class="description">Доменное имя или IP-адрес.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="example.com"
            value="${(x) => x.document.hostname}"
            ${ref('hostname')}
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
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить изменения
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const apiPostgreSqlPageStyles = css`
  ${pageStyles}
`;

export class ApiPostgreSqlPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.hostname);
    await validate(this.db);
    await validate(this.port);
    await validate(this.user);
    await validate(this.password);

    if (
      !(
        await checkPostgreSQLCredentials({
          url: new URL(
            'pg',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          connectionString: `postgresql://${this.user.value.trim()}:${encodeURIComponent(
            this.password.value
          )}@${this.hostname.value.trim()}:${this.port.value.trim()}/${this.db.value
            .trim()
            .replace('/', '.')}?ssl=true`
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.POSTGRESQL%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.POSTGRESQL,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        hostname: this.hostname.value.trim(),
        db: this.db.value.trim(),
        port: +Math.abs(this.port.value),
        user: this.user.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.POSTGRESQL,
        createdAt: new Date()
      }
    };
  }
}

export default ApiPostgreSqlPage.compose({
  name: 'ppp-api-postgresql-page',
  template: apiPostgreSqlPageTemplate,
  styles: apiPostgreSqlPageStyles
}).define();
