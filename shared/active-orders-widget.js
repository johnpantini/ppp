/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html } from './template.js';
import { WIDGET_TYPES } from './const.js';

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
        <div class="widget-empty-state-holder">
          <img draggable="false" src="static/empty-widget-state.svg"/>
          <span>Виджет сейчас недоступен.</span>
        </div>
      </div>
    </div>
  </template>
`;

export class PppActiveOrdersWidget extends WidgetWithInstrument {}

export async function widgetDefinition(definition = {}) {
  return {
    type: WIDGET_TYPES.ACTIVE_ORDERS,
    collection: 'PPP',
    title: html`Активные заявки`,
    description: html`Виджет
      <span class="positive">Активные заявки</span> отображает текущие лимитные
      и отложенные заявки, которые ещё не исполнены и не отменены.`,
    customElement: PppActiveOrdersWidget.compose(definition),
    maxHeight: 512,
    maxWidth: 365,
    minHeight: 365,
    minWidth: 275
  };
}
