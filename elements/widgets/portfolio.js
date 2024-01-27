/** @decorator */

import ppp from '../../ppp.js';
import {
  widgetStyles,
  widgetEmptyStateTemplate,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import { WidgetColumns } from '../widget-columns.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  repeat
} from '../../vendor/fast-element.min.js';
import { COLUMN_SOURCE, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import { normalize, ellipsis } from '../../design/styles.js';
import {
  fontSizeWidget,
  fontWeightWidget,
  lineHeightWidget
} from '../../design/design-tokens.js';
import '../badge.js';
import '../button.js';
import '../checkbox.js';
import '../draggable-stack.js';
import '../query-select.js';
import '../tabs.js';
import '../text-field.js';
import '../widget-column-list.js';
import '../widget-controls.js';

const DEFAULT_COLUMNS = [
  {
    source: COLUMN_SOURCE.INSTRUMENT
  },
  {
    source: COLUMN_SOURCE.SYMBOL
  },
  {
    source: COLUMN_SOURCE.INSTRUMENT_TYPE
  },
  {
    source: COLUMN_SOURCE.POSITION_AVAILABLE
  },
  {
    source: COLUMN_SOURCE.POSITION_AVERAGE
  },
  {
    source: COLUMN_SOURCE.LAST_PRICE
  },
  {
    source: COLUMN_SOURCE.PL_ABSOLUTE
  },
  {
    source: COLUMN_SOURCE.PL_RELATIVE
  }
].map((column) => {
  column.name = ppp.t(`$const.columnSource.${column.source}`);

  return column;
});

const portfolioSection = ({ title, section }) =>
  html`
    ${repeat(
      (x) => x?.[section],
      html`
        <tr
          class="row"
          ?active="${(cell, c) =>
            cell.instrument.symbol === c.parent.instrument?.symbol}"
          symbol="${(cell) => cell.instrument.symbol}"
          type="${(cell) => cell.instrument.type}"
        >
          ${repeat(
            (instrument, c) => c.parent.columns?.array,
            html`
              <td
                class="cell"
                :payload="${(x, c) => c.parent}"
                :column="${(x) => x}"
              >
                ${(x, c) => c.parentContext.parent.columns.columnElement(x)}
              </td>
            `
          )}
        </tr>
      `
    )}
  `.inline();

export const portfolioWidgetTemplate = html`
  <template>
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
        <div class="portfolio-header">
          <div class="portfolio-name-section">
            <div style="display: flex">
              <div class="portfolio-name-section-header">
                ${(x) => x.getPortfolioName()}
              </div>
            </div>
          </div>
        </div>
        <table class="widget-table">
          <thead>
            <tr>
              ${repeat(
                (x) => x?.columns?.array,
                html`
                  <th source="${(x) => x.source}">
                    <div class="resize-handle"></div>
                    <div>${(x) => x.name}</div>
                  </th>
                `
              )}
              <th class="empty">
                <div class="resize-handle"></div>
                <div></div>
              </th>
            </tr>
          </thead>
          <tbody @click="${(x, c) => x.handlePortfolioTableClick(c)}">
            ${portfolioSection({ title: 'Акции', section: 'stocks' })}
            ${portfolioSection({ title: 'Фонды', section: 'etfs' })}
            ${portfolioSection({ title: 'Облигации', section: 'bonds' })}
            ${portfolioSection({ title: 'Фьючерсы', section: 'futures' })}
          </tbody>
        </table>
        ${when(
          (x) =>
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
  ${widgetStyles()}
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

  .balance-row .cell {
    cursor: default;
  }

  th > div {
    display: block;
    width: 100%;
    text-align: right;
    overflow: hidden;
    font-weight: 500;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    ${ellipsis()};
  }
`;

export class PortfolioWidget extends WidgetWithInstrument {
  /**
   * @type {WidgetColumns}
   */
  @observable
  columns;

  @observable
  portfolioTrader;

  @observable
  position;

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

