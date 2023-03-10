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
  Observable
} from '../../vendor/fast-element.min.js';
import { TRADER_CAPS, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import { normalize } from '../../design/styles.js';

const defaultBuySideButtonsTemplate = `+1,+2,+5,+10
-1,-2,-5,-10`;
const defaultSellSideButtonsTemplate = `+1,+2,+5,+10
-1,-2,-5,-10`;

export const scalpingButtonsWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control
            selection="${(x) => x.document?.group}"
          ></ppp-widget-group-control>
          <ppp-widget-search-control></ppp-widget-search-control>
          <span class="widget-title">
            <span class="title">${(x) => x.document?.name ?? ''}</span>
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
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
    </div>
  </template>
`;

export const scalpingButtonsWidgetStyles = css`
  ${normalize()}
  ${widget()}
`;

export class ScalpingButtonsWidget extends WidgetWithInstrument {
  @observable
  ordersTrader;

  #buttons;

  async connectedCallback() {
    super.connectedCallback();

    this.ordersTrader = await ppp.getOrCreateTrader(this.document.ordersTrader);
    this.searchControl.trader = this.ordersTrader;

    if (this.ordersTrader) {
      await this.ordersTrader.sayHello(WIDGET_TYPES.SCALPING_BUTTONS);
    }
  }

  handleOrderTypeChange() {
    void this.applyChanges({
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

  async update() {
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
    maxHeight: 512,
    maxWidth: 1900,
    minHeight: 120,
    defaultHeight: 160,
    minWidth: 275,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер лимитных заявок</h5>
          <p>Трейдер, который будет переставлять лимитные заявки.</p>
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
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_LIMIT_ORDERS%]`
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
          <h5>Задержка после использования кнопок</h5>
          <p>
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
          <p>
            Перечислите значения (со знаком) кнопок через запятую. Для создания
            нового ряда выполните перенос строки. Чтобы сделать отступ, оставьте
            очередную строку пустой. Значения задаются в шагах цены торгового
            инструмента.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-codeflask
            :code="${(x) =>
              x.document.buySideButtonsTemplate ??
              defaultBuySideButtonsTemplate}"
            ${ref('buySideButtonsTemplate')}
          ></ppp-codeflask>
          <ppp-button
            class="margin-top"
            @click="${(x) => {
              x.buySideButtonsTemplate.updateCode(
                defaultBuySideButtonsTemplate
              );

              x.buySideButtonsTemplate.$emit('input');
            }}"
            appearance="primary"
          >
            Восстановить значение по умолчанию
          </ppp-button>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Кнопки для заявок на продажу</h5>
        </div>
        <div class="widget-settings-input-group">
          <ppp-codeflask
            :code="${(x) =>
              x.document.sellSideButtonsTemplate ??
              defaultSellSideButtonsTemplate}"
            ${ref('sellSideButtonsTemplate')}
          ></ppp-codeflask>
          <ppp-button
            class="margin-top"
            @click="${(x) => {
              x.sellSideButtonsTemplate.updateCode(
                defaultSellSideButtonsTemplate
              );

              x.sellSideButtonsTemplate.$emit('input');
            }}"
            appearance="primary"
          >
            Восстановить значение по умолчанию
          </ppp-button>
        </div>
      </div>
    `
  };
}
