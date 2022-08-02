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
              Локальный
            </ppp-badge>
          </div>
          <span slot="description">Торговля через профиль Alor Open API V2. Состояние хранится в браузере.</span>
          <${'ppp-button'}
            disabled
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.ALOR_OPENAPI_V2_LOCAL}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="Alor" style="height: 40px"
               src="static/alor.svg"/>
          <div slot="title">
            Alor Open API V2
            <${'ppp-badge'} appearance="green">
              Удалённый
            </ppp-badge>
          </div>
          <span slot="description">Торговля через профиль Alor Open API V2. Состояние хранится на удалённом сервере.</span>
          <${'ppp-button'}
            disabled
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.ALOR_OPENAPI_V2_REMOTE}`
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
