/** @decorator */

import ppp from '../../ppp.js';
import {
  widgetStyles,
  widgetEmptyStateTemplate,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetUnsupportedInstrumentTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  attr,
  Updates,
  repeat
} from '../../vendor/fast-element.min.js';
import { TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import {
  normalize,
  spacing,
  getTraderSelectOptionColor
} from '../../design/styles.js';
import { createChart, CrosshairMode, LineStyle } from '../../lib/ppp-charts.js';
import {
  bodyFont,
  chartBorderDownColor,
  chartBorderUpColor,
  chartDownColor,
  chartUpColor,
  chartWickDownColor,
  chartWickUpColor,
  fontSizeWidget,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenDark1,
  paletteGreenLight2,
  paletteRedDark1,
  paletteRedLight3,
  paletteWhite,
  darken,
  themeConditional,
  toColorComponents,
  lineHeightWidget,
  fontWeightWidget,
  positive,
  negative
} from '../../design/design-tokens.js';
import { arrowRight, trash } from '../../static/svg/sprite.js';
import {
  formatAmount,
  formatPriceWithoutCurrency,
  formatRelativeChange,
  formatVolume,
  getInstrumentPrecision
} from '../../lib/intl.js';
import '../button.js';
import '../query-select.js';
import '../tabs.js';
import '../text-field.js';
import '../widget-controls.js';
import '../widget-timeframe-list.js';

export const DEFAULT_TIMEFRAMES = [
  {
    name: '1D',
    unit: 'Day',
    value: 1,
    hidden: false
  }
];

export const lightChartWidgetTemplate = html`
  <template>
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate({
        buttons: html`
          <div
            ?hidden="${(x) => !x.document.showResetButton}"
            title="Очистить виджет"
            class="button"
            slot="start"
            @click="${(x) => {
              x.setData([]);
            }}"
          >
            ${html.partial(trash)}
          </div>
          <div
            ?hidden="${(x) => !x.ready}"
            title="Перейти в конец графика"
            class="button"
            slot="start"
            @click="${(x) => x.scrollToEnd()}"
          >
            ${html.partial(arrowRight)}
          </div>
        `
      })}
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
        ${when(
          (x) => !x.initialized,
          html`${html.partial(
            widgetEmptyStateTemplate(ppp.t('$widget.emptyState.loading'), {
              extraClass: 'loading-animation'
            })
          )}`
        )}
        ${when(
          (x) => x.initialized && !x.instrument?.symbol,
          html`${html.partial(
            widgetEmptyStateTemplate(
              ppp.t('$widget.emptyState.selectInstrument')
            )
          )}`
        )}
        ${widgetUnsupportedInstrumentTemplate()}
        <div
          class="chart-holder"
          ?hidden="${(x) =>
            !x.initialized ||
            !x.instrument?.symbol ||
            (x.instrument && x.instrumentTrader && x.unsupportedInstrument)}"
        >
          <ppp-widget-tabs
            ${ref('tfSelector')}
            activeid="${(x) => x.getActiveTimeframeTab()}"
            variant="compact"
            ?hidden="${(x) => !(x.document.showToolbar ?? true)}"
            @change="${(x, { event }) => {
              const activeTimeFrameTab = +event.detail.id;

              x.timeframeChanged(x.timeframes[activeTimeFrameTab - 1]);

              return x.updateDocumentFragment({
                $set: {
                  'widgets.$.activeTimeFrameTab': activeTimeFrameTab
                }
              });
            }}"
          >
            ${repeat(
              (x) => x.timeframes,
              html`
                <ppp-widget-tab id="${(x, c) => c.index + 1}">
                  ${(x) => x.name}
                </ppp-widget-tab>
                <ppp-tab-panel id="${(x, c) => c.index + 1}"></ppp-tab-panel>
              `,
              { positioning: true }
            )}
          </ppp-widget-tabs>
          <div class="chart-holder-inner">
            <div class="toolbar"></div>
            <div class="chart">
              <div
                class="price-info-holder${(x) =>
                  x.openPrice <= x.closePrice ? ' positive' : ' negative'}"
                ?hidden="${(x) => !x.shouldShowPriceInfo}"
              >
                <div class="price-info-holder-stack">
                  <div class="ohlcv-line">
                    <div class="pair">
                      <span>O</span>
                      <span class="ohlcv">
                        ${(x) =>
                          typeof x.openPrice === 'number'
                            ? x.priceFormatter(x.openPrice)
                            : ''}
                      </span>
                    </div>
                    <div class="pair">
                      <span>H</span>
                      <span class="ohlcv">
                        ${(x) =>
                          typeof x.highPrice === 'number'
                            ? x.priceFormatter(x.highPrice)
                            : ''}
                      </span>
                    </div>
                    <div class="pair">
                      <span>L</span>
                      <span class="ohlcv">
                        ${(x) =>
                          typeof x.lowPrice === 'number'
                            ? x.priceFormatter(x.lowPrice)
                            : ''}
                      </span>
                    </div>
                    <div class="pair">
                      <span>C</span>
                      <span class="ohlcv">
                        ${(x) =>
                          typeof x.closePrice === 'number'
                            ? x.priceFormatter(x.closePrice)
                            : ''}
                      </span>
                    </div>
                    <div class="pair">
                      <span class="ohlcv">
                        ${(x) =>
                          typeof x.absoluteChange === 'number' && x?.instrument
                            ? formatAmount(x.absoluteChange, x.instrument, {
                                signDisplay: 'always',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: Math.max(
                                  2,
                                  getInstrumentPrecision(
                                    x.instrument,
                                    x.absoluteChange
                                  )
                                )
                              })
                            : ''}
                      </span>
                    </div>
                    <div class="pair">
                      <span class="ohlcv">
                        ${(x) =>
                          typeof x.relativeChange === 'number'
                            ? formatRelativeChange(x.relativeChange)
                            : ''}
                      </span>
                    </div>
                  </div>
                  <div class="ohlcv-line">
                    <div class="pair volume">
                      <span>Volume</span>
                      <span class="ohlcv">
                        ${(x) =>
                          typeof x.volume === 'number'
                            ? formatVolume(x.volume)
                            : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ppp-widget-notifications-area></ppp-widget-notifications-area>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const lightChartWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  ${spacing()}
  .chart-holder {
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    height: 100%;
    width: 100%;
    position: relative;
  }

  .chart-holder-inner {
    position: relative;
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
    user-select: none;
    flex-direction: column;
  }

  .chart {
    flex-grow: 1;
    position: absolute;
    height: 100%;
    width: 100%;
    border-top: 1px solid
      ${themeConditional(darken(paletteGrayLight3, 5), paletteGrayDark1)};
  }

  .price-info-holder {
    position: absolute;
    margin: 2px 10px;
    left: 0;
    top: 0;
    z-index: 2;
    pointer-events: none;
  }

  .price-info-holder-stack {
    display: flex;
    flex-direction: column;
    gap: 4px 0;
  }

  .ohlcv-line {
    display: flex;
    flex-direction: row;
    gap: 0 8px;
  }

  .ohlcv-line .pair {
    display: flex;
    flex-direction: row;
    gap: 0;
  }

  .ohlcv-line .pair.volume {
    gap: 0 8px;
  }

  .ohlcv-line span {
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    font-weight: ${fontWeightWidget};
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  .price-info-holder.positive .ohlcv {
    color: ${positive};
  }

  .price-info-holder.negative .ohlcv {
    color: ${negative};
  }
`;

