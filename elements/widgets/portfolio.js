/** @decorator */

import {
  widget,
  widgetEmptyStateTemplate,
  WidgetWithInstrument
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  repeat
} from '../../vendor/fast-element.min.js';
import { TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import {
  currencyName,
  formatAmount,
  formatPrice,
  formatQuantity
} from '../../lib/intl.js';
import { ellipsis, normalize } from '../../design/styles.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  darken,
  fontSizeWidget,
  fontWeightWidget,
  lighten,
  lineHeightWidget,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  themeConditional
} from '../../design/design-tokens.js';
import { drag } from '../../static/svg/sprite.js';
import '../button.js';
import '../checkbox.js';
import '../draggable-stack.js';
import '../query-select.js';
import '../text-field.js';

const portfolioSection = ({ title, section }) =>
  html`
    <tr class="table-group" ?hidden="${(x) => !x?.[section].length}">
      <td colspan="1">${title}</td>
    </tr>
    ${repeat(
      (x) => x?.[section],
      html`
        <tr
          class="portfolio-row"
          symbol="${(cell) => cell.instrument.symbol}"
          type="${(cell) => cell.instrument.type}"
        >
          <td class="cell capitalize">
            <div class="portfolio-row-logo-with-name">
              <div
                class="portfolio-row-logo"
                style="${(cell, c) =>
                  `background-image:url(${c.parent.searchControl.getInstrumentIconUrl(
                    cell.instrument
                  )})`}"
              ></div>
              <div class="portfolio-row-name">
                ${(cell) => cell.instrument.fullName ?? cell.instrument.symbol}
              </div>
            </div>
          </td>
          <td class="cell">
            ${(cell) => formatQuantity(cell.size * cell.lot)}
          </td>
          <td class="cell">
            ${(cell) => formatPrice(cell.averagePrice, cell.instrument)}
          </td>
        </tr>
      `
    )}
  `.inline();

export const portfolioWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control
            selection="${(x) => x.document?.group}"
          ></ppp-widget-group-control>
          <ppp-widget-search-control></ppp-widget-search-control>
          <span class="widget-title">
            <span class="title">${(x) => x.document?.name ?? ''}</span>
          </span>
          <ppp-widget-header-buttons></ppp-widget-header-buttons>
        </div>
      </div>
      <div class="widget-body">
        <div class="portfolio-header">
          <div class="portfolio-name-section">
            <div style="display: flex">
              <div class="portfolio-name-section-header">
                ${(x) => x.getPortfolioName()}
              </div>
            </div>
          </div>
        </div>
        <table class="portfolio-table">
          <thead>
            <tr>
              <th>Инструмент</th>
              <th>Доступно</th>
              <th>Средняя</th>
            </tr>
          </thead>
          <tbody @click="${(x, c) => x.handleBalancesTableClick(c)}">
            <tr class="table-group" ?hidden="${(x) => !x?.balances.length}">
              <td colspan="1">Валютные балансы</td>
            </tr>
            ${repeat(
              (x) => x?.balances,
              html`
                <tr class="portfolio-row">
                  <td class="cell capitalize">
                    <div class="portfolio-row-logo-with-name">
                      <div
                        class="portfolio-row-logo"
                        style="${(cell) =>
                          `background-image:url(${
                            'static/currency/' + cell.symbol + '.svg'
                          })`}"
                      ></div>
                      <div class="portfolio-row-name">
                        ${(cell) => currencyName(cell.symbol)}
                      </div>
                    </div>
                  </td>
                  <td class="cell">
                    <ppp-button
                      class="xsmall"
                      ?hidden="${(x, c) => !c.parent.document.hideBalances}"
                    >
                      Скрыто
                    </ppp-button>
                    <span
                      class="balance-cell"
                      ?hidden="${(x, c) => c.parent.document.hideBalances}"
                    >
                      ${(cell) => formatAmount(cell.size, cell.symbol)}
                    </span>
                  </td>
                  <td class="cell"></td>
                </tr>
              `
            )}
          </tbody>
          <tbody @click="${(x, c) => x.handlePortfolioTableClick(c)}">
            ${portfolioSection({ title: 'Акции', section: 'stocks' })}
            ${portfolioSection({ title: 'Фонды', section: 'etfs' })}
            ${portfolioSection({ title: 'Облигации', section: 'bonds' })}
            ${portfolioSection({ title: 'Фьючерсы', section: 'futures' })}
          </tbody>
        </table>
        ${when(
          (x) =>
            !x?.balances?.length &&
            !x?.stocks?.length &&
            !x?.bonds?.length &&
            !x?.futures?.length &&
            !x?.zombies?.length,
          html`${html.partial(
            widgetEmptyStateTemplate('Нет позиций в портфеле.')
          )}`
        )}
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
    </div>
    <ppp-widget-resize-controls></ppp-widget-resize-controls>
  </template>
