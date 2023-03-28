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
  repeat,
  observable,
  Observable
} from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES, TRADER_DATUM, TRADER_CAPS } from '../../lib/const.js';
import {
  priceCurrencySymbol,
  formatQuantity,
  formatDate,
  formatPriceWithoutCurrency
} from '../../lib/intl.js';
import { ellipsis, normalize } from '../../design/styles.js';
import {
  buy,
  fontSizeWidget,
  lighten,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark4,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteWhite,
  sell,
  themeConditional,
  toColorComponents
} from '../../design/design-tokens.js';
import { validate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';

export const timeAndSalesWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control></ppp-widget-group-control>
          <ppp-widget-search-control></ppp-widget-search-control>
          <span class="widget-title">
            <span class="title">${(x) => x.document?.name ?? ''}</span>
          </span>
          <ppp-widget-header-buttons></ppp-widget-header-buttons>
        </div>
      </div>
      <div class="widget-body">
        ${when(
          (x) => !x.instrument,
          html`${html.partial(
            widgetEmptyStateTemplate('Выберите инструмент.')
          )}`
        )}
        ${when(
          (x) =>
            x.tradesTrader &&
            x.instrument &&
            !x.tradesTrader.supportsInstrument(x.instrument),
          html`${html.partial(
            widgetEmptyStateTemplate('Инструмент не поддерживается.')
          )}`
        )}
        ${when(
          (x) =>
            x.tradesTrader &&
            x.instrument &&
            x.tradesTrader.supportsInstrument(x.instrument),
          html`
            <table class="trades-table">
              <thead>
                <tr>
                  <th>
                    ${(x) =>
                      x.instrument
                        ? 'Цена, ' + priceCurrencySymbol(x.instrument)
                        : 'Цена'}
                  </th>
                  <th>Количество</th>
                  <th>Время</th>
                  <th
                    style="display: ${(x) =>
                      x.tradesTrader &&
                      x.tradesTrader.hasCap(TRADER_CAPS.CAPS_MIC)
                        ? 'table-cell'
                        : 'none'}"
                  >
                    MM
                  </th>
                </tr>
              </thead>
              <tbody @click="${(x, c) => x.handleTableClick(c)}">
                ${repeat(
                  (x) => x.trades ?? [],
                  html`
                    <tr
                      class="price-line"
                      side="${(x) => x.side}"
                      price="${(x) => x.price}"
                    >
                      <td>
                        <div class="cell">
                          ${(x, c) =>
                            formatPriceWithoutCurrency(
                              x.price,
                              c.parent.instrument
                            )}
                        </div>
                      </td>
                      <td>
                        <div class="cell">
                          ${(x, c) =>
                            formatQuantity(x.volume ?? 0, c.parent.instrument)}
                        </div>
                      </td>
                      <td>
                        <div class="cell">
                          ${(x) => formatDate(x.timestamp)}
                        </div>
                      </td>
                      <td
                        style="display: ${(x, c) =>
                          c.parent.tradesTrader &&
                          c.parent.tradesTrader.hasCap(TRADER_CAPS.CAPS_MIC)
                            ? 'table-cell'
                            : 'none'}"
                      >
                        <div class="cell">${(x) => x.pool}</div>
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
            ${when(
              (x) => !x.trades?.length,
              html`${html.partial(
                widgetEmptyStateTemplate('Лента сделок пуста.')
              )}`
            )}
          `
        )}
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const timeAndSalesWidgetStyles = css`
  ${normalize()}
  ${widget()}
  .trades-table {
    text-align: left;
    min-width: 140px;
    width: 100%;
    padding: 0;
    user-select: none;
    border-collapse: collapse;
  }

  .trades-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    width: 50%;
    height: 28px;
    padding: 4px 8px;
    font-weight: 500;
    font-size: ${fontSizeWidget};
    line-height: 20px;
    white-space: nowrap;
    color: ${themeConditional(
      paletteGrayDark1,
      lighten(paletteGrayLight1, 10)
    )};
    background: ${themeConditional(paletteWhite, paletteBlack)};
  }

  .trades-table th::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    display: block;
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  .trades-table .cell {
    padding: 2px 4px;
    font-variant-numeric: tabular-nums;
    color: ${themeConditional(paletteGrayBase, lighten(paletteGrayLight1, 10))};
  }

  .trades-table tr[side='buy'] {
    background-color: rgba(
      ${toColorComponents(buy)},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
  }

  .trades-table tr[side='sell'] {
    background-color: rgba(
      ${toColorComponents(sell)},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
  }

  .trades-table tr:hover {
    background-color: rgba(
      ${themeConditional(
        toColorComponents(paletteGrayLight2),
        toColorComponents(paletteGrayDark1)
      )},
      0.7
    );
  }

  .trades-table td {
    width: 50%;
    padding: 0;
    border: none;
    border-bottom: 1px solid
      ${themeConditional(lighten(paletteGrayLight2, 10), paletteGrayDark4)};
    background: transparent;
    cursor: pointer;
    font-size: ${fontSizeWidget};
    ${ellipsis()};
  }

  .trades-table .cell:last-child {
    margin-right: 8px;
  }
`;

export class TimeAndSalesWidget extends WidgetWithInstrument {
  @observable
  tradesTrader;

  @observable
  print;

  @observable
  trades;

  constructor() {
    super();

    this.trades = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.tradesTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер ленты.',
        keep: true
      });
    }

    try {
      this.tradesTrader = await ppp.getOrCreateTrader(
        this.document.tradesTrader
      );
      this.instrumentTrader = this.tradesTrader;

      this.selectInstrument(
        this.tradesTrader.instruments.get(this.document.symbol),
        { isolate: true }
      );

      if (this.tradesTrader) {
        if (
          this.instrument &&
          typeof this.tradesTrader.allTrades === 'function'
        ) {
          try {
            this.trades = (
              await this.tradesTrader.allTrades({
                instrument: this.instrument,
                depth: this.document.depth
              })
            )?.filter((t) => {
              if (this.document.threshold) {
                return t.volume >= this.document.threshold;
              } else return true;
            });
          } catch (e) {
            console.error(e);

            return this.notificationsArea.error({
              title: 'Лента всех сделок',
              text: 'Не удалось загрузить историю сделок.'
            });
          }
        }

        await this.tradesTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            print: TRADER_DATUM.MARKET_PRINT
          }
        });
      }
    } catch (e) {
      return this.catchException(e);
    }
  }

  handleTableClick({ event }) {
    const price = parseFloat(
      event
        .composedPath()
        .find((n) => n?.classList?.contains('price-line'))
        ?.getAttribute('price')
    );

    return this.broadcastPrice(price);
  }

  printChanged(oldValue, newValue) {
    if (newValue?.price) {
      if (
        this.document.threshold &&
        newValue?.volume < this.document.threshold
      ) {
        return;
      }

      this.trades.unshift(newValue);

      while (this.trades.length > this.document.depth) {
        this.trades.pop();
      }

      Observable.notify(this, 'trades');
    }
  }

  async disconnectedCallback() {
    if (this.tradesTrader) {
      await this.tradesTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.MARKET_PRINT
        }
      });
    }

    super.disconnectedCallback();
  }

  async instrumentChanged(oldValue, newValue) {
    this.trades = [];

    super.instrumentChanged(oldValue, newValue);

    if (this.tradesTrader) {
      if (
        this.instrument &&
        typeof this.tradesTrader.allTrades === 'function'
      ) {
        this.trades = (
          await this.tradesTrader.allTrades({
            instrument: this.instrument,
            depth: this.document.depth
          })
        )?.filter((t) => {
          if (this.document.threshold) {
            return t.volume >= this.document.threshold;
          } else return true;
        });
      }

      await this.tradesTrader.instrumentChanged?.(this, oldValue, newValue);
    }
  }

  async validate() {
    await validate(this.container.tradesTraderId);
    await validate(this.container.depth);
    await validate(this.container.depth, {
      hook: async (value) => +value > 0 && +value <= 300,
      errorMessage: 'Введите значение в диапазоне от 1 до 300'
    });

    if (this.container.threshold.value) {
      await validate(this.container.threshold, {
        hook: async (value) =>
          +value.replace(',', '.') >= 0 && +value.replace(',', '.') <= 10000000,
        errorMessage: 'Введите значение в диапазоне от 0 до 10000000'
      });
    }
  }

  async submit() {
    return {
      $set: {
        depth: Math.abs(this.container.depth.value),
        tradesTraderId: this.container.tradesTraderId.value,
        threshold: +this.container.threshold.value.replace(',', '.') || ''
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.TIME_AND_SALES,
    collection: 'PPP',
    title: html`Лента всех сделок`,
    tags: ['Лента обезличенных сделок'],
    description: html`<span class="positive">Лента всех сделок</span> отображает
      обезличенные сделки с финансовым инструментом по всем доступным рыночным
      центрам.`,
    customElement: TimeAndSalesWidget.compose({
      template: timeAndSalesWidgetTemplate,
      styles: timeAndSalesWidgetStyles
    }).define(),
    minWidth: 140,
    minHeight: 120,
    defaultWidth: 280,
    defaultHeight: 375,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер ленты</h5>
          <p class="description">
            Трейдер, который будет источником ленты сделок.
          </p>
        </div>
        <div class="control-line">
          <ppp-query-select
            ${ref('tradesTraderId')}
            value="${(x) => x.document.tradesTraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.tradesTrader ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('traders')
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_TIME_AND_SALES%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.tradesTraderId ?? ''%]` }
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
          <h5>Глубина истории ленты</h5>
          <p class="description">
            Количество записей, запрашиваемое из истории сделок текущего дня при
            смене торгового инструмента в виджете.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            type="number"
            placeholder="20"
            value="${(x) => x.document.depth ?? 20}"
            ${ref('depth')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Фильтр объёма</h5>
          <p class="description">
            Сделки с объёмом меньше указанного не будут отображены в ленте.
            Чтобы всегда отображать все сделки, введите 0 или не заполняйте
            поле.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            placeholder="Фильтр объёма"
            value="${(x) => x.document.threshold ?? 0}"
            @beforeinput="${(x, { event }) => {
              return event.data === null || /[0-9.,]/.test(event.data);
            }}"
            ${ref('threshold')}
          ></ppp-text-field>
        </div>
      </div>
    `
  };
}
