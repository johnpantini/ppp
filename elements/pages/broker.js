import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS } from '../../lib/const.js';
import { search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import '../text-field.js';
import '../button.js';

await ppp.i18n(import.meta.url);

export const brokerPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>${() => ppp.t('$collection.brokers')}</ppp-page-header>
      <ppp-text-field
        class="global-search-input"
        type="search"
        placeholder="${() => ppp.t('$brokerPage.searchPlaceholder')}"
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
            ${() => ppp.t('$brokerPage.alorDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://alor.dev/docs"
              >${() => ppp.t('$brokerPage.goToDocumentation')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.ALOR}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="T-Bank"
            style="height: 32px"
            src="${() => ppp.brandSvg('tinkoff')}"
          />
          <span slot="title">T-Bank</span>
          <span slot="description">
            ${() => ppp.t('$brokerPage.tbankDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://tinkoff.github.io/investAPI"
              >${() => ppp.t('$brokerPage.goToDocumentation')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.TINKOFF}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
            ${() => ppp.t('$brokerPage.finamDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://finamweb.github.io/trade-api-docs/"
              >${() => ppp.t('$brokerPage.goToDocumentation')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.FINAM}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
            ${() => ppp.t('$brokerPage.utexDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://utex.io"
              >${() => ppp.t('$brokerPage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.UTEX}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
          <span slot="description">
            ${() => ppp.t('$brokerPage.psinaDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.PSINA}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
          <span slot="description">
            ${() => ppp.t('$brokerPage.alpacaDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.ALPACA}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
          <span slot="description">
            ${() => ppp.t('$brokerPage.capitalcomDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.CAPITALCOM}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
          <span slot="description">
            ${() => ppp.t('$brokerPage.ibDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.IB}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
            ${() => ppp.t('$brokerPage.binanceDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://www.binance.com/"
              >${() => ppp.t('$brokerPage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.BINANCE}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
            ${() => ppp.t('$brokerPage.bybitDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://www.bybit.com/"
              >${() => ppp.t('$brokerPage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `broker-${BROKERS.BYBIT}`
              })}"
          >
            ${() => ppp.t('$brokerPage.continue')}
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
