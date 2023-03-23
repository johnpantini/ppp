import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { TRADERS, TRADER_CAPS } from '../../lib/const.js';
import { cloudFunctions, search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import { designTokens } from '../../design/design-tokens.js';
import { checkmark } from '../../static/svg/sprite.js';
import '../text-field.js';
import '../button.js';

await ppp.i18n(import.meta.url);

export const traderPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>Трейдеры</ppp-page-header>
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
          <div slot="title">Alor Open API V2</div>
          <span slot="description">
            Торговля и рыночные данные через брокерский профиль Alor Open API
            V2.
          </span>
          <div slot="description" class="caps-list">
            <ul>
              <li>
                ${(x) =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LIMIT_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_MARKET_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ACTIVE_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_STOP_ORDERS}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LEVEL1}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ORDERBOOK}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIME_AND_SALES}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_POSITIONS}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIMELINE}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_CHARTS}`)}
              </li>
            </ul>
          </div>
          <ppp-button
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
          <img
            slot="logo"
            draggable="false"
            alt="Alpaca"
            style="height: 32px"
            src="${() => ppp.brandSvg('alpaca')}"
          />
          <div slot="title">Alpaca API V2+</div>
          <span slot="description">
            Рыночные данные через брокерский профиль, совместимый с Alpaca API.
          </span>
          <div slot="description" class="caps-list">
            <ul>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ORDERBOOK}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIME_AND_SALES}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_MIC}`)}
              </li>
            </ul>
          </div>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.ALPACA_V2_PLUS}`
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
          <div slot="title">UTEX Margin (акции)</div>
          <span slot="description">
            Торговля акциями США через брокерский профиль UTEX.
          </span>
          <div slot="description" class="caps-list">
            <ul>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LIMIT_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_MARKET_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ACTIVE_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_POSITIONS}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIMELINE}`)}
              </li>
            </ul>
          </div>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.UTEX_MARGIN_STOCKS}`
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
          <div slot="title">Tinkoff Invest API (gRPC-Web)</div>
          <span slot="description">
            Торговля через брокерский профиль Tinkoff Invest API.
          </span>
          <div slot="description" class="caps-list">
            <ul>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LIMIT_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_MARKET_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ACTIVE_ORDERS}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_STOP_ORDERS}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LEVEL1}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ORDERBOOK}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIME_AND_SALES}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_POSITIONS}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIMELINE}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_CHARTS}`)}
              </li>
            </ul>
          </div>
          <ppp-button
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
          <img
            slot="logo"
            draggable="false"
            alt="Binance"
            style="height: 32px"
            src="${() => ppp.brandSvg('binance')}"
          />
          <div slot="title">Binance API V3</div>
          <span slot="description">
            Рыночные данные через брокерский профиль Binance.
          </span>
          <div slot="description" class="caps-list">
            <ul>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ORDERBOOK}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIME_AND_SALES}`)}
              </li>
            </ul>
          </div>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.BINANCE_V3}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <div class="picture" slot="logo">${html.partial(cloudFunctions)}</div>
          <div slot="title">Произвольная реализация</div>
          <span slot="description">
            Собственная реализация трейдера, загружаемая по ссылке.
          </span>
          <ppp-button
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
    </form>
  </template>
`;

export const traderPageStyles = css`
  ${pageStyles}
  .caps-list {
    margin-top: 2px;
  }

  .caps-list ul {
    margin-bottom: 10px;
    padding: 0;
  }

  .caps-list li {
    list-style: none;
    background-image: url(${`data:image/svg+xml;base64,${btoa(
      checkmark.replace(
        'fill="currentColor"',
        `fill="${
          ppp.darkMode
            ? designTokens.get('palette-green-light-1').$value
            : designTokens.get('palette-green-dark-2').$value
        }"`
      )
    )}`});
    background-size: 19px 23px;
    background-position-y: -2px;
    background-repeat: no-repeat;
    padding-left: 25px;
  }

  .picture svg {
    position: relative;
    height: 32px;
  }
`;

export class TraderPage extends Page {}

export default TraderPage.compose({
  template: traderPageTemplate,
  styles: traderPageStyles
}).define();
