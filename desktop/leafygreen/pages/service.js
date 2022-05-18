import { ServicePage } from '../../../shared/pages/service.js';
import { SUPPORTED_SERVICES } from '../../../shared/const.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles } from '../page.js';
import { search } from '../icons/search.js';

export const servicePageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Сервисы</ppp-page-header>
    <${'ppp-text-field'}
      class="search-input"
      type="search"
      placeholder="Поиск"
      @input="${(x, c) => x.filterCards(c.event.target.value)}"
    >
      ${search({
        slot: 'end'
      })}
    </ppp-text-field>
    <div class="card-container" ${ref('cards')}>
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
        <img slot="logo" draggable="false" alt="NYSE/NASDAQ"
             style="height: 44px"
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
        <img slot="logo" draggable="false" alt="Supabase Parser"
             style="height: 40px"
             src="static/parser.svg"/>
        <span slot="title">Парсер с персистентностью</span>
        <span slot="description">Произвольный парсер с сохранением состояния в Supabase.</span>
        <${'ppp-button'}
          disabled
          slot="action"
          @click="${(x) =>
            x.app.navigate({
              page: `service-${SUPPORTED_SERVICES.SUPABASE_PARSER}`
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
    .search-input {
      display: flex;
      margin: 5px 0 10px 0;
      width: 300px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const servicePage = ServicePage.compose({
  baseName: 'service-page',
  template: servicePageTemplate,
  styles: servicePageStyles
});
