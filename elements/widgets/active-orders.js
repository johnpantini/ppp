/** @decorator */

import { widget, WidgetWithInstrument } from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  Observable
} from '../../vendor/fast-element.min.js';
import { TRADER_CAPS, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import { normalize } from '../../design/styles.js';

export const activeOrdersWidgetTemplate = html`
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
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
    </div>
  </template>
`;

export const activeOrdersWidgetStyles = css`
  ${normalize()}
  ${widget()}
`;

export class ActiveOrdersWidget extends WidgetWithInstrument {
  @observable
  ordersTrader;

  @observable
  currentOrder;

  @observable
  orders;

  @observable
  empty;

  async connectedCallback() {
    super.connectedCallback();

    this.empty = true;
    this.orders = new Map();
    this.ordersTrader = await ppp.getOrCreateTrader(this.document.ordersTrader);
    this.searchControl.trader = this.ordersTrader;

    if (this.ordersTrader) {
      await this.ordersTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          currentOrder: TRADER_DATUM.CURRENT_ORDER
        }
      });
    }
  }

  async disconnectedCallback() {
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
    if (newValue?.orderId) {
      if (newValue.orderType === 'limit') {
        if (
          newValue.quantity === newValue.filled ||
          newValue.status !== 'working'
        )
          this.orders.delete(newValue.orderId);
        else if (newValue.status === 'working') {
          this.orders.set(newValue.orderId, newValue);
        }

        Observable.notify(this, 'orders');
      }
    }
  }

  instrumentChanged() {
    super.instrumentChanged();

    Observable.notify(this, 'orders');
  }

  getOrdersArray() {
    const orders = [];

    for (const [k, order] of this.orders ?? []) {
      if (order.status !== 'working') continue;

      if (this.instrument) {
        if (order.instrument?.symbol === this.instrument.symbol) {
          orders.push(order);
        }
      } else orders.push(order);
    }

    this.empty = orders.length === 0;

    return orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  }

  handleOrderTypeChange() {
    void this.applyChanges({
      $set: {
        'widgets.$.activeTab': this.orderTypeSelector.value
      }
    });
  }

  formatRestQuantity(order) {
    if (order.filled === 0) return formatQuantity(order.quantity);
    else
      return `${formatQuantity(order.filled)} из ${formatQuantity(
        order.quantity
      )}`;
  }

  async cancelOrder(order) {
    if (typeof this.ordersTrader?.cancelLimitOrder !== 'function') {
      return this.notificationsArea.error({
        title: 'Активные заявки',
        text: 'Трейдер не поддерживает отмену заявок.'
      });
    }

    this.topLoader.start();

    try {
      await this.ordersTrader?.cancelLimitOrder?.(order);

      this.notificationsArea.success({
        title: 'Заявка отменена'
      });
    } catch (e) {
      console.log(e);

      this.notificationsArea.error({
        title: 'Активные заявки',
        text: 'Не удалось отменить заявку.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async cancelAllOrders() {
    if (typeof this.ordersTrader?.cancelAllLimitOrders !== 'function') {
      return this.notificationsArea.error({
        title: 'Активные заявки',
        text: 'Трейдер не поддерживает отмену всех заявок.'
      });
    }

    this.topLoader.start();

    try {
      await this.ordersTrader?.cancelAllLimitOrders?.({
        instrument: this.instrument
      });

      this.notificationsArea.success({
        title: 'Заявки отменены'
      });
    } catch (e) {
      console.log(e);

      this.notificationsArea.error({
        title: 'Активные заявки',
        text: 'Не удалось отменить заявки.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async validate() {
    await validate(this.container.ordersTraderId);
  }

  async update() {
    return {
      $set: {
        ordersTraderId: this.container.ordersTraderId.value
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
      <span class="positive">Активные заявки</span> отображает текущие лимитные
      и отложенные заявки, которые ещё не исполнены и не отменены.`,
    customElement: ActiveOrdersWidget.compose({
      template: activeOrdersWidgetTemplate,
      styles: activeOrdersWidgetStyles
    }).define(),
    maxHeight: 1200,
    maxWidth: 365,
    defaultHeight: 400,
    defaultWidth: 280,
    minHeight: 132,
    minWidth: 242,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер лимитных заявок</h5>
          <p>
            Трейдер, который будет источником списка активных лимитных заявок.
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
        <ppp-button
          class="margin-top"
          @click="${() => window.open('?page=trader', '_blank').focus()}"
          appearance="primary"
        >
          Создать нового трейдера
        </ppp-button>
      </div>
    `
  };
}
