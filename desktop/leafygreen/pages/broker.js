import { BrokerPage } from '../../../shared/pages/broker.js';
import { SUPPORTED_BROKERS } from '../../../shared/const.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles } from '../page.js';

export const brokerPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Брокеры</ppp-page-header>
    <div class="card-container">
      <${'ppp-generic-card'}>
        <img slot="logo" draggable="false" alt="Supabase" style="height: 40px"
             src="static/alor.svg"/>
        <span slot="title">Alor Open API V2</span>
        <span slot="description">Торговля через Alor Open API. <a
          target="_blank"
          href="https://alor.dev/docs">Перейти к документации</a>.</span>
        <${'ppp-button'}
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `broker-${SUPPORTED_BROKERS.ALOR_OPENAPI_V2}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
    </div>
  </template>
`;

export const brokerPageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const brokerPage = BrokerPage.compose({
  baseName: 'broker-page',
  template: brokerPageTemplate,
  styles: brokerPageStyles
});
