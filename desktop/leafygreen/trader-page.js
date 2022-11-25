import { TraderPage } from '../../shared/trader-page.js';
import { TRADERS } from '../../shared/const.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { search } from './icons/search.js';
import { filterCards } from '../../shared/generic-card.js';
import ppp from '../../ppp.js';

export const traderPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Трейдеры
      </span>
      <${'ppp-text-field'}
        class="global-search-input"
        type="search"
        placeholder="Поиск"
        @input="${(x, c) =>
          filterCards(x.cards.children, c.event.target.value)}"
      >
        ${search({
          slot: 'end'
        })}
      </ppp-text-field>
      <div class="card-container" ${ref('cards')}>
        <${'ppp-generic-card'}>
          <img slot="logo" draggable="false" alt="Alor" style="height: 40px"
               src="static/alor.svg"/>
          <div slot="title">
            Alor Open API V2
            <${'ppp-badge'} appearance="blue">
              REST/WebSocket
            </ppp-badge>
          </div>
          <span slot="description">Торговля через брокерский профиль Alor Open API V2.</span>
          <${'ppp-button'}
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.ALOR_OPENAPI_V2}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="Tinkoff" style="height: 40px"
               src="static/tinkoff.svg"/>
          <div slot="title">
            Tinkoff Invest API
            <${'ppp-badge'} appearance="blue">
              gRPC-web
            </ppp-badge>
          </div>
          <span
            slot="description">Торговля через брокерский профиль Tinkoff Invest API.</span>
          <${'ppp-button'}
            disabled
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.TINKOFF_GRPC_WEB}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="Custom" style="height: 40px"
               src="static/functions.svg"/>
          <div slot="title">
            Произвольная реализация
          </div>
          <span
            slot="description">Торговля через любой брокерский профиль.</span>
          <${'ppp-button'}
            disabled
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.CUSTOM}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
      </div>
      <span slot="actions"></span>
    </ppp-page>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default TraderPage.compose({
  template: traderPageTemplate,
  styles: pageStyles
});
