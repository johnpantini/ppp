/** @decorator */

import ppp from '../../ppp.js';
import { ListWidget, listWidgetStyles, listWidgetTemplate } from './list.js';
import { WidgetColumns } from '../widget-columns.js';
import {
  Observable,
  html,
  observable,
  ref
} from '../../vendor/fast-element.min.js';
import { COLUMN_SOURCE, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../checkbox.js';
import '../draggable-stack.js';
import '../query-select.js';
import '../tabs.js';
import '../text-field.js';
import '../widget-column-list.js';
import '../widget-controls.js';

await ppp.i18n(import.meta.url);

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
    source: COLUMN_SOURCE.LAST_PRICE,
    highlightChanges: true
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

export class PortfolioWidget extends ListWidget {
  @observable
  portfolioTrader;

  @observable
  position;

  positions = new Map();

  rowsCache = new Map();

  positionChanged(oldValue, newValue) {
    const type = newValue?.instrument?.type;

    if (!newValue?.isBalance && type) {
      if (
        this.document[
          {
            stock: 'showStocksFlag',
            bond: 'showBondsFlag',
            etf: 'showEtfsFlag',
            future: 'showFuturesFlag',
            cryptocurrency: 'showCryptoFlag'
          }[type]
        ] ??
        true
      ) {
        const size = newValue.size;
        const symbol = newValue.symbol;
        const currency = newValue.instrument.currency;

        if (size) this.positions.set(symbol, newValue);
        else this.positions.delete(symbol);

        let row = this.rowsCache.get(`${symbol}:${currency}`);

        if (typeof row === 'undefined') {
          if (size) {
            row = this.appendRow({
              symbol,
              traderId: this.document.portfolioTraderId
            });

            row.setAttribute('currency', currency);
            this.rowsCache.set(`${symbol}:${currency}`, row);
          }
        } else {
          if (!size) {
            this.rowsCache.delete(`${symbol}:${currency}`);
            row.remove();
          }
        }
      }
    }

    if (this.positions.size) {
      this.document.listSource = [{}];
    } else {
      this.document.listSource = [];
    }

    Observable.notify(this, 'document');
  }

  async connectedCallback() {
    await super.connectedCallback();

    this.initialized = false;
    this.deletionAvailable = false;

    if (!this.document.portfolioTrader) {
      this.initialized = true;

      return this.notificationsArea.error({
        text: 'Отсутствует портфельный трейдер.',
        keep: true
      });
    }

    try {
      this.portfolioTrader = await ppp.getOrCreateTrader(
        this.document.portfolioTrader
      );
      this.instrumentTrader = this.portfolioTrader;

      this.selectInstrument(this.document.symbol, { isolate: true });

      this.columns = new WidgetColumns({
        columns: this.document.columns ?? DEFAULT_COLUMNS
      });

      await this.columns.registerColumns();

      this.columnsArray = this.columns.array;

      await this.portfolioTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          position: TRADER_DATUM.POSITION
        }
      });

      this.initialized = true;
    } catch (e) {
      this.initialized = true;

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

  async validate() {
    await this.container.columnList.validate();
  }

  async submit() {
    return {
      $set: {
        portfolioTraderId: this.container.portfolioTraderId.value,
        showStocksFlag: this.container.showStocksFlag.checked,
        showBondsFlag: this.container.showBondsFlag.checked,
        showEtfsFlag: this.container.showEtfsFlag.checked,
        showFuturesFlag: this.container.showFuturesFlag.checked,
        showCryptoFlag: this.container.showCryptoFlag.checked,
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
      сводку по всем открытым позициям.`,
    customElement: PortfolioWidget.compose({
      template: listWidgetTemplate,
      styles: listWidgetStyles
    }).define(),
    minWidth: 275,
    minHeight: 120,
    defaultWidth: 620,
    defaultHeight: 350,
    settings: html`
      <ppp-tabs activeid="integrations">
        <ppp-tab id="main">Основные настройки</ppp-tab>
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
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Типы инструментов для отображения</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-checkbox
              ?checked="${(x) => x.document.showStocksFlag ?? true}"
              ${ref('showStocksFlag')}
            >
              Акции
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showBondsFlag ?? true}"
              ${ref('showBondsFlag')}
            >
              Облигации
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showEtfsFlag ?? true}"
              ${ref('showEtfsFlag')}
            >
              Фонды
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showFuturesFlag ?? true}"
              ${ref('showFuturesFlag')}
            >
              Фьючерсы
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showCryptoFlag ?? true}"
              ${ref('showCryptoFlag')}
            >
              Криптовалюты
            </ppp-checkbox>
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
