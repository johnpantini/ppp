/** @decorator */

import ppp from '../../ppp.js';
import {
  widgetStyles,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetDefaultEmptyStateTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import { invalidate } from '../../lib/ppp-errors.js';
import {
  html,
  css,
  ref,
  observable,
  Updates,
  Observable
} from '../../vendor/fast-element.min.js';
import { TRADER_DATUM, WIDGET_TYPES, ORDERS } from '../../lib/const.js';
import {
  normalize,
  spacing,
  getTraderSelectOptionColor
} from '../../design/styles.js';
import { cancelOrders, refresh, filter } from '../../static/svg/sprite.js';
import { formatQuantity } from '../../lib/intl.js';
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
  paletteRedLight3,
  paletteBlueLight2,
  paletteBlueBase
} from '../../design/design-tokens.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../tabs.js';
import '../text-field.js';
import '../widget-allowed-order-list.js';
import '../widget-controls.js';
import '../widget-real-order-card.js';

export const defaultOrderProcessorFunc = `/**
* Функция обработки списка активных заявок.
*
* @param {object} trader - Экземпляр трейдера PPP.
* @param {array} orders - Массив заявок.
*/

return orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));`;

const allTabHidden = (x) =>
  typeof x.document.showAllTab === 'undefined' ? false : !x.document.showAllTab;
