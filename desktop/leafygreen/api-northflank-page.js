import { ApiNorthflankPage } from '../../shared/api-northflank-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const apiNorthflankPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Внешний API - Northflank - ${x.document.name}`
              : 'Внешний API - Northflank'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Northflank"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Токен API</h5>
            <p>API-токен Northflank. Можно получить в настройках профиля.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Token"
              value="${(x) => x.document.token}"
              ${ref('token')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ApiNorthflankPage.compose({
  template: apiNorthflankPageTemplate,
  styles: pageStyles
});
