import { TraderPage } from '../../shared/trader-page.js';
import { TRADER_CAPS, TRADERS } from '../../shared/const.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { search } from './icons/search.js';
import { css } from '../../shared/element/styles/css.js';
import { filterCards } from '../../shared/generic-card.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

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
          <span slot="description">Торговля и рыночные данные через брокерский профиль Alor Open API V2.</span>
          <div slot="description" class="caps-list">
            <ul>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LIMIT_ORDERS}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_MARKET_ORDERS}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ACTIVE_ORDERS}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_STOP_ORDERS}`)}
              </li>
              <li>${(x) => x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LEVEL1}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ORDERBOOK}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIME_AND_SALES}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_POSITIONS}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIMELINE}`)}
              </li>
              <li>${(x) => x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_CHARTS}`)}
              </li>
            </ul>
          </div>
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
          <img slot="logo" draggable="false" alt="Alpaca" style="height: 40px"
               src="static/alpaca.svg"/>
          <div slot="title">
            Alpaca API V2+
          </div>
          <span slot="description">Рыночные данные через брокерский профиль, совместимый с Alpaca API.</span>
          <div slot="description" class="caps-list">
            <ul>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ORDERBOOK}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIME_AND_SALES}`)}
              </li>
              <li>${(x) => x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_MIC}`)}
              </li>
            </ul>
          </div>
          <${'ppp-button'}
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
          <div slot="description" class="caps-list">
            <ul>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LIMIT_ORDERS}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_MARKET_ORDERS}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ACTIVE_ORDERS}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_STOP_ORDERS}`)}
              </li>
              <li>${(x) => x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_LEVEL1}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_ORDERBOOK}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIME_AND_SALES}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_POSITIONS}`)}
              </li>
              <li>${(x) =>
                x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_TIMELINE}`)}
              </li>
              <li>${(x) => x.t(`$const.traderCaps.${TRADER_CAPS.CAPS_CHARTS}`)}
              </li>
            </ul>
          </div>
          <${'ppp-button'}
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
            slot="description">Собственная реализация трейдера.</span>
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

export const traderPageStyles = (context, definition) => css`
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
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjYiIGhlaWdodD0iNjYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjM4IDI3Ljk5OC0zLjUzNS0xLjI0Yy0uMTc3IDAtLjM1NC0uMTc2LS41My0uMTc2LTIuNjUyLTEuMjQtMy43MTMtNC4yNS0yLjQ3NS02LjkwNWwxLjU5LTMuMzY0YTQuODgzIDQuODgzIDAgMCAwIDAtNC40MjZjLTEuMjM3LTIuNjU2LTQuMjQyLTMuNzE5LTYuODkzLTIuNDhsLTMuMTgyIDEuNTk0Yy0uMTc2IDAtLjM1My4xNzctLjUzLjE3Ny0yLjY1Mi44ODUtNS42NTYtLjUzLTYuNzE3LTMuMTg3bC0xLjIzNy0zLjU0Yy0uNTMtMS40MTctMS43NjgtMi42NTYtMy4xODItMy4xODgtMi42NTEtLjg4NS01LjY1Ni41MzItNi43MTcgMy4xODdsLTEuMjM3IDMuNTQxYzAgLjE3Ny0uMTc3LjM1NC0uMTc3LjUzMi0xLjIzNyAyLjY1NS00LjI0MiAzLjcxOC02Ljg5NCAyLjQ3OGwtMy4zNTgtMS41OTNhNC44NjEgNC44NjEgMCAwIDAtNC40MiAwYy0yLjY1IDEuMjQtMy43MTEgNC4yNDktMi40NzQgNi45MDVsMS41OTEgMy4zNjRjMCAuMTc3LjE3Ny4zNTQuMTc3LjUzLjg4NCAyLjY1Ni0uNTMgNS42NjYtMy4xODIgNi41NTJsLTMuNTM1IDEuMjM5Yy0xLjQxNC41MzEtMi42NTIgMS41OTMtMy4xODIgMy4xODctLjg4NCAyLjY1Ni4zNTQgNS42NjUgMy4xODIgNi43MjhsMy41MzUgMS4yNGMuMTc3IDAgLjM1NC4xNzYuNTMuMTc2IDIuNjUyIDEuMjQgMy43MTIgNC4yNSAyLjQ3NSA2LjkwNWwtMS41OSAzLjM2NGE0Ljg4MyA0Ljg4MyAwIDAgMCAwIDQuNDI2YzEuMjM2IDIuNjU2IDQuMjQyIDMuNzE4IDYuODkzIDIuNDc5bDMuNTM1LTEuNTkzYy4xNzctLjE3Ny4zNTQtLjE3Ny41My0uMTc3IDIuNjUyLS44ODYgNS42NTcuNTMgNi41NCAzLjE4NmwxLjIzOCAzLjU0MWMuNTMgMS40MTcgMS41OSAyLjY1NiAzLjE4MiAzLjE4NyAyLjY1MSAxLjA2MyA1LjY1Ni0uMzU0IDYuNzE2LTMuMTg3bDEuMjM4LTMuNTRjMC0uMTc4LjE3Ny0uMzU1LjE3Ny0uNTMyIDEuMjM3LTIuNjU1IDQuMjQyLTMuNzE4IDYuODkzLTIuNDc4bDMuMzU5IDEuNTkzYTQuODYxIDQuODYxIDAgMCAwIDQuNDE5IDBjMi42NTEtMS4yNCAzLjcxMi00LjI1IDIuNDc0LTYuOTA1bC0xLjU5LTMuMzY0YzAtLjE3Ny0uMTc3LS4zNTQtLjE3Ny0uNTMxLS44ODQtMi42NTYuNTMtNS42NjYgMy4xODEtNi41NWwzLjUzNi0xLjI0YzEuNDE0LS41MzEgMi42NTEtMS41OTQgMy4xODEtMy4xODcuODg0LTIuODMzLS41My01LjY2Ni0zLjM1OC02LjcyOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIi8+PHBhdGggZD0ibTQ4LjQxOSAyNS45NDUtMTYuNzk2IDE2LjU3LTIuODY2IDIuODI1LS4yOTYuMjkzYy0uMDk5LjA5Ny0uMTk4LjA5Ny0uMjk2LjE5NS0uMSAwLS4xIDAtLjE5OC4wOTctLjY5Mi4xOTUtMS40ODIgMC0xLjk3Ni0uNDg3bC0yLjk2NC0yLjkyNC01LjQzNC01LjM2Yy0uNzktLjc4LS43OS0yLjA0NyAwLTIuNzNsMi43NjYtMi43MjhjLjc5LS43OCAyLjA3NS0uNzggMi43NjcgMGwzLjk1MiAzLjg5OGMuMDk5LjA5OC4zOTUuMDk4LjQ5NCAwbDE1LjIxNS0xNS4wMWMuNzktLjc3OSAyLjA3NS0uNzc5IDIuNzY3IDBsMi43NjYgMi43M2MuODkuNjgyLjg5IDEuODUyLjA5OSAyLjYzMVoiIGZpbGw9IiMwMEVENjQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIi8+PC9zdmc+');
    background-size: 25px 25px;
    background-position-y: -2px;
    background-repeat: no-repeat;
    padding-left: 25px;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default TraderPage.compose({
  template: traderPageTemplate,
  styles: traderPageStyles
});
