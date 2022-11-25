/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html, requireComponent } from './template.js';
import { validate } from './validate.js';
import { WIDGET_TYPES } from './const.js';

export const orderbookWidgetTemplate = (context, definition) => html`
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
        <div class="widget-empty-state-holder">
          <img draggable="false" src="static/empty-widget-state.svg"/>
          <span>Виджет сейчас недоступен.</span>
        </div>
      </div>
    </div>
  </template>
`;

export class PppOrderbookWidget extends WidgetWithInstrument {
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

export async function widgetDefinition(definition = {}) {
  await requireComponent('ppp-radio');
  await requireComponent('ppp-radio-group');

  return {
    type: WIDGET_TYPES.ORDERBOOK,
    collection: 'PPP',
    title: html`Книга заявок`,
    tags: ['Цена', 'Объём', 'Пул ликвидности'],
    description: html`<span class="positive">Книга заявок</span> отображает
      таблицу лимитных заявок финансового инструмента на покупку и продажу.`,
    customElement: PppOrderbookWidget.compose(definition),
    maxHeight: 512,
    maxWidth: 365,
    minHeight: 365,
    minWidth: 275,
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
            value="${(x) => x.document.depth ?? 20}"
            ${ref('depth')}
          ></ppp-text-field>
        </div>
      </div>
    `
  };
}