`;

export const portfolioWidgetStyles = css`
  ${normalize()}
  ${widget()}
  .portfolio-header {
    display: none;
    flex-shrink: 0;
    margin: 4px 12px 8px;
    white-space: nowrap;
  }

  .portfolio-name-section {
    flex-shrink: 0;
    flex-grow: 1;
    margin-right: 32px;
    display: block;
  }

  .portfolio-metric-section:not(:last-of-type) {
    margin-right: 32px;
  }

  .portfolio-metric-section {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    font-weight: ${fontWeightWidget};
    letter-spacing: 0;
  }

  .portfolio-name-section-header {
    display: flex;
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    font-weight: 500;
    letter-spacing: 0;
    line-height: 24px;
    justify-content: center;
  }

  .portfolio-table {
    text-align: left;
    min-width: 140px;
    width: 100%;
    padding: 0;
    user-select: none;
    border-collapse: collapse;
  }

  .portfolio-table th {
    text-align: right;
    position: sticky;
    top: 0;
    z-index: 100;
    width: 50%;
    height: 28px;
    padding: 4px 8px;
    font-weight: 500;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    white-space: nowrap;
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  .portfolio-table th:first-of-type {
    text-align: left;
  }

  .portfolio-table .cell {
    text-align: right;
    max-width: 134px;
    padding: 4px 8px;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    white-space: nowrap;
    position: relative;
    vertical-align: middle;
  }

  .portfolio-table .cell ppp-button {
    position: absolute;
    z-index: 10;
    right: 0;
    top: 3px;
  }

  .portfolio-table .cell:first-of-type {
    text-align: left;
  }

  .portfolio-table .cell.capitalize {
    text-transform: capitalize;
  }

  .portfolio-row:nth-of-type(2n) {
    background-color: ${themeConditional(
      lighten(paletteGrayLight3, 1),
      paletteGrayDark2
    )};
  }

  .portfolio-row:hover {
    background-color: ${themeConditional(
      lighten(paletteGrayLight2, 5),
      darken(paletteGrayDark1, 10)
    )};
  }

  .portfolio-row-logo-with-name {
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    font-weight: ${fontWeightWidget};
    display: flex;
    align-items: center;
    width: 100%;
    letter-spacing: 0;
  }

  .portfolio-row-logo {
    min-width: 20px;
    min-height: 20px;
    height: 20px;
    width: 20px;
    padding: 2px;
    border-radius: 50%;
    background-size: 100%;
    margin-right: 10px;
    color: ${themeConditional(paletteGrayLight1, paletteBlack)};
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayBase)};
  }

  .portfolio-row-name {
    opacity: 1;
    width: 100%;
    text-align: left;
    ${ellipsis()};
  }
