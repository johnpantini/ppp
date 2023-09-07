/** @decorator */

import ppp from '../../ppp.js';
import {
  widgetStyles,
  widgetEmptyStateTemplate,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate
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
import { normalize, spacing } from '../../design/styles.js';
import { cancelOrders, refresh, trash } from '../../static/svg/sprite.js';
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
  spacing1,
  paletteGreenBase,
  paletteGreenLight3,
  paletteRedBase,
  paletteRedLight3
} from '../../design/design-tokens.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../text-field.js';
import '../widget-controls.js';

const showAllTabHidden = (x) =>
  typeof x.document.showAllTab === 'undefined' ? false : !x.document.showAllTab;
const showLimitTabHidden = (x) =>
  typeof x.document.showLimitTab === 'undefined'
    ? false
    : !x.document.showLimitTab;
const showConditionalTabHidden = (x) =>
  typeof x.document.showConditionalTab === 'undefined'
    ? false
    : !x.document.showConditionalTab;

export const activeOrdersWidgetTemplate = html`
  <template>
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
      <div class="widget-body">
        <div class="controls">
          <div class="tabs">
            <ppp-widget-box-radio-group
              ?hidden="${(x) =>
                showAllTabHidden(x) &&
                showLimitTabHidden(x) &&
                showConditionalTabHidden(x)}"
              class="order-type-selector"
              @change="${(x) => x.handleOrderTypeChange()}"
              value="${(x) => x.document.activeTab ?? 'all'}"
              ${ref('orderTypeSelector')}
            >
              <ppp-widget-box-radio
                ?hidden="${(x) => showAllTabHidden(x)}"
                value="all"
              >
                Все
              </ppp-widget-box-radio>
              <ppp-widget-box-radio
                ?hidden="${(x) => showLimitTabHidden(x)}"
                value="limit"
              >
                Лимитные
              </ppp-widget-box-radio>
              <ppp-widget-box-radio
                ?hidden="${(x) => showConditionalTabHidden(x)}"
                value="conditional"
                disabled
              >
                Условные
              </ppp-widget-box-radio>
            </ppp-widget-box-radio-group>
          </div>
          <div class="buttons">
            <button
              ?hidden="${(x) => !x.document.showRefreshOrdersButton}"
              class="refresh-orders"
              title="Переставить заявки"
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
        <div class="widget-card-list">
          ${when(
            (x) => x.empty,
            html`${html.partial(
              widgetEmptyStateTemplate('Активных заявок нет.')
            )}`
          )}
          <div class="widget-card-list-inner">
            ${repeat(
              (x) => x.orders,
              html`
                <div class="widget-card-holder">
                  <div class="widget-card-holder-inner">
                    <ppp-widget-card side="${(x) => x.side}">
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
                            o.instrument?.currency,
                            o.instrument
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
                        ${when(
                          (o) => typeof o.destination === 'string',
                          html`
                            ${(o) => o.destination.toUpperCase()}
                            <span class="dot-divider">•</span>
                          `
                        )}
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
  ${widgetStyles()}
  ${spacing()}
  .controls {
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
  }

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

  .dot-divider {
    margin: 0 ${spacing1};
  }
`;

export class ActiveOrdersWidget extends WidgetWithInstrument {
  @observable
  ordersTrader;

  @observable
  activeOrder;

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
          activeOrder: TRADER_DATUM.ACTIVE_ORDER
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
          activeOrder: TRADER_DATUM.ACTIVE_ORDER
        }
      });
    }

    super.disconnectedCallback();
  }

  activeOrderChanged(oldValue, newValue) {
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
    this.document.activeTab = this.orderTypeSelector.value;

    void this.updateDocumentFragment({
      $set: {
        'widgets.$.activeTab': this.document.activeTab
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

  async refreshOrders() {
    if (typeof this.ordersTrader?.modifyLimitOrders !== 'function') {
      return this.notificationsArea.error({
        text: 'Трейдер не поддерживает эту операцию.'
      });
    }

    try {
      this.topLoader.start();

      await this.ordersTrader.modifyLimitOrders({
        instrument: this.instrument,
        side: 'all',
        value: 0
      });

      this.notificationsArea.success({
        title: 'Заявки переставлены'
      });
    } catch (e) {
      console.error(e);

      this.notificationsArea.error({
        text: 'Не удалось переставить заявки.'
      });
    } finally {
      this.topLoader.stop();
    }
  }

  async cancelAllOrders(options = {}) {
    if (typeof this.ordersTrader?.cancelAllLimitOrders !== 'function') {
      return this.notificationsArea.error({
        title: 'Активные заявки',
        text: 'Трейдер не поддерживает отмену всех заявок.'
      });
    }

    this.topLoader.start();

    try {
      await this.ordersTrader?.cancelAllLimitOrders?.({
        instrument: this.instrument,
        filter: options.filter
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
    // No-op.
  }

  async submit() {
    return {
      $set: {
        ordersTraderId: this.container.ordersTraderId.value,
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
      <span class="positive">Активные заявки</span> отображает текущие лимитные
      и условные заявки, которые ещё не исполнены и не отменены.`,
    customElement: ActiveOrdersWidget.compose({
      template: activeOrdersWidgetTemplate,
      styles: activeOrdersWidgetStyles
    }).define(),
    defaultWidth: 280,
    minHeight: 120,
    minWidth: 140,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер лимитных заявок</h5>
          <p class="description">
            Трейдер, который будет источником списка активных лимитных заявок.
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
          <h5>Параметры отображения и работы</h5>
        </div>
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
          ?checked="${(x) => x.document.showCancelAllBuyOrdersButton ?? false}"
          ${ref('showCancelAllBuyOrdersButton')}
        >
          Показывать кнопку «Отменить все заявки на покупку»
        </ppp-checkbox>
        <ppp-checkbox
          ?checked="${(x) => x.document.showCancelAllSellOrdersButton ?? false}"
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
    `
  };
}
