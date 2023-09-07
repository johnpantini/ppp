/** @decorator */

import {
  widgetStyles,
  widgetEmptyStateTemplate,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetWithInstrumentBodyTemplate
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  repeat,
  observable
} from '../../vendor/fast-element.min.js';
import {
  EXCHANGE,
  TRADER_CAPS,
  TRADER_DATUM,
  WIDGET_TYPES
} from '../../lib/const.js';
import {
  formatPercentage,
  formatPriceWithoutCurrency,
  priceCurrencySymbol
} from '../../lib/intl.js';
import { ellipsis, normalize, spacing } from '../../design/styles.js';
import {
  buy,
  fontSizeWidget,
  lighten,
  lineHeightWidget,
  negative,
  paletteBlack,
  paletteBlueBase,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark4,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteWhite,
  positive,
  sell,
  themeConditional,
  toColorComponents
} from '../../design/design-tokens.js';
import { Tmpl } from '../../lib/tmpl.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../tabs.js';
import '../text-field.js';
import '../widget-controls.js';

export const defaultBookProcessorFunc = `/**
* Функция обработки книг заявок, поступающих от трейдеров.
*
* @param {object} trader - Экземпляр трейдера PPP.
* @param {array} prices - Массив цен (bid или ask) книги заявок.
* @param {boolean} isBidSide - Тип массива цен, переданного на обработку.
*/

return prices;
`;

export const orderbookWidgetTemplate = html`
  <template>
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
      <div class="widget-body">
        ${widgetWithInstrumentBodyTemplate(html`
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
                      price="${(x) => x.bid?.price}"
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
                        pool="${(x) => x.bid?.pool || 'none'}"
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
                          ${(x) =>
                            x.bid?.pool === 'LD' ? '⬇️' : x.bid?.volume}
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
                          html`<div class="pool">${(x) => x.bid?.pool}</div>`
                        )}
                      </div>
                    </td>
                    <td
                      price="${(x) => x.ask?.price}"
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
                        pool="${(x) => x.ask?.pool || 'none'}"
                      >
                        <div class="volume">
                          ${(x) =>
                            x.ask?.pool === 'LU' ? '⬆️' : x.ask?.volume}
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
                          html` <div class="pool">${(x) => x.ask?.pool}</div> `
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
            html`${html.partial(
              widgetEmptyStateTemplate('Книга заявок пуста.')
            )}`
          )}
        `)}
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const orderbookWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  ${spacing()}
  .orderbook-table {
    min-width: 140px;
    width: 100%;
    padding: 0;
    user-select: none;
    border-collapse: collapse;
  }

  .orderbook-table th {
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
    background: ${themeConditional(paletteWhite, paletteBlack)};
  }

  .orderbook-table th::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    display: block;
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  .bid-title {
    left: 8px;
    text-align: left;
    position: absolute;
    top: 4px;
    color: ${positive};
  }

  .ask-title {
    right: 8px;
    text-align: right;
    position: absolute;
    top: 4px;
    color: ${negative};
  }

  .bid-title,
  .ask-title {
    font-weight: 500;
  }

  .spread {
    left: 50%;
    transform: translateX(-50%);
    font-weight: 400;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    position: absolute;
    top: 4px;
  }

  .orderbook-table td {
    --orderbook-ask-color: rgba(
      ${toColorComponents(sell)},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
    --orderbook-bid-color: rgba(
      ${toColorComponents(buy)},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
    width: 50%;
    padding: 0;
    border: none;
    border-bottom: 1px solid
      ${themeConditional(lighten(paletteGrayLight2, 10), paletteGrayDark4)};
    background: transparent;
    cursor: pointer;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    ${ellipsis()};
  }

  .ask-line,
  .bid-line {
    width: 100%;
    display: flex;
    padding: 2px 4px;
    font-variant-numeric: tabular-nums;
  }

  .quote-line[pool='LD'] {
    background: rgba(
      ${toColorComponents(paletteGrayBase)},
      ${ppp.darkMode ? 0.7 : 0.3}
    );
  }

  .quote-line[pool='LU'] {
    background: rgba(
      ${toColorComponents(paletteGrayBase)},
      ${ppp.darkMode ? 0.7 : 0.3}
    );
  }

  .ask-line:hover,
  .bid-line:hover {
    background-color: rgba(
      ${themeConditional(
        toColorComponents(paletteGrayLight2),
        toColorComponents(paletteGrayDark1)
      )},
      0.7
    );
  }

  .bid-line {
    flex-direction: row-reverse;
  }

  .my-order {
    display: inline-block;
  }

  .ask-line .my-order {
    margin-left: 1px;
  }

  .bid-line .my-order {
    margin-right: 1px;
  }

  .my-order > span {
    cursor: pointer;
    background-color: ${paletteBlueBase};
    color: ${paletteWhite};
    border-radius: 24px;
    font-size: calc(${fontSizeWidget} - 1px);
    line-height: 16px;
    min-height: 16px;
    min-width: 16px;
    padding: 1px 4px;
  }

  .my-order > span > span {
    min-height: 16px;
    margin: 0 4px;
    word-wrap: normal;
    ${ellipsis()};
  }

  .spacer {
    width: 0;
    margin: 0 auto;
    user-select: none;
  }

  .volume {
    color: ${themeConditional(paletteGrayBase, lighten(paletteGrayLight1, 10))};
    display: flex;
    gap: 0 4px;
  }

  .price,
  .pool {
    margin-right: 8px;
    color: ${themeConditional(paletteGrayBase, lighten(paletteGrayLight1, 10))};
    width: 33.33%;
  }

  .volume {
    width: 33.33%;
    max-width: 33.33%;
  }

  .ask-line .price,
  .ask-line .pool,
  .bid-line .volume {
    text-align: right;
  }

  .bid-line .volume {
    justify-content: flex-end;
  }
`;

