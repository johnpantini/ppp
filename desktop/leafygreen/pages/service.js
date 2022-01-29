import { ServicePage } from '../../../shared/pages/service.js';
import { SUPPORTED_SERVICES } from '../../../shared/const.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles } from '../page.js';

export const servicePageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Сервисы</ppp-page-header>
    <div class="card-container">
      <${'ppp-generic-card'}>
        <img slot="logo" draggable="false" alt="SPBEX" style="height: 33px"
             src="static/spbex-1.svg"/>
        <span slot="title">Торговые паузы SPBEX</span>
        <span slot="description">Оповещение о торговых паузах SPBEX в Telegram. <a
          target="_blank"
          href="https://spbexchange.ru/ru/about/news.aspx?sectionrss=30">RSS-лента пауз</a>.</span>
        <${'ppp-button'}
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `service-${SUPPORTED_SERVICES.SPBEX_HALTS}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
      <ppp-generic-card>
        <img slot="logo" draggable="false" alt="SPBEX" style="height: 44px"
             src="static/nsdq-1.svg"/>
        <span slot="title">Торговые паузы NYSE/NASDAQ</span>
        <span slot="description">Оповещение о торговых паузах NYSE/NASDAQ в Telegram. <a
          target="_blank"
          href="http://www.nasdaqtrader.com/rss.aspx?feed=tradehalts">RSS-лента пауз</a>.</span>
        <${'ppp-button'}
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `service-${SUPPORTED_SERVICES.NYSE_NSDQ_HALTS}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
      <ppp-generic-card>
        <img slot="logo" draggable="false" alt="SPBEX" style="height: 40px"
             src="static/https.svg"/>
        <span slot="title">HTTPS/WebSocket</span>
        <span slot="description">Произвольный сервис с доступом по HTTPS/WebSocket.</span>
        <${'ppp-button'}
          disabled
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `service-${SUPPORTED_SERVICES.HTTPS_WEBSOCKET}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
    </div>
  </template>
`;

export const servicePageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const servicePage = ServicePage.compose({
  baseName: 'service-page',
  template: servicePageTemplate,
  styles: servicePageStyles
});
