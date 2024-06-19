/** @decorator */

import {
  widgetStyles,
  widgetEmptyStateTemplate,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetWithInstrumentBodyTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  attr,
  repeat,
  observable
} from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES, TRADER_DATUM, BROKERS } from '../../lib/const.js';
import {
  priceCurrencySymbol,
  formatQuantity,
  formatDateWithOptions,
  formatPriceWithoutCurrency,
  stringToFloat,
  getInstrumentPrecision,
  formatNumber
} from '../../lib/intl.js';
import { ellipsis, normalize, scrollbars } from '../../design/styles.js';
import {
  fontSizeWidget,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark4,
  paletteGrayLight1,
  paletteGrayLight2,
  themeConditional,
  toColorComponents,
  lighten,
  lineHeightWidget,
  darken
} from '../../design/design-tokens.js';
import { Tmpl } from '../../lib/tmpl.js';
import { AsyncFunction } from '../../vendor/fast-utilities.js';
import { invalidate, validate, ValidationError } from '../../lib/ppp-errors.js';
import '../button.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../tabs.js';
import '../text-field.js';
import '../widget-controls.js';
import '../widget-time-and-sales-column-list.js';

await ppp.i18n(import.meta.url);

const DEFAULT_COLUMNS = [
  {
    source: 'price',
    width: 95
  },
  {
    source: 'volume',
    width: 64
  },
  {
    source: 'amount',
    width: 95
  },
  {
    source: 'time',
    width: 100
  },
  {
    source: 'pool',
    width: 48
  }
].map((column) => {
  column.name = ppp.t(`$timeAndSalesWidget.columns.${column.source}`);

  return column;
});

export const timeAndSalesWidgetTemplate = html`
  <template @columnresize="${(x) => x.recalculateGridDimensions()}}">
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
        ${widgetWithInstrumentBodyTemplate(html`
          <table class="widget-table trades-table" ${ref('table')}>
            <thead>
              <tr @pointerdown="${(x, c) => x.beginPossibleColumnResize(c)}">
                ${repeat(
                  (x) => x.columns,
                  html`
                    <th
                      source="${(x) => x.source}"
                      :column="${(x) => x}"
                      title="${(x) => x.name}"
                      style="width:${(x, c) => c.parent.getColumnWidth(x)}"
                    >
                      <div class="resize-handle"></div>
                      <div>
                        ${(x, c) => {
                          if (x.source === 'price' || x.source === 'amount') {
                            return `${x.name}, ${priceCurrencySymbol(
                              c.parent.instrument
                            )}`;
                          }

                          return x.name;
                        }}
                      </div>
                    </th>
                  `
                )}
                <th class="empty">
                  <div class="resize-handle"></div>
                  <div></div>
                </th>
              </tr>
            </thead>
          </table>
          <div
            class="trades-grid-holder"
            ?hidden="${(x) => x.empty || !x.columns?.length}"
          >
            <div class="trades-grid-holder-inner">
              <div class="trades-grid" ${ref('grid')}></div>
            </div>
          </div>
          ${when(
            (x) => x.empty || !x.columns?.length,
            html`${html.partial(
              widgetEmptyStateTemplate(
                ppp.t('$widget.emptyState.noTradesToDisplay')
              )
            )}`
          )}
        `)}
      </div>
      <ppp-widget-notifications-area></ppp-widget-notifications-area>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const timeAndSalesWidgetStyles = css`
  .column-content {
    position: absolute;
    top: 0;
    min-width: max-content;
    left: 8px;
    right: 8px;
    width: calc(100% - 16px);
    color: ${themeConditional(paletteGrayBase, lighten(paletteGrayLight1, 10))};
  }

  :host(.highlighted-volume-enabled) .column-content.regular {
    color: ${themeConditional(darken(paletteGrayLight1, 10))};
  }

  .column-content.highlighted {
    color: ${themeConditional(paletteGrayBase, darken(paletteGrayLight2, 10))};
    font-weight: 600;
  }

  ${normalize()}
  ${widgetStyles()}
  ${scrollbars('.trades-grid-holder')}
  .trades-table {
    z-index: 2;
    position: sticky;
    top: 0;
  }

  .trades-table tr th {
    cursor: default;
  }

  .trades-table th > div {
    cursor: default;
    display: block;
    width: 100%;
    text-align: right;
    overflow: hidden;
    font-weight: 500;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    ${ellipsis()};
  }

  .trades-grid-holder {
    display: flex;
    position: relative;
    height: 100%;
    user-select: none;
  }

  .trades-grid-holder-inner {
    position: absolute;
    inset: 0;
  }

  .trades-grid {
    display: grid;
    grid-template-rows: 1fr 0;
    position: relative;
    width: 100%;
    min-width: fit-content;
    font-variant-numeric: tabular-nums;
    z-index: 0;
  }

  .column {
    pointer-events: none;
    word-wrap: break-word;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0;
    line-height: 20px;
    position: relative;
    overflow: hidden;
    white-space: pre-wrap;
    text-align: right;
    user-select: none;
    cursor: pointer;
    text-rendering: optimizeSpeed;
  }

  .rows-holder {
    position: absolute;
    z-index: -1;
    top: 0;
    cursor: pointer;
    width: 100%;
    overflow: hidden;
  }

  .rows-holder > div {
    width: 100%;
    height: 20px;
    border-bottom: 1px solid
      ${themeConditional(lighten(paletteGrayLight2, 10), paletteGrayDark4)};
  }

  .rows-holder > div:hover {
    background-color: rgba(
      ${themeConditional(
        toColorComponents(paletteGrayLight2),
        toColorComponents(paletteGrayDark1)
      )},
      0.7
    );
  }
