/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html, requireComponent } from './template.js';
import { validate } from './validate.js';
import { TRADER_CAPS, TRADER_DATUM, WIDGET_TYPES } from './const.js';
import { Observable, observable } from './element/observation/observable.js';
import { when } from './element/templating/when.js';
import { repeat } from './element/templating/repeat.js';
import {
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
                          `background: linear-gradient( to left, var(--orderbook-bid-color) 0%, var(--orderbook-bid-color) ${c.parent.calcGradientPercentage(
                            x.bid?.volume
                          )}%, transparent ${c.parent.calcGradientPercentage(
                            x.bid?.volume
                          )}%, transparent 100% )`}"
                      >
                        <div
                          class="quote-line bid-line"
                          price="${(x) => x.bid?.price}"
                        >
                          <div class="volume">
                            ${when(
                              (x) => x.bid?.my > 0,
                              html`
                                <div class="my-order">
                                  <span>
                                    <span>${(x) => x.bid.my}</span>
                                  </span>
                                </div>
                              `
                            )}
                            ${(x) => x.bid?.volume}
                          </div>
                          <div class="spacer"></div>
                          <div class="price">
                            ${(x, c) =>
                              formatPriceWithoutCurrency(
                                x.bid?.price,
                                c.parent.instrument
                              )}
                          </div>
                          ${when(
                            (x) => x.bid?.pool,
                            html`
                              <div class="pool">${(x) => x.bid?.pool}</div>
                            `
                          )}
                        </div>
                      </td>
                      <td
                        style="${(x, c) =>
                          `background: linear-gradient( to right, var(--orderbook-ask-color) 0%, var(--orderbook-ask-color) ${c.parent.calcGradientPercentage(
                            x.ask?.volume
                          )}%, transparent ${c.parent.calcGradientPercentage(
                            x.ask?.volume
                          )}%, transparent 100% )`}"
                      >
                        <div
                          class="quote-line ask-line"
                          price="${(x) => x.ask?.price}"
                        >
                          <div class="volume">
                            ${(x) => x.ask?.volume}
                            ${when(
                              (x) => x.ask?.my > 0,
                              html`
                                <div class="my-order">
                                  <span>
                                    <span>${(x) => x.ask.my}</span>
                                  </span>
                                </div>
                              `
                            )}
                          </div>
                          <div class="spacer"></div>
                          <div class="price">
                            ${(x, c) =>
                              formatPriceWithoutCurrency(
                                x.ask?.price,
                                c.parent.instrument
                              )}
                          </div>
                          ${when(
                            (x) => x.ask?.pool,
                            html`
                              <div class="pool">${(x) => x.ask?.pool}</div>
                            `
                          )}
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
        <${'ppp-widget-notifications-area'}
          ${ref('notificationsArea')}
        ></ppp-widget-notifications-area>
      </div>
    </div>
  </template>
