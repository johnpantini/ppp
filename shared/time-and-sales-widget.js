/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html } from './template.js';
import { validate } from './validate.js';
import { TRADER_DATUM, WIDGET_TYPES } from './const.js';
import { observable } from './element/observation/observable.js';
import { when } from './element/templating/when.js';
import { repeat } from './element/templating/repeat.js';
import {
  formatDate,
  formatPriceWithoutCurrency,
  formatQuantity
} from './intl.js';
import ppp from '../ppp.js';

export const timeAndSalesWidgetTemplate = (context, definition) => html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-instrument-area">
          <${'ppp-widget-group-control'}
            :widget="${(x) => x}"
            selection="${(x) => x.document?.group}"
            ${ref('groupControl')}
          ></ppp-widget-group-control>
          <div class="instrument-search-holder">
            <${'ppp-widget-search-control'}
              :widget="${(x) => x}"
              ${ref('searchControl')}
            ></ppp-widget-search-control>
          </div>
          <div class="widget-header-name"
               title="${(x) => x.document?.name ?? ''}">
            <span>${(x) => x.document?.name ?? ''}</span>
          </div>
          <div class="widget-header-controls">
            <img
              draggable="false"
              alt="Закрыть"
              class="widget-close-button"
              src="static/widgets/close.svg"
              @click="${(x) => x.close()}"
            />
          </div>
        </div>
      </div>
      <div class="widget-body">
        ${when(
          (x) => x.instrument,
          html`
            <table class="trades-table">
              <thead>
                <tr>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Время</th>
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
                          ${(x) => formatQuantity(x.volume ?? 0)}
                        </div>
                      </td>
                      <td>
                        <div class="cell">
                          ${(x) => formatDate(x.timestamp)}
                        </div>
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
            ${when(
              (x) => !x.trades.length,
              html`
                <div class="widget-empty-state-holder">
                  <img draggable="false" src="static/empty-widget-state.svg" />
                  <span>Лента сделок пуста.</span>
                </div>
              `
            )}
          `
        )}
        ${when(
          (x) => !x.instrument,
          html`
            <div class="widget-empty-state-holder">
              <img draggable="false" src="static/empty-widget-state.svg" />
              <span>Выберите инструмент.</span>
            </div>
          `
        )}
      </div>
    </div>
  </template>
`;

export class PppTimeAndSalesWidget extends WidgetWithInstrument {
  @observable
  tradesTrader;

  @observable
  print;

  @observable
  trades;

  async connectedCallback() {
    super.connectedCallback();

    this.trades = [];
    this.tradesTrader = await ppp.getOrCreateTrader(this.document.tradesTrader);
    this.searchControl.trader = this.tradesTrader;

    if (this.tradesTrader) {
      if (this.instrument) {
        this.trades = await this.tradesTrader.allTrades({
          instrument: this.instrument,
          depth: this.document.depth
        });
      }

      await this.tradesTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.MARKET_PRINT
        }
      });
    }
  }

  handleTableClick({ event }) {
    const price = parseFloat(
      event
        .composedPath()
        .find((n) => n?.classList?.contains('price-line'))
        ?.getAttribute('price')
    );

    return this.broadCastPrice(price);
  }

  printChanged(oldValue, newValue) {
    if (newValue?.price) {
      this.trades.unshift(newValue);

      while (this.trades.length > this.document.depth) {
        this.trades.pop();
      }
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
    super.instrumentChanged(oldValue, newValue);

    if (this.tradesTrader) {
      if (this.instrument) {
        this.trades = await this.tradesTrader.allTrades({
          instrument: this.instrument,
          depth: this.document.depth
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
  }

  async update() {
    return {
      $set: {
        depth: Math.abs(this.container.depth.value),
        tradesTraderId: this.container.tradesTraderId.value
      }
    };
  }
}

export async function widgetDefinition(definition = {}) {
  return {
    type: WIDGET_TYPES.TIME_AND_SALES,
    collection: 'PPP',
    title: html`Лента всех сделок`,
    tags: ['Цена', 'Объём', 'Пул ликвидности'],
    description: html`<span class="positive">Лента всех сделок</span> отображает
      обезличенные сделки с финансовым инструментом по всем доступным рыночным
      центрам.`,
    customElement: PppTimeAndSalesWidget.compose(definition),
    maxHeight: 2050,
    maxWidth: 365,
    defaultHeight: 375,
    minHeight: 120,
    minWidth: 275,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер ленты</h5>
          <p>Трейдер, который будет источником ленты сделок.</p>
        </div>
        <ppp-collection-select
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
                  $or: [
                    { removed: { $ne: true } },
                    { _id: `[%#this.document.tradesTraderId ?? ''%]` }
                  ]
                })
                .sort({ updatedAt: -1 });
            };
          }}"
          :transform="${() => ppp.decryptDocumentsTransformation()}"
        ></ppp-collection-select>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Глубина истории ленты</h5>
          <p>Количество записей, запрашиваемое из истории сделок текущего дня
            при
            смене торгового инструмента в виджете.</p>
        </div>
        <div class="widget-settings-input-group">
          <${'ppp-text-field'}
            type="number"
            placeholder="20"
            value="${(x) => x.document.depth ?? 20}"
            ${ref('depth')}
          ></ppp-text-field>
        </div>
      </div>
    `
  };
}