export class OrderbookWidget extends WidgetWithInstrument {
  @observable
  bookTrader;

  @observable
  ordersTrader;

  @observable
  currentOrder;

  @observable
  montage;

  @observable
  mainBook;

  @observable
  extraBook1;

  @observable
  extraBook2;

  @observable
  extraBook3;

  // Use this when orders change.
  #lastMontageValue;

  @observable
  orders;

  @observable
  quoteLines;

  @observable
  spreadString;

  maxSeenVolume;

  bookProcessorFunc;

  constructor() {
    super();

    this.spreadString = '—';
    this.maxSeenVolume = 0;
    this.orders = new Map();
    this.quoteLines = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    this.bookProcessorFunc = new Function(
      'trader',
      'prices',
      'isBidSide',
      await new Tmpl().render(
        this,
        this.document.bookProcessorFunc ?? defaultBookProcessorFunc,
        {}
      )
    );

    if (!this.document.bookTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует основной трейдер книги заявок.',
        keep: true
      });
    }

    try {
      this.bookTrader = await ppp.getOrCreateTrader(this.document.bookTrader);
      this.instrumentTrader = this.bookTrader;

      this.selectInstrument(this.document.symbol, { isolate: true });

      if (this.document.ordersTrader) {
        this.ordersTrader = await ppp.getOrCreateTrader(
          this.document.ordersTrader
        );
      }

      if (this.ordersTrader) {
        await this.ordersTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            currentOrder: TRADER_DATUM.ACTIVE_ORDER
          }
        });
      }

      await this.bookTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          mainBook: TRADER_DATUM.ORDERBOOK
        }
      });

      if (
        this.document.extraBookTrader1Enabled &&
        this.document.extraBookTrader1
      ) {
        this.extraBookTrader1 = await ppp.getOrCreateTrader(
          this.document.extraBookTrader1
        );

        await this.extraBookTrader1.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            extraBook1: TRADER_DATUM.ORDERBOOK
          }
        });
      }

      if (
        this.document.extraBookTrader2Enabled &&
        this.document.extraBookTrader2
      ) {
        this.extraBookTrader2 = await ppp.getOrCreateTrader(
          this.document.extraBookTrader2
        );

        await this.extraBookTrader2.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            extraBook2: TRADER_DATUM.ORDERBOOK
          }
        });
      }

      if (
        this.document.extraBookTrader3Enabled &&
        this.document.extraBookTrader3
      ) {
        this.extraBookTrader3 = await ppp.getOrCreateTrader(
          this.document.extraBookTrader3
        );

        await this.extraBookTrader3.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            extraBook3: TRADER_DATUM.ORDERBOOK
          }
        });
      }
    } catch (e) {
      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    if (this.bookTrader) {
      await this.bookTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          mainBook: TRADER_DATUM.ORDERBOOK
        }
      });
    }

    if (this.ordersTrader) {
      await this.ordersTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          currentOrder: TRADER_DATUM.ACTIVE_ORDER
        }
      });
    }

    if (this.extraBookTrader1) {
      await this.extraBookTrader1.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          extraBook1: TRADER_DATUM.ACTIVE_ORDER
        }
      });
    }

    if (this.extraBookTrader2) {
      await this.extraBookTrader2.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          extraBook2: TRADER_DATUM.ACTIVE_ORDER
        }
      });
    }

    if (this.extraBookTrader3) {
      await this.extraBookTrader3.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          extraBook3: TRADER_DATUM.ACTIVE_ORDER
        }
      });
    }

    super.disconnectedCallback();
  }

  #cloneOrderbook2Times(orderbook) {
    const result = [
      {
        bids: [],
        asks: []
      },
      {
        bids: [],
        asks: []
      }
    ];

    const iterationLength = Math.max(
      orderbook?.bids?.length,
      orderbook?.asks?.length
    );

    for (let i = 0; i < iterationLength; i++) {
      const ask = orderbook.asks[i];
      const bid = orderbook.bids[i];

      if (typeof bid !== 'undefined') {
        result[0].bids[i] = {};
        result[1].bids[i] = {};

        if (bid.pool) {
          result[0].bids[i].pool = bid.pool;
          result[1].bids[i].pool = bid.pool;
        }

        if (bid.condition) {
          result[0].bids[i].condition = bid.condition;
          result[1].bids[i].condition = bid.condition;
        }

        if (bid.timestamp) {
          result[0].bids[i].timestamp = bid.timestamp;
          result[1].bids[i].timestamp = bid.timestamp;
        }

        result[0].bids[i].price = +bid.price;
        result[1].bids[i].price = +bid.price;
        result[0].bids[i].volume = +bid.volume;
        result[1].bids[i].volume = +bid.volume;
      }

      if (typeof ask !== 'undefined') {
        result[0].asks[i] = {};
        result[1].asks[i] = {};

        if (ask.pool) {
          result[0].asks[i].pool = ask.pool;
          result[1].asks[i].pool = ask.pool;
        }

        if (ask.condition) {
          result[0].asks[i].condition = ask.condition;
          result[1].asks[i].condition = ask.condition;
        }

        if (ask.timestamp) {
          result[0].asks[i].timestamp = ask.timestamp;
          result[1].asks[i].timestamp = ask.timestamp;
        }

        result[0].asks[i].price = +ask.price;
        result[1].asks[i].price = +ask.price;
        result[0].asks[i].volume = +ask.volume;
        result[1].asks[i].volume = +ask.volume;
      }
    }

    return result;
  }

  #rebuildMontage() {
    const montage = {
      bids: [],
      asks: []
    };

    if (this.mainBook?.bids) {
      montage.bids.push(
        ...this.bookProcessorFunc.call(
          this,
          this.bookTrader,
          this.mainBook.bids,
          true
        )
      );
    }

    if (this.mainBook?.asks) {
      montage.asks.push(
        ...this.bookProcessorFunc.call(
          this,
          this.bookTrader,
          this.mainBook.asks,
          false
        )
      );
    }

    if (this.extraBook1?.bids) {
      montage.bids.push(
        ...this.bookProcessorFunc.call(
          this,
          this.extraBookTrader1,
          this.extraBook1.bids,
          true
        )
      );
    }

    if (this.extraBook1?.asks) {
      montage.asks.push(
        ...this.bookProcessorFunc.call(
          this,
          this.extraBookTrader1,
          this.extraBook1.asks,
          false
        )
      );
    }

    if (this.extraBook2?.bids) {
      montage.bids.push(
        ...this.bookProcessorFunc.call(
          this,
          this.extraBookTrader2,
          this.extraBook2.bids,
          true
        )
      );
    }

    if (this.extraBook2?.asks) {
      montage.asks.push(
        ...this.bookProcessorFunc.call(
          this,
          this.extraBookTrader2,
          this.extraBook2.asks,
          false
        )
      );
    }

    if (this.extraBook3?.bids) {
      montage.bids.push(
        ...this.bookProcessorFunc.call(
          this,
          this.extraBookTrader3,
          this.extraBook3.bids,
          true
        )
      );
    }

    if (this.extraBook3?.asks) {
      montage.asks.push(
        ...this.bookProcessorFunc.call(
          this,
          this.extraBookTrader3,
          this.extraBook3.asks,
          false
        )
      );
    }

    this.montage = {
      bids: montage.bids.sort((a, b) => {
        return b.price - a.price || b.volume - a.volume;
      }),
      asks: montage.asks.sort((a, b) => {
        return a.price - b.price || b.volume - a.volume;
      })
    };
  }

  mainBookChanged() {
    return this.#rebuildMontage();
  }

  extraBook1Changed() {
    return this.#rebuildMontage();
  }

  extraBook2Changed() {
    return this.#rebuildMontage();
  }

  extraBook3Changed() {
    return this.#rebuildMontage();
  }

  montageChanged(oldValue, newValue) {
    if (!Array.isArray(newValue?.bids)) {
      newValue = {
        bids: [],
        asks: []
      };
    }

    const clones = this.#cloneOrderbook2Times(newValue);

    if (oldValue !== null && newValue) {
      this.#lastMontageValue = clones[1];
    }

    const orderbook = clones[0];

    if (orderbook && this.instrument) {
      if (!Array.isArray(orderbook.bids)) orderbook.bids = [];

      if (!Array.isArray(orderbook.asks)) orderbook.asks = [];

      if (!orderbook.bids.length && !orderbook.asks.length) {
        this.quoteLines = [];

        return;
      }

      const { buyOrdersPricesAndSizes, sellOrdersPricesAndSizes } =
        this.#getMyOrdersPricesAndSizes();

      // 1. Buy orders, descending
      for (const [price, volume] of buyOrdersPricesAndSizes) {
        let insertAtTheEnd = true;

        for (let i = 0; i < orderbook.bids?.length; i++) {
          const bookPriceAtThisLevel = orderbook.bids[i].price;

          if (price === bookPriceAtThisLevel) {
            if (this.bookTrader?.hasCap(TRADER_CAPS.CAPS_MIC)) {
              orderbook.bids.splice(i, 0, {
                price,
                volume,
                my: volume,
                pool: this.#getMyOrderPool()
              });
            } else {
              orderbook.bids[i].my = volume;

              if (orderbook.bids[i].volume < volume)
                orderbook.bids[i].volume = volume + orderbook.bids[i].volume;
            }

            insertAtTheEnd = false;

            break;
          } else if (price > bookPriceAtThisLevel) {
            orderbook.bids.splice(i, 0, {
              price,
              volume,
              my: volume,
              pool: this.bookTrader?.hasCap(TRADER_CAPS.CAPS_MIC)
                ? this.#getMyOrderPool()
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
              ? this.#getMyOrderPool()
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
            // Always display fake pool
            if (this.bookTrader?.hasCap(TRADER_CAPS.CAPS_MIC)) {
              orderbook.asks.splice(i, 0, {
                price,
                volume,
                my: volume,
                pool: this.#getMyOrderPool()
              });
            } else {
              orderbook.asks[i].my = volume;

              if (orderbook.asks[i].volume < volume)
                orderbook.asks[i].volume = volume + orderbook.asks[i].volume;
            }

            insertAtTheEnd = false;

            break;
          } else if (price < bookPriceAtThisLevel) {
            orderbook.asks.splice(i, 0, {
              price,
              volume,
              my: volume,
              pool: this.bookTrader?.hasCap(TRADER_CAPS.CAPS_MIC)
                ? this.#getMyOrderPool()
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
              ? this.#getMyOrderPool()
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
          bid.pool = this.normalizePool(bid.pool, 'bid');

          this.maxSeenVolume = Math.max(this.maxSeenVolume, bid.volume);
        }

        if (ask) {
          ask.pool = this.normalizePool(ask.pool, 'ask');

          this.maxSeenVolume = Math.max(this.maxSeenVolume, ask.volume);
        }

        this.quoteLines.push({
          bid,
          ask
        });
      }
    } else this.spreadString = '—';
  }

  currentOrderChanged(oldValue, newValue) {
    let needToChangeMontage;

    if (newValue?.orderId) {
      if (newValue.orderType === 'limit') {
        if (
          newValue.quantity === newValue.filled ||
          newValue.status !== 'working'
        ) {
          if (this.orders.has(newValue.orderId)) {
            this.orders.delete(newValue.orderId);

            needToChangeMontage = true;
          }
        } else if (newValue.status === 'working') {
          this.orders.set(newValue.orderId, newValue);

          needToChangeMontage = true;
        }

        if (
          needToChangeMontage &&
          this.instrument &&
          this.instrumentTrader.instrumentsAreEqual(
            newValue.instrument,
            this.instrument
          )
        ) {
          this.montageChanged(null, this.#lastMontageValue);
        }
      }
    }
  }

  #getMyOrdersPricesAndSizes() {
    const buyOrdersPricesAndSizes = new Map();
    const sellOrdersPricesAndSizes = new Map();

    if (this.instrument) {
      for (const [, order] of this.orders) {
        if (
          order.status === 'working' &&
          order.filled < order.quantity &&
          this.ordersTrader.instrumentsAreEqual(
            order.instrument,
            this.instrument
          )
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

  #getMyOrderPool() {
    let result = this.instrument.exchange;

    if (this.ordersTrader) {
      const foreignInstrument = this.ordersTrader.adoptInstrument(
        this.instrument
      );

      if (foreignInstrument) {
        result = foreignInstrument.exchange;
      }
    }

    if (result === EXCHANGE.UTEX_MARGIN_STOCKS) return 'UTEX';

    return result;
  }

  normalizePool(pool, type) {
    const isLULDPool = pool === 'LU' || pool === 'LD' || pool === 'LULD';

    if (this.document.showPools === false && !isLULDPool) {
      return void 0;
    }

    if (!pool || !this.document.useMicsForPools) {
      if (pool === 'LULD') return type === 'bid' ? 'LD' : 'LU';

      return pool;
    }

    const mic = {
      PA: 'ARCA',
      DA: 'EDGA',
      DX: 'EDGX',
      SPBX: 'SPBX',
      BT: 'BYX',
      LULD: type === 'bid' ? 'LD' : 'LU',
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

  handleTableClick({ event }) {
    const price = parseFloat(
      event
        .composedPath()
        .find((n) => n?.hasAttribute?.('price'))
        ?.getAttribute?.('price')
    );

    if (!isNaN(price)) {
      return this.broadcastPrice(price);
    }
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

  async validate() {
    await validate(this.container.depth);
    await validate(this.container.depth, {
      hook: async (value) => +value > 0 && +value <= 5000,
      errorMessage: 'Введите значение в диапазоне от 1 до 5000'
    });

    try {
      new Function(
        'trader',
        'prices',
        'isBidSide',
        await new Tmpl().render(
          this,
          this.container.bookProcessorFunc.value,
          {}
        )
      );
    } catch (e) {
      console.dir(e);

      invalidate(this.container.bookProcessorFunc, {
        errorMessage: 'Код содержит ошибки.',
        raiseException: true
      });
    }
  }

  async submit() {
    return {
      $set: {
        bookTraderId: this.container.bookTraderId.value,
        ordersTraderId: this.container.ordersTraderId.value,
        extraBookTrader1Id: this.container.extraBookTrader1Id.value,
        extraBookTrader2Id: this.container.extraBookTrader2Id.value,
        extraBookTrader3Id: this.container.extraBookTrader3Id.value,
        extraBookTrader1Enabled: this.container.extraBookTrader1Enabled.checked,
        extraBookTrader2Enabled: this.container.extraBookTrader2Enabled.checked,
        extraBookTrader3Enabled: this.container.extraBookTrader3Enabled.checked,
        bookProcessorFunc: this.container.bookProcessorFunc.value,
        depth: Math.abs(this.container.depth.value),
        displayMode: this.container.displayMode.value,
        showPools: this.container.showPools.checked,
        useMicsForPools: this.container.useMicsForPools.checked
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.ORDERBOOK,
    collection: 'PPP',
    title: html`Книга заявок`,
    tags: ['Биржевой стакан'],
    description: html`<span class="positive">Книга заявок</span> отображает
      таблицу лимитных заявок финансового инструмента на покупку и продажу.`,
    customElement: OrderbookWidget.compose({
      template: orderbookWidgetTemplate,
      styles: orderbookWidgetStyles
    }).define(),
    minWidth: 140,
    minHeight: 120,
    defaultWidth: 280,
    settings: html`
      <ppp-tabs activeid="traders">
        <ppp-tab id="traders">Подключения</ppp-tab>
        <ppp-tab id="appearance">Отображение</ppp-tab>
        <ppp-tab-panel id="traders-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Трейдер книги заявок</h5>
              <p class="description">
                Трейдер, который будет источником книги заявок.
              </p>
            </div>
            <div class="control-line flex-start">
              <ppp-query-select
                ${ref('bookTraderId')}
                deselectable
                standalone
                placeholder="Опционально, нажмите для выбора"
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
                            caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_ORDERBOOK%]`
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
              <h5>Трейдер активных заявок</h5>
              <p class="description">
                Трейдер, который будет отображать собственные лимитные заявки
                (количество) на ценовых уровнях.
              </p>
            </div>
            <div class="control-line flex-start">
              <ppp-query-select
                ${ref('ordersTraderId')}
                standalone
                deselectable
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
                            caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_ACTIVE_ORDERS%]`
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
              <h5>Дополнительный трейдер книги заявок #1</h5>
            </div>
            <div class="control-line flex-start">
              <ppp-checkbox
                standalone
                ?checked="${(x) => x.document.extraBookTrader1Enabled ?? false}"
                ${ref('extraBookTrader1Enabled')}
              >
              </ppp-checkbox>
              <ppp-query-select
                ${ref('extraBookTrader1Id')}
                standalone
                deselectable
                ?disabled=${(x) => !x.extraBookTrader1Enabled.checked}
                placeholder="Опционально, нажмите для выбора"
                value="${(x) => x.document.extraBookTrader1Id}"
                :context="${(x) => x}"
                :preloaded="${(x) => x.document.extraBookTrader1 ?? ''}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({
                        $and: [
                          {
                            caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_ORDERBOOK%]`
                          },
                          {
                            $or: [
                              { removed: { $ne: true } },
                              {
                                _id: `[%#this.document.extraBookTrader1Id ?? ''%]`
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
              <h5>Дополнительный трейдер книги заявок #2</h5>
            </div>
            <div class="control-line flex-start">
              <ppp-checkbox
                standalone
                ?checked="${(x) => x.document.extraBookTrader2Enabled ?? false}"
                ${ref('extraBookTrader2Enabled')}
              >
              </ppp-checkbox>
              <ppp-query-select
                ${ref('extraBookTrader2Id')}
                standalone
                deselectable
                ?disabled=${(x) => !x.extraBookTrader2Enabled.checked}
                placeholder="Опционально, нажмите для выбора"
                value="${(x) => x.document.extraBookTrader2Id}"
                :context="${(x) => x}"
                :preloaded="${(x) => x.document.extraBookTrader2 ?? ''}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({
                        $and: [
                          {
                            caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_ORDERBOOK%]`
                          },
                          {
                            $or: [
                              { removed: { $ne: true } },
                              {
                                _id: `[%#this.document.extraBookTrader2Id ?? ''%]`
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
              <h5>Дополнительный трейдер книги заявок #3</h5>
            </div>
            <div class="control-line flex-start">
              <ppp-checkbox
                standalone
                ?checked="${(x) => x.document.extraBookTrader3Enabled ?? false}"
                ${ref('extraBookTrader3Enabled')}
              >
              </ppp-checkbox>
              <ppp-query-select
                ${ref('extraBookTrader3Id')}
                standalone
                deselectable
                ?disabled=${(x) => !x.extraBookTrader3Enabled.checked}
                placeholder="Опционально, нажмите для выбора"
                value="${(x) => x.document.extraBookTrader3Id}"
                :context="${(x) => x}"
                :preloaded="${(x) => x.document.extraBookTrader3 ?? ''}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({
                        $and: [
                          {
                            caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_ORDERBOOK%]`
                          },
                          {
                            $or: [
                              { removed: { $ne: true } },
                              {
                                _id: `[%#this.document.extraBookTrader3Id ?? ''%]`
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
              <h5>Обработка книг заявок</h5>
              <p class="description">
                Тело функции для обработки книг заявок, поступающих от трейдеров
                виджета.
              </p>
            </div>
            <div class="widget-settings-input-group">
              <ppp-snippet
                standalone
                :code="${(x) =>
                  x.document.bookProcessorFunc ?? defaultBookProcessorFunc}"
                ${ref('bookProcessorFunc')}
                revertable
                @revert="${(x) => {
                  x.bookProcessorFunc.updateCode(defaultBookProcessorFunc);
                }}"
              ></ppp-snippet>
            </div>
          </div>
        </ppp-tab-panel>
        <ppp-tab-panel id="appearance-panel">
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
                <ppp-radio value="compact">Компактный</ppp-radio>
              </ppp-radio-group>
            </div>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Глубина книги заявок</h5>
              <p class="description">
                Количество строк <span class="positive">bid</span> и
                <span class="negative">ask</span> для отображения.
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
              <h5>Параметры отображения</h5>
            </div>
            <ppp-checkbox
              ?checked="${(x) => x.document.showPools ?? true}"
              ${ref('showPools')}
            >
              Отображать пулы ликвидности в книге заявок
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.useMicsForPools}"
              ${ref('useMicsForPools')}
            >
              Отображать пулы ликвидности кодами MIC
            </ppp-checkbox>
          </div>
        </ppp-tab-panel>
      </ppp-tabs>
    `
  };
}
