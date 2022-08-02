import { ApiRedisPage } from '../../shared/api-redis-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const apiRedisPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Внешний API - Redis - ${x.document.name}`
              : 'Внешний API - Redis'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Redis"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Хост</h5>
            <p>Хост для подключения.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Введите адрес"
              value="${(x) => x.document.host}"
              ${ref('host')}
            ></ppp-text-field>
            <${'ppp-checkbox'}
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
            <p>Порт для подключения.</p>
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
            <p>Индекс базы данных Redis для подключения.</p>
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
            <p>Имя пользователя для подключения.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              optional
              placeholder="Имя пользователя"
              value="${(x) => x.document.username}"
              ${ref('username')}
            ></
            >
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Пароль</h5>
            <p>Пароль Redis.</p>
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
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ApiRedisPage.compose({
  template: apiRedisPageTemplate,
  styles: pageStyles
});
