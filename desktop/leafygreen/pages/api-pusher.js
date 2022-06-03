import { ApiPusherPage } from '../../../shared/pages/api-pusher.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles, loadingIndicator } from '../page.js';

export const apiPusherPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      ${(x) =>
        x.api
          ? `Внешний API - Pusher - ${x.api?.name}`
          : 'Внешний API - Pusher'}
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
              placeholder="Pusher"
              value="${(x) => x.api?.name}"
              ${ref('apiName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Id приложения</h5>
            <p>Смотрите раздел App Keys панели управления Pusher.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="app_id"
              value="${(x) => x.api?.appid}"
              ${ref('appId')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Ключ приложения</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="key"
              value="${(x) => x.api?.key}"
              ${ref('apiKey')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Секрет приложения</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="secret"
              value="${(x) => x.api?.secret}"
              ${ref('apiSecret')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Кластер</h5>
            <p>Датацентр, где размещено приложение.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="eu"
              value="${(x) => x.api?.cluster ?? 'eu'}"
              ${ref('apiCluster')}
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

export const apiPusherPageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const apiPusherPage = ApiPusherPage.compose({
  baseName: 'api-pusher-page',
  template: apiPusherPageTemplate,
  styles: apiPusherPageStyles
});
