import { BrokerPage } from '../../shared/broker-page.js';
import { BROKERS } from '../../shared/const.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { search } from './icons/search.js';
import { filterCards } from '../../shared/generic-card.js';
import ppp from '../../ppp.js';

export const brokerPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Брокеры
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
          <span slot="title">Alor Open API V2</span>
          <span slot="description">Торговля через Alor Open API. <a
            target="_blank"
            href="https://alor.dev/docs">Перейти к документации</a>.</span>
          <${'ppp-button'}
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.ALOR_OPENAPI_V2}`
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
export default BrokerPage.compose({
  template: brokerPageTemplate,
  styles: pageStyles
});
