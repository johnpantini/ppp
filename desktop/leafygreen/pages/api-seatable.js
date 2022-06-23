import { ApiSeatablePage } from '../../../shared/pages/api-seatable.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles } from '../page.js';

export const apiSeatablePageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
      <span slot="header">
        ${(x) =>
          x.document.name
            ? `Внешний API - Seatable - ${x.document.name}`
            : 'Внешний API - Seatable'}
      </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Seatable"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Токен базы</h5>
            <p>API-токен базы Seatable. Можно получить в панели управления.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Token"
              value="${(x) => x.document.baseToken}"
              ${ref('baseToken')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ApiSeatablePage.compose({
  template: apiSeatablePageTemplate,
  styles: pageStyles
});
