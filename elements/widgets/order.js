/** @decorator */

import { widget, WidgetWithInstrument } from '../widget.js';
import { debounce } from '../../lib/ppp-decorators.js';
import {
  html,
  css,
  when,
  ref,
  observable
} from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES, TRADER_DATUM } from '../../lib/const.js';
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
import { normalize } from '../../design/styles.js';
import { orderbookWidgetStyles, orderbookWidgetTemplate } from './orderbook.js';

const decSeparator = decimalSeparator();

export const orderWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control
            selection="${(x) => x.document?.group}"
          ></ppp-widget-group-control>
          <ppp-widget-search-control></ppp-widget-search-control>
        </div>
      </div>
      <div class="widget-body">
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
    </div>
  </template>
`;

export const orderWidgetStyles = css`
  ${normalize()}
  ${widget()}
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

    this.ordersTrader = await ppp.getOrCreateTrader(this.document.ordersTrader);
    this.level1Trader = await ppp.getOrCreateTrader(this.document.level1Trader);

    if (this.document.extraLevel1Trader) {
      this.extraLevel1Trader = await ppp.getOrCreateTrader(
        this.document.extraLevel1Trader
      );
    }

    this.positionTrader = await ppp.getOrCreateTrader(
      this.document.positionTrader
    );
    this.searchControl.trader = this.ordersTrader;

    if (this.level1Trader) {
      await this.level1Trader.subscribeFields?.({
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
      await this.extraLevel1Trader.subscribeFields?.({
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
      await this.positionTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          positionSize: TRADER_DATUM.POSITION_SIZE,
          positionAverage: TRADER_DATUM.POSITION_AVERAGE
        }
      });
    }

    if (this.ordersTrader) {
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
    }

    this.calculateTotalAmount();
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

  async selectSymbol(symbol, exchange) {
    if (this.ordersTrader) {
      const instrument = await this.ordersTrader.findInstrumentInCache(symbol);

      if (instrument) {
        await this.findAndSelectSymbol(
          {
            type: instrument.type,
            symbol,
            exchange: {
              $in:
                typeof exchange !== 'undefined'
                  ? [exchange]
                  : this.ordersTrader.getExchange() ?? instrument.exchange ?? []
            }
          },
          true
        );
      }
    }
  }

  pusherTelegramHandler(data) {
    void this.selectSymbol(data.t, data.ex);
  }

  instrumentChanged(oldValue, newValue) {
    super.instrumentChanged(oldValue, newValue);
    this.level1Trader?.instrumentChanged?.(this, oldValue, newValue);
    this.extraLevel1Trader?.instrumentChanged?.(this, oldValue, newValue);
    this.positionTrader?.instrumentChanged?.(this, oldValue, newValue);

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

  async update() {
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
        }, 100);
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
    if (this.instrument && quantity > 0) {
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

      DOM.queueUpdate(() => {
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
    maxHeight: 2560,
    maxWidth: 2560,
    defaultHeight: 375,
    defaultWidth: 280,
    minHeight: 370,
    minWidth: 250,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер лимитных и рыночных заявок</h5>
          <p>
            Трейдер, который будет выставлять лимитные и рыночные заявки, а
            также фильтровать инструменты в поиске.
          </p>
        </div>
        <ppp-collection-select
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
                          `[%#(await import('./const.js')).TRADER_CAPS.CAPS_LIMIT_ORDERS%]`,
                          `[%#(await import('./const.js')).TRADER_CAPS.CAPS_MARKET_ORDERS%]`
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
        ></ppp-collection-select>
        <ppp-button
          class="margin-top"
          @click="${() => window.open('?page=trader', '_blank').focus()}"
          appearance="primary"
        >
          Создать нового трейдера
        </ppp-button>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер позиций</h5>
          <p>Трейдер, ответственный за отображение средней цены и размера
            позиции в виджете.</p>
        </div>
        <ppp-collection-select
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
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_POSITIONS%]`
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
        ></ppp-collection-select>
        <ppp-button
          class="margin-top"
          @click="${() => window.open('?page=trader', '_blank').focus()}"
          appearance="primary"
        >
          Создать нового трейдера
        </ppp-button>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер L1</h5>
          <p>Трейдер, выступающий источником L1-данных виджета.</p>
        </div>
        <ppp-collection-select
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
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_LEVEL1%]`
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
        ></ppp-collection-select>
        <ppp-button
          class="margin-top"
          @click="${() => window.open('?page=trader', '_blank').focus()}"
          appearance="primary"
        >
          Создать нового трейдера
        </ppp-button>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Дополнительный трейдер L1</h5>
          <p>Трейдер, выступающий дополнительным источником L1-данных
            виджета.</p>
        </div>
        <ppp-collection-select
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
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_LEVEL1%]`
                    },
                    {
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.extraLevel1TraderId ?? ''%]` }
                      ]
                    }
                  ]
                })
                .sort({ updatedAt: -1 });
            };
          }}"
          :transform="${() => ppp.decryptDocumentsTransformation()}"
        ></ppp-collection-select>
        <ppp-button
          class="margin-top"
          @click="${() => window.open('?page=trader', '_blank').focus()}"
          appearance="primary"
        >
          Создать нового трейдера
        </ppp-button>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Интеграция с Pusher</h5>
          <p>Для управления виджетом из внешних систем.</p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-collection-select
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
                        type: `[%#(await import('./const.js')).APIS.PUSHER%]`
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
          ></ppp-collection-select>
          <ppp-button
            class="margin-top"
            @click="${() => window.open('?page=api-pusher', '_blank').focus()}"
            appearance="primary"
          >
            Добавить API Pusher
          </ppp-button>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Горячая клавиша для покупки</h5>
          <p>Покупка сработает, если фокус ввода будет находиться в поле цены
            или количества. Нажмите Esc, чтобы отменить эту функцию.</p>
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
          <p>Продажа сработает, если фокус ввода будет находиться в поле цены
            или количества. Нажмите Esc, чтобы отменить эту функцию.</p>
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
          <p>Перечислите значения через точку с запятой. Нажатие на кнопку
            подставляет номинал в поле количества. Поставьте ~ перед значением,
            чтобы указать объём в единицах валюты.</p>
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
          <ppp-checkbox>
      </div>
    `
  };
}