  constructor() {
    super();

    this.stocks = [];
    this.etfs = [];
    this.bonds = [];
    this.futures = [];
    this.zombies = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!Array.isArray(this.document.columns)) {
      this.document.columns = DEFAULT_COLUMNS;
    }

    if (!this.document.portfolioTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует портфельный трейдер.',
        keep: true
      });
    }

    try {
      this.stocksMap = new Map();
      this.etfsMap = new Map();
      this.bondsMap = new Map();
      this.futuresMap = new Map();
      this.zombiesMap = new Map();

      this.portfolioTrader = await ppp.getOrCreateTrader(
        this.document.portfolioTrader
      );
      this.instrumentTrader = this.portfolioTrader;
      this.columns = new WidgetColumns({
        columns: this.document.columns
      });

      await this.columns.registerColumns();
      this.selectInstrument(this.document.symbol, { isolate: true });

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

    return super.disconnectedCallback();
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
    if (!map?.size) {
      return [];
    }

    return Array.from(map.values()).sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
  }

  #arePositionsEqual(p1 = {}, p2 = {}) {
    return (
      p1.accountId === p2.accountId &&
      p1.averagePrice === p2.averagePrice &&
      p1.exchange === p2.exchange &&
      p1.isBalance === p2.isBalance &&
      p1.isCurrency === p2.isCurrency &&
      p1.size === p2.size &&
      p1.lot === p2.lot &&
      p1.symbol === p2.symbol
    );
  }

  positionChanged(oldValue, newValue) {
    if (newValue && !newValue.isBalance) {
      if (!newValue.instrument?.type) {
        const existing = this.zombiesMap.get(newValue.symbol);

        if (!this.#arePositionsEqual(existing, newValue)) {
          if (newValue.size !== 0)
            this.zombiesMap.set(newValue.symbol, newValue);
          else this.zombiesMap.delete(newValue.symbol);

          this.zombies = this.portfolioMapToArray(this.zombiesMap);
        }
      } else {
        const map = this[`${newValue.instrument.type}sMap`];
        const existing = map.get(newValue.symbol);

        if (!this.#arePositionsEqual(existing, newValue)) {
          if (newValue.size !== 0) map.set(newValue.symbol, newValue);
          else map.delete(newValue.symbol);

          this[`${newValue.instrument.type}s`] = this.portfolioMapToArray(map);
        }
      }
    }
  }

  getPortfolioName() {
    return '';
  }

  async validate() {
    await this.container.columnList.validate();
  }

  async submit() {
    return {
      $set: {
        portfolioTraderId: this.container.portfolioTraderId.value,
        columns: this.container.columnList.value
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
      <ppp-tabs activeid="integrations">
        <ppp-tab id="integrations">Подключения</ppp-tab>
        <ppp-tab id="columns">Столбцы таблицы</ppp-tab>
        <ppp-tab-panel id="integrations-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Портфельный трейдер</h5>
              <p class="description">
                Трейдер, который будет источником позиций в портфеле.
              </p>
            </div>
            <div class="control-line flex-start">
              <ppp-query-select
                ${ref('portfolioTraderId')}
                deselectable
                standalone
                placeholder="Опционально, нажмите для выбора"
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
                              {
                                _id: `[%#this.document.portfolioTraderId ?? ''%]`
                              }
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
        </ppp-tab-panel>
        <ppp-tab-panel id="columns-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Столбцы таблицы портфеля</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-widget-column-list
              ${ref('columnList')}
              :stencil="${() => {
                return {
                  source: COLUMN_SOURCE.SYMBOL,
                  name: ppp.t(`$const.columnSource.${COLUMN_SOURCE.SYMBOL}`)
                };
              }}"
              :list="${(x) => x.document.columns ?? DEFAULT_COLUMNS}"
              :traders="${(x) => x.document.traders}"
            ></ppp-widget-column-list>
          </div>
        </ppp-tab-panel>
      </ppp-tabs>
    `
  };
}
