/** @decorator */

import { widget, WidgetWithInstrument } from '../widget.js';
import {
  html,
  css,
  ref,
  observable,
  repeat
} from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES } from '../../lib/const.js';
import { normalize, spacing } from '../../design/styles.js';
import { scrollbars } from '../../design/styles.js';
import { validate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../query-select.js';
import '../snippet.js';
import '../text-field.js';

const defaultBuySideButtonsTemplate = `+1,+2,+5,+10
-1,-2,-5,-10`;
const defaultSellSideButtonsTemplate = `+1,+2,+5,+10
-1,-2,-5,-10`;

export const scalpingButtonsWidgetTemplate = html`
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
              <ppp-widget-box-radio value="limit">
                Лимитные
              </ppp-widget-box-radio>
              <ppp-widget-box-radio value="stop" disabled>
                Отложенные
              </ppp-widget-box-radio>
            </ppp-widget-box-radio-group>
          </div>
        </div>
        <div class="holder">
          <div
            class="holder-buy"
            @click="${(x, c) => x.handleBuySellButtonClick(c, 'buy')}"
          >
            ${repeat(
              (x) =>
                (
                  x.document.buySideButtonsTemplate ??
                  defaultBuySideButtonsTemplate
                )?.split(/\r?\n/),
              html`
                <div class="${(x) => (x?.trim() ? '' : 'empty')}">
                  ${repeat(
                    (x) => x?.split(',').filter((i) => i),
                    html`
                      <ppp-widget-button appearance="primary">
                        ${(x) => {
                          const n = parseInt(x).toString();

                          if (isNaN(n)) return '0';

                          if (n > 0) return `+${n}`;
                          else return n;
                        }}
                      </ppp-widget-button>
                    `
                  )}
                </div>
              `
            )}
          </div>
          <div
            class="holder-sell"
            @click="${(x, c) => x.handleBuySellButtonClick(c, 'sell')}"
          >
            ${repeat(
              (x) =>
                (
                  x.document.sellSideButtonsTemplate ??
                  defaultSellSideButtonsTemplate
                )?.split(/\r?\n/),
              html`
                <div class="${(x) => (x?.trim() ? '' : 'empty')}">
                  ${repeat(
                    (x) => x?.split(',').filter((i) => i),
                    html`
                      <ppp-widget-button appearance="danger">
                        ${(x) => {
                          const n = parseInt(x).toString();

                          if (isNaN(n)) return '0';

                          if (n > 0) return `+${n}`;
                          else return n;
                        }}
                      </ppp-widget-button>
                    `
                  )}
                </div>
              `
            )}
          </div>
        </div>
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const scalpingButtonsWidgetStyles = css`
  ${normalize()}
  ${widget()}
  ${spacing()}
  ${scrollbars('.holder')}
  .controls {
    z-index: 1;
    display: flex;
    align-items: center;
    padding-right: 12px;
  }

  .tabs {
    padding: 10px 8px 8px 8px;
  }

  .holder {
    display: flex;
    position: relative;
    padding: 0 8px;
    margin-bottom: 8px;
    height: 100%;
    width: 100%;
    gap: 0 8px;
  }

  .holder-buy,
  .holder-sell {
    width: 100%;
  }

  .holder-buy > div,
  .holder-sell > div {
    display: flex;
    width: 100%;
    margin-top: 8px;
    gap: 2px 5px;
  }

  .holder-buy > div.empty,
  .holder-sell > div.empty {
    margin-top: 0;
    height: 4px;
  }

  .holder-buy > div > ppp-widget-button,
  .holder-sell > div > ppp-widget-button {
    width: 100%;
  }
`;

export class ScalpingButtonsWidget extends WidgetWithInstrument {
  @observable
  ordersTrader;

  #buttons;

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.ordersTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер для модификации заявок.',
        keep: true
      });
    }

    try {
      this.ordersTrader = await ppp.getOrCreateTrader(
        this.document.ordersTrader
      );
      this.searchControl.trader = this.ordersTrader;

      if (this.ordersTrader) {
        await this.ordersTrader.sayHello(WIDGET_TYPES.SCALPING_BUTTONS);
      }
    } catch (e) {
      return this.catchException(e);
    }
  }

  handleOrderTypeChange() {
    void this.updateDocumentFragment({
      $set: {
        'widgets.$.activeTab': this.orderTypeSelector.value
      }
    });
  }

  async handleBuySellButtonClick({ event }, side) {
    if (typeof this.ordersTrader?.modifyLimitOrders === 'function') {
      const button = event
        .composedPath()
        .find((n) => n.tagName?.toLowerCase?.() === 'ppp-widget-button');

      if (button) {
        const value = parseInt(button.textContent);

        if (value !== 0) {
          this.#buttons =
            this.#buttons ??
            Array.from(this.querySelectorAll('ppp-widget-button'));

          const coolDown = Math.abs(this.document.coolDown);

          try {
            this.topLoader.start();
            this.#buttons.forEach((b) => b.setAttribute('disabled', true));

            await this.ordersTrader.modifyLimitOrders({
              instrument: this.instrument,
              side,
              value
            });
          } catch (e) {
            console.error(e);

            this.notificationsArea.error({
              title: 'Скальперские кнопки',
              text: 'Не удалось переставить заявки.'
            });
          } finally {
            if (coolDown > 0) {
              await later(coolDown);
            }

            this.#buttons.forEach((b) => b.removeAttribute('disabled'));
            this.topLoader.stop();
          }
        }
      }
    } else {
      return this.notificationsArea.error({
        title: 'Скальперские кнопки',
        text: 'Трейдер не поддерживает переставление заявок.'
      });
    }
  }

  async validate() {
    await validate(this.container.ordersTraderId);

    if (this.container.coolDown.value) {
      await validate(this.container.coolDown, {
        hook: async (value) => +value >= 0 && +value <= 5000,
        errorMessage: 'Введите значение в диапазоне от 0 до 5000'
      });
    }

    await validate(this.container.buySideButtonsTemplate);
    await validate(this.container.sellSideButtonsTemplate);
  }

  async submit() {
    return {
      $set: {
        ordersTraderId: this.container.ordersTraderId.value,
        coolDown: this.container.coolDown.value,
        buySideButtonsTemplate: this.container.buySideButtonsTemplate.value,
        sellSideButtonsTemplate: this.container.sellSideButtonsTemplate.value
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.SCALPING_BUTTONS,
    collection: 'PPP',
    title: html`Скальперские кнопки`,
    description: html`<span class="positive">Скальперские кнопки</span>
      позволяют быстро модифицировать лимитные и отложенные заявки на заданное
      количество шагов цены.`,
    customElement: ScalpingButtonsWidget.compose({
      template: scalpingButtonsWidgetTemplate,
      styles: scalpingButtonsWidgetStyles
    }).define(),
    minWidth: 275,
    minHeight: 120,
    defaultWidth: 275,
    defaultHeight: 160,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер лимитных заявок</h5>
          <p class="description">
            Трейдер, который будет переставлять лимитные заявки.
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
                        caps: `[%#(await import('../../lib/const.js')).TRADER_CAPS.CAPS_LIMIT_ORDERS%]`
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
          <h5>Задержка после использования кнопок</h5>
          <p class="description">
            В течение этого времени после нажатия кнопка будет недоступна.
            Указывается в миллисекундах.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            optional
            type="number"
            placeholder="1000"
            value="${(x) => x.document.coolDown}"
            ${ref('coolDown')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Кнопки для заявок на покупку</h5>
          <p class="description">
            Перечислите значения (со знаком) кнопок через запятую. Для создания
            нового ряда выполните перенос строки. Чтобы сделать отступ, оставьте
            очередную строку пустой. Значения задаются в шагах цены торгового
            инструмента.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-snippet
            :code="${(x) =>
              x.document.buySideButtonsTemplate ??
              defaultBuySideButtonsTemplate}"
            ${ref('buySideButtonsTemplate')}
          ></ppp-snippet>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Кнопки для заявок на продажу</h5>
        </div>
        <div class="widget-settings-input-group">
          <ppp-snippet
            :code="${(x) =>
              x.document.sellSideButtonsTemplate ??
              defaultSellSideButtonsTemplate}"
            ${ref('sellSideButtonsTemplate')}
          ></ppp-snippet>
        </div>
      </div>
    `
  };
}
