import { ApiPage } from '../../../shared/pages/api.js';
import { SUPPORTED_APIS } from '../../../shared/const.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles } from '../page.js';

export const apiPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Внешние API</ppp-page-header>
    <div class="card-container">
      <${'ppp-generic-card'}>
        <img slot="logo" draggable="false" alt="Supabase" style="height: 40px"
             src="static/supabase.svg"/>
        <span slot="title">Supabase</span>
        <span slot="description">Платформа бессерверной разработки на базе PostgreSQL. <a
          target="_blank"
          href="https://supabase.com/">Официальный ресурс</a>.</span>
        <${'ppp-button'}
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `api-${SUPPORTED_APIS.SUPABASE}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
      <ppp-generic-card>
        <img slot="logo" draggable="false" alt="Supabase" style="height: 44px"
             src="static/pusher.svg"/>
        <span slot="title">Pusher</span>
        <span slot="description">Платформа рассылки уведомлений. <a
          target="_blank"
          href="https://pusher.com/">Официальный ресурс</a>.</span>
        <${'ppp-button'}
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `api-${SUPPORTED_APIS.PUSHER}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
      <ppp-generic-card>
        <img slot="logo" draggable="false" alt="AstraDB" style="height: 41px"
             src="static/astradb.svg"/>
        <span slot="title">DataStax Astra</span>
        <span slot="description">Облачная база данных на основе Apache Cassandra™. <a
          target="_blank"
          href="https://www.datastax.com/products/datastax-astra">Официальный ресурс</a>.</span>
        <${'ppp-button'}
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `api-${SUPPORTED_APIS.ASTRADB}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
      <ppp-generic-card>
        <img slot="logo" draggable="false" alt="AstraDB" style="height: 41px"
             src="static/northflank.svg"/>
        <span slot="title">Northflank</span>
        <span slot="description">Платформа для создания и развёртывания микросервисов. <a
          target="_blank"
          href="https://northflank.com/">Официальный ресурс</a>.</span>
        <${'ppp-button'}
          slot="action"
          disabled
          @click="${(x) =>
            x.app.navigate({
              page: `api-${SUPPORTED_APIS.NORTHFLANK}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
      <ppp-generic-card>
        <img slot="logo" draggable="false" alt="AstraDB" style="height: 41px"
             src="static/alpaca.svg"/>
        <span slot="title">Alpaca Real-time Stock API</span>
        <span slot="description">API Alpaca в реальном времени для акций. <a
          target="_blank"
          href="https://alpaca.markets/docs/api-references/market-data-api/stock-pricing-data/realtime/">Официальный ресурс</a>.</span>
        <${'ppp-button'}
          slot="action"
          disabled
          @click="${(x) =>
            x.app.navigate({
              page: `api-${SUPPORTED_APIS.ALPACA_REALTIME}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
      <ppp-generic-card>
        <img slot="logo" draggable="false" alt="Seatable" style="height: 45px"
             src="static/seatable.svg"/>
        <span slot="title">Seatable</span>
        <span slot="description">База данных с табличным интерфейсом. <a
          target="_blank"
          href="https://api.seatable.io/">Документация</a>.</span>
        <${'ppp-button'}
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `api-${SUPPORTED_APIS.SEATABLE}`
            })}"
        >
          Продолжить
        </ppp-button>
      </ppp-generic-card>
    </div>
  </template>
`;

export const apiPageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const apiPage = ApiPage.compose({
  baseName: 'api-page',
  template: apiPageTemplate,
  styles: apiPageStyles
});