`;

export class PortfolioWidget extends WidgetWithInstrument {
  @observable
  portfolioTrader;

  @observable
  position;

  @observable
  balances;

  @observable
  stocks;

  @observable
  etfs;

  @observable
  bonds;

  @observable
  futures;

  @observable
  zombies;

  onTraderError() {
    this.notificationsArea.error({
      title: 'Портфель',
      text: 'Возникла проблема с отображением инструментов. Смотрите консоль браузера.'
    });
  }

  constructor() {
    super();

    this.balances = [];
    this.stocks = [];
    this.etfs = [];
    this.bonds = [];
    this.futures = [];
    this.zombies = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.portfolioTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер портфеля.',
        keep: true
      });
    }

    try {
      this.balancesMap = new Map();
      this.stocksMap = new Map();
      this.etfsMap = new Map();
      this.bondsMap = new Map();
      this.futuresMap = new Map();
      this.zombiesMap = new Map();

      this.portfolioTrader = await ppp.getOrCreateTrader(
        this.document.portfolioTrader
      );
      this.instrumentTrader = this.portfolioTrader;

      this.selectInstrument(this.document.symbol, { isolate: true });

      this.portfolioTrader.onError = this.onTraderError.bind(this);

      await this.portfolioTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          position: TRADER_DATUM.POSITION
        }
      });
    } catch (e) {
      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    if (this.portfolioTrader) {
      await this.portfolioTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          position: TRADER_DATUM.POSITION
        }
      });
    }

    super.disconnectedCallback();
  }

  handleBalancesTableClick({ event }) {
    const button = event
      .composedPath()
      .find((n) => n.tagName?.toLowerCase?.() === 'ppp-button');

    if (button) {
      button.setAttribute('hidden', '');
      button.nextElementSibling.removeAttribute('hidden', '');
    }
  }

  async handlePortfolioTableClick({ event }) {
    if (this.groupControl.selection && !this.preview && this.portfolioTrader) {
      this.selectInstrument(
        event
          .composedPath()
          .find((n) => n?.tagName?.toLowerCase?.() === 'tr')
          ?.getAttribute('symbol')
      );
    }
  }

  portfolioMapToArray(map) {
    if (!map || !map.size) {
      return [];
    }

    return Array.from(map.values()).sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
  }

  positionChanged(oldValue, newValue) {
    if (newValue) {
      if (newValue.isBalance) {
        if (newValue.size !== 0)
          this.balancesMap.set(newValue.symbol, newValue);
        else this.balancesMap.delete(newValue.symbol);

        this.balances = this.portfolioMapToArray(this.balancesMap);
      } else if (!newValue.instrument?.type) {
        if (newValue.size !== 0) this.zombiesMap.set(newValue.symbol, newValue);
        else this.zombiesMap.delete(newValue.symbol);

        this.zombies = this.portfolioMapToArray(this.zombiesMap);
      } else {
        switch (newValue.instrument.type) {
          case 'stock':
            if (newValue.size !== 0)
              this.stocksMap.set(newValue.symbol, newValue);
            else this.stocksMap.delete(newValue.symbol);

            this.stocks = this.portfolioMapToArray(this.stocksMap);

            break;
          case 'etf':
            if (newValue.size !== 0)
              this.etfsMap.set(newValue.symbol, newValue);
            else this.etfsMap.delete(newValue.symbol);

            this.etfs = this.portfolioMapToArray(this.etfsMap);

            break;
          case 'bond':
            if (newValue.size !== 0)
              this.bondsMap.set(newValue.symbol, newValue);
            else this.bondsMap.delete(newValue.symbol);

            this.bonds = this.portfolioMapToArray(this.bondsMap);

            break;
          case 'future':
            if (newValue.size !== 0)
              this.futuresMap.set(newValue.symbol, newValue);
            else this.futuresMap.delete(newValue.symbol);

            this.futures = this.portfolioMapToArray(this.futuresMap);

            break;
        }
      }
    }
  }

  getPortfolioName() {
    return '';
  }

  async validate() {
    await validate(this.container.portfolioTraderId);
  }

  async submit() {
    return {
      $set: {
        portfolioTraderId: this.container.portfolioTraderId.value,
        hideBalances: this.container.hideBalances.checked
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.PORTFOLIO,
    collection: 'PPP',
    title: html`Портфель`,
    description: html`Виджет <span class="positive">Портфель</span> отображает
      сводку по всем открытым позициям и балансам.`,
    customElement: PortfolioWidget.compose({
      template: portfolioWidgetTemplate,
      styles: portfolioWidgetStyles
    }).define(),
    minWidth: 275,
    minHeight: 120,
    defaultWidth: 620,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер позиций портфеля</h5>
          <p class="description">
            Трейдер, который будет источником позиций в портфеле.
          </p>
        </div>
        <div class="control-line">
          <ppp-query-select
            ${ref('portfolioTraderId')}
            value="${(x) => x.document.portfolioTraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.portfolioTrader ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('traders')
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_POSITIONS%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.portfolioTraderId ?? ''%]` }
                        ]
                      }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <ppp-button
            appearance="default"
            @click="${() => window.open('?page=trader', '_blank').focus()}"
          >
            +
          </ppp-button>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Параметры отображения</h5>
        </div>
        <ppp-checkbox
          ?checked="${(x) => x.document.hideBalances}"
          ${ref('hideBalances')}
        >
          Скрывать валютные балансы
        </ppp-checkbox>
      </div>
    `
  };
}
