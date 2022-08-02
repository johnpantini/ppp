import { ApiPage } from '../../shared/api-page.js';
import { APIS } from '../../shared/const.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { search } from './icons/search.js';
import { filterCards } from '../../shared/generic-card.js';
import ppp from '../../ppp.js';

export const apiPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Внешние API
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
          <img slot="logo" draggable="false" alt="Supabase" style="height: 40px"
               src="static/supabase.svg"/>
          <span slot="title">Supabase</span>
          <span slot="description">Платформа бессерверной разработки на базе PostgreSQL. <a
            target="_blank"
            href="https://supabase.com/">Официальный ресурс</a>.</span>
          <${'ppp-button'}
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.SUPABASE}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="Pusher" style="height: 44px"
               src="static/pusher.svg"/>
          <span slot="title">Pusher</span>
          <span slot="description">Платформа рассылки уведомлений. <a
            target="_blank"
            href="https://pusher.com/">Официальный ресурс</a>.</span>
          <${'ppp-button'}
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.PUSHER}`
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
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.ASTRADB}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="Northflank"
               style="height: 41px"
               src="static/northflank.svg"/>
          <span slot="title">Northflank</span>
          <span slot="description">Платформа для создания и развёртывания микросервисов. <a
            target="_blank"
            href="https://northflank.com/">Официальный ресурс</a>.</span>
          <${'ppp-button'}
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.NORTHFLANK}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="Alpaca" style="height: 41px"
               src="static/alpaca.svg"/>
          <span slot="title">Alpaca Real-time Stock API</span>
          <span slot="description">API Alpaca в реальном времени для акций. <a
            target="_blank"
            href="https://alpaca.markets/docs/api-references/market-data-api/stock-pricing-data/realtime/">Официальный ресурс</a>.</span>
          <${'ppp-button'}
            slot="action"
            disabled
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.ALPACA_REALTIME}`
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
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.SEATABLE}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="Algolia" style="height: 45px"
               src="static/algolia.svg"/>
          <span slot="title">Algolia</span>
          <span slot="description">Платформа поиска. <a
            target="_blank"
            href="https://pantini.gitbook.io/pantini-co/recipes/algolia">Инструкция</a>.</span>
          <${'ppp-button'}
            disabled
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.ALGOLIA}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="Redis" style="height: 45px"
               src="static/redis.svg"/>
          <span slot="title">Redis</span>
          <span slot="description">База данных NoSQL.</span>
          <${'ppp-button'}
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.REDIS}`
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
export default ApiPage.compose({
  template: apiPageTemplate,
  styles: pageStyles
});
