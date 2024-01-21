/** @decorator */

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
  Updates
} from '../../vendor/fast-element.min.js';
import { TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import { normalize, spacing } from '../../design/styles.js';
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
import { formatPriceWithoutCurrency, formatVolume } from '../../lib/intl.js';
import { CandleInterval } from '../../vendor/tinkoff/definitions/market-data.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';
import '../widget-controls.js';

export const lightChartWidgetTemplate = html`
  <template>
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
        ${when(
          (x) => !x.instrument?.symbol,
          html`${html.partial(
            widgetEmptyStateTemplate('Выберите инструмент.')
          )}`
        )}
        ${widgetUnsupportedInstrumentTemplate()}
        <div
          class="chart-holder"
          ?hidden="${(x) =>
            !x.instrument?.symbol ||
            (x.instrument && x.instrumentTrader && x.unsupportedInstrument)}"
        >
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
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
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

  // Previous candle for timeframe.
  prev;

  // Next candle for timeframe.
  next;

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
  shouldShowPriceInfo;

  css(dt) {
    const value = dt.$value;

    if (typeof value === 'object') return value.createCSS();

    return value;
  }

  async connectedCallback() {
    this.ready = false;
    this.onCrosshairMove = this.onCrosshairMove.bind(this);
    this.onVisibleLogicalRangeChanged =
      this.onVisibleLogicalRangeChanged.bind(this);

    super.connectedCallback();

    if (!this.document.chartTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер котировок.',
        keep: true
      });
    }

    if (!this.document.tradesTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер ленты сделок.',
        keep: true
      });
    }

    try {
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
          candle: TRADER_DATUM.CANDLE,
          traderEvent: TRADER_DATUM.TRADER
        }
      });
    } catch (e) {
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
          candle: TRADER_DATUM.CANDLE,
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

        if (this.stackSelector.hasAttribute('hidden')) {
          this.chart.resize(parseInt(width) - 2, parseInt(height) - 32);
        } else {
          this.chart.resize(
            parseInt(width) - 2,
            parseInt(height) -
              32 -
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
      // TODO.
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
      }
    } else {
      this.shouldShowPriceInfo = false;
    }
  }

  async setupChart() {
    this.chart.applyOptions({
      timeframe: '5',
      localization: {
        priceFormatter: this.priceFormatter.bind(this),
        timeFormatter: (t) =>
          new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
          }).format(
            new Date(
              t * 1000 + ((3600 * new Date().getTimezoneOffset()) / 60) * 1000
            )
          )
      },
      rightPriceScale: {
        alignLabels: true
      }
    });

    this.chart.subscribeCrosshairMove(this.onCrosshairMove);
    this.chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(this.onVisibleLogicalRangeChanged);
    this.resizeChart();

    this.mainSeries = this.chart.addCandlestickSeries({
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
        console.error(e);

        return this.notificationsArea.error({
          text: 'Не удалось загрузить историю котировок.'
        });
      }
    }
  }

  // Older quotes come first.
  setData(quotes) {
    this.mainSeries.setData(quotes.map(this.traderQuoteToChartQuote));

    this.volumeSeries.setData(
      quotes.map((c) => {
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

    this.lastCandle = quotes[quotes.length - 1];
  }

  async traderEventChanged(oldValue, newValue) {
    if (typeof newValue === 'object' && newValue?.event === 'reconnect') {
      await this.loadHistory();
    }
  }

  async loadHistory() {
    if (typeof this.chartTrader.historicalCandles === 'function') {
      this.ready = false;

      try {
        const { candles, prev, next } =
          await this.chartTrader.historicalCandles({
            instrument: this.instrument,
            tf: CandleInterval.CANDLE_INTERVAL_5_MIN
          });

        this.prev = prev;
        this.next = next;

        this.setData(candles);
      } finally {
        this.ready = true;

        this.chart.timeScale().scrollToPosition(3);
      }
    }
  }

  async instrumentChanged(oldValue, newValue) {
    super.instrumentChanged(oldValue, newValue);

    if (this.chartTrader) {
      if (this.instrument?.symbol) {
        await this.loadHistory();
      }
    }
  }

  traderQuoteToChartQuote(quote) {
    quote.time = new Date(quote.time).valueOf();
    quote.time =
      Math.floor(quote.time / 1000) -
      (3600 * new Date().getTimezoneOffset()) / 60;

    return quote;
  }

  roundTimestampForTimeframe(timestamp, tf = 1) {
    const printTime = new Date(timestamp);
    const coefficient = 1000 * 60 * tf;
    const roundedTime = new Date(
      Math.floor(printTime.getTime() / coefficient) * coefficient
    );

    return (
      Math.floor(roundedTime.valueOf() / 1000) -
      (3600 * new Date().getTimezoneOffset()) / 60
    );
  }

  printChanged(oldValue, newValue) {
    if (this.ready && newValue?.price) {
      if (newValue.timestamp < Date.now() - 3600 * 1000) {
        return;
      }

      // Update the last candle here.
      const time = this.roundTimestampForTimeframe(newValue.timestamp, 5);

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

  candleChanged(oldValue, newValue) {
    if (this.ready && newValue?.close) {
      const roundedTime = this.roundTimestampForTimeframe(
        new Date(newValue.time).valueOf(),
        5
      );

      if (
        typeof this.lastCandle === 'undefined' ||
        this.lastCandle.time < roundedTime
      ) {
        this.lastCandle = {
          open: newValue.open,
          high: newValue.high,
          low: newValue.low,
          close: newValue.price,
          time: roundedTime,
          volume: newValue.volume
        };
      } else {
        const { open, high, low, volume } = this.lastCandle;

        // TODO - volume
        this.lastCandle = {
          open,
          high: Math.max(high, newValue.high),
          low: Math.min(low, newValue.low),
          close: newValue.close,
          time: roundedTime,
          volume
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
        // Suppress TV errors
        void 0;
      }
    }
  }

  async validate() {
    // No-op.
  }

  async submit() {
    return {
      $set: {
        chartTraderId: this.container.chartTraderId.value,
        tradesTraderId: this.container.tradesTraderId.value
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
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер графика</h5>
          <p class="description">
            Трейдер, который будет являться источником для отрисовки графика.
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
            Лента сделок используется для формирования графика в режиме
            реального времени.
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
    `
  };
}
