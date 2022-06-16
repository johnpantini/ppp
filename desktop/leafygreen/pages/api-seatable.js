import { ApiSeatablePage } from '../../../shared/pages/api-seatable.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles, loadingIndicator } from '../page.js';

export const apiSeatablePageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      ${(x) =>
        x.api
          ? `Внешний API - Seatable - ${x.api?.name}`
          : 'Внешний API - Seatable'}
    </ppp-page-header>
    <form ${ref('form')} novalidate onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Seatable"
              value="${(x) => x.api?.name}"
              ${ref('apiName')}
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
              value="${(x) => x.api?.baseToken}"
              ${ref('baseToken')}
            ></ppp-text-field>
          </div>
        </section>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy || x.api?.removed}"
            type="submit"
            @click="${(x) => x.connectApi()}"
            appearance="primary"
          >
            ${(x) => (x.api ? 'Обновить API' : 'Подключить API')}
          </ppp-button>
        </div>
      </section>
    </form>
    </div>
  </template>
`;

export const apiSeatablePageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const apiSeatablePage = ApiSeatablePage.compose({
  baseName: 'api-seatable-page',
  template: apiSeatablePageTemplate,
  styles: apiSeatablePageStyles
});
