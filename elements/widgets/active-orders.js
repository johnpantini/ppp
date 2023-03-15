/** @decorator */

import {
  widget,
  widgetEmptyStateTemplate,
  WidgetWithInstrument
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  Observable,
  repeat
} from '../../vendor/fast-element.min.js';
import { TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import { validate } from '../../lib/ppp-errors.js';
import { ellipsis, normalize } from '../../design/styles.js';
import { cancelOrders, trash } from '../../static/svg/sprite.js';
import { formatAmount, formatPrice, formatQuantity } from '../../lib/intl.js';
import { fontSizeWidget } from '../../design/design-tokens.js';

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
        <div class="active-orders-widget-controls">
          <div class="active-orders-widget-tabs">
            <ppp-widget-box-radio-group
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
            </ppp-widget-box-radio-group>
          </div>
          <button
            class="active-orders-widget-cancel-orders"
            title="Отменить все заявки"
            @click="${(x) => x.cancelAllOrders()}"
          >
            <span>${html.partial(cancelOrders)}</span>
          </button>
        </div>
        <div class="active-orders-widget-order-list">
          ${when(
            (x) => x.empty,
            html`${html.partial(
              widgetEmptyStateTemplate('Активных заявок нет.')
            )}`
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
                          <span>${html.partial(trash)}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `
            )}
          </div>
          <ppp-widget-notifications-area></ppp-widget-notifications-area>
        </div>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
  </template>
`;

export const activeOrdersWidgetStyles = css`
  ${normalize()}
  ${widget()}
  .active-orders-widget-controls {
    z-index: 1;
    display: flex;
    align-items: center;
    padding-right: 12px;
  }

  .active-orders-widget-tabs {
    padding: 8px;
  }

  .active-orders-widget-cancel-orders {
    cursor: pointer;
    min-height: 24px;
    min-width: 24px;
    padding: 4px 8px;
    margin-right: 4px;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    border: none;
    border-radius: 4px;
    font-size: ${fontSizeWidget};
    text-align: left;
    vertical-align: middle;
    justify-content: center;
    background-color: rgb(243, 245, 248);
  }

  .active-orders-widget-cancel-orders:hover {
    background-color: rgb(223, 230, 237);
  }

  .active-orders-widget-cancel-orders span {
    margin: -2px -8px;
    display: inline-block;
    flex: 0 0 auto;
    vertical-align: text-bottom;
  }

  .active-orders-widget-cancel-orders span svg {
    width: 16px;
    height: 16px;
  }

  .active-orders-widget-order-list {
    height: 100%;
    width: 100%;
    position: relative;
    overflow-x: hidden;
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
    scrollbar-width: thin;
  }

  .active-orders-widget-order-list::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .active-orders-widget-order-list::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .active-orders-widget-order-list::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .active-orders-widget-order-list-inner {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
  }

  .active-order-holder {
    padding-top: 6px;
    margin: 0 8px;
  }

  .active-order-holder:first-child {
    padding-top: 0;
  }

  .active-order-holder:last-child {
    padding-bottom: 8px;
  }

  .active-order-holder-inner {
    cursor: default;
  }

  .active-order-card {
    min-height: 36px;
    height: auto;
    background-color: rgb(243, 245, 248);
    color: #323e4a;
    padding: 0 12px;
    border-radius: 4px;
    user-select: none;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .active-order-card-side-indicator {
    height: 100%;
    border-radius: 8px 0 0 8px;
    position: absolute;
    width: 4px;
    left: 0;
    top: 0;
  }

  .active-order-card[side='buy'] .active-order-card-side-indicator {
    background: linear-gradient(90deg, rgb(11, 176, 109) 50%, transparent 0);
  }

  .active-order-card[side='sell'] .active-order-card-side-indicator {
    background: linear-gradient(90deg, rgb(213, 54, 69) 50%, transparent 0);
  }

  .active-order-card-payload {
    width: 100%;
    padding: 8px 0;
    display: flex;
    align-items: center;
  }

  .active-order-card-actions {
    position: absolute;
    top: 0;
    right: 0;
    padding-right: 16px;
    width: 116px;
    height: 100%;
    opacity: 0;
    transition: opacity 0.15s ease-in;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: linear-gradient(
      90deg,
      rgba(243, 245, 248, 0) 0,
      rgb(243, 245, 248) 30%,
      rgb(243, 245, 248)
    );
  }

  .active-order-card-actions button {
    border-radius: 50%;
    min-height: 24px;
    min-width: 24px;
    background-color: rgb(232, 237, 243);
    color: rgb(90, 118, 143);
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    border: none;
    cursor: pointer;
    font-size: ${fontSizeWidget};
    justify-content: center;
    text-align: left;
    vertical-align: middle;
    padding: 0 8px;
  }

  .active-order-card-actions button:hover {
    background-color: rgb(223, 230, 237);
  }

  .active-order-card-actions button span {
    margin: 0 -8px;
    color: rgb(140, 167, 190);
    display: inline-block;
    flex: 0 0 auto;
    vertical-align: text-bottom;
  }

  .active-order-card-actions button span svg {
    width: 16px;
    height: 16px;
  }

  .active-order-card:hover .active-order-card-actions {
    opacity: 1;
    transition-timing-function: ease-out;
  }

  .active-order-card-logo {
    margin-right: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgb(140, 167, 190);
    background-color: rgb(223, 230, 237);
    min-width: 28px;
    min-height: 28px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    position: relative;
    word-wrap: break-word;
    font-size: 15px;
    line-height: 20px;
    font-weight: 400;
    letter-spacing: 0;
  }

  .active-order-card-logo div {
    width: 28px;
    height: 28px;
    left: 0;
    top: 0;
    position: absolute;
    border-radius: 50%;
    background-size: 100%;
    text-transform: capitalize;
  }

  .active-order-card-text {
    overflow: hidden;
    flex: 1;
  }

  .active-order-card-text-name-price,
  .active-order-card-text-side-rest {
    display: flex;
    white-space: nowrap;
    justify-content: space-between;
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    letter-spacing: 0;
  }

  .active-order-card-text-name-price {
    font-weight: 500;
    color: rgb(51, 70, 87);
  }

  .active-order-card-text-name {
    display: flex;
    align-items: center;
    margin-right: 20px;
    overflow: hidden;
  }

  .active-order-card-text-name > span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .active-order-card-text-name > span > div {
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: 20px;
    font-weight: 500;
    letter-spacing: 0;
    color: rgb(51, 70, 87);
    ${ellipsis()};
  }

  .active-order-card-text-side-rest {
    font-weight: 400;
    color: rgb(90, 118, 143);
  }

  .active-order-card-text-side {
    flex: 1;
    margin-right: 20px;
    ${ellipsis()};
  }

  .active-order-card-dot-divider {
    margin: 0 4px;
  }

  .active-order-card-text-side.positive {
    color: rgb(0, 163, 92);
  }

  .active-order-card-text-side.negative {
    color: rgb(219, 48, 48);
  }
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

    for (const [_, order] of this.orders ?? []) {
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
    void this.updateDocumentFragment({
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
