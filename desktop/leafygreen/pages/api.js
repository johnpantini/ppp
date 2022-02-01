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
        <img slot="logo" draggable="false" alt="Supabase" style="height: 50px"
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
