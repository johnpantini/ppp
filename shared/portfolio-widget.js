/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html } from './template.js';
import { TRADER_DATUM, WIDGET_TYPES } from './const.js';
import { validate } from './validate.js';
import ppp from '../ppp.js';

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

      </div>
    </div>
  </template>
`;

export class PppPortfolioWidget extends WidgetWithInstrument {
  async connectedCallback() {
    super.connectedCallback();

    this.trades = [];
    this.portfolioTrader = await ppp.getOrCreateTrader(
      this.document.portfolioTrader
    );
    this.searchControl.trader = this.portfolioTrader;

    if (this.portfolioTrader) {
      await this.portfolioTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {}
      });
    }
  }

  async disconnectedCallback() {
    if (this.portfolioTrader) {
      await this.portfolioTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {}
      });
    }

    super.disconnectedCallback();
  }

  async validate() {
    await validate(this.container.portfolioTraderId);
  }

  async update() {
    return {
      $set: {
        portfolioTraderId: this.container.portfolioTraderId.value
      }
    };
  }
}

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
    defaultWidth: 512,
    minHeight: 365,
    minWidth: 275,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер портфеля</h5>
          <p>Трейдер, который будет источником портфельных данных.</p>
        </div>
        <ppp-collection-select
          ${ref('portfolioTraderId')}
          value="${(x) => x.document.portfolioTraderId}"
          :context="${(x) => x}"
          :preloaded="${(x) => x.document.portfolioTrader ?? ''}"
          :query="${() => {
            return (context) => {
              return context.services
                .get('mongodb-atlas')
                .db('ppp')
                .collection('traders')
                .find({
                  $or: [
                    { removed: { $ne: true } },
                    { _id: `[%#this.document.portfolioTraderId ?? ''%]` }
                  ]
                })
                .sort({ updatedAt: -1 });
            };
          }}"
          :transform="${() => ppp.decryptDocumentsTransformation()}"
        ></ppp-collection-select>
      </div>
    `
  };
}
