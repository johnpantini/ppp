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
  repeat,
  attr
} from '../../vendor/fast-element.min.js';
import { TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import { validate } from '../../lib/ppp-errors.js';
import { normalize, scrollbars, spacing } from '../../design/styles.js';
import { cancelOrders, trash } from '../../static/svg/sprite.js';
import { formatAmount, formatPrice, formatQuantity } from '../../lib/intl.js';
import {
  themeConditional,
  darken,
  lighten,
  fontSizeWidget,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayLight1,
  paletteGrayLight2,
  spacing1
} from '../../design/design-tokens.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';

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
        <div class="controls">
          <div class="tabs">
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
            class="cancel-orders"
            title="Отменить все заявки"
            @click="${(x) => x.cancelAllOrders()}"
          >
            <span>${html.partial(cancelOrders)}</span>
          </button>
        </div>
        <div class="order-list">
          ${when(
            (x) => x.empty,
            html`${html.partial(
              widgetEmptyStateTemplate('Активных заявок нет.')
            )}`
          )}
          <div class="order-list-inner">
            ${repeat(
              (x) => x.orders,
              html`
                <div class="widget-card-holder">
                  <div class="widget-card-holder-inner">
                    <ppp-widget-card clickable side="${(x) => x.side}">
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
                          formatAmount(
                            o.instrument?.lot *
                              o.price *
                              (o.quantity - o.filled),
                            o.instrument?.currency
                          )}
                      </span>
                      <span
                        slot="subtitle-left"
                        class="${(o) =>
                          o.side === 'buy' ? 'positive' : 'negative'}"
                      >
                        ${(o) => (o.side === 'buy' ? 'Покупка' : 'Продажа')}
                      </span>
                      <div style="display: flex" slot="subtitle-right">
                        ${(o, c) => c.parent.formatRestQuantity(o)}
                        <span class="dot-divider">•</span>
                        ${(o) => formatPrice(o.price, o.instrument)}
                      </div>
                      <button
                        class="widget-action-button"
                        slot="actions"
                        @click="${(o, c) => c.parent.cancelOrder(o)}"
                      >
                        <span>${html.partial(trash)}</span>
                      </button>
                    </ppp-widget-card>
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
  ${scrollbars('.order-list')}
  ${spacing()}
  .controls {
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
  }

  .tabs {
    padding: 10px 8px 14px 8px;
  }

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

  .cancel-orders:hover {
    background-color: ${themeConditional(
      darken(paletteGrayLight2, 10),
      paletteGrayBase
    )};
  }

  .cancel-orders span {
    margin: -2px -8px;
    display: inline-block;
    flex: 0 0 auto;
    vertical-align: text-bottom;
  }

  .cancel-orders span svg {
    width: 16px;
    height: 16px;
  }

  .order-list {
    height: 100%;
    width: 100%;
    position: relative;
    overflow-x: hidden;
  }

  .order-list-inner {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
  }

  .dot-divider {
    margin: 0 ${spacing1};
  }
`;

export class ActiveOrdersWidget extends WidgetWithInstrument {
  @observable
  ordersTrader;

  @observable
  currentOrder;

  @observable
  orders;

  @attr
  empty;

  constructor() {
    super();

    this.orders = [];
    this.ordersMap = new Map();
    this.empty = true;
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.ordersTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер лимитных заявок.',
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
          currentOrder: TRADER_DATUM.CURRENT_ORDER
        }
      });
    } catch (e) {
      return this.catchException(e);
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
          this.ordersMap.delete(newValue.orderId);
        else if (newValue.status === 'working') {
          this.ordersMap.set(newValue.orderId, newValue);
        }

        this.orders = this.getOrdersArray();
      }
    }
  }

  async instrumentChanged(oldValue, newValue) {
    super.instrumentChanged();

    await this.ordersTrader?.instrumentChanged?.(this, oldValue, newValue);

    this.orders = this.getOrdersArray();
  }

  getOrdersArray() {
    const orders = [];

    for (const [_, order] of this.ordersMap ?? []) {
      if (order.status !== 'working') continue;

      if (this.instrument) {
        if (
          this.ordersTrader?.instrumentsAreEqual?.(
            order.instrument,
            this.instrument
          )
        ) {
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

  async submit() {
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
          <p class="description">
            Трейдер, который будет источником списка активных лимитных заявок.
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
                        caps: `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_ACTIVE_ORDERS%]`
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
    `
  };
}