`;

export class PppOrderbookWidget extends WidgetWithInstrument {
  @observable
  bookTrader;

  @observable
  ordersTrader;

  @observable
  currentOrder;

  @observable
  orderbook;

  // Use this when orders change.
  #lastOrderBookValue;

  @observable
  orders;

  @observable
  quoteLines;

  @observable
  spreadString;

  maxSeenVolume;

  constructor() {
    super();

    this.spreadString = '—';
    this.maxSeenVolume = 0;
    this.orders = new Map();
    this.quoteLines = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    this.bookTrader = await ppp.getOrCreateTrader(this.document.bookTrader);

    if (this.document.ordersTrader) {
      this.ordersTrader = await ppp.getOrCreateTrader(
        this.document.ordersTrader
      );
    }

    this.searchControl.trader = this.bookTrader;

    if (this.ordersTrader) {
      await this.ordersTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          currentOrder: TRADER_DATUM.CURRENT_ORDER
        }
      });
    }

    if (this.bookTrader) {
      try {
        await this.bookTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            orderbook: TRADER_DATUM.ORDERBOOK
          }
        });
      } catch (e) {
        console.error(e);

        return this.notificationsArea.error({
          title: 'Книга заявок',
          text: 'Не удалось подключиться к источнику данных.'
        });
      }
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

    if (this.ordersTrader) {
      await this.ordersTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          currentOrder: TRADER_DATUM.CURRENT_ORDER
        }
      });
    }

    super.disconnectedCallback();
  }

  currentOrderChanged(oldValue, newValue) {
    let needToChangeOrderbook;

    if (newValue?.orderId) {
      if (newValue.orderType === 'limit') {
        if (
          newValue.quantity === newValue.filled ||
          newValue.status !== 'working'
        ) {
          if (this.orders.has(newValue.orderId)) {
            this.orders.delete(newValue.orderId);

            needToChangeOrderbook = true;
          }
        } else if (newValue.status === 'working') {
          this.orders.set(newValue.orderId, newValue);

          needToChangeOrderbook = true;
        }

        if (
          needToChangeOrderbook &&
          this.instrument &&
          newValue.instrument.symbol === this.instrument.symbol
        ) {
          this.orderbookChanged(null, this.#lastOrderBookValue);
        }
      }
    }
  }

  handleTableClick({ event }) {
    const price = parseFloat(
      event
        .composedPath()
        .find((n) => n?.classList?.contains('quote-line'))
        ?.getAttribute('price')
    );

    return this.broadcastPrice(price);
  }

  #getMyOrdersPricesAndSizes() {
    const buyOrdersPricesAndSizes = new Map();
    const sellOrdersPricesAndSizes = new Map();

    if (this.instrument) {
      for (const [_, order] of this.orders) {
        if (
          order.status === 'working' &&
          order.filled < order.quantity &&
          order.instrument?.symbol === this.instrument.symbol
        ) {
          const map = {
            buy: buyOrdersPricesAndSizes,
            sell: sellOrdersPricesAndSizes
          }[order.side];

          const existingValue = map.get(order.price);

          if (typeof existingValue !== 'number') {
            map.set(order.price, order.quantity - order.filled);
          } else {
            map.set(order.price, existingValue + order.quantity - order.filled);
          }
        }
      }
    }

    return { buyOrdersPricesAndSizes, sellOrdersPricesAndSizes };
  }

  orderbookChanged(oldValue, newValue) {
    if (newValue === '—') {
      newValue = {
        bids: [],
        asks: []
      };
    }

    if (oldValue !== null && newValue)
      this.#lastOrderBookValue = ppp.structuredClone(newValue);

    const orderbook = ppp.structuredClone(newValue);

    if (orderbook && this.instrument) {
      if (!Array.isArray(orderbook.bids)) orderbook.bids = [];

      if (!Array.isArray(orderbook.asks)) orderbook.asks = [];

      const { buyOrdersPricesAndSizes, sellOrdersPricesAndSizes } =
        this.#getMyOrdersPricesAndSizes();

      // 1. Buy orders, descending
      for (const [price, volume] of buyOrdersPricesAndSizes) {
        let insertAtTheEnd = true;

        for (let i = 0; i < orderbook.bids?.length; i++) {
          const bookPriceAtThisLevel = orderbook.bids[i].price;

          if (price === bookPriceAtThisLevel) {
            orderbook.bids[i].my = volume;

            if (orderbook.bids[i].volume < volume)
              orderbook.bids[i].volume = volume + orderbook.bids[i].volume;

            insertAtTheEnd = false;

            break;
          } else if (price > bookPriceAtThisLevel) {
            orderbook.bids.splice(i, 0, {
              price,
              volume,
              my: volume,
              pool: this.bookTrader?.hasCap(TRADER_CAPS.CAPS_MIC)
                ? this.bookTrader?.document?.exchange ?? 'SPBX'
                : void 0
            });

            insertAtTheEnd = false;

            break;
          }
        }

        if (insertAtTheEnd) {
          orderbook.bids.push({
            price,
            volume,
            my: volume,
            pool: this.bookTrader?.hasCap(TRADER_CAPS.CAPS_MIC)
              ? this.bookTrader?.document?.exchange ?? 'SPBX'
              : void 0
          });
        }
      }

      // 2. Sell orders, ascending
      for (const [price, volume] of sellOrdersPricesAndSizes) {
        let insertAtTheEnd = true;

        for (let i = 0; i < orderbook.asks?.length; i++) {
          const bookPriceAtThisLevel = orderbook.asks[i].price;

          if (price === bookPriceAtThisLevel) {
            orderbook.asks[i].my = volume;

            if (orderbook.asks[i].volume < volume)
              orderbook.asks[i].volume = volume + orderbook.asks[i].volume;

            insertAtTheEnd = false;

            break;
          } else if (price < bookPriceAtThisLevel) {
            orderbook.asks.splice(i, 0, {
              price,
              volume,
              my: volume,
              pool: this.bookTrader?.hasCap(TRADER_CAPS.CAPS_MIC)
                ? this.bookTrader?.document?.exchange ?? 'SPBX'
                : void 0
            });

            insertAtTheEnd = false;

            break;
          }
        }

        if (insertAtTheEnd) {
          orderbook.asks.push({
            price,
            volume,
            my: volume,
            pool: this.bookTrader?.hasCap(TRADER_CAPS.CAPS_MIC)
              ? this.bookTrader?.document?.exchange ?? 'SPBX'
              : void 0
          });
        }
      }

      if (orderbook.bids?.length && orderbook.asks?.length) {
        const bestBid = orderbook.bids[0]?.price;
        const bestAsk = orderbook.asks[0]?.price;

        this.spreadString = `${formatPriceWithoutCurrency(
          bestAsk - bestBid,
          this.instrument
        )} (${formatPercentage((bestAsk - bestBid) / bestBid)})`;
      }

      let max = Math.max(
        orderbook.bids?.length ?? 0,
        orderbook.asks?.length ?? 0
      );

      if (max > this.document.depth) max = this.document.depth;

      this.quoteLines = [];
      this.maxSeenVolume = 0;

      for (let i = 0; i < max; i++) {
        const bid = orderbook.bids[i] ?? null;
        const ask = orderbook.asks[i] ?? null;

        if (bid) {
          bid.pool = this.normalizePool(bid.pool);

          this.maxSeenVolume = Math.max(this.maxSeenVolume, bid.volume);
        }

        if (ask) {
          ask.pool = this.normalizePool(ask.pool);

          this.maxSeenVolume = Math.max(this.maxSeenVolume, ask.volume);
        }

        this.quoteLines.push({
          bid,
          ask
        });
      }

      Observable.notify(this, 'quoteLines');
    } else this.spreadString = '—';
  }

  normalizePool(pool) {
    if (!pool || !this.document.useMicsForPools) return pool;

    const mic = {
      PA: 'ARCA',
      DA: 'EDGA',
      DX: 'EDGX',
      SPBX: 'SPBX',
      // Y
      BT: 'BYX',
      // M
      MW: 'CHX',
      // NYSE American (AMEX)
      A: 'AMEX',
      // NASDAQ OMX BX
      B: 'BX',
      // National Stock Exchange
      C: 'NSX',
      // FINRA ADF
      D: 'XADF',
      // Market Independent
      E: 'MIND',
      // MIAX Pearl, LLC (MIAX)
      H: 'HPE',
      // International Securities Exchange
      I: 'XISX',
      // Cboe EDGA
      J: 'EDGA',
      // Cboe EDGX
      K: 'EDGX',
      // Long-Term Stock Exchange (LTSE)
      L: 'LTE',
      // NYSE Chicago, Inc.
      M: 'CHX',
      // New York Stock Exchange
      N: 'NYSE',
      // NYSE Arca
      P: 'ARCA',
      // NASDAQ OMX
      Q: 'XNAS',
      // NASDAQ Small Cap
      S: 'XNCM',
      // NASDAQ Int
      T: 'XNIM',
      // Members Exchange, MEMX LLC (MEMX)
      U: 'MMX',
      // Investor's Exchange LLC (IEX)
      V: 'IEX',
      // CBOE
      W: 'CBOE',
      // Nasdaq PHLX LLC
      X: 'PHO',
      // Cboe BYX Exchange
      Y: 'BYX',
      // Cboe BZX Exchange
      Z: 'BZX'
    }[pool];

    if (!mic) return pool;

    return mic;
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

  async instrumentChanged(oldValue, newValue) {
    this.orderbook = {
      bids: [],
      asks: []
    };

    super.instrumentChanged(oldValue, newValue);

    await this.bookTrader?.instrumentChanged?.(this, oldValue, newValue);
    Observable.notify(this, 'orders');
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
        bookTraderId: this.container.bookTraderId.value,
        ordersTraderId: this.container.ordersTraderId.value,
        depth: Math.abs(this.container.depth.value),
        displayMode: this.container.displayMode.value,
        useMicsForPools: this.container.useMicsForPools.checked
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
    tags: ['Биржевой стакан'],
    description: html`<span class="positive">Книга заявок</span> отображает
      таблицу лимитных заявок финансового инструмента на покупку и продажу.`,
    customElement: PppOrderbookWidget.compose(definition),
    maxHeight: 1440,
    maxWidth: 2560,
    defaultHeight: 375,
    defaultWidth: 280,
    minHeight: 120,
    minWidth: 140,
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
                  $and: [
                    {
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_ORDERBOOK%]`
                    },
                    {
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.bookTraderId ?? ''%]` }
                      ]
                    }
                  ]
                })
                .sort({ updatedAt: -1 });
            };
          }}"
          :transform="${() => ppp.decryptDocumentsTransformation()}"
        ></ppp-collection-select>
        <${'ppp-button'}
          class="margin-top"
          @click="${() => window.open('?page=trader', '_blank').focus()}"
          appearance="primary"
        >
          Создать нового трейдера
        </ppp-button>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер активных заявок</h5>
          <p>Трейдер, который будет отображать собственные лимитные заявки
            (количество) на ценовых уровнях.</p>
        </div>
        <ppp-collection-select
          ${ref('ordersTraderId')}
          placeholder="Опционально, нажмите для выбора"
          value="${(x) => x.document.ordersTraderId}"
          :context="${(x) => x}"
          :preloaded="${(x) => x.document.ordersTrader ?? ''}"
          :query="${() => {
            return (context) => {
              return context.services
                .get('mongodb-atlas')
                .db('ppp')
                .collection('traders')
                .find({
                  $and: [
                    {
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_ACTIVE_ORDERS%]`
                    },
                    {
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.ordersTraderId ?? ''%]` }
                      ]
                    }
                  ]
                })
                .sort({ updatedAt: -1 });
            };
          }}"
          :transform="${() => ppp.decryptDocumentsTransformation()}"
        ></ppp-collection-select>
        <${'ppp-button'}
          class="margin-top"
          @click="${() => window.open('?page=trader', '_blank').focus()}"
          appearance="primary"
        >
          Создать нового трейдера
        </ppp-button>
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
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Параметры отображения</h5>
        </div>
        <${'ppp-checkbox'}
          ?checked="${(x) => x.document.useMicsForPools}"
          ${ref('useMicsForPools')}
        >
          Отображать пулы ликвидности кодами MIC
        </${'ppp-checkbox'}>
      </div>
    `
  };
}
