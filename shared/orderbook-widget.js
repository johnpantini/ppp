/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html, requireComponent } from './template.js';
import { validate } from './validate.js';
import { TRADER_DATUM, WIDGET_TYPES } from './const.js';
import { observable } from './element/observation/observable.js';
import { when } from './element/templating/when.js';
import { repeat } from './element/templating/repeat.js';
import {
  formatPrice,
  formatPercentage,
  formatPriceWithoutCurrency,
  priceCurrencySymbol
} from './intl.js';
import ppp from '../ppp.js';

export const orderbookWidgetTemplate = (context, definition) => html`
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
            <table class="orderbook-table">
              <thead>
                <tr>
                  <th colspan="2">
                    <div class="bid-title">
                      ${(x) => 'Bid, ' + priceCurrencySymbol(x.instrument)}
                    </div>
                    <div class="spread">${(x) => x.spreadString}</div>
                    <div class="ask-title">
                      ${(x) => 'Ask, ' + priceCurrencySymbol(x.instrument)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody @click="${(x, c) => x.handleTableClick(c)}">
                ${repeat(
                  (x) => x.quoteLines,
                  html`
                    <tr>
                      <td
                        style="${(x, c) =>
                          `background: linear-gradient( to left, var(--pro-orderbook-bid-color) 0%, var(--pro-orderbook-bid-color) ${c.parent.calcGradientPercentage(
                            x.bid?.volume
                          )}%, transparent ${c.parent.calcGradientPercentage(
                            x.bid?.volume
                          )}%, transparent 100% )`}"
                      >
                        <div
                          class="quote-line bid-line"
                          price="${(x) => x.bid?.price}"
                        >
                          <div class="volume">${(x) => x.bid?.volume}</div>
                          <div class="spacer"></div>
                          <div class="price">
                            ${(x, c) =>
                              formatPriceWithoutCurrency(
                                x.bid?.price,
                                c.parent.instrument
                              )}
                          </div>
                        </div>
                      </td>
                      <td
                        style="${(x, c) =>
                          `background: linear-gradient( to right, var(--pro-orderbook-ask-color) 0%, var(--pro-orderbook-ask-color) ${c.parent.calcGradientPercentage(
                            x.ask?.volume
                          )}%, transparent ${c.parent.calcGradientPercentage(
                            x.ask?.volume
                          )}%, transparent 100% )`}"
                      >
                        <div
                          class="quote-line ask-line"
                          price="${(x) => x.ask?.price}"
                        >
                          <div class="volume">${(x) => x.ask?.volume}</div>
                          <div class="spacer"></div>
                          <div class="price">
                            ${(x, c) =>
                              formatPriceWithoutCurrency(
                                x.ask?.price,
                                c.parent.instrument
                              )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
            ${when(
              (x) => !x.quoteLines.length,
              html`
                <div class="widget-empty-state-holder">
                  <img draggable="false" src="static/empty-widget-state.svg" />
                  <span>Книга заявок пуста.</span>
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

export class PppOrderbookWidget extends WidgetWithInstrument {
  @observable
  bookTrader;

  @observable
  orderbook;

  @observable
  quoteLines;

  @observable
  spreadString;

  maxSeenVolume;

  async connectedCallback() {
    super.connectedCallback();

    this.spreadString = '—';
    this.maxSeenVolume = 0;
    this.quoteLines = [];
    this.bookTrader = await ppp.getOrCreateTrader(this.document.bookTrader);
    this.searchControl.trader = this.bookTrader;

    if (this.bookTrader) {
      await this.bookTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          orderbook: TRADER_DATUM.ORDERBOOK
        }
      });
    }
  }

  async disconnectedCallback() {
    if (this.bookTrader) {
      await this.bookTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          orderbook: TRADER_DATUM.ORDERBOOK
        }
      });
    }

    super.disconnectedCallback();
  }

  handleTableClick({ event }) {
    const price = parseFloat(
      event
        .composedPath()
        .find((n) => n?.classList?.contains('quote-line'))
        ?.getAttribute('price')
    );

    if (price > 0 && !this.preview) {
      const widgets = Array.from(
        this.container.shadowRoot.querySelectorAll('.widget')
      ).filter(
        (w) =>
          w !== this.widget &&
          typeof w.setPrice === 'function' &&
          w?.groupControl.selection === this.groupControl.selection &&
          w.instrument
      );

      widgets.forEach((w) => w.setPrice(price));
    }
  }

  orderbookChanged(oldValue, newValue) {
    if (newValue && this.instrument) {
      if (newValue.bids?.length && newValue.asks?.length) {
        const bestBid = newValue.bids[0]?.price;
        const bestAsk = newValue.asks[0]?.price;

        this.spreadString = `${formatPriceWithoutCurrency(
          bestAsk - bestBid,
          this.instrument
        )} (${formatPercentage((bestAsk - bestBid) / bestBid)})`;
      }

      let max = Math.max(
        newValue.bids?.length ?? 0,
        newValue.asks?.length ?? 0
      );

      if (max > this.document.depth)
        max = this.document.depth;

      this.quoteLines = [];
      this.maxSeenVolume = 0;

      for (let i = 0; i < max; i++) {
        const bid = newValue.bids[i] ?? null;
        const ask = newValue.asks[i] ?? null;

        if (bid) {
          this.maxSeenVolume = Math.max(this.maxSeenVolume, bid.volume);
        }

        if (ask) {
          this.maxSeenVolume = Math.max(this.maxSeenVolume, ask.volume);
        }

        this.quoteLines.push({
          bid,
          ask
        });
      }
    } else this.spreadString = '—';
  }

  calcGradientPercentage(volume) {
    try {
      if (volume > 0 && this.maxSeenVolume > 0) {
        return ((volume * 100) / this.maxSeenVolume).toFixed(2);
      }
    } catch (e) {
      return 0;
    }

    return 0;
  }

  instrumentChanged(oldValue, newValue) {
    super.instrumentChanged(oldValue, newValue);

    this.bookTrader?.instrumentChanged?.(this, oldValue, newValue);
  }

  async validate() {
    await validate(this.container.bookTraderId);
    await validate(this.container.depth);
    await validate(this.container.depth, {
      hook: async (value) => +value > 0 && +value <= 50,
      errorMessage: 'Введите значение в диапазоне от 1 до 50'
    });
  }

  async update() {
    return {
      $set: {
        depth: Math.abs(this.container.depth.value),
        displayMode: this.container.displayMode.value,
        bookTraderId: this.container.bookTraderId.value
      }
    };
  }
}

export async function widgetDefinition(definition = {}) {
  await requireComponent('ppp-radio');
  await requireComponent('ppp-radio-group');

  return {
    type: WIDGET_TYPES.ORDERBOOK,
    collection: 'PPP',
    title: html`Книга заявок`,
    tags: ['Цена', 'Объём', 'Пул ликвидности'],
    description: html`<span class="positive">Книга заявок</span> отображает
      таблицу лимитных заявок финансового инструмента на покупку и продажу.`,
    customElement: PppOrderbookWidget.compose(definition),
    maxHeight: 512,
    maxWidth: 365,
    defaultHeight: 375,
    minHeight: 120,
    minWidth: 275,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер книги заявок</h5>
          <p>
            Трейдер, который будет источником книги заявок.
          </p>
        </div>
        <ppp-collection-select
          ${ref('bookTraderId')}
          value="${(x) => x.document.bookTraderId}"
          :context="${(x) => x}"
          :preloaded="${(x) => x.document.bookTrader ?? ''}"
          :query="${() => {
            return (context) => {
              return context.services
                .get('mongodb-atlas')
                .db('ppp')
                .collection('traders')
                .find({
                  $or: [
                    { removed: { $ne: true } },
                    { _id: `[%#this.document.bookTraderId ?? ''%]` }
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
          <h5>Тип отображения</h5>
        </div>
        <div class="widget-settings-input-group">
          <ppp-radio-group
            orientation="vertical"
            value="compact"
            ${ref('displayMode')}
          >
            <ppp-radio value="compact">Компактный
            </ppp-radio>
            <ppp-radio disabled value="classic-1">Классический, 1
              колонка
            </ppp-radio>
            <ppp-radio disabled value="classic-2">Классический, 2
              колонки
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Глубина книги заявок</h5>
          <p>Количество строк <span
            class="positive">bid</span> и <span
            class="negative">ask</span> для отображения.</p>
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
