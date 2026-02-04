/** @decorator */

import {
  widgetStyles,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetDefaultEmptyStateTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import {
  html,
  css,
  attr,
  ref,
  observable
} from '../../vendor/fast-element.min.js';
import {
  BROKERS,
  EXCHANGE,
  TRADER_DATUM,
  WIDGET_TYPES
} from '../../lib/const.js';
import { pause, trash, refresh } from '../../static/svg/sprite.js';
import {
  formatAmount,
  formatPercentage,
  formatPriceWithoutCurrency,
  formatQuantity,
  priceCurrencySymbol,
  stringToFloat
} from '../../lib/intl.js';
import {
  normalize,
  spacing,
  getTraderSelectOptionColor,
  ellipsis
} from '../../design/styles.js';
import { createThemed } from '../../design/design-tokens.js';
import {
  buy,
  fontSizeWidget,
  lighten,
  lineHeightWidget,
  paletteBlack,
  paletteBlueBase,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark4,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteWhite,
  sell,
  spacing1,
  spacing2,
  themeConditional,
  toColorComponents
} from '../../design/design-tokens.js';
import { Tmpl } from '../../lib/tmpl.js';
import { colorSelectorTemplate } from '../pages/widget.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import '../banner.js';
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
      ${widgetDefaultHeaderTemplate({
        buttons: html`
          <div
            ?hidden="${(x) => !x.document.showPauseButton}"
            title="Обновить вручную"
            class="button"
            slot="start"
            @click="${(x) => {
              x.refresh();
            }}"
          >
            ${html.partial(refresh)}
          </div>
          <div
            ?hidden="${(x) => !x.document.showPauseButton}"
            title="Пауза"
            class="button${(x) => (x.paused ? ' earth' : '')}"
            slot="start"
            @click="${(x) => {
              x.togglePause();
            }}"
          >
            ${html.partial(pause)}
          </div>
          <div
            ?hidden="${(x) => !x.document.showResetButton}"
            title="Очистить виджет"
            class="button"
            slot="start"
            @click="${(x) => {
              x.clear();
            }}"
          >
            ${html.partial(trash)}
          </div>
        `
      })}
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
        <div class="widget-content" ?hidden="${(x) => !x.mayShowContent}">
          <div class="header">
            <span class="title-left">
              ${(x) => {
                if (x.document.displayMode === '1-column') {
                  return html`
                    <span class="negative">Ask</span>/<span class="positive">
                      Bid </span
                    >, ${priceCurrencySymbol(x.instrument)}
                  `;
                } else if (x.document.displayMode === '2-columns') {
                  return html`<span class="positive">Bid</span>`;
                } else if (x.document.displayMode === 'compact') {
                  return html`
                    <span class="positive">Bid</span>,
                    ${priceCurrencySymbol(x.instrument)}
                  `;
                }

                return '';
              }}
            </span>
            <span
              class="title-center"
              ?hidden="${(x) => x.document.displayMode === '1-column'}"
            >
              ${(x) => {
                if (x.document.displayMode === '2-columns') {
                  return `${ppp.t('$g.price')}, ${priceCurrencySymbol(
                    x.instrument
                  )}`;
                } else if (
                  x.document.displayMode === 'compact' &&
                  (x.document.showSpread ?? true)
                ) {
                  return x.spreadString;
                }

                return '';
              }}
            </span>
            <span
              class="title-right"
              ?hidden="${(x) => x.document.displayMode === '1-column'}"
            >
              ${(x) => {
                if (x.document.displayMode === '2-columns') {
                  return html`<span class="negative">Ask</span>`;
                } else if (x.document.displayMode === 'compact') {
                  return html`
                    <span class="negative">Ask</span>,
                    ${priceCurrencySymbol(x.instrument)}
                  `;
                }

                return '';
              }}
            </span>
          </div>
          <div class="holder" ${ref('holder')} ?hidden="${(x) => x.empty}">
            <div
              ${ref('columnarAsks')}
              class="asks columnar"
              ?hidden="${(x) => x.document.displayMode === 'compact'}"
            ></div>
            <div
              class="spread-bar"
              ?hidden="${(x) =>
                x.document.displayMode === 'compact' ||
                !(x.document.showSpread ?? true)}"
            >
              <span class="title-center">${(x) => x.spreadString}</span>
            </div>
            <div
              ${ref('columnarBids')}
              class="bids columnar"
              ?hidden="${(x) => x.document.displayMode === 'compact'}"
            ></div>
            <div
              class="compact-holder"
              ?hidden="${(x) => x.document.displayMode !== 'compact'}"
            >
              <div class="bids compact" ${ref('compactBids')}></div>
              <div class="asks compact" ${ref('compactAsks')}></div>
            </div>
          </div>
        </div>
        <ppp-widget-empty-state-control
          ?hidden="${(x) => !x.empty || !x.mayShowContent}"
        >
          ${() => ppp.t('$widget.emptyState.noDataToDisplay')}
        </ppp-widget-empty-state-control>
        ${widgetDefaultEmptyStateTemplate()}
      </div>
      <ppp-widget-notifications-area></ppp-widget-notifications-area>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const orderbookWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  ${spacing()}
  .header, 
  .spread-bar {
    display: flex;
    gap: 0 ${spacing1};
    justify-content: space-between;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    height: 26px;
    border: 0 solid ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    border-bottom-width: 1px;
    padding: 5px 8px 3px;
    white-space: nowrap;
    z-index: 4;
  }

  .spread-bar {
    border-top-width: 1px;
    margin-top: 1px;
    transform: translateY(-1px);
    justify-content: center;
  }

  .header {
    position: sticky;
    top: 0;
    background: ${themeConditional(paletteWhite, paletteBlack)};
  }

  .title-left,
  .title-right {
    font-weight: 500;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  .title-center {
    font-weight: 400;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  .holder {
    position: relative;
    width: 100%;
  }

  .compact-holder {
    position: relative;
    display: flex;
    z-index: 0;
    width: 100%;
    text-rendering: optimizeSpeed;
    contain: layout;
  }

  .bids.columnar,
  .asks.columnar {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    text-rendering: optimizeSpeed;
    contain: layout;
    overflow: hidden;
    cursor: pointer;
  }

  .bids.compact,
  .asks.compact {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: fit-content;
    cursor: pointer;
  }

  .bids.compact .pool,
  .bids.compact .price {
    text-align: left;
  }

  .bids.compact .volume {
    text-align: right;
    margin-right: ${spacing1};
  }

  .asks.columnar > div:first-of-type,
  .bids.columnar > div:first-of-type,
  .bids.compact > div:first-of-type {
    margin: 0 ${spacing2};
  }

  .asks.compact .pool,
  .asks.compact .price {
    text-align: right;
  }

  .asks.compact .volume {
    text-align: left;
    margin: 0 ${spacing2};
  }

  .asks.columnar .volume,
  .bids.columnar .volume {
    text-align: right;
    margin: 0 ${spacing2};
  }

  .asks.compact > div:last-child {
    margin: 0 ${spacing2};
  }

  .pool,
  .price,
  .volume {
    color: ${themeConditional(paletteGrayBase, lighten(paletteGrayLight1, 10))};
    pointer-events: none;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0;
    line-height: 20px;
    position: relative;
    overflow: hidden;
    white-space: pre;
    user-select: none;
    cursor: pointer;
    text-rendering: optimizeSpeed;
    min-width: 40px;
    z-index: 2;
    transform: translateY(-1px);
  }

  .asks.columnar .volume,
  .bids.columnar .volume {
    min-width: 50px;
  }

  .my {
    display: inline-block;
    cursor: pointer;
    background-color: ${paletteBlueBase};
    color: ${paletteWhite};
    font-size: calc(${fontSizeWidget} - 1px);
    line-height: 13px;
    min-height: 13px;
    min-width: 16px;
    padding: 1px 2px;
    pointer-events: none;
    transform: translateY(-1px);
  }

  .my > span {
    min-height: 16px;
    margin: 0 4px;
    word-wrap: normal;
    ${ellipsis()};
  }

  svg[orderbook]{
    position: absolute;
    pointer-events: none;
    z-index: 0;
    width: 100%;
  }

  polygon.border {
    fill: ${themeConditional(lighten(paletteGrayLight2, 10), paletteGrayDark4)};
  }

  polygon.level1 {
    --orderbook-ask-color: rgba(
      ${toColorComponents(sell)},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
    --orderbook-bid-color: rgba(
      ${toColorComponents(buy)},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
  }
`;

export class OrderbookWidget extends WidgetWithInstrument {
  #refs = {
    bids: {
      holder: null,
      svg: {
        hover: null,
        borders: null,
        level1: null,
        level2: null,
        level3: null,
        level4: null,
        level5: null
      },
      pool: null,
      price: null,
      volume: null
    },
    asks: {
      holder: null,
      svg: {
        borders: null,
        hover: null,
        level1: null,
        level2: null,
        level3: null,
        level4: null,
        level5: null
      },
      pool: null,
      price: null,
      volume: null
    }
  };

  @attr({ mode: 'boolean' })
  empty;

  @observable
  bookTrader;

  @observable
  ordersTrader;

  @observable
  realOrder;

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

  // By price, then by orderId.
  orders = new Map();

  @observable
  spreadString;

  maxSeenVolume;

  bookProcessorFunc;

  #updateNeeded = false;

  @observable
  paused;

  togglePause() {
    this.paused = !this.paused;
  }

  refresh() {
    this.#updateNeeded = true;
  }

  clear() {
    this.montage = {
      bids: [],
      asks: []
    };
    this.empty = true;
  }

  constructor() {
    super();

    this.spreadString = '—';
    this.maxSeenVolume = 0;
    this.rafLoop = this.rafLoop.bind(this);
  }

  async connectedCallback() {
    super.connectedCallback();

    if (this.document.depth <= 0) {
      this.document.depth = 10;
    }

    if (typeof this.document.levelColoring === 'undefined') {
      this.document.levelColoring = 'volume';
    }

    if (typeof this.document.ownOrdersDisplayMode === 'undefined') {
      this.document.ownOrdersDisplayMode = 'native';
    }

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
      this.initialized = true;

      return this.notificationsArea.error({
        text: 'Отсутствует основной трейдер книги заявок.',
        keep: true
      });
    }

    try {
      this.bookTrader = await ppp.getOrCreateTrader(this.document.bookTrader);
      this.instrumentTrader = this.bookTrader;

      this.#createDOM();

      if (this.document.ordersTrader) {
        this.ordersTrader = await ppp.getOrCreateTrader(
          this.document.ordersTrader
        );
      }

      ppp.app.rafEnqueue(this.rafLoop);

      if (this.document.instrument?.type === 'option') {
        this.selectInstrument(this.document.instrument, { isolate: true });
      } else {
        this.selectInstrument(this.document.symbol, { isolate: true });
      }

      if (this.ordersTrader) {
        await this.ordersTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            realOrder: TRADER_DATUM.REAL_ORDER
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

      this.initialized = true;
    } catch (e) {
      this.initialized = true;

      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    this.#updateNeeded = false;

    ppp.app.rafDequeue(this.rafLoop);

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
          realOrder: TRADER_DATUM.REAL_ORDER
        }
      });
    }

    if (this.extraBookTrader1) {
      await this.extraBookTrader1.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          extraBook1: TRADER_DATUM.ORDERBOOK
        }
      });
    }

    if (this.extraBookTrader2) {
      await this.extraBookTrader2.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          extraBook2: TRADER_DATUM.ORDERBOOK
        }
      });
    }

    if (this.extraBookTrader3) {
      await this.extraBookTrader3.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          extraBook3: TRADER_DATUM.ORDERBOOK
        }
      });
    }

    super.disconnectedCallback();
  }

  #createDOM() {
    const vectors = [
      `<svg orderbook xmlns="http://www.w3.org/2000/svg" width="100%" height="${
        (this.document.depth ?? 1) * 20
      }px" preserveAspectRatio="none" viewBox="0 0 100 ${
        (this.document.depth ?? 1) * 20
      }">`,
      '<polygon class="level1" stroke="none"></polygon>',
      '<polygon class="level2" stroke="none"></polygon>',
      '<polygon class="level3" stroke="none"></polygon>',
      '<polygon class="level4" stroke="none"></polygon>',
      '<polygon class="level5" stroke="none"></polygon>',
      '<polygon class="border" stroke="none"></polygon>',
      '<rect x="0" y="-20" class="hover" width="100%" height="19px" stroke="none"></rect></svg>'
    ];

    if (this.document.displayMode === 'compact') {
      this.shadowRoot.querySelector('.widget-content').classList.add('compact');

      this.#refs.bids.holder = this.compactBids;
      this.#refs.asks.holder = this.compactAsks;

      this.#refs.bids.holder.insertAdjacentHTML(
        'afterbegin',
        [
          '<div class="pool"></div><div class="price"></div><div class="volume"></div>',
          ...vectors
        ].join('')
      );

      this.#refs.asks.holder.insertAdjacentHTML(
        'afterbegin',
        [
          ...vectors,
          '<div class="volume"></div><div class="price"></div><div class="pool"></div>'
        ].join('')
      );
    } else {
      this.shadowRoot
        .querySelector('.widget-content')
        .classList.add('columnar');

      this.#refs.bids.holder = this.columnarBids;
      this.#refs.asks.holder = this.columnarAsks;

      this.#refs.bids.holder.insertAdjacentHTML(
        'afterbegin',
        [
          '<div class="pool"></div><div class="price"></div><div class="volume"></div>',
          ...vectors
        ].join('')
      );

      this.#refs.asks.holder.insertAdjacentHTML(
        'afterbegin',
        [
          ...vectors,
          '<div class="pool"></div><div class="price"></div><div class="volume"></div>'
        ].join('')
      );
    }

    [this.#refs.bids.holder, this.#refs.asks.holder].forEach((holder, i) => {
      holder.addEventListener('pointerdown', (e) => {
        const isBid = i === 0;
        const rect = holder.getBoundingClientRect();
        const win = holder.ownerDocument.defaultView;
        const top = rect.top + win.pageYOffset;
        const y = Math.trunc(e.clientY - top);
        const index = Math.max(
          0,
          y % 20 === 0 ? y / 20 - 1 : Math.floor(y / 20)
        );
        const askCount = Math.min(
          this.document.depth,
          this.montage.asks.length ?? 0
        );

        if (
          isBid &&
          index < Math.min(this.document.depth, this.montage?.bids.length ?? 0)
        ) {
          const price = this.montage.bids[index].price;

          if (!isNaN(price)) {
            return this.broadcastPrice(price);
          }
        } else if (!isBid && index < askCount) {
          const price =
            this.document.displayMode === 'compact'
              ? this.montage.asks[index].price
              : this.montage.asks[askCount - index - 1].price;

          if (!isNaN(price)) {
            return this.broadcastPrice(price);
          }
        }
      });

      holder.addEventListener('pointermove', (e) => {
        const isBid = i === 0;
        const rect = holder.getBoundingClientRect();
        const win = holder.ownerDocument.defaultView;
        const top = rect.top + win.pageYOffset;
        const y = Math.trunc(e.clientY - top);
        const index = Math.max(
          0,
          y % 20 === 0 ? y / 20 - 1 : Math.floor(y / 20)
        );

        if (isBid) {
          if (
            index <
            Math.min(this.document.depth, this.montage?.bids.length ?? 0)
          ) {
            this.#refs.bids.svg.hover.setAttribute('y', 20 * index);
          } else {
            this.#refs.bids.svg.hover.setAttribute('y', '-20');
          }
        } else {
          if (
            index <
            Math.min(this.document.depth, this.montage?.asks.length ?? 0)
          ) {
            this.#refs.asks.svg.hover.setAttribute('y', 20 * index);
          } else {
            this.#refs.asks.svg.hover.setAttribute('y', '-20');
          }
        }
      });

      holder.addEventListener('pointerout', (e) => {
        const isBid = i === 0;

        if (isBid) {
          this.#refs.bids.svg.hover.setAttribute('y', '-20');
        } else {
          this.#refs.asks.svg.hover.setAttribute('y', '-20');
        }
      });
    });

    this.#refs.bids.pool = this.#refs.bids.holder.querySelector('.pool');
    this.#refs.bids.price = this.#refs.bids.holder.querySelector('.price');
    this.#refs.bids.volume = this.#refs.bids.holder.querySelector('.volume');
    this.#refs.bids.svg.borders =
      this.#refs.bids.holder.querySelector('polygon.border');
    this.#refs.bids.svg.hover =
      this.#refs.bids.holder.querySelector('rect.hover');

    this.#refs.asks.pool = this.#refs.asks.holder.querySelector('.pool');
    this.#refs.asks.price = this.#refs.asks.holder.querySelector('.price');
    this.#refs.asks.volume = this.#refs.asks.holder.querySelector('.volume');
    this.#refs.asks.svg.borders =
      this.#refs.asks.holder.querySelector('polygon.border');
    this.#refs.asks.svg.hover =
      this.#refs.asks.holder.querySelector('rect.hover');

    [this.#refs.bids.svg.hover, this.#refs.asks.svg.hover].forEach((rect) =>
      rect.setAttribute(
        'fill',
        `rgba(${themeConditional(
          toColorComponents(paletteGrayLight2),
          toColorComponents(paletteGrayDark1)
        ).createCSS()},0.7)`
      )
    );

    if (this.document.showPools === false) {
      this.#refs.bids.pool.remove();
      this.#refs.asks.pool.remove();

      this.#refs.bids.pool = null;
      this.#refs.asks.pool = null;
    }

    this.#refs.bids.svg.level1 =
      this.#refs.bids.holder.querySelector('.level1');
    this.#refs.asks.svg.level1 =
      this.#refs.asks.holder.querySelector('.level1');
    this.#refs.bids.svg.level2 =
      this.#refs.bids.holder.querySelector('.level2');
    this.#refs.asks.svg.level2 =
      this.#refs.asks.holder.querySelector('.level2');
    this.#refs.bids.svg.level3 =
      this.#refs.bids.holder.querySelector('.level3');
    this.#refs.asks.svg.level3 =
      this.#refs.asks.holder.querySelector('.level3');
    this.#refs.bids.svg.level4 =
      this.#refs.bids.holder.querySelector('.level4');
    this.#refs.asks.svg.level4 =
      this.#refs.asks.holder.querySelector('.level4');
    this.#refs.bids.svg.level5 =
      this.#refs.bids.holder.querySelector('.level5');
    this.#refs.asks.svg.level5 =
      this.#refs.asks.holder.querySelector('.level5');

    if (this.document.levelColoring === 'volume') {
      this.#refs.bids.svg.level1.setAttribute(
        'fill',
        'var(--orderbook-bid-color)'
      );
      this.#refs.asks.svg.level1.setAttribute(
        'fill',
        'var(--orderbook-ask-color)'
      );
    } else if (this.document.levelColoring === 'ordinal') {
      const DEFAULT_COLORS = {
        Dark: [
          'palette-green-base',
          'palette-red-base',
          'palette-yellow-base',
          'palette-blue-base',
          'palette-gray-base'
        ],
        opacity: [20, 20, 20, 20, 0]
      };

      DEFAULT_COLORS.Light = DEFAULT_COLORS.Dark;

      [1, 2, 3, 4, 5].forEach((L) => {
        const theme = ppp.darkMode ? 'Dark' : 'Light';
        let color = this.document[`level${L}Bg${theme}`];

        if (color === 'default') {
          color = DEFAULT_COLORS[theme][L - 1];
        }

        const opacity = parseInt(
          this.document[`level${L}BgOpacity`] || DEFAULT_COLORS.opacity[L - 1]
        );

        this.#refs.bids.svg['level' + L].setAttribute(
          'fill',
          `rgba(${toColorComponents(createThemed(color)).createCSS()},${(
            opacity / 100
          ).toFixed(2)})`
        );
        this.#refs.asks.svg['level' + L].setAttribute(
          'fill',
          `rgba(${toColorComponents(createThemed(color)).createCSS()}, ${(
            opacity / 100
          ).toFixed(2)})`
        );
      });
    }
  }

  rafLoop() {
    if (
      this.$fastController.isConnected &&
      this.#updateNeeded &&
      this.instrument
    ) {
      this.#updateNeeded = false;

      this.#repaint();
    }
  }

  #repaint() {
    const montage = this.montage ?? {
      bids: [],
      asks: []
    };

    this.empty = !montage.bids?.length && !montage.asks?.length;

    const bestBid = montage.bids[0]?.price ?? 0;
    const bestAsk = montage.asks[0]?.price ?? 0;
    // For my orders.
    const seenBidPrices = new Set();
    const seenAskPrices = new Set();

    this.spreadString = `${formatAmount(
      Math.max(0, bestAsk - bestBid),
      this.instrument,

      {
        style: 'decimal',
        minimumFractionDigits: 2
      }
    )} (${formatPercentage(Math.max(0, (bestAsk - bestBid) / bestBid))})`;

    let maxSeenVolume = 0;

    // Bid side.
    let bidPoolValues = '';
    let bidPriceValues = '';
    let bidVolumeValues = '';
    let bidBorderPoints = '';
    let bidLevel = 0;
    const bidLevels = ['', '', '', '', ''];
    const bidCount = Math.min(this.document.depth, montage.bids.length);

    for (let i = 0; i < bidCount; i++) {
      const bid = montage.bids[i];

      if (+bid.price === 0 || +bid.volume === 0) {
        continue;
      }

      maxSeenVolume = Math.max(maxSeenVolume, bid.volume);

      if (this.#refs.bids.pool) {
        bidPoolValues += this.normalizePool(bid.pool, 'bid') + '\n';
      }

      let my = 0;

      for (const [left] of this.orders.get(bid.price.toString())?.values() ??
        []) {
        my += left;
      }

      bidPriceValues +=
        formatPriceWithoutCurrency(
          bid.price,
          this.instrument,
          this.instrument.broker === BROKERS.UTEX
        ) + '\n';

      let formattedVolume = '';

      if (bid.pool === 'LD') {
        formattedVolume = '&nbsp;' + '⬇️';
      } else if (!bid.virtual) {
        formattedVolume =
          '&nbsp;' + formatQuantity(bid.volume, this.instrument);
      }

      if (my > 0 && !seenBidPrices.has(bid.price)) {
        seenBidPrices.add(bid.price);

        bidVolumeValues +=
          `<span class="my${
            bid.virtual ? ' virtual' : ''
          }"><span>${formatQuantity(
            my,
            this.instrument
          )}</span></span>${formattedVolume}` + '\n';
      } else {
        bidVolumeValues += formattedVolume + '\n';
      }

      if (this.document.showBorders ?? true) {
        bidBorderPoints += `0,${19 + i * 20} 100,${19 + i * 20} 100,${
          20 + i * 20
        } 0,${20 + i * 20} `;
      }

      if (this.document.levelColoring === 'ordinal') {
        if (bidLevel === 0) {
          bidLevel = 1;
        } else if (bid.price !== montage.bids[i - 1].price) {
          bidLevel = Math.min(5, bidLevel + 1);
        }

        bidLevels[bidLevel - 1] += `100,${i * 20} 0,${i * 20} 0,${
          (i + 1) * 20
        } 100,${(i + 1) * 20} `;
      }
    }

    if (this.document.showPools ?? true) {
      this.#refs.bids.pool.textContent = bidPoolValues;
    }

    this.#refs.bids.price.textContent = bidPriceValues;
    this.#refs.bids.volume.innerHTML = bidVolumeValues;

    // Ask side.
    let askPoolValues = '';
    let askPriceValues = '';
    let askVolumeValues = '';
    let askBorderPoints = '';
    let askLevel = 0;
    const askLevels = ['', '', '', '', ''];
    const askCount = Math.min(this.document.depth, montage.asks.length);

    for (let i = 0; i < askCount; i++) {
      const ask =
        this.document.displayMode === 'compact'
          ? montage.asks[i]
          : montage.asks[askCount - i - 1];

      if (+ask.price === 0 || +ask.volume === 0) {
        continue;
      }

      maxSeenVolume = Math.max(maxSeenVolume, ask.volume);

      if (this.#refs.asks.pool) {
        askPoolValues += this.normalizePool(ask.pool, 'ask') + '\n';
      }

      let my = 0;

      for (const [left] of this.orders.get(ask.price.toString())?.values() ??
        []) {
        my += left;
      }

      askPriceValues +=
        formatPriceWithoutCurrency(
          ask.price,
          this.instrument,
          this.instrument.broker === BROKERS.UTEX
        ) + '\n';

      let formattedVolume = '';

      if (ask.pool === 'LU') {
        formattedVolume = '⬆️';
      } else if (!ask.virtual) {
        formattedVolume = formatQuantity(ask.volume, this.instrument);
      }

      if (my > 0 && !seenAskPrices.has(ask.price)) {
        seenAskPrices.add(ask.price);

        if (this.document.displayMode === 'compact') {
          askVolumeValues +=
            `${formattedVolume}${ask.virtual ? '' : '&nbsp;'}<span class="my${
              ask.virtual ? ' virtual' : ''
            }"><span>${formatQuantity(my, this.instrument)}</span></span>` +
            '\n';
        } else {
          askVolumeValues +=
            `<span class="my${
              ask.virtual ? ' virtual' : ''
            }"><span>${formatQuantity(my, this.instrument)}</span></span>${
              ask.virtual ? '' : '&nbsp;'
            }${formattedVolume}` + '\n';
        }
      } else {
        askVolumeValues += formattedVolume + '\n';
      }

      if (this.document.showBorders ?? true) {
        askBorderPoints += `0,${19 + i * 20} 100,${19 + i * 20} 100,${
          20 + i * 20
        } 0,${20 + i * 20} `;
      }

      if (this.document.levelColoring === 'ordinal') {
        if (askLevel === 0) {
          askLevel = 1;
        } else if (ask.price !== montage.asks[i - 1].price) {
          askLevel = Math.min(5, askLevel + 1);
        }

        if (this.document.displayMode === 'compact') {
          askLevels[askLevel - 1] += `0,${i * 20} 100,${i * 20} 100,${
            (i + 1) * 20
          } 0,${(i + 1) * 20} `;
        } else {
          askLevels[askLevel - 1] += `0,${(askCount - i - 1) * 20} 100,${
            (askCount - i - 1) * 20
          } 100,${(askCount - i) * 20} 0,${(askCount - i) * 20} `;
        }
      }
    }

    if (this.document.showPools ?? true) {
      this.#refs.asks.pool.textContent = askPoolValues;
    }

    this.#refs.asks.price.textContent = askPriceValues;
    this.#refs.asks.volume.innerHTML = askVolumeValues;

    // Borders.
    if (this.document.showBorders ?? true) {
      if (bidBorderPoints) {
        this.#refs.bids.svg.borders.setAttribute('points', bidBorderPoints);
      } else {
        this.#refs.bids.svg.borders.removeAttribute('points');
      }

      if (askBorderPoints) {
        this.#refs.asks.svg.borders.setAttribute('points', askBorderPoints);
      } else {
        this.#refs.asks.svg.borders.removeAttribute('points');
      }
    }

    // Coloring - RVol.
    if (this.document.levelColoring === 'volume') {
      if (this.document.displayMode === 'compact') {
        for (let i = 0; i < bidCount; i++) {
          const rvol = 100 - (100 * montage.bids[i].volume) / maxSeenVolume;

          bidLevels[0] += `100,${i * 20} ${rvol},${i * 20} ${rvol},${
            (i + 1) * 20
          } 100,${(i + 1) * 20} `;
        }
      } else {
        for (let i = 0; i < bidCount; i++) {
          const rvol = (100 * montage.bids[i].volume) / maxSeenVolume;

          bidLevels[0] += `0,${i * 20} ${rvol},${i * 20} ${rvol},${
            (i + 1) * 20
          } 0,${(i + 1) * 20} `;
        }
      }

      if (bidLevels[0]) {
        this.#refs.bids.svg.level1.setAttribute('points', bidLevels[0]);
      } else {
        this.#refs.bids.svg.level1.removeAttribute('points');
      }

      for (let i = 0; i < askCount; i++) {
        const rvol = (100 * montage.asks[i].volume) / maxSeenVolume;

        if (this.document.displayMode === 'compact') {
          askLevels[0] += `0,${i * 20} ${rvol},${i * 20} ${rvol},${
            (i + 1) * 20
          } 0,${(i + 1) * 20} `;
        } else {
          askLevels[0] += `0,${(askCount - i - 1) * 20} ${rvol},${
            (askCount - i - 1) * 20
          } ${rvol},${(askCount - i) * 20} 0,${(askCount - i) * 20} `;
        }
      }

      if (askLevels[0]) {
        this.#refs.asks.svg.level1.setAttribute('points', askLevels[0]);
      } else {
        this.#refs.asks.svg.level1.removeAttribute('points');
      }
    } else if (this.document.levelColoring === 'ordinal') {
      [1, 2, 3, 4, 5].forEach((i) => {
        const B = bidLevels[i - 1];
        const A = askLevels[i - 1];

        if (B) {
          this.#refs.bids.svg['level' + i].setAttribute('points', B);
        } else {
          this.#refs.bids.svg['level' + i].removeAttribute('points');
        }

        if (A) {
          this.#refs.asks.svg['level' + i].setAttribute('points', A);
        } else {
          this.#refs.asks.svg['level' + i].removeAttribute('points');
        }
      });
    }
  }

  async instrumentChanged(oldValue, newValue) {
    this.orders.clear();
    super.instrumentChanged(oldValue, newValue);

    this.#updateNeeded = true;
  }

  clearFields() {
    ['mainBook', 'extraBook1', 'extraBook2', 'extraBook3'].forEach(
      (f) => (this[f] = {})
    );

    this.realOrder = void 0;
  }

  #getVirtualOrderPool() {
    let result = this.instrument.exchange;

    if (this.ordersTrader) {
      const foreignInstrument = this.ordersTrader.adoptInstrument(
        this.instrument
      );

      if (!foreignInstrument.notSupported) {
        result = foreignInstrument.exchange;
      }
    }

    if (result === EXCHANGE.UTEX_MARGIN_STOCKS) return 'UT';

    return result || 'NONE';
  }

  #rebuildMontage() {
    const montage = {
      bids: [],
      asks: []
    };

    if (this.document.ownOrdersDisplayMode !== 'native') {
      const pool = this.#getVirtualOrderPool();

      for (let [price, map] of this.orders) {
        price = stringToFloat(price);

        for (const [orderId, [left, side]] of map) {
          if (side === 'buy') {
            montage.bids.push({
              price,
              volume: 1e9,
              pool,
              virtual: true
            });

            break;
          }
        }

        for (const [orderId, [left, side]] of map) {
          if (side === 'sell') {
            montage.asks.push({
              price,
              volume: 1e9,
              pool,
              virtual: true
            });

            break;
          }
        }
      }
    }

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
    this.#rebuildMontage();
  }

  extraBook1Changed() {
    this.#rebuildMontage();
  }

  extraBook2Changed() {
    this.#rebuildMontage();
  }

  extraBook3Changed() {
    this.#rebuildMontage();
  }

  montageChanged() {
    if (!this.paused) {
      this.#updateNeeded = true;
    }

    this.initialized = true;
  }

  realOrderChanged(oldValue, newValue) {
    if (
      this.instrument &&
      newValue?.orderId &&
      this.bookTrader.instrumentsAreEqual(this.instrument, newValue?.instrument)
    ) {
      const price = newValue.price.toString();

      if (!this.orders.has(price.toString())) {
        this.orders.set(price, new Map());
      }

      const left = newValue.quantity - newValue.filled;

      if (newValue.status === 'working' && left > 0) {
        this.orders.get(price).set(newValue.orderId, [left, newValue.side]);
      } else {
        this.orders.get(price).delete(newValue.orderId);
      }
    }

    if (this.document.ownOrdersDisplayMode !== 'native') {
      this.#rebuildMontage();
    } else {
      this.#updateNeeded = true;
    }
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
      this.$$debug('[%s] validate failed: %o', this.document.name, e);

      invalidate(this.container.bookProcessorFunc, {
        errorMessage: 'Код содержит ошибки.',
        raiseException: true
      });
    }

    if (this.container.levelColoring.value === 'ordinal') {
      for (const L of [1, 2, 3, 4, 5]) {
        await validate(this.container[`level${L}BgOpacity`], {
          hook: async (value) => +value >= 0 && +value <= 100,
          errorMessage: 'Введите значение в диапазоне от 0 до 100'
        });
      }
    }
  }

  async submit() {
    return {
      $set: {
        bookTraderId: this.container.bookTraderId.value,
        ordersTraderId: this.container.ordersTraderId.value,
        ownOrdersDisplayMode: this.container.ownOrdersDisplayMode.value,
        extraBookTrader1Id: this.container.extraBookTrader1Id.value,
        extraBookTrader2Id: this.container.extraBookTrader2Id.value,
        extraBookTrader3Id: this.container.extraBookTrader3Id.value,
        extraBookTrader1Enabled: this.container.extraBookTrader1Enabled.checked,
        extraBookTrader2Enabled: this.container.extraBookTrader2Enabled.checked,
        extraBookTrader3Enabled: this.container.extraBookTrader3Enabled.checked,
        bookProcessorFunc: this.container.bookProcessorFunc.value,
        depth: Math.abs(this.container.depth.value),
        displayMode: this.container.displayMode.value,
        showBorders: this.container.showBorders.checked,
        levelColoring: this.container.levelColoring.value,
        showResetButton: this.container.showResetButton.checked,
        showPauseButton: this.container.showPauseButton.checked,
        showSpread: this.container.showSpread.checked,
        showPools: this.container.showPools.checked,
        useMicsForPools: this.container.useMicsForPools.checked,
        level1BgDark: this.container.level1BgDark.value,
        level1BgLight: this.container.level1BgLight.value,
        level1BgOpacity: this.container.level1BgOpacity.value,
        level2BgDark: this.container.level2BgDark.value,
        level2BgLight: this.container.level2BgLight.value,
        level2BgOpacity: this.container.level2BgOpacity.value,
        level3BgDark: this.container.level3BgDark.value,
        level3BgLight: this.container.level3BgLight.value,
        level3BgOpacity: this.container.level3BgOpacity.value,
        level4BgDark: this.container.level4BgDark.value,
        level4BgLight: this.container.level4BgLight.value,
        level4BgOpacity: this.container.level4BgOpacity.value,
        level5BgDark: this.container.level5BgDark.value,
        level5BgLight: this.container.level5BgLight.value,
        level5BgOpacity: this.container.level5BgOpacity.value
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
      таблицу лимитных заявок инструмента на покупку и продажу.`,
    customElement: OrderbookWidget.compose({
      template: orderbookWidgetTemplate,
      styles: orderbookWidgetStyles
    }).define(),
    minWidth: 140,
    minHeight: 80,
    defaultWidth: 300,
    defaultHeight: 350,
    settings: html`
      <ppp-tabs activeid="traders">
        <ppp-tab id="traders">Трейдеры</ppp-tab>
        <ppp-tab id="ui">UI</ppp-tab>
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
              <h5>Трейдер лимитных заявок</h5>
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
              <h5>Отображение своих заявок</h5>
            </div>
            <div class="spacing2"></div>
            <div class="widget-settings-input-group">
              <ppp-radio-group
                orientation="vertical"
                value="${(x) => x.document.ownOrdersDisplayMode ?? 'native'}"
                ${ref('ownOrdersDisplayMode')}
              >
                <ppp-radio value="native">
                  Только если уровень есть у трейдера книги
                </ppp-radio>
                <ppp-radio value="above">
                  Всегда на виртуальном уровне
                </ppp-radio>
              </ppp-radio-group>
            </div>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Дополнительный трейдер книги заявок #1</h5>
            </div>
            <div class="spacing2"></div>
            <div class="control-line">
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
            <div class="spacing2"></div>
            <div class="control-line">
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
            <div class="spacing2"></div>
            <div class="control-line">
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
        <ppp-tab-panel id="ui-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Тип отображения</h5>
            </div>
            <div class="spacing2"></div>
            <div class="widget-settings-input-group">
              <ppp-radio-group
                orientation="vertical"
                value="${(x) => x.document.displayMode ?? 'compact'}"
                ${ref('displayMode')}
              >
                <ppp-radio value="compact">Компактный</ppp-radio>
                <ppp-radio value="1-column">1 колонка</ppp-radio>
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
                standalone
                type="number"
                placeholder="20"
                value="${(x) => x.document.depth ?? 20}"
                ${ref('depth')}
              ></ppp-text-field>
            </div>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Интерфейс заголовка</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-checkbox
              ?checked="${(x) => x.document.showResetButton ?? false}"
              ${ref('showResetButton')}
            >
              Показывать кнопку очистки
            </ppp-checkbox>
             <ppp-checkbox
              ?checked="${(x) => x.document.showPauseButton ?? false}"
              ${ref('showPauseButton')}
            >
              Показывать кнопку паузы
            </ppp-checkbox>
          </div>          
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Наполнение</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-checkbox
              ?checked="${(x) => x.document.showSpread ?? true}"
              ${ref('showSpread')}
            >
              Показывать спред
            </ppp-checkbox>
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
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Ценовые уровни</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-checkbox
              ?checked="${(x) => x.document.showBorders ?? true}"
              ${ref('showBorders')}
            >
              Выделять границы ценовых уровней
            </ppp-checkbox>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Раскраска ценовых уровней</h5>
            </div>
            <div class="spacing2"></div>
            <div class="widget-settings-input-group">
              <ppp-radio-group
                orientation="vertical"
                value="${(x) => x.document.levelColoring ?? 'volume'}"
                ${ref('levelColoring')}
              >
                <ppp-radio value="off">Нет</ppp-radio>
                <ppp-radio value="volume">По относительному объёму</ppp-radio>
                <ppp-radio value="ordinal">По порядковому номеру</ppp-radio>
              </ppp-radio-group>
              <div class="spacing3"></div>
              <div ?hidden="${(x) => x.levelColoring.value !== 'ordinal'}">
                <ppp-banner class="inline" appearance="warning">
                  Параметры слева направо: Тёмная тема, Светлая тема,
                  Прозрачность.
                </ppp-banner>
                <div class="spacing3"></div>
                <div class="control-stack" style="gap: 16px 0">
                  <div class="control-line colors-line">
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level1BgDark',
                        value: x.document.level1BgDark,
                        isDark: true,
                        hideDescription: true
                      })}
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level1BgLight',
                        value: x.document.level1BgLight,
                        hideDescription: true
                      })}
                    <ppp-text-field
                      standalone
                      placeholder="20"
                      min="0"
                      step="1"
                      max="100"
                      type="number"
                      value="${(x) => x.document.level1BgOpacity ?? 20}"
                      ?disabled="${(x) => !x.isSteady()}"
                      ${ref('level1BgOpacity')}
                    ></ppp-text-field>
                  </div>
                  <div class="control-line colors-line">
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level2BgDark',
                        value: x.document.level2BgDark,
                        isDark: true,
                        hideDescription: true
                      })}
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level2BgLight',
                        value: x.document.level2BgLight,
                        hideDescription: true
                      })}
                    <ppp-text-field
                      standalone
                      placeholder="20"
                      min="0"
                      step="1"
                      max="100"
                      type="number"
                      value="${(x) => x.document.level2BgOpacity ?? 20}"
                      ?disabled="${(x) => !x.isSteady()}"
                      ${ref('level2BgOpacity')}
                    ></ppp-text-field>
                  </div>
                  <div class="control-line colors-line">
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level3BgDark',
                        value: x.document.level3BgDark,
                        isDark: true,
                        hideDescription: true
                      })}
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level3BgLight',
                        value: x.document.level3BgLight,
                        hideDescription: true
                      })}
                    <ppp-text-field
                      standalone
                      placeholder="20"
                      min="0"
                      step="1"
                      max="100"
                      type="number"
                      value="${(x) => x.document.level3BgOpacity ?? 20}"
                      ?disabled="${(x) => !x.isSteady()}"
                      ${ref('level3BgOpacity')}
                    ></ppp-text-field>
                  </div>
                  <div class="control-line colors-line">
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level4BgDark',
                        value: x.document.level4BgDark,
                        isDark: true,
                        hideDescription: true
                      })}
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level4BgLight',
                        value: x.document.level4BgLight,
                        hideDescription: true
                      })}
                    <ppp-text-field
                      standalone
                      placeholder="20"
                      min="0"
                      step="1"
                      max="100"
                      type="number"
                      value="${(x) => x.document.level4BgOpacity ?? 20}"
                      ?disabled="${(x) => !x.isSteady()}"
                      ${ref('level4BgOpacity')}
                    ></ppp-text-field>
                  </div>
                  <div class="control-line colors-line">
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level5BgDark',
                        value: x.document.level5BgDark,
                        isDark: true,
                        hideDescription: true
                      })}
                    ${(x) =>
                      colorSelectorTemplate({
                        refName: 'level5BgLight',
                        value: x.document.level5BgLight,
                        hideDescription: true
                      })}
                    <ppp-text-field
                      standalone
                      placeholder="20"
                      min="0"
                      step="1"
                      max="100"
                      type="number"
                      value="${(x) => x.document.level5BgOpacity ?? 0}"
                      ?disabled="${(x) => !x.isSteady()}"
                      ${ref('level5BgOpacity')}
                    ></ppp-text-field>
                  </div>
                </div>
                <div class="spacing4"></div>
                <ppp-button
                  appearance="primary"
                  class="xsmall"
                  ?disabled="${(x) => !x.isSteady()}"
                  @click="${(x) => {
                    for (const L of [1, 2, 3, 4, 5]) {
                      x[`level${L}BgDark`].value = 'default';
                      x[`level${L}BgLight`].value = 'default';
                      x[`level${L}BgOpacity`].value = 20;
                    }

                    x.level5BgOpacity.value = 0;
                  }}"
                >
                  ${() => ppp.t('$g.restoreDefaults')}
                </ppp-button>
              </div>
            </div>
          </div>
        </ppp-tab-panel>
      </ppp-tabs>
    `
  };
}