const realTabHidden = (x) =>
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
        <div class="widget-toolbar" ?hidden="${(x) => !x.mayShowContent}">
          <div class="tabs">
            <ppp-widget-box-radio-group
              ?hidden="${(x) =>
                allTabHidden(x) && realTabHidden(x) && conditionalTabHidden(x)}"
              class="order-type-selector"
              @change="${(x) => x.handleOrderTypeChange()}"
              value="${(x) => x.document.activeTab ?? 'all'}"
              ${ref('orderTypeSelector')}
            >
              <ppp-widget-box-radio
                ?hidden="${(x) => allTabHidden(x)}"
                value="all"
              >
                ${() => ppp.t('$widget.tabs.allOrdersText')}
              </ppp-widget-box-radio>
              <ppp-widget-box-radio
                ?hidden="${(x) => realTabHidden(x)}"
                value="real"
              >
                ${() => ppp.t('$widget.tabs.realOrdersText')}
              </ppp-widget-box-radio>
              <ppp-widget-box-radio
                ?hidden="${(x) => conditionalTabHidden(x)}"
                value="conditional"
              >
                ${() => ppp.t('$widget.tabs.conditionalOrdersText')}
              </ppp-widget-box-radio>
            </ppp-widget-box-radio-group>
          </div>
          <div class="buttons">
            <button
              ?hidden="${(x) => {
                return typeof x.document.showConditionalOrdersFilterButton ===
                  'undefined'
                  ? false
                  : !x.document.showConditionalOrdersFilterButton;
              }}"
              ?active="${(x) => x.document.isConditionalOrdersFilterActive}"
              class="conditional-orders-filter"
              title="Фильтр условных заявок"
              @click="${(x) => x.handleConditionalFilterButtonClick()}"
            >
              <span>${html.partial(filter)}</span>
            </button>
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
              @click="${(x, c) =>
                x.cancelAllOrders({
                  filter: 'buy',
                  force: c.event.shiftKey
                })}"
            >
              <span>${html.partial(cancelOrders)}</span>
            </button>
            <button
              ?hidden="${(x) => !x.document.showCancelAllBuyOrdersButton}"
              class="cancel-sell-orders"
              title="Отменить все заявки на продажу"
              @click="${(x, c) =>
                x.cancelAllOrders({
                  filter: 'sell',
                  force: c.event.shiftKey
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
              @click="${(x, c) =>
                x.cancelAllOrders({ force: c.event.shiftKey })}"
            >
              <span>${html.partial(cancelOrders)}</span>
            </button>
          </div>
        </div>
        <div class="widget-card-list" ?hidden="${(x) => !x.mayShowContent}">
          <ppp-widget-empty-state-control
            ?hidden="${(x) => x.orders?.length || !x.mayShowContent}"
          >
            ${() => ppp.t('$widget.emptyState.noActiveOrders')}
          </ppp-widget-empty-state-control>
          <div class="widget-card-list-inner" ${ref('cardList')}></div>
        </div>
        ${widgetDefaultEmptyStateTemplate()}
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
  .conditional-orders-filter,
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

  .conditional-orders-filter[active] {
    color: ${themeConditional(paletteBlueBase, paletteBlueLight2)};
  }

  .refresh-orders:hover,
  .conditional-orders-filter:hover,
  .cancel-sell-orders:hover,
  .cancel-buy-orders:hover,
  .cancel-orders:hover {
    background-color: ${themeConditional(
      darken(paletteGrayLight2, 10),
      paletteGrayBase
    )};
  }

  .refresh-orders span,
  .conditional-orders-filter span,
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
  .conditional-orders-filter span svg,
  .cancel-sell-orders span svg,
  .cancel-buy-orders span svg,
  .cancel-orders span svg {
    width: 16px;
    height: 16px;
  }
`;

export class ActiveOrdersWidget extends WidgetWithInstrument {
  allowEmptyInstrument = true;

  @observable
  ordersTrader;

  @observable
  realOrder;

  onClick(e) {
    for (const node of e.composedPath()) {
      const actionButton = node?.closest?.('.widget-action-button[action');

      if (actionButton) {
        const action = actionButton.getAttribute('action');

        if (actionButton.parentNode.hasAttribute('real')) {
          if (action === 'cancel') {
            this.cancelOrder(
              this.realOrdersById.get(
                actionButton.parentNode.getAttribute('oid')
              )
            );
          }
        } else {
          this.conditionalOrdersById
            .get(actionButton.parentNode.getAttribute('oid'))
            .domElement.firstElementChild.firstElementChild.firstElementChild.performCardAction(
              action,
              e
            );
        }

        // Stop propagation.
        return;
      }

      if (
        node?.hasAttribute?.('selectable') &&
        this.document.disableInstrumentFiltering
      ) {
        if (node.hasAttribute('real')) {
          this.selectInstrument(
            this.realOrdersById.get(node.getAttribute('oid')).symbol
          );
        } else {
          const order = this.conditionalOrdersById.get(
            node.getAttribute('oid')
          );

          if (order.instrument) {
            this.selectInstrument(order.instrument.symbol);
          }
        }

        break;
      }
    }
  }

  realOrderChanged(oldValue, order) {
    if (order?.orderId) {
      const oid = order.orderId.toString();

      if (oid === '@CLEAR') {
        for (const [, node] of this.realOrdersRefsById) {
          node.remove();
        }

        this.realOrdersById.clear();
        this.realOrdersRefsById.clear();
      } else {
        if (order.quantity === order.filled || order.status !== 'working') {
          this.realOrdersRefsById.get(oid)?.remove();
          this.realOrdersRefsById.delete(oid);
          this.realOrdersById.delete(oid);
        } else if (order.status === 'working') {
          this.realOrdersById.set(oid, order);

          if (!this.realOrdersRefsById.has(oid)) {
            const cardHolder = document.createElement('div');

            cardHolder.classList.add('widget-card-holder');
            this.realOrdersRefsById.set(oid, cardHolder);

            const innerHolder = document.createElement('div');

            innerHolder.classList.add('widget-card-holder-inner');
            cardHolder.appendChild(innerHolder);

            const realOrderCardElement = document.createElement(
              'ppp-widget-real-order-card'
            );

            realOrderCardElement.order = order;
            realOrderCardElement.disableInstrumentFiltering =
              this.document.disableInstrumentFiltering;

            innerHolder.appendChild(realOrderCardElement);
            this.cardList.appendChild(cardHolder);
          } else {
            this.realOrdersRefsById.get(
              oid
            ).firstElementChild.firstElementChild.order = order;
          }
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

  // DOM nodes.
  realOrdersRefsById = new Map();

  conditionalOrdersById = new Map();

  // DOM nodes.
  conditionalOrdersRefsById = new Map();

  #conditionalOrdersQueue = [];

  #conditionalOrdersQueueIsBusy = false;

  orderProcessorFunc;

  slot;

  allowedConditionalOrders = new Set();

  constructor() {
    super();

    this.onClick = this.onClick.bind(this);
    this.orders = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    this.addEventListener('click', this.onClick);

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

      if (
        allTabHidden(this) &&
        conditionalTabHidden(this) &&
        this.document.activeTab === 'real'
      ) {
        await this.ordersTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            realOrder: TRADER_DATUM.REAL_ORDER
          }
        });
      } else if (
        allTabHidden(this) &&
        realTabHidden(this) &&
        this.document.activeTab === 'conditional'
      ) {
        await this.ordersTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            conditionalOrder: TRADER_DATUM.CONDITIONAL_ORDER
          }
        });
      } else {
        await this.ordersTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            realOrder: TRADER_DATUM.REAL_ORDER,
            conditionalOrder: TRADER_DATUM.CONDITIONAL_ORDER
          }
        });
      }

      this.orderProcessorFunc ??= new Function(
        'trader',
        'orders',
        await new Tmpl().render(
          this,
          this.document.orderProcessorFunc ?? defaultOrderProcessorFunc,
          {}
        )
      );

      this.cardList.attachShadow({ mode: 'open', slotAssignment: 'manual' });

      this.slot = document.createElement('slot');

      this.cardList.shadowRoot.append(this.slot);

      for (const { orderId, hidden } of this.document
        .allowedConditionalOrders ?? []) {
        if (orderId && !hidden) {
          this.allowedConditionalOrders.add(orderId);
        }
      }

      this.#rebuildOrdersArray();

      this.initialized = true;
    } catch (e) {
      this.initialized = true;

      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    this.removeEventListener('click', this.onClick);

    if (this.ordersTrader) {
      if (
        allTabHidden(this) &&
        conditionalTabHidden(this) &&
        this.document.activeTab === 'real'
      ) {
        await this.ordersTrader.unsubscribeFields?.({
          source: this,
          fieldDatumPairs: {
            realOrder: TRADER_DATUM.REAL_ORDER
          }
        });
      } else if (
        allTabHidden(this) &&
        realTabHidden(this) &&
        this.document.activeTab === 'conditional'
      ) {
        await this.ordersTrader.unsubscribeFields?.({
          source: this,
          fieldDatumPairs: {
            conditionalOrder: TRADER_DATUM.CONDITIONAL_ORDER
          }
        });
      } else {
        await this.ordersTrader.unsubscribeFields?.({
          source: this,
          fieldDatumPairs: {
            realOrder: TRADER_DATUM.REAL_ORDER,
            conditionalOrder: TRADER_DATUM.CONDITIONAL_ORDER
          }
        });
      }
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
      const oid = order.orderId.toString();

      if (order.status === 'canceled') {
        this.conditionalOrdersRefsById.get(oid)?.remove();
        this.conditionalOrdersRefsById.delete(oid);
        this.conditionalOrdersById.delete(oid);
      } else {
        this.conditionalOrdersById.set(oid, order);

        if (!this.conditionalOrdersRefsById.has(oid)) {
          const cardHolder = document.createElement('div');

          cardHolder.classList.add('widget-card-holder');
          this.conditionalOrdersRefsById.set(oid, cardHolder);

          const innerHolder = document.createElement('div');

          innerHolder.classList.add('widget-card-holder-inner');
          cardHolder.appendChild(innerHolder);

          const payloadHolder = document.createElement('div');

          payloadHolder.classList.add('widget-card-order-payload-holder');

          payloadHolder.order = order;

          const orderCardDefinitionElement = document.createElement(
            order.cardDefinition.name
          );

          payloadHolder.appendChild(orderCardDefinitionElement);
          innerHolder.appendChild(payloadHolder);
          this.cardList.appendChild(cardHolder);
        } else {
          this.conditionalOrdersRefsById.get(
            oid
          ).firstElementChild.firstElementChild.firstElementChild.order = order;
        }
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
      for (const [orderId, order] of this.realOrdersById ?? []) {
        if (order.status !== 'working') continue;

        order.domElement = this.realOrdersRefsById.get(orderId);

        if (typeof order.instrument === 'string') {
          order.instrument = this.ordersTrader.instruments.get(
            this.ordersTrader.symbolToCanonical(order.instrument)
          );
        }

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
      for (const [orderId, order] of this.conditionalOrdersById ?? []) {
        if (order.status === 'canceled') continue;

        if (
          this.document.isConditionalOrdersFilterActive &&
          !this.allowedConditionalOrders.has(order.payload.orderId)
        ) {
          continue;
        }

        order.domElement = this.conditionalOrdersRefsById.get(orderId);

        if (typeof order.instrument === 'string') {
          order.instrument = this.ordersTrader.instruments.get(
            this.ordersTrader.symbolToCanonical(order.instrument)
          );
        }

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

    this.slot.assign(...this.orders.map((o) => o.domElement));
  }

  handleConditionalFilterButtonClick() {
    this.document.isConditionalOrdersFilterActive =
      !this.document.isConditionalOrdersFilterActive;

    this.#rebuildOrdersArray();

    Observable.notify(this, 'document');

    return this.updateDocumentFragment({
      $set: {
        'widgets.$.isConditionalOrdersFilterActive':
          this.document.isConditionalOrdersFilterActive
      }
    });
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

      !this.document.onlyShowErrorNotifications &&
        this.notificationsArea.note({
          title: 'Заявка отменена'
        });
    } catch (e) {
      this.$$debug('cancelOrder [%o] failed: %o', order, e);

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
      await this.ordersTrader?.cco?.(order.orderId, payload);

      !this.document.onlyShowErrorNotifications &&
        this.notificationsArea.note({
          title: 'Условная заявка отменена'
        });
    } catch (e) {
      this.$$debug('cancelConditionalOrder [%o] failed: %o', order, e);

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
      await this.ordersTrader?.pcoa?.(order.orderId, action, payload);

      !this.document.onlyShowErrorNotifications &&
        this.notificationsArea.note({
          title: 'Запрос на действие отправлен'
        });
    } catch (e) {
      this.$$debug(
        'performConditionalOrderAction [%o, %s, %o] failed: %o',
        order,
        action,
        payload,
        e
      );

      this.notificationsArea.error({
        text: 'Не удалось выполнить действие.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async refreshOrders() {
    if (this.orderTypeSelector.value === 'conditional') {
      !this.document.onlyShowErrorNotifications &&
        this.notificationsArea.note({
          text: 'Переставлять можно только биржевые заявки.'
        });

      return;
    }

    try {
      this.topLoader.start();

      await this.ordersTrader.modifyRealOrders({
        instrument: this.instrument,
        side: 'all',
        value: 0
      });

      if (!this.document.onlyShowErrorNotifications) {
        if (!this.instrument) {
          this.notificationsArea.success({
            title: 'Биржевые заявки переставлены по всем инструментам'
          });
        } else {
          this.notificationsArea.success({
            title: `Биржевые заявки переставлены по инструменту ${this.instrument.symbol}`
          });
        }
      }
    } catch (e) {
      this.$$debug('refreshOrders failed: %o', e);

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
          filter: options.filter,
          payload: {
            force: options.force
          }
        });
      }

      if (!this.document.onlyShowErrorNotifications) {
        if (!this.instrument) {
          this.notificationsArea.note({
            title: `${typeText} заявки${filterText}отменены по всем инструментам`
          });
        } else {
          this.notificationsArea.note({
            title: `${typeText} заявки${filterText}отменены по инструменту ${this.instrument.symbol}`
          });
        }
      }
    } catch (e) {
      this.$$debug('cancelAllOrders [%o] failed: %o', options, e);

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

      await this.container.allowedConditionalOrders.validate();
    } catch (e) {
      this.$$debug('validate failed: %o', e);

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
        onlyShowErrorNotifications:
          this.container.onlyShowErrorNotifications.checked,
        showAllTab: this.container.showAllTab.checked,
        showLimitTab: this.container.showLimitTab.checked,
        showConditionalTab: this.container.showConditionalTab.checked,
        showRefreshOrdersButton: this.container.showRefreshOrdersButton.checked,
        showCancelAllOrdersButton:
          this.container.showCancelAllOrdersButton.checked,
        showCancelAllBuyOrdersButton:
          this.container.showCancelAllBuyOrdersButton.checked,
        showCancelAllSellOrdersButton:
          this.container.showCancelAllSellOrdersButton.checked,
        showConditionalOrdersFilterButton:
          this.container.showConditionalOrdersFilterButton.checked,
        isConditionalOrdersFilterActive:
          this.container.isConditionalOrdersFilterActive.checked,
        allowedConditionalOrders: this.container.allowedConditionalOrders.value
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
    defaultWidth: 300,
    minHeight: 120,
    minWidth: 140,
    defaultHeight: 350,
    settings: html`
      <ppp-tabs activeid="main">
        <ppp-tab id="main">Основные настройки</ppp-tab>
        <ppp-tab id="ui">UI</ppp-tab>
        <ppp-tab id="conditional">Условные заявки</ppp-tab>
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
                            caps: {
                              $in: [
                                `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_ACTIVE_ORDERS%]`,
                                `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_CONDITIONAL_ORDERS%]`
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
            <ppp-checkbox
              ?checked="${(x) => x.document.onlyShowErrorNotifications}"
              ${ref('onlyShowErrorNotifications')}
            >
              Показывать только уведомления об ошибках
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
              Показывать вкладку «Биржевые»
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showConditionalTab ?? true}"
              ${ref('showConditionalTab')}
            >
              Показывать вкладку «Условные»
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) => x.document.showRefreshOrdersButton ?? false}"
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
        <ppp-tab-panel id="conditional-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Интерфейс</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-checkbox
              ?checked="${(x) =>
                x.document.showConditionalOrdersFilterButton ?? true}"
              ${ref('showConditionalOrdersFilterButton')}
            >
              Показывать кнопку фильтра условных заявок
            </ppp-checkbox>
            <ppp-checkbox
              ?checked="${(x) =>
                x.document.isConditionalOrdersFilterActive ?? false}"
              ${ref('isConditionalOrdersFilterActive')}
            >
              Включить фильтр
            </ppp-checkbox>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Разрешённые условные заявки</h5>
              <p class="description">
                Список условных заявок, которые будут отображаться при активном
                фильтре.
              </p>
            </div>
            <div class="widget-settings-input-group">
              <div class="spacing2"></div>
              <ppp-widget-allowed-order-list
                ${ref('allowedConditionalOrders')}
                :stencil="${() => {
                  return {};
                }}"
                :list="${(x) =>
                  x.document.allowedConditionalOrders ?? [{ hidden: true }]}"
                :orders="${(x) => x.document.orders}"
              ></ppp-widget-allowed-order-list>
            </div>
          </div>
        </ppp-tab-panel>
      </ppp-tabs>
    `
  };
}