export class LightChartWidget extends WidgetWithInstrument {
  chart;

  mainSeries;

  volumeSeries;

  hasMore = true;

  ohlcv = [];

  @observable
  chartTrader;

  @observable
  tradesTrader;

  // Ready to receive realtime updates.
  @attr({ mode: 'boolean' })
  ready;

  @observable
  print;

  @observable
  traderEvent;

  @observable
  candle;

  @observable
  lastCandle;

  cursor;

  @observable
  timeframes;

  @observable
  openPrice;

  @observable
  highPrice;

  @observable
  lowPrice;

  @observable
  closePrice;

  @observable
  volume;

  @observable
  absoluteChange;

  @observable
  relativeChange;

  @observable
  shouldShowPriceInfo;

  css(dt) {
    const value = dt.$value;

    if (typeof value === 'object') return value.createCSS();

    return value;
  }

  constructor() {
    super();

    this.timeframes = [];
    this.ready = false;
  }

  async connectedCallback() {
    this.onCrosshairMove = this.onCrosshairMove.bind(this);
    this.onVisibleLogicalRangeChanged =
      this.onVisibleLogicalRangeChanged.bind(this);

    super.connectedCallback();

    if (!this.document.chartTrader) {
      this.initialized = true;

      return this.notificationsArea.error({
        text: 'Отсутствует трейдер котировок.',
        keep: true
      });
    }

    if (!this.document.tradesTrader) {
      this.initialized = true;

      return this.notificationsArea.error({
        text: 'Отсутствует трейдер ленты сделок.',
        keep: true
      });
    }

    try {
      this.timeframes = (this.document.timeframes ?? DEFAULT_TIMEFRAMES).filter(
        (t) => !t.hidden
      );

      this.tfSelector.activeid = this.getActiveTimeframeTab();
      this.chartTrader = await ppp.getOrCreateTrader(this.document.chartTrader);
      this.instrumentTrader = this.chartTrader;

      this.selectInstrument(this.document.symbol, { isolate: true });

      this.chart = createChart(this.shadowRoot.querySelector('.chart'), {
        layout: {
          fontFamily: bodyFont.$value,
          fontSize: parseInt(fontSizeWidget.$value),
          backgroundColor: themeConditional(paletteWhite, paletteBlack).$value,
          textColor: themeConditional(paletteGrayBase, paletteGrayLight1).$value
        },
        grid: {
          vertLines: {
            color: themeConditional(paletteGrayLight3, paletteGrayDark2).$value
          },
          horzLines: {
            color: themeConditional(paletteGrayLight3, paletteGrayDark2).$value
          }
        },
        timeScale: {
          borderColor: this.css(
            themeConditional(darken(paletteGrayLight2, 15), paletteGrayDark1)
          ),
          timeVisible: true
        },
        rightPriceScale: {
          borderColor: this.css(
            themeConditional(darken(paletteGrayLight2, 15), paletteGrayDark1)
          )
        },
        cursor:
          'url("data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABiSURBVHgB1ZKxDcAgDATtKBsl2SULZIUMkRWyAMPATICpQPLbBRVXId0/Qi+YMEd3TlpgI4PvD9HyZtlj0fJO46oINcMivFUV8vvcVyujhFxaQyfy8uwE3Nwn8Vi0zIZzBysoRhBRZhqXHAAAAABJRU5ErkJggg==")\n        7 7, crosshair',
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: this.css(
              themeConditional(darken(paletteGrayLight2, 5), paletteGrayBase)
            ),
            style: LineStyle.Dashed,
            labelBackgroundColor: this.css(
              themeConditional(darken(paletteGrayLight2, 5), paletteGrayBase)
            )
          },
          horzLine: {
            color: this.css(
              themeConditional(darken(paletteGrayLight2, 10), paletteGrayBase)
            ),
            style: LineStyle.Dashed,
            labelBackgroundColor: this.css(
              themeConditional(darken(paletteGrayLight2, 10), paletteGrayBase)
            )
          }
        }
      });

