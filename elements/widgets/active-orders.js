/** @decorator */

import ppp from '../../ppp.js';
import {
  widgetStyles,
  widgetEmptyStateTemplate,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import { invalidate } from '../../lib/ppp-errors.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  repeat,
  Updates
} from '../../vendor/fast-element.min.js';
import { staticallyCompose } from '../../vendor/fast-utilities.js';
import { TRADER_DATUM, WIDGET_TYPES, ORDERS } from '../../lib/const.js';
import {
  normalize,
  spacing,
  getTraderSelectOptionColor
} from '../../design/styles.js';
import { cancelOrders, refresh, trash } from '../../static/svg/sprite.js';
import { formatAmount, formatPrice, formatQuantity } from '../../lib/intl.js';
import { Tmpl } from '../../lib/tmpl.js';
import {
  themeConditional,
  darken,
  lighten,
  fontSizeWidget,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGreenBase,
  paletteGreenLight3,
  paletteRedBase,
  paletteRedLight3
} from '../../design/design-tokens.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../tabs.js';
import '../text-field.js';
import '../widget-controls.js';

export const defaultOrderProcessorFunc = `/**
* Функция обработки списка активных заявок.
*
* @param {object} trader - Экземпляр трейдера PPP.
* @param {array} orders - Массив заявок.
*/

return orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
`;

const allTabHidden = (x) =>
  typeof x.document.showAllTab === 'undefined' ? false : !x.document.showAllTab;
const limitTabHidden = (x) =>
  typeof x.document.showLimitTab === 'undefined'
    ? false
    : !x.document.showLimitTab;
const conditionalTabHidden = (x) =>
  typeof x.document.showConditionalTab === 'undefined'
    ? false
    : !x.document.showConditionalTab;

