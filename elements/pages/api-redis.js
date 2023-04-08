import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { APIS } from '../../lib/const.js';
import '../button.js';
import '../checkbox.js';
import '../text-field.js';

export const apiRedisPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Внешние API - Redis - ${x.document.name}`
            : 'Внешние API - Redis'}
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
            placeholder="Redis"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Хост</h5>
          <p class="description">Хост для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Введите адрес"
            value="${(x) => x.document.host}"
            ${ref('host')}
          ></ppp-text-field>
          <ppp-checkbox
            style="margin-top:6px;"
            name="tls"
            ?checked="${(x) => x.document.tls ?? true}"
            ${ref('tls')}
          >
            Защищённое соединение
          </ppp-checkbox>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Порт</h5>
          <p class="description">Порт для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="6379"
            value="${(x) => x.document.port ?? 6379}"
            ${ref('port')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>База данных</h5>
          <p class="description">Индекс базы данных Redis для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="0"
            value="${(x) => x.document.database ?? 0}"
            ${ref('database')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Имя пользователя</h5>
          <p class="description">Имя пользователя для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            placeholder="Имя пользователя"
            value="${(x) => x.document.username}"
            ${ref('username')}
          ></${'ppp-text-field'}>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Пароль</h5>
          <p class="description">Пароль Redis.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
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

export const apiRedisPageStyles = css`
  ${pageStyles}
`;

export async function checkRedisCredentials({
  serviceMachineUrl,
  host,
  port,
  tls,
  username,
  database,
  password
}) {
  return fetch(new URL('redis', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      options: {
        host,
        port,
        tls,
        username,
        db: database ?? 0,
        password
      },
      command: 'ping',
      args: []
    })
  });
}

export class ApiRedisPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.host);
    await validate(this.port);
    await validate(this.database);
    await validate(this.database, {
      hook: async (value) => +value >= 0 && +value <= 16,
      errorMessage: 'Введите значение в диапазоне от 0 до 16'
    });

    if (
      !(
        await checkRedisCredentials({
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url'),
          host: this.host.value.trim(),
          port: Math.abs(+this.port.value),
          tls: this.tls.checked
            ? {
                servername: this.host.value.trim()
              }
            : void 0,
          database: Math.abs(+this.database.value),
          username: this.username.value.trim(),
          password: this.password.value.trim()
        })
      ).ok
    ) {
      invalidate(this.host, {
        errorMessage: 'Ошибка соединения',
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
          type: `[%#(await import('../../lib/const.js')).APIS.REDIS%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.REDIS,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        host: this.host.value.trim(),
        port: Math.abs(this.port.value.trim()),
        tls: this.tls.checked,
        database: Math.abs(+this.database.value),
        username: this.username.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.REDIS,
        createdAt: new Date()
      }
    };
  }
}

export default ApiRedisPage.compose({
  template: apiRedisPageTemplate,
  styles: apiRedisPageStyles
}).define();