      await this.setupChart();

      this.tradesTrader = await ppp.getOrCreateTrader(
        this.document.tradesTrader
      );

      await this.tradesTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.MARKET_PRINT
        }
      });

      await this.chartTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          traderEvent: TRADER_DATUM.TRADER
        }
      });

      this.initialized = true;
    } catch (e) {
      this.initialized = true;

      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    if (this.chart) {
      this.chart.unsubscribeCrosshairMove(this.onCrosshairMove);
      this.chart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(
          this.onVisibleLogicalRangeChanged
        );
    }

    if (this.chartTrader) {
      await this.chartTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          traderEvent: TRADER_DATUM.TRADER
        }
      });
    }

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

  resizeChart() {
    Updates.enqueue(() => {
      if (this.chart) {
        const { width, height } = getComputedStyle(this);
        const toolbarOffset = this.document.showToolbar ?? true ? 28 : 0;

        if (this.stackSelector.hasAttribute('hidden')) {
          this.chart.resize(
            parseInt(width) - 2,
            parseInt(height) - 32 - toolbarOffset
          );
        } else {
          this.chart.resize(
            parseInt(width) - 2,
            parseInt(height) -
              32 -
              toolbarOffset -
              parseInt(getComputedStyle(this.stackSelector).height)
          );
        }
      }
    });
  }

  onResize({ width, height }) {
    this.resizeChart();
  }

  restack() {
    super.restack();
    this.resizeChart();
  }

  priceFormatter(price) {
    return formatPriceWithoutCurrency(price, this.instrument);
  }

  onVisibleLogicalRangeChanged(newRange) {
    const info = this.mainSeries.barsInLogicalRange(newRange);

    if (info !== null && info.barsBefore < 50) {
      this.ready && this.loadHistory();
    }
  }

  onCrosshairMove(param) {
    if (param.time) {
      this.shouldShowPriceInfo = true;

      const values = param.seriesPrices.values();
      const [candle, volume] = values;

      if (candle) {
        this.openPrice = candle.open;
        this.highPrice = candle.high;
        this.lowPrice = candle.low;
        this.closePrice = candle.close;
        this.volume = volume;
        this.absoluteChange = candle.close - candle.open;
        this.relativeChange = (candle.close - candle.open) / candle.open;
      }
    } else {
      this.shouldShowPriceInfo = false;
    }
  }

  scrollToEnd() {
    if (this.ready && this.chart?.timeScale) {
      this.chart.timeScale().scrollToPosition(3);
    }
  }

  applyChartOptions() {
    const tf = this.getCurentTimeframe();

    this.chart.applyOptions({
      timeframe: '5',
      localization: {
        priceFormatter: this.priceFormatter.bind(this),
        timeFormatter: (t) => {
          const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
          };

          if (tf.unit === 'Sec') {
            options.second = 'numeric';
          }

          return new Intl.DateTimeFormat(ppp.i18nLocale, options).format(
            new Date(
              t * 1000 + ((3600 * new Date().getTimezoneOffset()) / 60) * 1000
            )
          );
        }
      },
      rightPriceScale: {
        alignLabels: true
      }
    });
  }

  async setupChart() {
    this.applyChartOptions();
    this.chart.subscribeCrosshairMove(this.onCrosshairMove);
    this.chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(this.onVisibleLogicalRangeChanged);
    this.resizeChart();

    let seriesKind = this.document.seriesKind;

    if (!['Candlestick', 'Bar', 'Line'].includes(seriesKind)) {
      seriesKind = 'Candlestick';
    }

    this.mainSeries = this.chart[`add${seriesKind}Series`]({
      downColor: chartDownColor.$value,
      upColor: chartUpColor.$value,
      borderDownColor: chartBorderDownColor.$value,
      borderUpColor: chartBorderUpColor.$value,
      wickDownColor: chartWickDownColor.$value,
      wickUpColor: chartWickUpColor.$value
    });

    this.volumeSeries = this.chart.addHistogramSeries({
      priceFormat: {
        type: 'volume'
      },
      priceLineVisible: false,
      priceScaleId: '',
      scaleMargins: {
        top: 0.85,
        bottom: 0
      },
      lastValueVisible: false
    });

    if (this.instrument && !this.unsupportedInstrument) {
      try {
        this.mainSeries.applyOptions({
          priceFormat: {
            precision: 2,
            minMove: 0.01
          },
          scaleMargins: {
            top: 0.1,
            bottom: 0.2
          },
          isMain: true
        });
      } catch (e) {
        this.$$debug('setupChart failed: %o', e);

        return this.notificationsArea.error({
          text: 'Не удалось загрузить историю котировок.'
        });
      }
    }
  }

  // Older quotes come first.
  setData(ohlcv) {
    this.mainSeries.setData(ohlcv);

    this.volumeSeries.setData(
      ohlcv.map((c) => {
        return {
          time: new Date(c.time).valueOf(),
          value: c.volume,
          color:
            c.close < c.open
              ? `rgba(${toColorComponents(
                  chartDownColor
                ).$value.createCSS()}, 0.56)`
              : `rgba(${toColorComponents(
                  chartUpColor
                ).$value.createCSS()}, 0.56)`
        };
      })
    );

    this.lastCandle = ohlcv[ohlcv.length - 1];
  }

  async traderEventChanged(oldValue, newValue) {
    if (typeof newValue === 'object' && newValue?.event === 'reconnect') {
      if (this.ready) {
        this.cursor = void 0;
        this.ohlcv = [];
        this.hasMore = true;

        this.loadHistory();
      }
    }
  }

  async loadHistory() {
    if (!this.hasMore) {
      return;
    }

    const shouldScroll = !this.ohlcv.length;

    if (typeof this.chartTrader.historicalCandles === 'function') {
      this.ready = false;

      try {
        for (const tab of this.tfSelector.tabs) {
          tab.setAttribute('disabled', '');
        }

        const { unit, value } = this.getCurentTimeframe();
        const { candles, cursor } =
          (await this.chartTrader.historicalCandles({
            instrument: this.instrument,
            unit,
            value,
            cursor: this.cursor
          })) ?? {};

        this.cursor = cursor;

        if (!cursor || !candles.length) {
          this.hasMore = false;
        }

        if (candles?.length) {
          this.ohlcv = [
            ...candles.map(this.traderQuoteToChartQuote),
            ...this.ohlcv
          ];
        }

        this.setData(this.ohlcv);
      } finally {
        this.ready = true;

        shouldScroll && this.chart.timeScale().scrollToPosition(3);

        for (const tab of this.tfSelector.tabs) {
          tab.removeAttribute('disabled');
        }
      }
    }
  }

  async instrumentChanged(oldValue, newValue) {
    super.instrumentChanged(oldValue, newValue);

    if (this.chartTrader) {
      if (this.instrument?.symbol) {
        this.cursor = void 0;
        this.ohlcv = [];
        this.hasMore = true;

        this.loadHistory();
      }
    }
  }

  getActiveTimeframeTab() {
    // From 1 to this.timeframes.length.
    const activeTimeFrameTab = +this.document.activeTimeFrameTab;

    if (
      !isNaN(activeTimeFrameTab) &&
      activeTimeFrameTab > 0 &&
      activeTimeFrameTab <= this.timeframes.length
    ) {
      return activeTimeFrameTab.toString();
    } else {
      return '1';
    }
  }

  getCurentTimeframe() {
    return (
      this.timeframes[+this.tfSelector?.activeid - 1] ??
      this.timeframes[this.document.activeTimeFrameTab - 1] ??
      this.timeframes[0] ?? {
        unit: 'Day',
        value: 1
      }
    );
  }

  async timeframeChanged() {
    if (this.chartTrader) {
      if (this.instrument?.symbol) {
        this.cursor = void 0;
        this.ohlcv = [];
        this.hasMore = true;

        await this.loadHistory();
        this.applyChartOptions();
      }
    }
  }

  traderQuoteToChartQuote(quote) {
    const cloned = {
      open: quote.open,
      high: quote.high,
      low: quote.low,
      close: quote.close,
      volume: quote.volume
    };

    if (typeof quote.vw === 'number') {
      cloned.vw = quote.vw;
    }

    cloned.time = new Date(quote.time).valueOf();
    cloned.time =
      Math.floor(cloned.time / 1000) -
      (3600 * new Date().getTimezoneOffset()) / 60;

    return cloned;
  }

  /**
   *
   * @param {*} timestamp
   * @param {number} tf - timeframe in seconds.
   * @returns {number}
   */
  roundTimestampForTimeframe(timestamp, tf) {
    const printTime = new Date(timestamp);
    const coefficient = 1000 * tf;
    const roundedTime = new Date(
      Math.floor(printTime.getTime() / coefficient) * coefficient
    );

    return (
      Math.floor(roundedTime.valueOf() / 1000) -
      (3600 * new Date().getTimezoneOffset()) / 60
    );
  }

  // Update the last candle here.
  printChanged(oldValue, newValue) {
    if (this.ready && newValue?.price) {
      if (Array.isArray(newValue.condition)) {
        // https://alpaca.markets/learn/stock-minute-bars/
        for (const condition of newValue.condition) {
          if (
            [
              'B',
              'W',
              '4',
              '7',
              '9',
              'C',
              'G',
              'H',
              'M',
              'N',
              'P',
              'Q',
              'R',
              'U',
              'V',
              'Z'
            ].includes(condition)
          ) {
            return;
          }
        }
      }

      const { unit, value } = this.getCurentTimeframe();
      let tf = 1;

      switch (unit) {
        case 'Sec':
          tf = value;

          break;
        case 'Min':
          tf = value * 60;

          break;
        case 'Hour':
          tf = value * 3600;

          break;
        case 'Day':
          tf = value * 3600 * 24;

          break;
        case 'Week':
          tf = value * 3600 * 24 * 7;

          break;
        case 'Month':
          const now = new Date();
          const daysInMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
          ).getDate();

          tf = value * 3600 * 24 * daysInMonth;

          break;
      }

      const time = this.roundTimestampForTimeframe(newValue.timestamp, tf);

      if (
        typeof this.lastCandle === 'undefined' ||
        this.lastCandle.time < time
      ) {
        this.lastCandle = {
          open: newValue.price,
          high: newValue.price,
          low: newValue.price,
          close: newValue.price,
          time,
          volume: newValue.volume
        };
      } else {
        const { high, low, open, volume } = this.lastCandle;

        this.lastCandle = {
          open,
          high: Math.max(high, newValue.price),
          low: Math.min(low, newValue.price),
          close: newValue.price,
          time,
          volume: volume + newValue.volume
        };
      }
    }
  }

  lastCandleChanged(oldValue, newValue) {
    if (newValue?.close) {
      try {
        this.mainSeries.update(newValue);
        this.volumeSeries.update({
          time: newValue.time,
          value: newValue.volume,
          color:
            newValue.close < newValue.open
              ? `rgba(${themeConditional(
                  toColorComponents(paletteRedLight3),
                  toColorComponents(paletteRedDark1)
                ).$value.createCSS()}, 0.56)`
              : `rgba(${themeConditional(
                  toColorComponents(paletteGreenLight2),
                  toColorComponents(paletteGreenDark1)
                ).$value.createCSS()}, 0.56)`
        });
      } catch (e) {
        // Suppress TV errors.
        void 0;
      }
    }
  }

  async validate() {
    await this.container.timeframeList.validate();
  }

  async submit() {
    return {
      $set: {
        chartTraderId: this.container.chartTraderId.value,
        tradesTraderId: this.container.tradesTraderId.value,
        timeframes: this.container.timeframeList.value,
        showToolbar: this.container.showToolbar.checked,
        showResetButton: this.container.showResetButton.checked,
        seriesKind: this.container.seriesKind.value
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.LIGHT_CHART,
    collection: 'PPP',
    title: html`Лёгкий график`,
    description: html`Виджет
      <span class="positive">Лёгкий график</span> отображает график финансового
      инструмента в минимальной комплектации.`,
    customElement: LightChartWidget.compose({
      template: lightChartWidgetTemplate,
      styles: lightChartWidgetStyles
    }).define(),
    defaultWidth: 600,
    minHeight: 120,
    minWidth: 140,
    defaultHeight: 350,
    settings: html`
      <ppp-tabs activeid="traders">
        <ppp-tab id="traders">Трейдеры</ppp-tab>
        <ppp-tab id="tf">Таймфреймы</ppp-tab>
        <ppp-tab id="ui">UI</ppp-tab>
        <ppp-tab-panel id="traders-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Трейдер графика</h5>
              <p class="description">
                Трейдер, который будет являться источником исторических данных
                графика.
              </p>
            </div>
            <div class="control-line flex-start">
              <ppp-query-select
                ${ref('chartTraderId')}
                deselectable
                standalone
                placeholder="Опционально, нажмите для выбора"
                value="${(x) => x.document.chartTraderId}"
                :context="${(x) => x}"
                :preloaded="${(x) => x.document.chartTrader ?? ''}"
                :displayValueFormatter="${() => (item) =>
                  html`
                    <span style="color:${getTraderSelectOptionColor(item)}">
                      ${item?.name}
                    </span>
                  `}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({
                        $and: [
                          {
                            caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_CHARTS%]`
                          },
                          {
                            $or: [
                              { removed: { $ne: true } },
                              { _id: `[%#this.document.chartTraderId ?? ''%]` }
                            ]
                          }
                        ]
                      })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
                @change="${async (x) => {
                  const datum = x.chartTraderId.datum();

                  if (datum) {
                    const trader = await ppp.getOrCreateTrader(
                      await x.denormalization.denormalize(datum),
                      {
                        doNotStartWorker: true
                      }
                    );

                    x.timeframeList.allowedTimeframeList =
                      trader.getTimeframeList() ?? [];
                  } else {
                    x.timeframeList.allowedTimeframeList = [];
                  }
                }}"
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
              <h5>Трейдер ленты сделок</h5>
              <p class="description">
                Будет использован как источник последних сделок для формирования
                графика в режиме реального времени.
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
                :displayValueFormatter="${() => (item) =>
                  html`
                    <span style="color:${getTraderSelectOptionColor(item)}">
                      ${item?.name}
                    </span>
                  `}"
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
        <ppp-tab-panel id="tf-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Таймфреймы для отображения</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-widget-timeframe-list
              ${ref('timeframeList')}
              :stencil="${() => {
                return {};
              }}"
              :list="${(x) => x.document.timeframes ?? DEFAULT_TIMEFRAMES}"
            ></ppp-widget-timeframe-list>
          </div>
        </ppp-tab-panel>
        <ppp-tab-panel id="ui-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Интерфейс</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-checkbox
              ?checked="${(x) => x.document.showToolbar ?? true}"
              ${ref('showToolbar')}
            >
              Показывать панель выбора таймфрейма
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showResetButton ?? false}"
              ${ref('showResetButton')}
            >
              Показывать кнопку очистки
            </ppp-checkbox>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Вид графика</h5>
            </div>
            <div class="spacing2"></div>
            <div class="widget-settings-input-group">
              <ppp-radio-group
                orientation="vertical"
                value="${(x) => x.document.seriesKind ?? 'Candlestick'}"
                ${ref('seriesKind')}
              >
                <ppp-radio value="Candlestick">Японские свечи</ppp-radio>
                <ppp-radio value="Bar">Бары</ppp-radio>
                <ppp-radio value="Line">Линия</ppp-radio>
              </ppp-radio-group>
            </div>
          </div>
        </ppp-tab-panel>
      </ppp-tabs>
    `
  };
}