export const activeOrdersWidgetTemplate = html`
  <template>
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
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
        <div class="widget-toolbar" ?hidden="${(x) => !x.initialized}">
          <div class="tabs">
            <ppp-widget-box-radio-group
              ?hidden="${(x) =>
                allTabHidden(x) &&
                limitTabHidden(x) &&
                conditionalTabHidden(x)}"
              class="order-type-selector"
              @change="${(x) => x.handleOrderTypeChange()}"
              value="${(x) => x.document.activeTab ?? 'all'}"
              ${ref('orderTypeSelector')}
            >
              <ppp-widget-box-radio
                ?hidden="${(x) => allTabHidden(x)}"
                value="all"
              >
                Все
              </ppp-widget-box-radio>
              <ppp-widget-box-radio
                ?hidden="${(x) => limitTabHidden(x)}"
                value="real"
              >
                Биржевые
              </ppp-widget-box-radio>
              <ppp-widget-box-radio
                ?hidden="${(x) => conditionalTabHidden(x)}"
                value="conditional"
              >
                Условные
              </ppp-widget-box-radio>
            </ppp-widget-box-radio-group>
          </div>
          <div class="buttons">
            <button
              ?hidden="${(x) => !x.document.showRefreshOrdersButton}"
              class="refresh-orders"
              title="Переставить биржевые заявки"
              @click="${(x) => x.refreshOrders()}"
            >
              <span>${html.partial(refresh)}</span>
            </button>
            <button
              ?hidden="${(x) => !x.document.showCancelAllBuyOrdersButton}"
              class="cancel-buy-orders"
              title="Отменить все заявки на покупку"
              @click="${(x) =>
                x.cancelAllOrders({
                  filter: 'buy'
                })}"
            >
              <span>${html.partial(cancelOrders)}</span>
            </button>
            <button
              ?hidden="${(x) => !x.document.showCancelAllBuyOrdersButton}"
              class="cancel-sell-orders"
              title="Отменить все заявки на продажу"
              @click="${(x) =>
                x.cancelAllOrders({
                  filter: 'sell'
                })}"
            >
              <span>${html.partial(cancelOrders)}</span>
            </button>
            <button
              ?hidden="${(x) =>
                typeof x.document.showCancelAllOrdersButton === 'undefined'
                  ? false
                  : !x.document.showCancelAllOrdersButton}"
              class="cancel-orders"
              title="Отменить все заявки"
              @click="${(x) => x.cancelAllOrders()}"
            >
              <span>${html.partial(cancelOrders)}</span>
            </button>
          </div>
        </div>
        <div class="widget-card-list" ?hidden="${(x) => !x.initialized}">
          ${when(
            (x) => !x.orders?.length,
            html`${html.partial(
              widgetEmptyStateTemplate(
                ppp.t('$widget.emptyState.noActiveOrders')
              )
            )}`
          )}
          <div class="widget-card-list-inner">
            ${repeat(
              (x) => x.orders,
              html`
                <div class="widget-card-holder">
                  <div class="widget-card-holder-inner">
                    ${when(
                      (x) => x.isConditionalOrder,
                      html`
                        <div
                          class="widget-card-order-payload-holder"
                          :order="${(o) => o}"
                        >
                          ${(o) => html`
                            ${staticallyCompose(
                              `<${o.cardDefinition.name}></${o.cardDefinition.name}>`
                            )}
                          `}
                        </div>
                      `,
                      html`
                        <ppp-widget-card
                          ?selectable="${(x, c) =>
                            c.parent.document.disableInstrumentFiltering}"
                          side="${(x) => x.side}"
                          @click="${(o, c) => {
                            if (c.parent.document.disableInstrumentFiltering) {
                              c.parent.selectInstrument(o.instrument.symbol);
                            }

                            return true;
                          }}"
                        >
                          <div slot="indicator" class="${(x) => x.side}"></div>
                          <div
                            slot="icon"
                            style="${(o, c) =>
                              `background-image:url(${c.parent.searchControl.getInstrumentIconUrl(
                                o.instrument
                              )})`}"
                          ></div>
                          <span slot="icon-fallback">
                            ${(o) =>
                              o.instrument?.fullName?.[0] ??
                              o.instrument?.symbol[0]}
                          </span>
                          <span slot="title-left">
                            ${(o) => o.instrument?.fullName ?? o.symbol}
                          </span>
                          <span slot="title-right">
                            ${(o) =>
                              o.price
                                ? formatAmount(
                                    o.instrument?.lot *
                                      o.price *
                                      (o.quantity - o.filled),
                                    o.instrument
                                  )
                                : 'At Market'}
                          </span>
                          <span
                            slot="subtitle-left"
                            class="${(o) =>
                              o.side === 'buy' ? 'positive' : 'negative'}"
                          >
                            ${(o) => (o.side === 'buy' ? 'Buy' : 'Sell')}
                          </span>
                          <div class="dot-divider-line" slot="subtitle-right">
                            ${when(
                              (o) => typeof o.destination === 'string',
                              html`
                                ${(o) => o.destination.toUpperCase()}
                                <span class="dot-divider">•</span>
                              `
                            )}
                            ${(o, c) => c.parent.formatRestQuantity(o)}
                            <span class="dot-divider">•</span>
                            ${(o) =>
                              o.price
                                ? formatPrice(o.price, o.instrument)
                                : ppp.t('$g.atMarket')}
                          </div>
                          <button
                            class="widget-action-button"
                            slot="actions"
                            @click="${(o, c) => {
                              c.event.preventDefault();
                              c.event.stopPropagation();
                              c.parent.cancelOrder(o);
                            }}"
                          >
                            <span>${html.partial(trash)}</span>
                          </button>
                        </ppp-widget-card>
                      `
                    )}
                  </div>
                </div>
              `
            )}
          </div>
        </div>
      </div>
      <ppp-widget-notifications-area></ppp-widget-notifications-area>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const activeOrdersWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  ${spacing()}
  .tabs {
    padding: 0 8px 8px 8px;
  }

  .buttons {
    padding: 0 0 8px 8px;
    display: flex;
    gap: 0 4px;
  }

  .tabs ppp-widget-box-radio-group:not([hidden]),
  .buttons button:not([hidden]) {
    margin-top: 10px;
  }

  .refresh-orders,
  .cancel-sell-orders,
  .cancel-buy-orders,
  .cancel-orders {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 24px;
    width: 24px;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    font-size: ${fontSizeWidget};
    vertical-align: middle;
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    color: ${themeConditional(
      paletteGrayLight1,
      lighten(paletteGrayLight1, 15)
    )};
  }

  .cancel-buy-orders {
    color: ${themeConditional(paletteGreenBase, paletteGreenLight3)};
  }

  .cancel-sell-orders {
    color: ${themeConditional(paletteRedBase, paletteRedLight3)};
  }

  .refresh-orders:hover,
  .cancel-sell-orders:hover,
  .cancel-buy-orders:hover,
  .cancel-orders:hover {
    background-color: ${themeConditional(
      darken(paletteGrayLight2, 10),
      paletteGrayBase
    )};
  }

  .refresh-orders span,
  .cancel-sell-orders span,
  .cancel-buy-orders span,
  .cancel-orders span {
    width: 16px;
    height: 16px;
    display: inline-block;
    flex: 0 0 auto;
    vertical-align: text-bottom;
  }

  .refresh-orders span svg,
  .cancel-sell-orders span svg,
  .cancel-buy-orders span svg,
  .cancel-orders span svg {
    width: 16px;
    height: 16px;
  }
`;

