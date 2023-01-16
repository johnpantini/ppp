/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html } from './template.js';
import { validate } from './validate.js';
import { WIDGET_TYPES } from './const.js';
import { observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export const lightweightChartWidgetTemplate = (context, definition) => html`
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

export class PppLightChartWidget extends WidgetWithInstrument {
  @observable
  chartTrader;

  async connectedCallback() {
    super.connectedCallback();

    this.chartTrader = await ppp.getOrCreateTrader(this.document.chartTrader);
    this.searchControl.trader = this.chartTrader;
  }

  async validate() {
    await validate(this.container.chartTraderId);
  }

  async update() {
    return {
      $set: {
        chartTraderId: this.container.chartTraderId.value
      }
    };
  }
}

export async function widgetDefinition(definition = {}) {
  return {
    type: WIDGET_TYPES.LIGHT_CHART,
    collection: 'PPP',
    title: html`Лёгкий график`,
    description: html`Виджет
      <span class="positive">Лёгкий график</span> отображает график финансового
      инструмента в минимальной комплектации.`,
    customElement: PppLightChartWidget.compose(definition),
    defaultWidth: 700,
    defaultHeight: 500,
    maxHeight: 1200,
    maxWidth: 1920,
    minHeight: 110,
    minWidth: 275,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер для графика</h5>
          <p>
            Трейдер, предоставляющий данные для построения графика.
          </p>
        </div>
        <ppp-collection-select
          ${ref('chartTraderId')}
          value="${(x) => x.document.chartTraderId}"
          :context="${(x) => x}"
          :preloaded="${(x) => x.document.chartTrader ?? ''}"
          :query="${() => {
            return (context) => {
              return context.services
                .get('mongodb-atlas')
                .db('ppp')
                .collection('traders')
                .find({
                  $and: [
                    {
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_CHARTS%]`
                    },
                    {
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.chartTraderId ?? ''%]` }
                      ]
                    }
                  ]
                })
                .sort({ updatedAt: -1 });
            };
          }}"
          :transform="${() => ppp.decryptDocumentsTransformation()}"
        ></ppp-collection-select>
        <${'ppp-button'}
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
