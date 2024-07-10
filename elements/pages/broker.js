import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS } from '../../lib/const.js';
import { search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import '../text-field.js';
import '../button.js';

export const brokerPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>Брокеры</ppp-page-header>
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
            alt="Alor"
            style="height: 32px"
            src="${() => ppp.brandSvg('alor')}"
          />
          <span slot="title">Alor</span>
          <span slot="description">
            Торговля и рыночные данные через Alor Open API.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://alor.dev/docs"
              >Перейти к документации</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.ALOR}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Tinkoff"
            style="height: 32px"
            src="${() => ppp.brandSvg('tinkoff')}"
          />
          <span slot="title">Tinkoff</span>
          <span slot="description">
            Торговля и рыночные данные через T‑Bank Invest API.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://tinkoff.github.io/investAPI"
              >Перейти к документации</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.TINKOFF}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Finam"
            style="height: 44px"
            src="${() => ppp.brandSvg('finam')}"
          />
          <span slot="title">Finam</span>
          <span slot="description">
            Торговля через Finam Trade API.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://finamweb.github.io/trade-api-docs/"
              >Перейти к документации</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.FINAM}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="UTEX"
            style="height: 32px"
            src="${() => ppp.brandSvg('utex')}"
          />
          <span slot="title">UTEX</span>
          <span slot="description">
            Торговля и рыночные данные через сервисы UTEX.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://utex.io"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.UTEX}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Psina"
            style="height: 42px"
            src="${() => ppp.brandSvg('psina')}"
          />
          <span slot="title">Psina</span>
          <span slot="description">Рыночные данные проекта Psina.</span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.PSINA}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Alpaca"
            style="height: 32px"
            src="${() => ppp.brandSvg('alpaca')}"
          />
          <span slot="title">Alpaca</span>
          <span slot="description">Рыночные данные брокера Alpaca.</span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.ALPACA}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="capital.com"
            style="height: 42px"
            src="${() => ppp.brandSvg('capitalcom')}"
          />
          <span slot="title">capital.com</span>
          <span slot="description">Рыночные данные Capital.com.</span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.CAPITALCOM}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="IB"
            style="height: 42px"
            src="${() => ppp.brandSvg('ib')}"
          />
          <span slot="title">Interactive Brokers</span>
          <span slot="description">Торговля через Interactive Brokers.</span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.IB}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Binance"
            style="height: 32px"
            src="${() => ppp.brandSvg('binance')}"
          />
          <span slot="title">Binance</span>
          <span slot="description">
            Рыночные данные через криптовалютную биржу Binance.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://www.binance.com/"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.BINANCE}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Bybit"
            style="height: 32px"
            src="${() => ppp.brandSvg('bybit')}"
          />
          <span slot="title">Bybit</span>
          <span slot="description">
            Торговля и рыночные данные через криптовалютную биржу Bybit.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://www.bybit.com/"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.BYBIT}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
      </div>
    </form>
  </template>
`;

export const brokerPageStyles = css`
  ${pageStyles}
`;

export class BrokerPage extends Page {}

export default BrokerPage.compose({
  template: brokerPageTemplate,
  styles: brokerPageStyles
}).define();
