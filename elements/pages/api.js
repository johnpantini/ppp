import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { APIS } from '../../lib/const.js';
import { search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import '../text-field.js';
import '../button.js';

export const apiPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>Внешние API</ppp-page-header>
      <ppp-text-field
        class="global-search-input"
        type="search"
        placeholder="Поиск"
        @input="${(x, c) =>
          filterCards(x.cards.children, c.event.target.value)}"
      >
        <span class="icon" slot="end">${html.partial(search)}</span>
      </ppp-text-field>
      <div class="card-container" ${ref('cards')}>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Supabase"
            style="height: 40px"
            src="${() => ppp.brandSvg('supabase')}"
          />
          <span slot="title">Supabase</span>
          <span slot="description">
            Платформа бессерверной разработки на базе PostgreSQL.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://supabase.com/"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
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
          <img
            slot="logo"
            draggable="false"
            alt="Pusher"
            style="height: 32px"
            src="${() => ppp.brandSvg('pusher')}"
          />
          <span slot="title">Pusher</span>
          <span slot="description">
            Платформа рассылки уведомлений.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://pusher.com/"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
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
          <img
            slot="logo"
            draggable="false"
            alt="AstraDB"
            style="height: 32px"
            src="${() => ppp.brandSvg('astradb')}"
          />
          <span slot="title">DataStax Astra</span>
          <span slot="description">
            Облачная база данных на основе Apache Cassandra™.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://www.datastax.com/products/datastax-astra"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
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
          <img
            slot="logo"
            draggable="false"
            alt="Northflank"
            style="height: 32px"
            src="${() => ppp.brandSvg('northflank')}"
          />
          <span slot="title">Northflank</span>
          <span slot="description">
            Платформа для создания и развёртывания микросервисов.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://northflank.com/"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
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
          <img
            slot="logo"
            draggable="false"
            alt="Seatable"
            style="height: 36px"
            src="${() => ppp.brandSvg('seatable')}"
          />
          <span slot="title">Seatable</span>
          <span slot="description">
            База данных с табличным интерфейсом.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://api.seatable.io/"
              >Документация</a
            >.
          </span>
          <ppp-button
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
          <img
            slot="logo"
            draggable="false"
            alt="Redis"
            style="height: 36px"
            src="${() => ppp.brandSvg('redis')}"
          />
          <span slot="title">Redis</span>
          <span slot="description">База данных NoSQL.</span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.REDIS}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="PostgreSQL"
            style="height: 40px;"
            src="${() => ppp.brandSvg('postgresql')}"
          />
          <span slot="title">PostgreSQL</span>
          <span slot="description">Реляционная база данных.</span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.POSTGRESQL}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="bit.io"
            style="height: 32px;"
            src="${() => ppp.brandSvg('bitio')}"
          />
          <span slot="title">bit.io</span>
          <span slot="description">
            Облачная база данных на основе PostgreSQL.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://bit.io/"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.BITIO}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Cloudflare"
            style="height: 32px"
            src="${() => ppp.brandSvg('cloudflare')}"
          />
          <span slot="title">Cloudflare</span>
          <span slot="description">Доступ к API Cloudflare Workers.</span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.CLOUDFLARE}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Yandex Cloud"
            style="height: 32px"
            src="${() => ppp.brandSvg('yc')}"
          />
          <span slot="title">Yandex Cloud</span>
          <span slot="description">Доступ к облачной платформе от Yandex.</span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.YC}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
      </div>
    </form>
  </template>
`;

export const apiPageStyles = css`
  ${pageStyles}
`;

export class ApiPage extends Page {}

export default ApiPage.compose({
  template: apiPageTemplate,
  styles: apiPageStyles
}).define();
