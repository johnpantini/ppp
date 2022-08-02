import { Widget } from './widget.js';
import { html, requireComponent } from './template.js';
import { WIDGET_TYPES } from './const.js';
import { ref } from './element/templating/ref.js';
import { validate } from './validate.js';
import { DOM } from './element/dom.js';

export const orderbookWidgetTemplate = (context, definition) => html`
  <template>
    <div class="widget-root">
      <div class="widget-header" ${ref('dragPanel')}>
        <div class="widget-instrument-area">
          <div class="widget-group-selector">
            <div class="widget-group-selector-button"></div>
          </div>
          <div class="instrument-search-holder">
            <input
              class="instrument-search-field"
              type="text"
              placeholder="Тикер"
              maxlength="20"
              autocomplete="off"
              value=""
            />
          </div>
          <div class="instrument-quote-line">
            <span class="price positive">147.04</span>
            <span class="positive">+0.69</span>
            <span class="positive">+0.47%</span>
          </div>
          <div class="widget-header-controls">
            <img
              draggable="false"
              alt="Close"
              class="widget-close-button"
              src="static/widgets/close.svg"
              @click="${(x) => x.close()}"
            />
          </div>
        </div>
      </div>
      <div class="widget-body">${(x) => x.document.depth}</div>
    </div>
  </template>
`;

export class PppOrderbookWidget extends Widget {
  async validate() {
    await validate(this.container.depth);
    await validate(this.container.depth, {
      hook: async (value) => +value > 0 && +value <= 50,
      errorMessage: 'Введите значение в диапазоне от 1 до 50'
    });
  }

  async update() {
    return {
      $set: {
        depth: Math.abs(this.container.depth.value),
        displayMode: this.container.displayMode.value
      }
    };
  }
}

export async function widgetData(definition = {}) {
  await requireComponent('ppp-radio');
  await requireComponent('ppp-radio-group');

  return {
    type: WIDGET_TYPES.ORDERBOOK,
    collection: 'PPP',
    title: html`Книга заявок 2D`,
    tags: ['Цена', 'Объём'],
    description: html`<span class="positive">Книга заявок</span> отображает
      таблицу лимитных заявок финансового инструмента на покупку и продажу.
      Данный виджет подходит для отображения информации в двух измерениях: цена
      и объём.`,
    customElement: PppOrderbookWidget.compose(definition),
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Тип отображения</h5>
        </div>
        <div class="widget-settings-input-group">
          <ppp-radio-group
            orientation="vertical"
            value="compact"
            ${ref('displayMode')}
          >
            <ppp-radio value="compact">Компактный
            </ppp-radio>
            <ppp-radio disabled value="classic-1">Классический, 1
              колонка
            </ppp-radio>
            <ppp-radio disabled value="classic-2">Классический, 2
              колонки
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Глубина книги заявок</h5>
          <p>Количество строк <span
            class="positive">bid</span> и <span
            class="negative">ask</span> для отображения</p>
        </div>
        <div class="widget-settings-input-group">
          <${'ppp-text-field'}
            type="number"
            placeholder="20"
            value="${(x) => {
              const value = x.document.depth ?? 20;

              DOM.queueUpdate(() =>
                x.syncWidget((x.widgetElement.document.depth = value))
              );

              return value;
            }}"
            ${ref('depth')}
            @input="${(x) =>
              x.syncWidget((x.widgetElement.document.depth = +x.depth.value))}"
          ></ppp-text-field>
        </div>
      </div>
    `
  };
}
