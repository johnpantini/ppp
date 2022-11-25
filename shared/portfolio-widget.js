/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html } from './template.js';
import { WIDGET_TYPES } from './const.js';

export const portfolioWidgetTemplate = (context, definition) => html`
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

export class PppPortfolioWidget extends WidgetWithInstrument {}

export async function widgetDefinition(definition = {}) {
  return {
    type: WIDGET_TYPES.PORTFOLIO,
    collection: 'PPP',
    title: html`Портфель`,
    description: html`Виджет <span class="positive">Порфтель</span> отображает
      список открытых позиций.`,
    customElement: PppPortfolioWidget.compose(definition),
    maxHeight: 1200,
    maxWidth: 1920,
    minHeight: 365,
    minWidth: 275
  };
}
