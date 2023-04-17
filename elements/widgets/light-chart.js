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
import { TRADER_CAPS, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import { normalize, spacing } from '../../design/styles.js';
import { validate } from '../../lib/ppp-errors.js';
import { createChart, CrosshairMode, LineStyle } from '../../lib/ppp-charts.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';
import {
  bodyFont,
  darken,
  fontSizeWidget,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenDark1,
  paletteGreenLight1,
  paletteGreenLight2,
  paletteRedDark1,
  paletteRedLight1,
  paletteRedLight2,
  paletteRedLight3,
  paletteWhite,
  themeConditional,
  toColorComponents
} from '../../design/design-tokens.js';
import { formatDate, formatPriceWithoutCurrency } from '../../lib/intl.js';

export const lightChartWidgetTemplate = html`
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
            x.instrument &&
            x.chartTrader &&
            !x.chartTrader.supportsInstrument(x.instrument),
          html`${html.partial(
            widgetEmptyStateTemplate('Инструмент не поддерживается.')
          )}`
        )}
        <div
          class="chart-holder"
          ?hidden="${(x) =>
            !x.instrument ||
            (x.instrument &&
              x.chartTrader &&
              !x.chartTrader.supportsInstrument(x.instrument))}"
        >
          <div class="chart-holder-inner">
            <div class="toolbar"></div>
            <div class="chart"></div>
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
  ${widget()}
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
`;

export class LightChartWidget extends WidgetWithInstrument {
  chart;

  mainSeries;

  volumeSeries;

  @observable
  chartTrader;

  css(dt) {
    const value = dt.$value;

    if (typeof value === 'object') return value.createCSS();

    return value;
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.chartTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер котировок.',
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
    } catch (e) {
      return this.catchException(e);
    }
  }

  onResize({ width, height }) {
    this.chart.resize(width - 2, height - 32);
  }

  priceFormatter(price) {
    return formatPriceWithoutCurrency(price, this.instrument);
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

    const { width, height } = getComputedStyle(this);

    this.chart.resize(parseInt(width) - 2, parseInt(height) - 32);

    this.mainSeries = this.chart.addCandlestickSeries({
      upColor: themeConditional(paletteGreenLight2, paletteGreenDark1).$value,
      downColor: themeConditional(paletteRedLight3, paletteRedDark1).$value,
      borderDownColor: themeConditional(paletteRedLight2, paletteRedLight1)
        .$value,
      borderUpColor: paletteGreenLight1.$value,
      wickDownColor: themeConditional(paletteRedLight2, paletteRedLight1)
        .$value,
      wickUpColor: paletteGreenLight1.$value
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

    if (
      this.instrument &&
      typeof this.chartTrader.historicalQuotes === 'function' &&
      this.instrumentTrader.supportsInstrument(this.instrument)
    ) {
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

  setData(quotes) {
    this.mainSeries.setData(
      quotes.map((c) => {
        c.time =
          Math.floor(c.time / 1000) -
          (3600 * new Date().getTimezoneOffset()) / 60;

        return c;
      })
    );

    this.volumeSeries.setData(
      quotes.map((c) => {
        return {
          time: c.time,
          value: c.volume,
          color:
            c.close < c.open
              ? `rgba(${themeConditional(
                  toColorComponents(paletteRedLight3),
                  toColorComponents(paletteRedDark1)
                ).$value.createCSS()}, 0.56)`
              : `rgba(${themeConditional(
                  toColorComponents(paletteGreenLight2),
                  toColorComponents(paletteGreenDark1)
                ).$value.createCSS()}, 0.56)`
        };
      })
    );
  }

  async instrumentChanged(oldValue, newValue) {
    super.instrumentChanged(oldValue, newValue);

    if (this.chartTrader) {
      if (
        this.instrument &&
        typeof this.chartTrader.historicalQuotes === 'function' &&
        this.instrumentTrader.supportsInstrument(this.instrument)
      ) {
        this.setData(
          await this.chartTrader.historicalQuotes({
            instrument: this.instrument
          })
        );

        this.chart.timeScale().scrollToPosition(3);
      }

      await this.chartTrader.instrumentChanged?.(this, oldValue, newValue);
    }
  }

  async validate() {
    await validate(this.container.chartTraderId);
  }

  async submit() {
    return {
      $set: {
        chartTraderId: this.container.chartTraderId.value
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
    defaultHeight: 375,
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
        <div class="control-line">
          <ppp-query-select
            ${ref('chartTraderId')}
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
                        caps: `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_CHARTS%]`
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
    `
  };
}
