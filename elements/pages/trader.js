import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { TRADERS, TRADER_CAPS } from '../../lib/const.js';
import { cloudFunctions, search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import { designTokens } from '../../design/design-tokens.js';
import { checkmark } from '../../static/svg/sprite.js';
import '../button.js';
import '../radio-group.js';
import '../query-select.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const traderNameAndRuntimePartial = ({ sharedWorker } = {}) => html`
  <section>
    <div class="label-group">
      <h5>Название трейдера</h5>
      <p class="description">
        Произвольное имя, чтобы ссылаться на этот профиль, когда потребуется.
      </p>
    </div>
    <div class="input-group">
      <ppp-text-field
        placeholder="Trader"
        value="${(x) => x.document.name}"
        ${ref('name')}
      ></ppp-text-field>
    </div>
  </section>
  <section>
    <div class="label-group">
      <h5>Среда выполнения</h5>
      <p class="description">Выберите среду выполнения для трейдера.</p>
    </div>
    <div class="input-group">
      <ppp-radio-group
        orientation="vertical"
        value="${(x) => x.document.runtime ?? 'main-thread'}"
        ${ref('runtime')}
      >
        <ppp-radio value="main-thread">Основной поток, браузер</ppp-radio>
        <ppp-radio
          ?disabled="${() => sharedWorker === false}"
          value="shared-worker"
        >
          Разделяемый поток, браузер
        </ppp-radio>
        <ppp-radio disabled value="aspirant-worker">Aspirant Worker</ppp-radio>
      </ppp-radio-group>
      <div
        class="runtime-selector"
        ?hidden="${(x) => x.runtime.value !== 'aspirant-worker'}"
      >
        <div class="spacing2"></div>
        <ppp-query-select
          ${ref('runtimeServiceId')}
          value="${(x) => x.document.runtimeServiceId}"
          :context="${(x) => x}"
          :preloaded="${(x) => x.document.runtimeService ?? ''}"
          :query="${() => {
            return (context) => {
              return context.services
                .get('mongodb-atlas')
                .db('ppp')
                .collection('services')
                .find({
                  $and: [
                    {
                      type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
                    },
                    { workerPredefinedTemplate: 'pppRuntime' },
                    {
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.runtimeServiceId ?? ''%]` }
                      ]
                    }
                  ]
                })
                .sort({ updatedAt: -1 });
            };
          }}"
          :transform="${() => ppp.decryptDocumentsTransformation()}"
        ></ppp-query-select>
      </div>
    </div>
  </section>
`;

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
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_MIC}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_US_NBBO}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_NSDQ_TOTALVIEW}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_NOII}`)}
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
            alt="Interactive Brokers"
            style="height: 32px"
            src="${() => ppp.brandSvg('ib')}"
          />
          <div slot="title">Interactive Brokers</div>
          <span slot="description"> Торговля через Interactive Brokers. </span>
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
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_POSITIONS}`)}
              </li>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIMELINE}`)}
              </li>
              <li>
                ${() =>
                  ppp.t(
                    `$const.traderCaps.${TRADER_CAPS.CAPS_ORDER_DESTINATION}`
                  )}
              </li>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ORDER_TIF}`)}
              </li>
            </ul>
          </div>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.IB}`
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
          <div slot="title">UTEX Margin, акции и ETF</div>
          <span slot="description">
            Торговля акциями США через брокерский профиль UTEX.
          </span>
          <div slot="description" class="caps-list">
            <ul>
              <li>
                ${() =>
                  ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LEVEL1}`) +
                  ' (NBBO)'}
              </li>
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
          <div slot="title">Tinkoff Invest API, gRPC-Web</div>
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
            alt="Finam"
            style="height: 44px"
            src="${() => ppp.brandSvg('finam')}"
          />
          <div slot="title">Finam Trade API</div>
          <span slot="description">
            Торговля через брокерский профиль Finam.
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
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_CHARTS}`)}
              </li>
            </ul>
          </div>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.FINAM_TRADE_API}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Capital.com"
            style="height: 42px"
            src="${() => ppp.brandSvg('capitalcom')}"
          />
          <div slot="title">Capital.com</div>
          <span slot="description">
            Рыночные данные платформы Capital.com
          </span>
          <div slot="description" class="caps-list">
            <ul>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LEVEL1}`)}
              </li>
            </ul>
          </div>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `trader-${TRADERS.CAPITALCOM}`
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
          <div slot="title">Bybit API V5</div>
          <span slot="description">
            Торговля и рыночные данные через брокерский профиль Bybit.
          </span>
          <div slot="description" class="caps-list">
            <ul>
              <li>
                ${() => ppp.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LEVEL1}`)}
              </li>
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
                page: `trader-${TRADERS.BYBIT_V5}`
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
          <div slot="title">Binance API V3 (Spot)</div>
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
          <div slot="title">По ссылке</div>
          <span slot="description">
            Собственная реализация трейдера, загружаемая по ссылке.
          </span>
          <ppp-button
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
    height: 34px;
  }
`;

export class TraderPage extends Page {}

export default TraderPage.compose({
  template: traderPageTemplate,
  styles: traderPageStyles
}).define();
