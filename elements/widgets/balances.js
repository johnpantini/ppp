/** @decorator */

import {
  widgetStyles,
  Widget,
  widgetEmptyStateTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import {
  html,
  css,
  ref,
  observable,
  repeat,
  when
} from '../../vendor/fast-element.min.js';
import { COLUMN_SOURCE, WIDGET_TYPES, TRADER_DATUM } from '../../lib/const.js';
import { normalize, spacing } from '../../design/styles.js';
import { WidgetColumns } from '../widget-columns.js';
import '../button.js';
import '../query-select.js';
import '../snippet.js';
import '../text-field.js';
import '../widget-controls.js';

export const balancesWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <span class="widget-title">
            <span class="title">${(x) => x.document?.name ?? ''}</span>
          </span>
          <ppp-widget-header-buttons></ppp-widget-header-buttons>
        </div>
      </div>
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
        ${when(
          (x) => x?.balances?.length,
          html`
            <div class="spacing1"></div>
            <div class="widget-section">
              <div class="widget-summary">
                ${repeat(
                  (x) => x.balances,
                  html`
                    <div class="widget-summary-line">
                      <span
                        :trader="${(x, c) => c.parent.balancesTrader}"
                        :payload="${(x) => x}"
                        :column="${(x, c) =>
                          c.parent.columnsBySource.get(
                            COLUMN_SOURCE.INSTRUMENT
                          )}"
                      >
                        ${(x, c) =>
                          c.parent.columns.columnElement(
                            c.parent.columnsBySource.get(
                              COLUMN_SOURCE.INSTRUMENT
                            ),
                            x.symbol
                          )}
                      </span>
                      <span
                        :trader="${(x, c) => c.parent.balancesTrader}"
                        :payload="${(x) => x}"
                        :column="${(x, c) => {
                          const column = c.parent.columnsBySource.get(
                            COLUMN_SOURCE.POSITION_AVAILABLE
                          );

                          column.hideBalances = c.parent.document.hideBalances;

                          return column;
                        }}"
                      >
                        ${(x, c) =>
                          c.parent.columns.columnElement(
                            c.parent.columnsBySource.get(
                              COLUMN_SOURCE.POSITION_AVAILABLE
                            ),
                            x.symbol
                          )}
                      </span>
                    </div>
                  `
                )}
              </div>
            </div>
          `,
          html`${html.partial(
            widgetEmptyStateTemplate('Нет балансов для отображения.', {
              hideGlyph: true
            })
          )}`
        )}
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const balancesWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  ${spacing()}
  .widget-summary-line::after {
    content: unset;
    display: none;
  }
`;

export class BalancesWidget extends Widget {
  @observable
  balancesTrader;

  @observable
  position;

  positionChanged(oldValue, newValue) {
    if (newValue) {
      if (newValue.isBalance) {
        const existing = this.balancesMap.get(newValue.symbol);

        if (!this.#sameCurrency(existing, newValue)) {
          if (newValue.size !== 0)
            this.balancesMap.set(newValue.symbol, newValue);
          else this.balancesMap.delete(newValue.symbol);

          this.balances = this.balancesMapToArray();
        }
      }
    }
  }

  @observable
  balances;

  /**
   * @type {WidgetColumns}
   */
  @observable
  columns;

  columnsBySource = new Map();

  constructor() {
    super();

    this.balances = [];
  }

  #sameCurrency(p1 = {}, p2 = {}) {
    return p1.symbol === p2.symbol;
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.balancesTrader) {
      const emptyStateText = this.shadowRoot.querySelector(
        '.widget-empty-state-holder span'
      );

      if (emptyStateText) {
        emptyStateText.textContent = 'Не задан портфельный трейдер.';
      }

      return;
    }

    try {
      this.balancesMap = new Map();
      this.columns = new WidgetColumns({
        columns: [
          {
            source: COLUMN_SOURCE.LAST_PRICE,
            highlightChanges: this.document.highlightLastPriceChanges
          },
          {
            source: COLUMN_SOURCE.INSTRUMENT
          },
          {
            source: COLUMN_SOURCE.POSITION_AVAILABLE
          }
        ]
      });

      await this.columns.registerColumns();

      this.columns.array.forEach((column) => {
        this.columnsBySource.set(column.source, column);
      });

      this.balancesTrader = await ppp.getOrCreateTrader(
        this.document.balancesTrader
      );

      await this.balancesTrader.subscribeFields?.({
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
    if (this.balancesTrader) {
      await this.balancesTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          position: TRADER_DATUM.POSITION
        }
      });
    }

    return super.disconnectedCallback();
  }

  balancesMapToArray() {
    if (!this.balancesMap?.size) {
      return [];
    }

    return Array.from(this.balancesMap.values()).sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
  }

  async validate() {
    // No-op.
  }

  async submit() {
    return {
      $set: {
        balancesTraderId: this.container.balancesTraderId.value,
        hideBalances: this.container.hideBalances.checked
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.BALANCES,
    collection: 'PPP',
    title: html`Балансы`,
    description: html`Виджет <span class="positive">Балансы</span> отображает
      денежные или иные активы, использующиеся для открытия позиций.`,
    customElement: BalancesWidget.compose({
      template: balancesWidgetTemplate,
      styles: balancesWidgetStyles
    }).define(),
    minWidth: 200,
    minHeight: 62,
    defaultWidth: 275,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Портфельный трейдер</h5>
          <p class="description">
            Трейдер, который будет источником балансовых позиций.
          </p>
        </div>
        <div class="control-line flex-start">
          <ppp-query-select
            ${ref('balancesTraderId')}
            deselectable
            standalone
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.balancesTraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.balancesTrader ?? ''}"
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
                            _id: `[%#this.document.balancesTraderId ?? ''%]`
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
          <h5>Интерфейс</h5>
        </div>
        <ppp-checkbox
          ?checked="${(x) => x.document.hideBalances ?? false}"
          ${ref('hideBalances')}
        >
          Скрывать значения
        </ppp-checkbox>
      </div>
    `
  };
}
