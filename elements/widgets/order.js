/** @decorator */

import {
  widget,
  widgetEmptyStateTemplate,
  WidgetWithInstrument
} from '../widget.js';
import { debounce } from '../../lib/ppp-decorators.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  repeat,
  Updates
} from '../../vendor/fast-element.min.js';
import {
  WIDGET_TYPES,
  TRADER_DATUM,
  EXCHANGE,
  TRADERS
} from '../../lib/const.js';
import {
  formatRelativeChange,
  formatAbsoluteChange,
  formatAmount,
  formatPrice,
  formatCommission,
  priceCurrencySymbol,
  getInstrumentPrecision,
  decimalSeparator,
  getInstrumentQuantityPrecision
} from '../../lib/intl.js';
import { ellipsis, normalize, spacing } from '../../design/styles.js';
import { decrement, increment, plus } from '../../static/svg/sprite.js';
import {
  fontSizeWidget,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayLight1,
  paletteGrayLight2,
  buy,
  themeConditional,
  toColorComponents,
  sell,
  paletteWhite,
  paletteGrayLight3,
  darken,
  positive,
  negative
} from '../../design/design-tokens.js';
import { validate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../text-field.js';

const decSeparator = decimalSeparator();

export const orderWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control></ppp-widget-group-control>
          <ppp-widget-search-control></ppp-widget-search-control>
          <span class="widget-title">
            ${when(
              (x) => !x.instrument,
              html`
                <span class="title">${(x) => x.document?.name ?? ''}</span>
              `
            )}
            ${when(
              (x) => x.instrument,
              html`
                <span
                  class="price ${(x) =>
                    x.lastPriceAbsoluteChange < 0 ? 'negative' : 'positive'}"
                >
                  ${(x) => x.formatPrice(x.lastPrice)}
                </span>
                <span
                  class="${(x) =>
                    x.lastPriceAbsoluteChange < 0 ? 'negative' : 'positive'}"
                >
                  ${(x) =>
                    formatAbsoluteChange(
                      x.lastPriceAbsoluteChange,
                      x.instrument
                    )}
                </span>
                <span
                  class="${(x) =>
                    x.lastPriceAbsoluteChange < 0 ? 'negative' : 'positive'}"
                >
                  ${(x) =>
                    formatRelativeChange(x.lastPriceRelativeChange / 100)}
                </span>
              `
            )}
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
            x.ordersTrader &&
            !x.ordersTrader.supportsInstrument(x.instrument),
          html`${html.partial(
            widgetEmptyStateTemplate('Инструмент не поддерживается.')
          )}`
        )}
        ${when(
          (x) =>
            x.instrument &&
            x.ordersTrader &&
            x.ordersTrader.supportsInstrument(x.instrument),
          html`
            <ppp-widget-tabs
              activeid="${(x) => x.getActiveWidgetTab()}"
              @change="${(x, c) => x.handleWidgetTabChange(c)}"
              ${ref('orderTypeTabs')}
            >
              <ppp-widget-tab id="market">Рыночная</ppp-widget-tab>
              <ppp-widget-tab id="limit">Лимитная</ppp-widget-tab>
              <ppp-widget-tab id="stop" disabled>Отложенная</ppp-widget-tab>
              <ppp-tab-panel id="market-panel"></ppp-tab-panel>
              <ppp-tab-panel id="limit-panel"></ppp-tab-panel>
              <ppp-tab-panel id="stop-panel"></ppp-tab-panel>
            </ppp-widget-tabs>
            <div style="height: 100%">
              <div class="company-card">
                <div class="company-card-item">
                  <span
                    title="${(x) => x.instrument?.fullName}"
                    class="company-name"
                  >
                    ${(x) => x.instrument?.fullName}
                  </span>
                  <span
                    @click="${(x) => x.setPrice(x.lastPrice)}"
                    class="company-last-price ${(x) =>
                      x.lastPriceAbsoluteChange < 0 ? 'negative' : 'positive'}"
                  >
                    ${(x) => x.formatPrice(x.lastPrice)}
                  </span>
                </div>
                <div class="company-card-item">
                  <span
                    style="cursor: pointer"
                    @click="${(x) => x.setQuantity(Math.abs(x.positionSize))}"
                  >
                    В портфеле: ${(x) => x.formatPositionSize()}
                  </span>
                  <span>
                    Средняя: ${(x) => x.formatPrice(x.positionAverage ?? 0)}
                  </span>
                </div>
              </div>
              <div class="nbbo-line">
                <div
                  class="nbbo-line-bid"
                  @click="${(x) => x.setPrice(x.bestBid)}"
                >
                  Bid ${(x) => x.formatPrice(x.bestBid)}
                  <div
                    @click="${(x, { event }) => event.stopPropagation()}"
                    class="nbbo-line-icon-holder"
                  >
                    <div class="nbbo-line-icon-fallback">
                      <div
                        class="nbbo-line-icon-logo"
                        style="${(x) =>
                          `background-image:url(${x.searchControl.getInstrumentIconUrl(
                            x.instrument
                          )})`}"
                      ></div>
                      ${(x) => x.instrument?.fullName[0]}
                    </div>
                  </div>
                </div>
                <div
                  class="nbbo-line-ask"
                  @click="${(x) => x.setPrice(x.bestAsk)}"
                >
                  Ask ${(x) => x.formatPrice(x.bestAsk)}
                </div>
              </div>
              <div class="widget-section">
                <div class="widget-subsection">
                  <div class="widget-subsection-item">
                    <div class="widget-text-label">Цена исполнения</div>
                    <div class="widget-flex-line">
                      <ppp-widget-text-field
                        type="text"
                        autocomplete="off"
                        min="0"
                        max="1000000000"
                        step="${(x) =>
                          x.instrument?.minPriceIncrement ?? '0.01'}"
                        precision="${(x) =>
                          getInstrumentPrecision(x.instrument)}"
                        ?disabled="${(x) =>
                          x.orderTypeTabs.activeid === 'market'}"
                        maxlength="12"
                        @wheel="${(x, c) => x.handlePriceWheel(c)}"
                        @input="${(x, c) => x.handlePriceInput(c)}"
                        @keydown="${(x, c) => x.handlePriceKeydown(c)}"
                        @paste="${(x, c) => x.handlePricePaste(c)}"
                        @beforeinput="${(x, c) => x.handlePriceBeforeInput(c)}"
                        value="${(x) =>
                          (x.document?.lastPrice ?? '').replace(
                            '.',
                            decSeparator
                          )}"
                        ${ref('price')}
                      >
                        <span slot="end">
                          ${(x) => priceCurrencySymbol(x.instrument)}
                        </span>
                      </ppp-widget-text-field>
                      <div class="step-controls">
                        <button @click="${(x) => x.stepUp(false)}">
                          ${html.partial(increment)}
                        </button>
                        <button @click="${(x) => x.stepDown(false)}">
                          ${html.partial(decrement)}
                        </button>
                      </div>
                      ${when(
                        (x) => x.orderTypeTabs.activeid === 'market',
                        html`
                          <ppp-widget-text-field
                            class="price-placeholder"
                            disabled
                            placeholder="Рыночная"
                          >
                          </ppp-widget-text-field>
                        `
                      )}
                    </div>
                  </div>
                  <div class="widget-subsection-item">
                    <div class="widget-text-label">Количество</div>
                    <div class="widget-flex-line">
                      <ppp-widget-text-field
                        type="number"
                        autocomplete="off"
                        min="1"
                        max="1000000000"
                        precision="0"
                        maxlength="8"
                        @wheel="${(x, c) => x.handleQuantityWheel(c)}"
                        @input="${(x, c) => x.handleQuantityInput(c)}"
                        @paste="${(x, c) => x.handleQuantityPaste(c)}"
                        @keydown="${(x, c) => x.handleQuantityKeydown(c)}"
                        lotsize="${(x) =>
                          x.instrument?.lot?.toString()?.length ?? 1}"
                        value="${(x) => x.document?.lastQuantity ?? ''}"
                        ${ref('quantity')}
                      >
                        <span slot="end">
                          ${(x) =>
                            x.instrument?.lot ? '×' + x.instrument.lot : ''}
                        </span>
                      </ppp-widget-text-field>
                      <div class="step-controls">
                        <button @click="${(x) => x.stepUp(true)}">
                          ${html.partial(increment)}
                        </button>
                        <button @click="${(x) => x.stepDown(true)}">
                          ${html.partial(decrement)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="widget-margin-spacer"></div>
              ${when(
                (x) => x.document.fastVolumes,
                html`
                  <div class="widget-section">
                    <ppp-widget-box-radio-group
                      wrap
                      readonly
                      class="fast-volume-selector"
                      value="${(x) => x.document.selectedFastVolume}"
                      @click="${(x, c) => x.handleFastVolumeClick(c)}"
                      @dblclick="${(x, c) => x.handleFastVolumeDblClick(c)}"
                      ${ref('fastVolumeButtons')}
                    >
                      ${repeat(
                        (x) => x.getFastVolumeButtonsData(),
                        html`
                          <ppp-widget-box-radio
                            class="xsmall"
                            value="${(x, c) => c.index}"
                            volume="${(x) => x.volume}"
                            ?money="${(x) => x.isInMoney}"
                          >
                            ${when(
                              (x) => x.isInMoney,
                              html` <div class="coin-icon"></div> `
                            )}
                            ${(x) => x.text}
                          </ppp-widget-box-radio>
                        `,
                        { positioning: true, recycle: false }
                      )}
                    </ppp-widget-box-radio-group>
                  </div>
                  <div class="widget-margin-spacer"></div>
                `
              )}
              <div class="widget-section">
                <div class="widget-summary">
                  <div class="widget-summary-line">
                    <span>Стоимость</span>
                    <span class="widget-summary-line-price">
                      ${(x) =>
                        x.orderTypeTabs.activeid === 'market'
                          ? 'по факту сделки'
                          : formatAmount(x.totalAmount, x.instrument?.currency)}
                    </span>
                  </div>
                  <div class="widget-summary-line">
                    <span>Комиссия</span>
                    <span
                      >${(x) =>
                        x.orderTypeTabs.activeid === 'market'
                          ? 'по факту сделки'
                          : formatCommission(x.commission, x.instrument)}</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="widget-footer">
              <div class="widget-section">
                <div class="widget-subsection">
                  <div class="widget-summary">
                    <div
                      class="widget-summary-line"
                      style="cursor:pointer;"
                      @click="${(x) =>
                        x.setQuantity(x.buyingPowerQuantity ?? 0, {
                          force: true
                        })}"
                    >
                      <span>Доступно</span>
                      <span class="positive">
                        ${(x) => x.buyingPowerQuantity ?? '—'}
                      </span>
                    </div>
                    <div
                      class="widget-summary-line"
                      style="cursor:pointer;"
                      @click="${(x) =>
                        x.setQuantity(x.marginBuyingPowerQuantity ?? 0, {
                          force: true
                        })}"
                    >
                      <span>С плечом</span>
                      <span class="positive">
                        ${(x) => x.marginBuyingPowerQuantity ?? '—'}
                      </span>
                    </div>
                  </div>
                  <div class="widget-summary">
                    <div
                      class="widget-summary-line"
                      style="cursor:pointer;"
                      @click="${(x) =>
                        x.setQuantity(x.sellingPowerQuantity ?? 0, {
                          force: true
                        })}"
                    >
                      <span>Доступно</span>
                      <span class="negative">
                        ${(x) => x.sellingPowerQuantity ?? '—'}
                      </span>
                    </div>
                    <div
                      class="widget-summary-line"
                      style="cursor:pointer;"
                      @click="${(x) =>
                        x.setQuantity(x.marginSellingPowerQuantity ?? 0, {
                          force: true
                        })}"
                    >
                      <span>С плечом</span>
                      <span class="negative">
                        ${(x) => x.marginSellingPowerQuantity ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="widget-section-spacer"></div>
              <div class="widget-section">
                <div class="widget-subsection">
                  <ppp-widget-button
                    appearance="primary"
                    @click="${(x) => x.buyOrSell('buy')}"
                  >
                    Покупка
                  </ppp-widget-button>
                  <ppp-widget-button
                    appearance="danger"
                    @click="${(x) => x.buyOrSell('sell')}"
                  >
                    Продажа
                  </ppp-widget-button>
                </div>
              </div>
            </div>
          `
        )}
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const orderWidgetStyles = css`
  ${normalize()}
  ${widget()}
  ${spacing()}
  :host ppp-widget-notifications-area {
    bottom: 55px;
  }

  div.widget-empty-state-holder + ppp-widget-notifications-area {
    bottom: 20px;
  }

  .company-card {
    width: 100%;
    padding: 10px 10px 0;
    font-size: ${fontSizeWidget};
    text-align: left;
  }

  .company-card-item {
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    display: flex;
    align-items: center;
    line-height: 20px;
    justify-content: space-between;
  }

  .company-card-item:first-child {
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
    font-size: calc(${fontSizeWidget} + 4px);
  }

  .company-name {
    font-weight: bold;
    max-width: 70%;
    ${ellipsis()};
  }

  .company-last-price {
    white-space: nowrap;
    cursor: pointer;
  }

  .nbbo-line {
    display: flex;
    width: 100%;
    font-size: calc(${fontSizeWidget} + 1px);
    line-height: 22px;
    padding: 10px;
    font-weight: 500;
  }

  .nbbo-line-bid {
    flex: 1 1 0;
    color: ${positive};
    cursor: pointer;
    padding: 2px 10px;
    position: relative;
    background-color: rgba(${toColorComponents(buy)}, 0.2);
    text-align: left;
    border-bottom-left-radius: 4px;
    border-top-left-radius: 4px;
  }

  .nbbo-line-ask {
    flex: 1 1 0;
    color: ${negative};
    cursor: pointer;
    padding: 2px 10px;
    background-color: rgba(${toColorComponents(sell)}, 0.2);
    text-align: right;
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
  }

  .nbbo-line-icon-holder {
    cursor: default;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 2px;
    position: absolute;
    transform: translate(50%, 0px);
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    border-radius: 50%;
    font-weight: 500;
  }

  .nbbo-line-icon-fallback {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    background-color: ${themeConditional(
      darken(paletteGrayLight3, 5),
      paletteBlack
    )};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    overflow-wrap: break-word;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .nbbo-line-icon-logo {
    position: absolute;
    width: 22px;
    height: 22px;
    left: 0;
    top: 0;
    border-radius: 50%;
    background-size: 100%;
  }

  .step-controls {
    display: inline-flex;
    flex-grow: 0;
    flex-shrink: 0;
    margin-left: 2px;
    border-radius: 0 4px 4px 0;
    align-items: stretch;
    flex-direction: column;
    vertical-align: top;
  }

  .step-controls button {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    font-size: ${fontSizeWidget};
    justify-content: center;
    text-align: left;
    vertical-align: middle;
    min-width: 24px;
    position: relative;
    flex: 1 1 15px;
    min-height: 0;
    padding: 0;
    width: 32px;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  .step-controls button:hover {
    border: 1px solid ${themeConditional(paletteGrayLight1, paletteGrayBase)};
  }

  .step-controls button:first-child {
    border-radius: 0 4px 0 0;
    margin-bottom: 2px;
  }

  .step-controls button:last-child {
    border-radius: 0 0 4px;
  }

  .price-placeholder {
    position: absolute;
    z-index: 2;
  }

  .coin-icon {
    background-image: url('static/svg/coin.svg');
    background-repeat: no-repeat;
    width: 12px;
    height: 12px;
    margin-right: 2px;
    pointer-events: none;
  }
`;