export class ActiveOrdersWidget extends WidgetWithInstrument {
  @observable
  ordersTrader;

  @observable
  realOrder;

  realOrderChanged(oldValue, newValue) {
    if (newValue?.orderId) {
      if (newValue.orderId === '@CLEAR') {
        this.realOrdersById.clear();
      } else {
        if (
          newValue.quantity === newValue.filled ||
          newValue.status !== 'working'
        ) {
          this.realOrdersById.delete(newValue.orderId);
        } else if (newValue.status === 'working') {
          this.realOrdersById.set(newValue.orderId, newValue);
        }
      }

      return this.#rebuildOrdersArray();
    }
  }

  @observable
  conditionalOrder;

  @observable
  orders;

  realOrdersById = new Map();

  conditionalOrdersById = new Map();

  #conditionalOrdersQueue = [];

  #conditionalOrdersQueueIsBusy = false;

  orderProcessorFunc;

  constructor() {
    super();

    this.orders = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.ordersTrader) {
      this.initialized = true;

      return this.notificationsArea.error({
        text: 'Отсутствует трейдер активных заявок.',
        keep: true
      });
    }

    try {
      this.ordersTrader = await ppp.getOrCreateTrader(
        this.document.ordersTrader
      );
      this.instrumentTrader = this.ordersTrader;

      this.selectInstrument(this.document.symbol, { isolate: true });

      await this.ordersTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          realOrder: TRADER_DATUM.ACTIVE_ORDER,
          conditionalOrder: TRADER_DATUM.CONDITIONAL_ORDER
        }
      });

      this.orderProcessorFunc ??= new Function(
        'trader',
        'orders',
        await new Tmpl().render(
          this,
          this.document.orderProcessorFunc ?? defaultOrderProcessorFunc,
          {}
        )
      );

      this.#rebuildOrdersArray();

      this.initialized = true;
    } catch (e) {
      this.initialized = true;

      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    if (this.ordersTrader) {
      await this.ordersTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          realOrder: TRADER_DATUM.ACTIVE_ORDER,
          conditionalOrder: TRADER_DATUM.CONDITIONAL_ORDER
        }
      });
    }

    return super.disconnectedCallback();
  }

  conditionalOrderChanged(oldValue, newValue) {
    if (newValue?.orderId) {
      this.#conditionalOrdersQueue.push(newValue);
      Updates.enqueue(() => this.#drainConditionalOrdersQueue());
    }
  }

  #conditionalOrderLoadedAndChanged(order) {
    if (order.orderId) {
      if (order.status === 'canceled')
        this.conditionalOrdersById.delete(order.orderId);
      else {
        this.conditionalOrdersById.set(order.orderId, order);
      }

      return this.#rebuildOrdersArray();
    }
  }

  async #drainConditionalOrdersQueue() {
    const q = this.#conditionalOrdersQueue;

    if (!this.#conditionalOrdersQueueIsBusy) {
      if (q.length) {
        this.#conditionalOrdersQueueIsBusy = true;

        const order = this.#conditionalOrdersQueue.shift();
        const type = order.payload.order.type;
        let cardUrl;

        if (
          type === ORDERS.CUSTOM &&
          typeof order.payload.order.baseUrl === 'string'
        ) {
          cardUrl = `${new URL(order.payload.order.baseUrl).toString()}card.js`;
        } else {
          cardUrl = `${ppp.rootUrl}/lib/orders/${type}/card.js`;
        }

        try {
          const cardModule = await import(cardUrl);

          order.cardDefinition = cardModule.default;

          this.#conditionalOrderLoadedAndChanged(order);
        } finally {
          this.#conditionalOrdersQueueIsBusy = false;

          if (this.#conditionalOrdersQueue.length) {
            Updates.enqueue(() => this.#drainConditionalOrdersQueue());
          }
        }
      }
    }
  }

  async instrumentChanged() {
    super.instrumentChanged();
    this.#rebuildOrdersArray();
  }

  #rebuildOrdersArray() {
    if (!this.orderProcessorFunc) {
      return;
    }

    const orders = [];
    const typeSelectorValue = this.orderTypeSelector.value;

    if (typeSelectorValue === 'all' || typeSelectorValue === 'real') {
      for (const [_, order] of this.realOrdersById ?? []) {
        if (order.status !== 'working') continue;

        if (
          this.instrument?.symbol &&
          !this.document.disableInstrumentFiltering
        ) {
          if (
            this.ordersTrader?.instrumentsAreEqual?.(
              order.instrument,
              this.instrument
            )
          ) {
            orders.push(order);
          }
        } else {
          orders.push(order);
        }
      }
    }

    if (typeSelectorValue === 'all' || typeSelectorValue === 'conditional') {
      for (const [_, order] of this.conditionalOrdersById ?? []) {
        if (order.status === 'canceled') continue;

        if (
          this.instrument?.symbol &&
          !this.document.disableInstrumentFiltering
        ) {
          if (
            this.ordersTrader?.instrumentsAreEqual?.(
              order.instrument,
              this.instrument
            )
          ) {
            orders.push(order);
          }
        } else {
          orders.push(order);
        }
      }
    }

    this.orders = this.orderProcessorFunc.call(this, this.ordersTrader, orders);
  }

  handleOrderTypeChange() {
    this.document.activeTab = this.orderTypeSelector.value;

    this.#rebuildOrdersArray();

    return this.updateDocumentFragment({
      $set: {
        'widgets.$.activeTab': this.document.activeTab
      }
    });
  }

  formatRestQuantity(order) {
    if (order.filled === 0) return formatQuantity(order.quantity);
    else
      return `${formatQuantity(order.filled)} ${ppp.t(
        '$g.of'
      )} ${formatQuantity(order.quantity)}`;
  }

  async cancelOrder(order) {
    if (typeof this.ordersTrader?.cancelRealOrder !== 'function') {
      return this.notificationsArea.error({
        text: 'Трейдер не поддерживает отмену заявок.'
      });
    }

    this.topLoader.start();

    try {
      await this.ordersTrader?.cancelRealOrder?.(order);

      this.notificationsArea.note({
        title: 'Заявка отменена'
      });
    } catch (e) {
      console.log(e);

      this.notificationsArea.error({
        text: 'Не удалось отменить заявку.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async cancelConditionalOrder(order, payload = {}) {
    this.topLoader.start();

    try {
      await this.ordersTrader?.cancelConditionalOrder?.(order.orderId, payload);

      this.notificationsArea.note({
        title: 'Условная заявка отменена'
      });
    } catch (e) {
      console.log(e);

      this.notificationsArea.error({
        text: 'Не удалось отменить условную заявку.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async performConditionalOrderAction({ order, action, payload = {} } = {}) {
    this.topLoader.start();

    try {
      await this.ordersTrader?.performConditionalOrderAction?.(
        order.orderId,
        action,
        payload
      );

      this.notificationsArea.note({
        title: 'Запрос на действие отправлен'
      });
    } catch (e) {
      console.log(e);

      this.notificationsArea.error({
        text: 'Не удалось выполнить действие.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async refreshOrders() {
    if (this.orderTypeSelector.value === 'conditional') {
      return this.notificationsArea.note({
        text: 'Переставлять можно только биржевые заявки.'
      });
    }

    try {
      this.topLoader.start();

      await this.ordersTrader.modifyRealOrders({
        instrument: this.instrument,
        side: 'all',
        value: 0
      });

      if (!this.instrument) {
        this.notificationsArea.success({
          title: 'Биржевые заявки переставлены по всем инструментам'
        });
      } else {
        this.notificationsArea.success({
          title: `Биржевые заявки переставлены по инструменту ${this.instrument.symbol}`
        });
      }
    } catch (e) {
      console.error(e);

      this.notificationsArea.error({
        text: 'Не удалось переставить биржевые заявки.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async cancelAllOrders(options = {}) {
    this.topLoader.start();

    try {
      const typeSelectorValue = this.orderTypeSelector.value;
      const typeText = {
        all: 'Все',
        real: 'Биржевые',
        conditional: 'Условные'
      }[typeSelectorValue];
      let filterText = ' ';

      if (options?.filter === 'sell') {
        filterText = ' на продажу ';
      } else if (options?.filter === 'buy') {
        filterText = ' на покупку ';
      }

      if (typeSelectorValue === 'all' || typeSelectorValue === 'real') {
        await this.ordersTrader?.cancelAllRealOrders?.({
          instrument: this.instrument,
          filter: options.filter
        });
      }

      if (typeSelectorValue === 'all' || typeSelectorValue === 'conditional') {
        await this.ordersTrader?.cancelAllConditionalOrders?.({
          instrument: this.instrument,
          filter: options.filter
        });
      }

      if (!this.instrument) {
        this.notificationsArea.note({
          title: `${typeText} заявки${filterText}отменены по всем инструментам`
        });
      } else {
        this.notificationsArea.note({
          title: `${typeText} заявки${filterText}отменены по инструменту ${this.instrument.symbol}`
        });
      }
    } catch (e) {
      console.log(e);

      this.notificationsArea.error({
        text: 'Не удалось отменить все или некоторые заявки.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async validate() {
    try {
      new Function(
        'trader',
        'orders',
        await new Tmpl().render(
          this,
          this.container.orderProcessorFunc.value,
          {}
        )
      );
    } catch (e) {
      console.dir(e);

      invalidate(this.container.orderProcessorFunc, {
        errorMessage: 'Код содержит ошибки.',
        raiseException: true
      });
    }
  }

  async submit() {
    return {
      $set: {
        ordersTraderId: this.container.ordersTraderId.value,
        orderProcessorFunc: this.container.orderProcessorFunc.value,
        disableInstrumentFiltering:
          this.container.disableInstrumentFiltering.checked,
        showAllTab: this.container.showAllTab.checked,
        showLimitTab: this.container.showLimitTab.checked,
        showConditionalTab: this.container.showConditionalTab.checked,
        showRefreshOrdersButton: this.container.showRefreshOrdersButton.checked,
        showCancelAllOrdersButton:
          this.container.showCancelAllOrdersButton.checked,
        showCancelAllBuyOrdersButton:
          this.container.showCancelAllBuyOrdersButton.checked,
        showCancelAllSellOrdersButton:
          this.container.showCancelAllSellOrdersButton.checked
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.ACTIVE_ORDERS,
    collection: 'PPP',
    title: html`Активные заявки`,
    description: html`Виджет
      <span class="positive">Активные заявки</span> отображает текущие рыночные,
      лимитные и условные заявки, которые ожидают исполнения и не отменены.`,
    customElement: ActiveOrdersWidget.compose({
      template: activeOrdersWidgetTemplate,
      styles: activeOrdersWidgetStyles
    }).define(),
    defaultWidth: 280,
    minHeight: 120,
    minWidth: 140,
    defaultHeight: 350,
    settings: html`
      <ppp-tabs activeid="main">
        <ppp-tab id="main">Основные настройки</ppp-tab>
        <ppp-tab id="ui">UI</ppp-tab>
        <ppp-tab-panel id="main-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Трейдер активных заявок</h5>
              <p class="description">
                Трейдер, который будет источником списка активных заявок.
              </p>
            </div>
            <div class="control-line flex-start">
              <ppp-query-select
                ${ref('ordersTraderId')}
                deselectable
                standalone
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
              <h5>Обработка списка заявок</h5>
              <p class="description">
                Тело функции для обработки списка заявок.
              </p>
            </div>
            <div class="widget-settings-input-group">
              <ppp-snippet
                standalone
                :code="${(x) =>
                  x.document.orderProcessorFunc ?? defaultOrderProcessorFunc}"
                ${ref('orderProcessorFunc')}
                revertable
                @revert="${(x) => {
                  x.orderProcessorFunc.updateCode(defaultOrderProcessorFunc);
                }}"
              ></ppp-snippet>
            </div>
          </div>
        </ppp-tab-panel>
        <ppp-tab-panel id="ui-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Интерфейс</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-checkbox
              ?checked="${(x) => x.document.disableInstrumentFiltering}"
              ${ref('disableInstrumentFiltering')}
            >
              Не фильтровать содержимое по выбранному инструменту
            </ppp-checkbox>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Наполнение</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-checkbox
              ?checked="${(x) => x.document.showAllTab ?? true}"
              ${ref('showAllTab')}
            >
              Показывать вкладку «Все»
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showLimitTab ?? true}"
              ${ref('showLimitTab')}
            >
              Показывать вкладку «Лимитные»
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showConditionalTab ?? true}"
              ${ref('showConditionalTab')}
            >
              Показывать вкладку «Условные»
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showRefreshOrdersButton ?? true}"
              ${ref('showRefreshOrdersButton')}
            >
              Показывать кнопку «Переставить все заявки»
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) =>
                x.document.showCancelAllBuyOrdersButton ?? false}"
              ${ref('showCancelAllBuyOrdersButton')}
            >
              Показывать кнопку «Отменить все заявки на покупку»
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) =>
                x.document.showCancelAllSellOrdersButton ?? false}"
              ${ref('showCancelAllSellOrdersButton')}
            >
              Показывать кнопку «Отменить все заявки на продажу»
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showCancelAllOrdersButton ?? true}"
              ${ref('showCancelAllOrdersButton')}
            >
              Показывать кнопку «Отменить все заявки»
            </ppp-checkbox>
          </div>
        </ppp-tab-panel>
      </ppp-tabs>
    `
  };
}