`;

export class TimeAndSalesWidget extends WidgetWithInstrument {
  #refs = {
    price: {
      hidden: true
    },
    volume: {
      hidden: true
    },
    amount: {
      hidden: true
    },
    time: {
      hidden: true
    },
    pool: {
      hidden: true
    }
  };

  #stillGrowing;

  #rowsHolder;

  #trades = [];

  #inflyQueue = [];

  #updateNeeded = false;

  #shouldCreateColumns = true;

  isWaitingForHistory = false;

  @attr({ mode: 'boolean' })
  empty;

  @observable
  columns;

  @observable
  tradesTrader;

  @observable
  print;

  highlightedVolumeThreshold = 0;

  timeColumnOptions;

  async printChanged(oldValue, trade) {
    const threshold = await this.getThreshold(trade);

    if (this.instrumentTrader.getSymbol(this.instrument) !== trade.symbol) {
      return;
    }

    if (trade?.price) {
      this.empty = false;

      if (typeof threshold === 'number' && trade?.volume < threshold) {
        return;
      }

      if (this.isWaitingForHistory) {
        this.#inflyQueue.unshift(this.formatTrade(trade));
      } else {
        this.#trades.unshift(this.formatTrade(trade));

        while (this.#trades.length > this.document.depth) {
          this.#trades.pop();
        }

        this.#stillGrowing = this.#trades.length < this.document.depth + 1;
        this.#updateNeeded = true;
      }
    }
  }

  constructor() {
    super();

    this.rafLoop = this.rafLoop.bind(this);
    this.onRowsHolderPointerDown = this.onRowsHolderPointerDown.bind(this);

    this.clear();
  }

  async connectedCallback() {
    super.connectedCallback();

    this.timeColumnOptions = {
      default: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      },
      'day-1': {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      },
      compact: {
        hour: 'numeric',
        minute: 'numeric'
      },
      'day-2': {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    }[this.document.timeColumnOptions ?? 'default'];

    this.highlightedVolumeThreshold = Math.abs(
      stringToFloat(this.document.highlightedVolumeThreshold)
    );

    if (this.highlightedVolumeThreshold > 0) {
      this.classList.add('highlighted-volume-enabled');
    }

    if (!Array.isArray(this.document?.columns)) {
      this.document.columns = DEFAULT_COLUMNS;
    }

    this.columns = this.document.columns.filter((c) => !c.hidden);

    if (!this.document.tradesTrader) {
      this.initialized = true;

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

      this.selectInstrument(this.document.symbol, { isolate: true });
      ppp.app.rafEnqueue(this.rafLoop);
      await this.tradesTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.MARKET_PRINT
        }
      });

      this.initialized = true;
    } catch (e) {
      this.initialized = true;

      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    ppp.app.rafDequeue(this.rafLoop);
    this.#rowsHolder?.removeEventListener(
      'pointerdown',
      this.onRowsHolderPointerDown
    );

    if (this.tradesTrader) {
      await this.tradesTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.MARKET_PRINT
        }
      });
    }

    return super.disconnectedCallback();
  }

  clear() {
    this.#stillGrowing = void 0;
    this.#inflyQueue = [];
    this.#trades = [];
    this.empty = true;

    if (this.grid) {
      this.grid.style.height = '0';
    }

    if (this.#rowsHolder) {
      this.#rowsHolder.style.height = '0';
    }
  }

  formatTrade(trade) {
    return {
      rawPrice: trade.price,
      price: formatPriceWithoutCurrency(
        trade.price,
        this.instrument,
        this.instrument.broker === BROKERS.UTEX
      ),
      side: trade.side,
      volume: formatQuantity(trade.volume ?? 0, this.instrument),
      rawVolume: trade.volume,
      amount: formatNumber(+trade.volume * +trade.price, {
        minimumFractionDigits: 2,
        maximumFractionDigits: Math.max(
          2,
          getInstrumentPrecision(this.instrument)
        )
      }),
      time: formatDateWithOptions(trade.timestamp, this.timeColumnOptions),
      pool: trade.pool
    };
  }

  onRowsHolderPointerDown(event) {
    const index = Array.from(this.#rowsHolder.children).indexOf(
      event.composedPath()[0]
    );

    if (index > -1) {
      this.broadcastPrice(this.#trades[index].rawPrice);
    }
  }

  #createDOMColumns() {
    if (!this.#shouldCreateColumns) {
      return;
    }

    this.#shouldCreateColumns = false;

    const layout = [];

    for (const { source } of this.columns) {
      this.#refs[source].hidden = false;

      if (source === 'price' || source === 'amount') {
        layout.push([
          `<div class="column" source="${source}"><div class="column-content positive"></div><div class="column-content negative"></div></div>`
        ]);
      } else if (source === 'time' || source === 'pool') {
        layout.push([
          `<div class="column" source="${source}"><div class="column-content"></div></div>`
        ]);
      } else if (source === 'volume') {
        layout.push([
          `<div class="column" source="${source}"><div class="column-content regular"></div><div class="column-content highlighted"></div></div>`
        ]);
      }
    }

    layout.push(['<div class="column"></div>']);
    layout.push(['<div class="rows-holder"></div>']);

    this.grid.insertAdjacentHTML('beforeend', layout.join(''));

    if (!this.#refs.price.hidden) {
      this.#refs.price.positive = this.grid.querySelector(
        'div[source="price"] div.positive'
      );
      this.#refs.price.negative = this.grid.querySelector(
        'div[source="price"] div.negative'
      );
      this.#refs.price.th = this.table.querySelector('th[source="price"]');
    }

    if (!this.#refs.volume.hidden) {
      this.#refs.volume.regular = this.grid.querySelector(
        'div[source="volume"] div.regular'
      );
      this.#refs.volume.highlighted = this.grid.querySelector(
        'div[source="volume"] div.highlighted'
      );
      this.#refs.volume.th = this.table.querySelector('th[source="volume"]');
    }

    if (!this.#refs.amount.hidden) {
      this.#refs.amount.positive = this.grid.querySelector(
        'div[source="amount"] div.positive'
      );
      this.#refs.amount.negative = this.grid.querySelector(
        'div[source="amount"] div.negative'
      );
      this.#refs.amount.th = this.table.querySelector('th[source="amount"]');
    }

    if (!this.#refs.time.hidden) {
      this.#refs.time.content = this.grid.querySelector(
        'div[source="time"] div.column-content'
      );
      this.#refs.time.th = this.table.querySelector('th[source="time"]');
    }

    if (!this.#refs.pool.hidden) {
      this.#refs.pool.content = this.grid.querySelector(
        'div[source="pool"] div.column-content'
      );
      this.#refs.pool.th = this.table.querySelector('th[source="pool"]');
    }

    this.#rowsHolder = this.grid.querySelector('div.rows-holder');

    if ('MozAppearance' in document.documentElement.style) {
      this.#rowsHolder.style.top = '2px';
    }

    let rowsLayout = '';

    for (let i = 0; i < this.document.depth; i++) {
      rowsLayout += '<div></div>';
    }

    this.#rowsHolder.insertAdjacentHTML('beforeend', rowsLayout);
    this.#rowsHolder.addEventListener(
      'pointerdown',
      this.onRowsHolderPointerDown
    );
    this.recalculateGridDimensions();
  }

  recalculateGridDimensions() {
    if (this.grid) {
      const values = [];

      for (const { source } of this.columns) {
        values.push(
          this.#refs[source].th?.style.width || this.getColumnWidth({ source })
        );
      }

      values.push('1fr');

      this.grid.style.gridTemplateColumns = values.join(' ');
    }
  }

  rafLoop() {
    if (
      this.$fastController.isConnected &&
      this.#updateNeeded &&
      typeof this.grid !== 'undefined'
    ) {
      this.#updateNeeded = false;

      this.#repaint();
    }
  }

  #repaint() {
    this.#createDOMColumns();

    if (this.#stillGrowing || typeof this.#stillGrowing === 'undefined') {
      this.grid.style.height = `${this.#trades.length * 20}px`;
      this.#rowsHolder.style.height = `${this.#trades.length * 20}px`;
    }

    let positivePriceValues = '';
    let negativePriceValues = '';
    let regularVolumeValues = '';
    let highlightedVolumeValues = '';
    let positiveAmountValues = '';
    let negativeAmountValues = '';
    let timeValues = '';
    let poolValues = '';

    for (let i = 0; i < this.#trades.length; i++) {
      const trade = this.#trades[i];

      if (!this.#refs.price.hidden) {
        if (trade.side === 'buy') {
          positivePriceValues += `${trade.price}\n`;
          negativePriceValues += '\n';
        } else {
          positivePriceValues += '\n';
          negativePriceValues += `${trade.price}\n`;
        }
      }

      if (!this.#refs.volume.hidden) {
        if (this.highlightedVolumeThreshold > 0) {
          if (trade.rawVolume >= this.highlightedVolumeThreshold) {
            highlightedVolumeValues += `${trade.volume}\n`;
            regularVolumeValues += '\n';
          } else {
            regularVolumeValues += `${trade.volume}\n`;
            highlightedVolumeValues += '\n';
          }
        } else {
          regularVolumeValues += `${trade.volume}\n`;
        }
      }

      if (!this.#refs.amount.hidden) {
        if (trade.side === 'buy') {
          positiveAmountValues += `${trade.amount}\n`;
          negativeAmountValues += '\n';
        } else {
          positiveAmountValues += '\n';
          negativeAmountValues += `${trade.amount}\n`;
        }
      }

      if (!this.#refs.time.hidden) {
        timeValues += `${trade.time}\n`;
      }

      if (!this.#refs.pool.hidden) {
        poolValues += `${trade.pool}\n`;
      }
    }

    if (!this.#refs.price.hidden) {
      this.#refs.price.positive.textContent = positivePriceValues;
      this.#refs.price.negative.textContent = negativePriceValues;
    }

    if (!this.#refs.volume.hidden) {
      this.#refs.volume.regular.textContent = regularVolumeValues;
      this.#refs.volume.highlighted.textContent = highlightedVolumeValues;
    }

    if (!this.#refs.amount.hidden) {
      this.#refs.amount.positive.textContent = positiveAmountValues;
      this.#refs.amount.negative.textContent = negativeAmountValues;
    }

    if (!this.#refs.time.hidden) {
      this.#refs.time.content.textContent = timeValues;
    }

    if (!this.#refs.pool.hidden) {
      this.#refs.pool.content.textContent = poolValues;
    }
  }

  getColumnWidth(column) {
    if (typeof column.width === 'number') {
      return `${Math.max(32, column.width)}px`;
    } else {
      const defaultColumn = DEFAULT_COLUMNS.find(
        (c) => c.source === column.source
      );

      if (defaultColumn) {
        return `${defaultColumn.width}px`;
      } else {
        return '70px';
      }
    }
  }

  async getThreshold(trade) {
    const threshold = +this.document.threshold.toString().replace(',', '.');

    if (!isNaN(threshold) && typeof threshold === 'number') {
      return threshold;
    } else {
      const evaluated = await new AsyncFunction(
        'widget',
        'print',
        await new Tmpl().render(this, this.document.threshold, {})
      )(this, trade);

      if (isNaN(evaluated) || typeof evaluated !== 'number') {
        return 0;
      } else {
        return evaluated;
      }
    }
  }

  async instrumentChanged(oldValue, newValue) {
    super.instrumentChanged(oldValue, newValue);
    this.clear();

    if (this.tradesTrader) {
      if (
        this.instrument &&
        typeof this.tradesTrader.historicalTimeAndSales === 'function' &&
        !this.unsupportedInstrument
      ) {
        try {
          this.isWaitingForHistory = true;

          try {
            for (const trade of (await this.tradesTrader.historicalTimeAndSales(
              {
                instrument: this.instrument,
                depth: this.document.depth
              }
            )) ?? []) {
              const threshold = await this.getThreshold(trade);

              if (typeof threshold === 'number' && trade.volume >= threshold) {
                this.#trades.push(this.formatTrade(trade));
              }
            }
          } finally {
            this.isWaitingForHistory = false;
          }

          if (this.#inflyQueue.length) {
            this.#trades.unshift(...this.#inflyQueue);
            this.#inflyQueue = [];
          }

          if (this.#trades.length) {
            this.empty = false;
            this.#updateNeeded = true;
          }

          while (this.#trades.length > this.document.depth) {
            this.#trades.pop();
          }
        } catch (e) {
          console.error(e);

          return this.notificationsArea.error({
            title: 'Лента всех сделок',
            text: 'Не удалось загрузить историю сделок.'
          });
        }
      }
    }
  }

  async validate() {
    await this.container.columnList.validate();

    await validate(this.container.depth);
    await validate(this.container.depth, {
      hook: async (value) => +value > 0 && +value <= 500,
      errorMessage: 'Введите значение в диапазоне от 1 до 500'
    });
    await validate(this.container.threshold);

    // Plain text (code) or number. Check manually.
    const threshold = +this.container.threshold.value
      .toString()
      .replace(',', '.');

    if (!isNaN(threshold) && typeof threshold === 'number') {
      await validate(this.container.threshold, {
        hook: async (value) => {
          const v = stringToFloat(value);

          return v >= 0 && v <= 10000000;
        },
        errorMessage: 'Введите значение в диапазоне от 0 до 10000000'
      });
    } else {
      try {
        const evaluated = await new AsyncFunction(
          'widget',
          await new Tmpl().render(this, this.container.threshold.value, {})
        )(this);

        if (isNaN(evaluated) || typeof evaluated !== 'number') {
          // noinspection ExceptionCaughtLocallyJS
          throw new ValidationError({
            element: this.container.threshold
          });
        }
      } catch (e) {
        console.dir(e);

        invalidate(this.container.threshold, {
          errorMessage: 'Код содержит ошибки.',
          raiseException: true
        });
      }
    }
  }

  async submit() {
    return {
      $set: {
        tradesTraderId: this.container.tradesTraderId.value,
        columns: this.container.columnList.value,
        threshold: this.container.threshold.value,
        timeColumnOptions: this.container.timeColumnOptions.value,
        depth: this.container.depth.value
          ? Math.trunc(Math.abs(this.container.depth.value))
          : '',
        highlightedVolumeThreshold:
          this.container.highlightedVolumeThreshold.value
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
    defaultWidth: 320,
    defaultHeight: 350,
    settings: html`
      <ppp-tabs activeid="main">
        <ppp-tab id="main">Подключения</ppp-tab>
        <ppp-tab id="columns">Столбцы</ppp-tab>
        <ppp-tab id="filter">Фильтр</ppp-tab>
        <ppp-tab id="ui">UI</ppp-tab>
        <ppp-tab-panel id="main-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Трейдер ленты</h5>
              <p class="description">
                Трейдер, который будет источником ленты сделок.
              </p>
            </div>
            <div class="control-line flex-start">
              <ppp-query-select
                ${ref('tradesTraderId')}
                deselectable
                standalone
                placeholder="Опционально, нажмите для выбора"
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
                            caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_TIME_AND_SALES%]`
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
        </ppp-tab-panel>
        <ppp-tab-panel id="columns-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Столбцы таблицы сделок</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-widget-time-and-sales-column-list
              ${ref('columnList')}
              :stencil="${() => {
                return {};
              }}"
              :list="${(x) => x.document.columns ?? DEFAULT_COLUMNS}"
              :orders="${(x) => x.document.orders}"
            ></ppp-widget-time-and-sales-column-list>
          </div>
        </ppp-tab-panel>
        <ppp-tab-panel id="filter-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Фильтр объёма</h5>
              <p class="description">
                Сделки с объёмом меньше указанного не будут отображены в ленте.
                Чтобы всегда отображать все сделки, введите 0. Можно вводить
                целые, дробные числа или код тела функции JavaScript.
              </p>
            </div>
            <div class="widget-settings-input-group">
              <ppp-snippet
                standalone
                :code="${(x) => x.document.threshold ?? '0'}"
                ${ref('threshold')}
              ></ppp-snippet>
            </div>
          </div>
        </ppp-tab-panel>
        <ppp-tab-panel id="ui-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Формат отображения времени</h5>
            </div>
            <div class="spacing2"></div>
            <div class="widget-settings-input-group">
              <ppp-radio-group
                orientation="vertical"
                value="${(x) => x.document.timeColumnOptions ?? 'default'}"
                ${ref('timeColumnOptions')}
              >
                <ppp-radio value="default">Часы, минуты, секунды</ppp-radio>
                <ppp-radio value="day-1">День, часы, минуты, секунды</ppp-radio>
                <ppp-radio value="compact">Часы, минуты</ppp-radio>
                <ppp-radio value="day-2">День, часы, минуты</ppp-radio>
              </ppp-radio-group>
            </div>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Количество сделок для отображения</h5>
              <p class="description">
                Максимальное количество сделок, отображаемое в ленте.
              </p>
            </div>
            <div class="widget-settings-input-group">
              <ppp-text-field
                standalone
                type="number"
                placeholder="100"
                value="${(x) => x.document.depth ?? 100}"
                ${ref('depth')}
              ></ppp-text-field>
            </div>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Выделение сделок по объёму</h5>
              <p class="description">
                Будут выделяться сделки с объёмом не меньше заданного.
              </p>
            </div>
            <div class="widget-settings-input-group">
              <ppp-text-field
                standalone
                type="number"
                placeholder="Нет"
                value="${(x) => x.document.highlightedVolumeThreshold ?? ''}"
                ${ref('highlightedVolumeThreshold')}
              ></ppp-text-field>
            </div>
          </div>
        </ppp-tab-panel>
      </ppp-tabs>
    `
  };
}
