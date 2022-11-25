/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html } from './template.js';
import { WIDGET_TYPES } from './const.js';

export const scalpingButtonsWidgetTemplate = (context, definition) => html`
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

export class PppScalpingButtonsWidget extends WidgetWithInstrument {}

export async function widgetDefinition(definition = {}) {
  return {
    type: WIDGET_TYPES.TIMELINE,
    collection: 'PPP',
    title: html`Скальперские кнопки`,
    description: html`<span class="positive">Скальперские кнопки</span>
      позволяют быстро модифицировать лимитные заявки на заданное количество
      шагов цены.`,
    customElement: PppScalpingButtonsWidget.compose(definition),
    maxHeight: 512,
    maxWidth: 365,
    minHeight: 150,
    minWidth: 275
  };
}