export class OrderWidget extends WidgetWithInstrument {
  @observable
  ordersTrader;

  @observable
  level1Trader;

  @observable
  extraLevel1Trader;

  @observable
  positionTrader;

  @observable
  lastPrice;

  @observable
  lastPriceAbsoluteChange;

  @observable
  lastPriceRelativeChange;

  @observable
  bestBid;

  @observable
  bestAsk;

  @observable
  totalAmount;

  @observable
  commission;

  @observable
  buyingPowerQuantity;

  @observable
  marginBuyingPowerQuantity;

  @observable
  sellingPowerQuantity;

  @observable
  marginSellingPowerQuantity;

  @observable
  positionSize;

  @observable
  positionAverage;

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.ordersTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер для выставления заявок.',
        keep: true
      });
    }

    if (!this.document.level1Trader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер данных L1.',
        keep: true
      });
    }

    try {
      this.ordersTrader = await ppp.getOrCreateTrader(
        this.document.ordersTrader
      );

      this.instrumentTrader = this.ordersTrader;

      this.selectInstrument(this.document.symbol, { isolate: true });

      this.level1Trader = await ppp.getOrCreateTrader(
        this.document.level1Trader
      );

      if (this.document.extraLevel1Trader) {
        this.extraLevel1Trader = await ppp.getOrCreateTrader(
          this.document.extraLevel1Trader
        );
      }

      this.positionTrader = await ppp.getOrCreateTrader(
        this.document.positionTrader
      );

      await this.level1Trader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: TRADER_DATUM.LAST_PRICE,
          lastPriceRelativeChange: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
          lastPriceAbsoluteChange: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
          bestBid: TRADER_DATUM.BEST_BID,
          bestAsk: TRADER_DATUM.BEST_ASK
        },
        condition: function ({ instrument }) {
          // Example: SBER
          return !(
            this.document.type === TRADERS.ALOR_OPENAPI_V2 &&
            instrument?.exchange !== this.document.exchange
          );
        }
      });

      if (this.extraLevel1Trader) {
        await this.extraLevel1Trader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            lastPrice: TRADER_DATUM.LAST_PRICE,
            lastPriceRelativeChange: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
            lastPriceAbsoluteChange: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
            bestBid: TRADER_DATUM.BEST_BID,
            bestAsk: TRADER_DATUM.BEST_ASK
          },
          condition: function ({ instrument }) {
            return !(
              this.document.type === TRADERS.ALOR_OPENAPI_V2 &&
              instrument?.exchange !== this.document.exchange
            );
          }
        });
      }

      if (this.positionTrader) {
        await this.positionTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            positionSize: TRADER_DATUM.POSITION_SIZE,
            positionAverage: TRADER_DATUM.POSITION_AVERAGE
          }
        });
      }

      this.pusherTelegramHandler = this.pusherTelegramHandler.bind(this);

      if (this.document.pusherApi) {
        const connection = await ppp.getOrCreatePusherConnection(
          this.document.pusherApi
        );

        if (connection) {
          connection
            .channel('telegram')
            ?.bind('ticker', this.pusherTelegramHandler);
        }
      }

      this.calculateTotalAmount();
    } catch (e) {
      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    if (this.level1Trader) {
      await this.level1Trader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: TRADER_DATUM.LAST_PRICE,
          lastPriceRelativeChange: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
          lastPriceAbsoluteChange: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
          bestBid: TRADER_DATUM.BEST_BID,
          bestAsk: TRADER_DATUM.BEST_ASK
        }
      });
    }

    if (this.extraLevel1Trader) {
      await this.extraLevel1Trader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: TRADER_DATUM.LAST_PRICE,
          lastPriceRelativeChange: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE,
          lastPriceAbsoluteChange: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE,
          bestBid: TRADER_DATUM.BEST_BID,
          bestAsk: TRADER_DATUM.BEST_ASK
        }
      });
    }

    if (this.positionTrader) {
      await this.positionTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          positionSize: TRADER_DATUM.POSITION_SIZE,
          positionAverage: TRADER_DATUM.POSITION_AVERAGE
        }
      });
    }

    if (this.ordersTrader) {
      if (this.document.pusherApi) {
        const connection = await ppp.getOrCreatePusherConnection(
          this.document.pusherApi
        );

        if (connection) {
          connection
            .channel('telegram')
            ?.unbind('ticker', this.pusherTelegramHandler);
        }
      }
    }

    super.disconnectedCallback();
  }

  pusherTelegramHandler(data) {
    if (typeof data.t === 'string')
      return this.selectInstrument(data.t.toUpperCase().split('~')[0]);
  }

  instrumentChanged(oldValue, newValue) {
    super.instrumentChanged(oldValue, newValue);

    this.ordersTrader?.instrumentChanged?.(this, oldValue, newValue);
    this.level1Trader?.instrumentChanged?.(this, oldValue, newValue);
    this.extraLevel1Trader?.instrumentChanged?.(this, oldValue, newValue);
    this.positionTrader?.instrumentChanged?.(this, oldValue, newValue);

    if (
      this.price &&
      (!this.ordersTrader.instrumentsAreEqual(oldValue, newValue) || !oldValue)
    ) {
      setTimeout(() => {
        this.price.value = '';
        this.price.focus();

        void this.saveLastPriceValue();
      }, 25);
    }

    this.calculateEstimate();
  }

  async validate() {
    await validate(this.container.ordersTraderId);
    await validate(this.container.level1TraderId);
    await validate(this.container.positionTraderId);

    if (this.container.buyShortcut.value && this.container.sellShortcut.value) {
      await validate(this.container.sellShortcut, {
        hook: async () =>
          this.container.buyShortcut.value !==
          this.container.sellShortcut.value,
        errorMessage: 'Горячие клавиши должны различаться'
      });
    }
  }

  async submit() {
    return {
      $set: {
        ordersTraderId: this.container.ordersTraderId.value,
        level1TraderId: this.container.level1TraderId.value,
        extraLevel1TraderId: this.container.extraLevel1TraderId.value,
        positionTraderId: this.container.positionTraderId.value,
        pusherApiId: this.container.pusherApiId.value,
        displaySizeInUnits: this.container.displaySizeInUnits.checked,
        changePriceQuantityViaMouseWheel:
          this.container.changePriceQuantityViaMouseWheel.checked,
        buyShortcut: this.container.buyShortcut.value.trim(),
        sellShortcut: this.container.sellShortcut.value.trim(),
        fastVolumes: this.container.fastVolumes.value.trim()
      }
    };
  }

  getActiveWidgetTab() {
    if (/market|limit/i.test(this.document.activeTab))
      return this.document.activeTab;
    else return 'limit';
  }

  handleFastVolumeClick({ event }) {
    if (!this.instrument) return;

    const radio = event
      .composedPath()
      .find((n) => n.tagName?.toLowerCase?.() === 'ppp-widget-box-radio');

    this.#setQuantityForFastButtonRadio(radio);
  }

  handleFastVolumeDblClick({ event }) {
    const radio = event
      .composedPath()
      .find((n) => n.tagName?.toLowerCase?.() === 'ppp-widget-box-radio');

    if (radio) {
      if (this.fastVolumeButtons.value === radio.value) {
        this.fastVolumeButtons.value = null;
        this.fastVolumeButtons.slottedRadioButtons.forEach((b) => {
          b.checked = false;
        });
      } else {
        this.fastVolumeButtons.value = radio.value;
      }

      void this.updateDocumentFragment({
        $set: {
          'widgets.$.selectedFastVolume': this.fastVolumeButtons.value
        }
      });
    }
  }

  getFastVolumeButtonsData() {
    if (typeof this.document.fastVolumes !== 'string') {
      return [];
    }

    const result = [];

    this.document.fastVolumes.split(';').forEach((v) => {
      let isInMoney = false;

      if (v[0] === '~') {
        v = v.substring(1);
        isInMoney = true;
      }

      v = v.replaceAll(',', '.').trim();

      const multiplier = v[v.length - 1];
      let volume = parseFloat(v);

      if (multiplier) {
        if (multiplier.toLowerCase() === 'k') volume *= 1000;
        else if (multiplier.toLowerCase() === 'm') volume /= 1000;
        else if (multiplier.toLowerCase() === 'M') volume *= 10000000;
      }

      if (volume > 0) {
        result.push({
          text: v.replaceAll('.', decSeparator),
          isInMoney,
          volume
        });
      }
    });

    return result;
  }

  handleWidgetTabChange({ event }) {
    void this.updateDocumentFragment({
      $set: {
        'widgets.$.activeTab': event.detail.id
      }
    });
  }

  @debounce(250)
  calculateEstimate() {
    if (this.instrument && typeof this.ordersTrader?.estimate === 'function') {
      this.marginBuyingPowerQuantity = '—';
      this.marginSellingPowerQuantity = '—';
      this.commission = '—';
      this.buyingPowerQuantity = '—';
      this.sellingPowerQuantity = '—';

      const price = parseFloat(this.price?.value.replace(',', '.'));

      if (!isNaN(price) && price) {
        const quantity = parseInt(this.quantity.value || '0');

        this.ordersTrader
          .estimate(this.instrument, price, quantity)
          .then((estimate) => {
            this.marginBuyingPowerQuantity = estimate.marginBuyingPowerQuantity;
            this.marginSellingPowerQuantity =
              estimate.marginSellingPowerQuantity;
            this.buyingPowerQuantity = estimate.buyingPowerQuantity;
            this.sellingPowerQuantity = estimate.sellingPowerQuantity;

            const flatCommissionRate =
              this.ordersTrader?.document?.flatCommissionRate ?? void 0;

            if (typeof flatCommissionRate === 'undefined') {
              this.commission = estimate.commission;
            } else {
              this.commission =
                (price * quantity * this.instrument.lot * flatCommissionRate) /
                100;
            }
          })
          .catch((error) => {
            console.log(error);

            this.notificationsArea.error({
              title: 'Ошибка заявки',
              text: 'Не удалось рассчитать комиссию.'
            });
          });
      }
    }
  }

  calculateTotalAmount() {
    if (!this.instrument) return;

    if (this.instrument.type === 'future') return;

    this.totalAmount =
      parseFloat(this.price?.value.replace(',', '.')) *
      parseInt(this.quantity?.value) *
      this.instrument.lot;

    this.calculateEstimate();
  }

  async handlePriceOrQuantityKeydown({ event, type }) {
    if (this.document.buyShortcut !== this.document.sellShortcut) {
      if (
        this.document.buyShortcut &&
        event.code === this.document.buyShortcut
      ) {
        await this.buyOrSell('buy');
      } else if (
        this.document.sellShortcut &&
        event.code === this.document.sellShortcut
      ) {
        await this.buyOrSell('sell');
      }
    }
  }

  handlePricePaste({ event }) {
    const data = event.clipboardData.getData('text/plain').replace(',', '.');

    return (
      !/[e/-/+]/i.test(data) && +data === parseFloat(data.replace(',', '.'))
    );
  }

  handlePriceBeforeInput({ event }) {
    if (event.data) {
      return /[0-9.,]/.test(event.data);
    }

    return true;
  }

  handlePriceWheel({ event }) {
    if (this.document.changePriceQuantityViaMouseWheel) {
      if (event.deltaY < 0) this.stepUp(false);
      else this.stepDown(false);
    }
  }

  handlePriceInput() {
    if (this.price.value === decSeparator || this.price.value === '.')
      this.price.value = '';

    this.price.value = this.price.value
      .replaceAll('.', decSeparator)
      .replaceAll(/^00/gi, '0')
      .replace(new RegExp(decSeparator, 'g'), (val, index, str) =>
        index === str.indexOf(decSeparator) ? val : ''
      );

    if (typeof this?.fastVolumeButtons?.value !== 'undefined') {
      const radio = this?.fastVolumeButtons.slottedRadioButtons.find(
        (b) => b.value === this.fastVolumeButtons.value
      );

      this.#setQuantityForFastButtonRadio(radio);
    }

    this.calculateTotalAmount();
    this.saveLastPriceValue();
  }

  handlePriceKeydown({ event }) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();

      if (event.key === 'ArrowUp') this.stepUp(false);
      else this.stepDown(false);
    } else {
      void this.handlePriceOrQuantityKeydown({ event, type: 'price' });
    }

    return true;
  }

  formatPrice(price) {
    return formatPrice(price, this.instrument);
  }

  #setQuantityForFastButtonRadio(radio) {
    if (radio) {
      const volume = parseFloat(radio.getAttribute('volume'));
      const isInMoney = radio.hasAttribute('money');

      if (volume > 0) {
        if (isInMoney && this.ordersTrader) {
          this.setQuantity(
            +volume /
              this.instrument.lot /
              +this.ordersTrader.fixPrice(this.instrument, this.price.value),
            {
              focusOnQuantity: false
            }
          );
        } else {
          this.setQuantity(
            +volume.toFixed(getInstrumentQuantityPrecision(this.instrument)),
            {
              focusOnQuantity: false
            }
          );
        }
      }
    }
  }

  setPrice(price) {
    if (price > 0) {
      if (this.orderTypeTabs.activeid !== 'limit') {
        this.orderTypeTabs.activeid = 'limit';

        void this.updateDocumentFragment({
          $set: {
            'widgets.$.activeTab': 'limit'
          }
        });

        setTimeout(() => {
          this.price.focus();

          const length = this.price.control.value.length;

          this.price.control.setSelectionRange(length, length);
        }, 25);
      }

      this.price.value = price.toString().replace('.', decSeparator);

      this.calculateTotalAmount();
      this.price.focus();

      if (typeof this?.fastVolumeButtons?.value !== 'undefined') {
        const radio = this?.fastVolumeButtons.slottedRadioButtons.find(
          (b) => b.value === this.fastVolumeButtons.value
        );

        this.#setQuantityForFastButtonRadio(radio);
      }

      this.saveLastPriceValue();
    }
  }

  @debounce(250)
  saveLastPriceValue() {
    void this.updateDocumentFragment({
      $set: {
        'widgets.$.lastPrice': this.price.value.replace(',', '.')
      }
    });
  }

  setQuantity(quantity, options = {}) {
    if (options.force && quantity === 0) {
      this.quantity.value = '';

      if (options.focusOnQuantity !== false) this.quantity.focus();

      return;
    }

    if (this.instrument && quantity > 0 && quantity !== Infinity) {
      const precision = getInstrumentQuantityPrecision(this.instrument);

      this.quantity.value =
        Math.trunc(+quantity * Math.pow(10, precision)) /
        Math.pow(10, precision);

      if (+this.quantity.value === 0) {
        this.quantity.value = '';
      }

      this.calculateTotalAmount();

      if (options.focusOnQuantity !== false) this.quantity.focus();

      this.saveLastQuantity();
    }
  }

  @debounce(250)
  saveLastQuantity() {
    void this.updateDocumentFragment({
      $set: {
        'widgets.$.lastQuantity': this.quantity.value
      }
    });
  }

  handleQuantityInput() {
    if (+this.quantity.value === 0) this.quantity.value = '';

    while (this.quantity.value.charAt(0) === '0') {
      this.quantity.value = this.quantity.value.substring(1);
    }

    this.calculateTotalAmount();
    this.saveLastQuantity();
  }

  handleQuantityPaste({ event }) {
    const data = event.clipboardData.getData('text/plain');

    if (+data === 0 && !this.quantity.value) return false;

    return parseInt(data) === +data && data >= 0 && +data <= 1000000000;
  }

  handleQuantityKeydown({ event }) {
    void this.handlePriceOrQuantityKeydown({ event, type: 'quantity' });

    if (event.key === '0' && !this.quantity.value) return false;

    switch (event.key) {
      case 'e':
      case '-':
      case '+':
      case '.':
      case ',':
        return false;
    }

    return true;
  }

  stepUpOrDown(quantity = true, up = true) {
    if (quantity) {
      up ? this.quantity.control.stepUp() : this.quantity.control.stepDown();

      this.quantity.value = this.quantity.control.value;

      this.quantity.control.focus();
      this.calculateTotalAmount();
      this.saveLastQuantity();
    } else {
      if (this.price.value.endsWith(decSeparator))
        this.price.value = this.price.value.replace(/.$/, '');

      this.price.value = this.price.value.replace(',', '.');
      this.price.control.type = 'number';

      Updates.enqueue(() => {
        up ? this.price.control.stepUp() : this.price.control.stepDown();
        this.price.control.type = 'text';

        const length = this.price.control.value.length;

        this.price.control.setSelectionRange(length, length);

        this.price.value = this.price.control.value.replace?.(
          '.',
          decSeparator
        );

        if (typeof this?.fastVolumeButtons?.value !== 'undefined') {
          const radio = this?.fastVolumeButtons.slottedRadioButtons.find(
            (b) => b.value === this.fastVolumeButtons.value
          );

          this.#setQuantityForFastButtonRadio(radio);
        }

        this.price.control.focus();
        this.calculateTotalAmount();
        this.saveLastPriceValue();
      });
    }
  }

  stepUp(quantity = true) {
    this.stepUpOrDown(quantity, true);
  }

  stepDown(quantity = true) {
    this.stepUpOrDown(quantity, false);
  }

  handleQuantityWheel({ event }) {
    if (this.document.changePriceQuantityViaMouseWheel) {
      if (event.deltaY < 0) this.stepUp(true);
      else this.stepDown(true);
    }
  }

  formatPositionSize() {
    let size = 0;
    let suffix = this.document.displaySizeInUnits ? 'шт.' : 'л.';

    if (this.instrument) {
      size = this.positionSize ?? 0;

      if (this.document.displaySizeInUnits) size *= this.instrument.lot ?? 1;
    }

    return `${size} ${suffix}`;
  }

  async buyOrSell(direction) {
    if (!this.ordersTrader) {
      return this.notificationsArea.error({
        title: 'Ошибка заявки',
        text: 'Отсутствует трейдер для выставления заявок.'
      });
    }

    this.topLoader.start();

    try {
      if (this.orderTypeTabs.activeid === 'limit') {
        if (typeof this.ordersTrader.placeLimitOrder !== 'function') {
          return this.notificationsArea.error({
            title: 'Ошибка заявки',
            text: 'Трейдер не поддерживает выставление лимитных заявок.'
          });
        }

        await this.ordersTrader.placeLimitOrder({
          instrument: this.instrument,
          price: this.price.value,
          quantity: this.quantity.value,
          direction
        });
      } else if (this.orderTypeTabs.activeid === 'market') {
        if (typeof this.ordersTrader.placeMarketOrder !== 'function') {
          return this.notificationsArea.error({
            title: 'Ошибка заявки',
            text: 'Трейдер не поддерживает выставление рыночных заявок.'
          });
        }

        await this.ordersTrader.placeMarketOrder({
          instrument: this.instrument,
          quantity: this.quantity.value,
          direction
        });
      }

      return this.notificationsArea.success({
        title: 'Заявка выставлена'
      });
    } catch (e) {
      console.log(e);

      return this.notificationsArea.error({
        title: 'Заявка не выставлена',
        text: await this.ordersTrader?.formatError?.(this.instrument, e)
      });
    } finally {
      this.topLoader.stop();
    }
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.ORDER,
    collection: 'PPP',
    title: html`Заявка`,
    description: html`Виджет <span class="positive">Заявка</span> используется,
      чтобы выставлять рыночные, лимитные и отложенные биржевые заявки.`,
    customElement: OrderWidget.compose({
      template: orderWidgetTemplate,
      styles: orderWidgetStyles
    }).define(),
    minWidth: 250,
    minHeight: 370,
    defaultWidth: 280,
    defaultHeight: 375,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер лимитных и рыночных заявок</h5>
          <p class="description">
            Трейдер, который будет выставлять лимитные и рыночные заявки, а
            также фильтровать инструменты в поиске.
          </p>
        </div>
        <div class="control-line">
          <ppp-query-select
            ${ref('ordersTraderId')}
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
                        caps: {
                          $all: [
                            `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_LIMIT_ORDERS%]`,
                            `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_MARKET_ORDERS%]`
                          ]
                        }
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
          <h5>Трейдер позиций</h5>
          <p class="description">
            Трейдер, ответственный за отображение средней цены и размера позиции
            в виджете.
          </p>
        </div>
        <div class="control-line">
          <ppp-query-select
            ${ref('positionTraderId')}
            value="${(x) => x.document.positionTraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.positionTrader ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('traders')
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_POSITIONS%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.positionTraderId ?? ''%]` }
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
          <h5>Трейдер L1</h5>
          <p class="description">
            Трейдер, выступающий источником L1-данных виджета.
          </p>
        </div>
        <div class="control-line">
          <ppp-query-select
            ${ref('level1TraderId')}
            value="${(x) => x.document.level1TraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.level1Trader ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('traders')
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_LEVEL1%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.level1TraderId ?? ''%]` }
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
          <h5>Дополнительный трейдер L1</h5>
          <p class="description">
            Трейдер, выступающий дополнительным источником L1-данных виджета.
          </p>
        </div>
        <div class="control-line">
          <ppp-query-select
            ${ref('extraLevel1TraderId')}
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.extraLevel1TraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.extraLevel1Trader ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('traders')
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_LEVEL1%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.extraLevel1TraderId ?? ''%]`
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
          <h5>Интеграция с Pusher</h5>
          <p class="description">Для управления виджетом из внешних систем.</p>
        </div>
        <div class="widget-settings-input-group">
          <div class="control-line">
            <ppp-query-select
              ${ref('pusherApiId')}
              placeholder="Опционально, нажмите для выбора"
              value="${(x) => x.document.pusherApiId}"
              :context="${(x) => x}"
              :preloaded="${(x) => x.document.pusherApi ?? ''}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('apis')
                    .find({
                      $and: [
                        {
                          type: `[%#(await import('../../lib/const.js')).APIS.PUSHER%]`
                        },
                        {
                          $or: [
                            { removed: { $ne: true } },
                            {
                              _id: `[%#this.document.pusherApiId ?? ''%]`
                            }
                          ]
                        }
                      ]
                    })
                    .sort({ updatedAt: -1 });
                };
              }}"
              :transform="${() => ppp.decryptDocumentsTransformation(['key'])}"
            ></ppp-query-select>
            <ppp-button
              appearance="default"
              @click="${() =>
                window.open('?page=api-pusher', '_blank').focus()}"
            >
              +
            </ppp-button>
          </div>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Горячая клавиша для покупки</h5>
          <p class="description">
            Покупка сработает, если фокус ввода будет находиться в поле цены или
            количества. Нажмите Esc, чтобы отменить эту функцию.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            optional
            placeholder="Не задана"
            value="${(x) => x.document.buyShortcut}"
            @keydown="${(x, { event }) => {
              if (
                +event.key === parseInt(event.key) ||
                /Comma|Period|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Backspace|Delete/i.test(
                  event.code
                )
              )
                return false;

              if (event.key === 'Escape') {
                x.buyShortcut.value = '';
              } else {
                x.buyShortcut.value = event.code;
              }

              return false;
            }}"
            ${ref('buyShortcut')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Горячая клавиша для продажи</h5>
          <p class="description">
            Продажа сработает, если фокус ввода будет находиться в поле цены или
            количества. Нажмите Esc, чтобы отменить эту функцию.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            optional
            placeholder="Не задана"
            value="${(x) => x.document.sellShortcut}"
            @keydown="${(x, { event }) => {
              if (
                +event.key === parseInt(event.key) ||
                /Comma|Period|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Backspace|Delete/i.test(
                  event.code
                )
              )
                return false;

              if (event.key === 'Escape') {
                x.sellShortcut.value = '';
              } else {
                x.sellShortcut.value = event.code;
              }

              return false;
            }}"
            ${ref('sellShortcut')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Кнопки быстрого объёма</h5>
          <p class="description">
            Перечислите значения через точку с запятой. Нажатие на кнопку
            подставляет номинал в поле количества. Поставьте ~ перед значением,
            чтобы указать объём в единицах валюты.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            optional
            placeholder="1;10;100;1k;~100;~500;~1k"
            value="${(x) => x.document.fastVolumes}"
            @beforeinput="${(x, { event }) => {
              return event.data === null || /[0-9.,;~kmM]/.test(event.data);
            }}"
            ${ref('fastVolumes')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Параметры отображения и работы</h5>
        </div>
        <ppp-checkbox
          ?checked="${(x) => x.document.displaySizeInUnits}"
          ${ref('displaySizeInUnits')}
        >
          Показывать количество инструмента в портфеле в штуках
        </ppp-checkbox>
        <ppp-checkbox
          ?checked="${(x) => x.document.changePriceQuantityViaMouseWheel}"
          ${ref('changePriceQuantityViaMouseWheel')}
        >
          Изменять цену и количество колесом мыши
        </ppp-checkbox>
      </div>
    `
  };
}
