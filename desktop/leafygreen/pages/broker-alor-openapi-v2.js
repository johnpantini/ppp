import { BrokerAlorOpenapiV2Page } from '../../../shared/pages/broker-alor-openapi-v2.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles, loadingIndicator } from '../page.js';

export const brokerAlorOpenAPIV2PageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      ${(x) =>
        x.broker
          ? `Брокер - Alor OpenAPI V2 - ${x.broker?.name}`
          : 'Брокер - Alor OpenAPI V2'}
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
              placeholder="Alor"
              value="${(x) => x.broker?.name}"
              ${ref('brokerName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Токен для доступа к API</h5>
            <p>
              Требуется для подписи всех запросов. Получить можно по
              <a target="_blank" href="https://alor.dev/open-api-tokens"
              >ссылке</a
              >. Если получаете впервые,
              <a target="_blank" href="https://alor.dev/register"
              >зарегистрируйтесь</a
              > предварительно.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Alor refresh token"
              value="${(x) => x.broker?.refreshToken}"
              ${ref('alorRefreshToken')}
            ></ppp-text-field>
          </div>
        </section>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy || x.broker?.removed}"
            type="submit"
            @click="${(x) => x.connectBroker()}"
            appearance="primary"
          >
            ${(x) => (x.broker ? 'Обновить брокера' : 'Добавить брокера')}
          </ppp-button>
        </div>
      </section>
    </form>
    </div>
  </template>
`;

export const brokerAlorOpenAPIV2PageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const brokerAlorOpenapiV2Page = BrokerAlorOpenapiV2Page.compose({
  baseName: 'broker-alor-openapi-v2-page',
  template: brokerAlorOpenAPIV2PageTemplate,
  styles: brokerAlorOpenAPIV2PageStyles
});
