/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html, requireComponent } from './template.js';
import { TRADER_DATUM, WIDGET_TYPES } from './const.js';
import { Observable, observable } from './element/observation/observable.js';
import { validate } from './validate.js';
import { when } from './element/templating/when.js';
import { repeat } from './element/templating/repeat.js';
import { cancelOrders } from '../desktop/leafygreen/icons/cancel-orders.js';
import { trash } from '../desktop/leafygreen/icons/trash.js';
import { formatAmount, formatPrice, formatQuantity } from './intl.js';
import ppp from '../ppp.js';

await requireComponent('ppp-widget-radio-box-group');

export const activeOrdersWidgetTemplate = (context, definition) => html`
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
        <div class="active-orders-widget-controls">
          <div class="active-orders-widget-tabs">
            <ppp-widget-radio-box-group
              class="order-type-selector"
              @change="${(x) => x.handleOrderTypeChange()}"
              value="${(x) => x.document.activeTab ?? 'all'}"
              ${ref('orderTypeSelector')}
            >
              <ppp-widget-box-radio value="all">Все</ppp-widget-box-radio>
              <ppp-widget-box-radio
                value="limit"
              >
                Лимитные
              </ppp-widget-box-radio>
              <ppp-widget-box-radio
                value="stop"
                disabled
              >
                Отложенные
              </ppp-widget-box-radio>
            </ppp-widget-radio-box-group>
          </div>
          <button
            class="active-orders-widget-cancel-orders"
            title="Отменить все заявки"
            @click="${(x) => x.cancelAllOrders()}"
          >
            <span> ${cancelOrders()} </span>
          </button>
        </div>
        <div class="active-orders-widget-order-list">
          ${when(
            (x) => x.empty,
            html`
              <div class="widget-empty-state-holder">
                <img draggable="false" src="static/empty-widget-state.svg" />
                <span>Активных заявок нет.</span>
              </div>
            `
          )}
          <div class="active-orders-widget-order-list-inner">
            ${repeat(
              (x) => x.getOrdersArray(),
              html`
                <div class="active-order-holder">
                  <div class="active-order-holder-inner">
                    <div class="active-order-card" side="${(x) => x.side}">
                      <div class="active-order-card-side-indicator"></div>
                      <div class="active-order-card-payload">
                        <div class="active-order-card-logo">
                          <div
                            style="${(o) =>
                              o.instrument.isin
                                ? `background-image:url(${
                                    'static/instruments/' +
                                    o.instrument.isin +
                                    '.svg'
                                  })`
                                : ''}"
                          ></div>
                          ${(o) =>
                            o.instrument?.fullName?.[0] ??
                            o.instrument.symbol[0] ??
                            ''}
                        </div>
                        <div class="active-order-card-text">
                          <div class="active-order-card-text-name-price">
                            <div class="active-order-card-text-name">
                              <span>
                                <div>
                                  ${(o) => o.instrument?.fullName ?? o.symbol}
                                </div>
                              </span>
                            </div>
                            <span>
                              ${(o) =>
                                formatAmount(
                                  o.instrument?.lot *
                                    o.price *
                                    (o.quantity - o.filled),
                                  o.instrument?.currency
                                )}
                            </span>
                          </div>
                          <div class="active-order-card-text-side-rest">
                            <div
                              class="active-order-card-text-side ${(o) =>
                                o.side === 'buy' ? 'positive' : 'negative'}"
                            >
                              ${(o) =>
                                o.side === 'buy' ? 'Покупка' : 'Продажа'}
                            </div>
                            <span>
                              <div>
                                ${(o, c) => c.parent.formatRestQuantity(o)}
                                <span class="active-order-card-dot-divider"
                                  >•</span
                                >
                                ${(o) => formatPrice(o.price, o.instrument)}
                              </div>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="active-order-card-actions">
                        <button @click="${(o, c) => c.parent.cancelOrder(o)}">
                          <span> ${trash()} </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `
            )}
          </div>
        </div>
        <${'ppp-widget-notifications-area'}
          ${ref('notificationsArea')}
        ></ppp-widget-notifications-area>
      </div>
    </div>
  </template>
`;

export class PppActiveOrdersWidget extends WidgetWithInstrument {
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
        if (order.instrument.symbol === this.instrument.symbol) {
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

export async function widgetDefinition(definition = {}) {
  return {
    type: WIDGET_TYPES.ACTIVE_ORDERS,
    collection: 'PPP',
    title: html`Активные заявки`,
    description: html`Виджет
      <span class="positive">Активные заявки</span> отображает текущие лимитные
      и отложенные заявки, которые ещё не исполнены и не отменены.`,
    customElement: PppActiveOrdersWidget.compose(definition),
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
        <${'ppp-button'}
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
