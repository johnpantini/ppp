import { Widget } from './widget.js';
import { html, requireComponent } from './template.js';
import { WIDGET_TYPES } from './const.js';
import { ref } from './element/templating/ref.js';
import ppp from '../ppp.js';

await Promise.all([
  requireComponent('ppp-widget-tabs'),
  requireComponent(
    'ppp-widget-tab',
    `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/widget-tabs.js`
  ),
  requireComponent(
    'ppp-widget-tab-panel',
    `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/widget-tabs.js`
  )
]);

export const orderWidgetTemplate = (context, definition) => html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
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
            />
          </div>
        </div>
      </div>
      <div class="widget-body">
        <ppp-widget-tabs activeid="limit">
          <ppp-widget-tab id="market">Рыночная</ppp-widget-tab>
          <ppp-widget-tab id="limit">Лимитная</ppp-widget-tab>
          <ppp-widget-tab id="stop">Отложенная</ppp-widget-tab>
          <ppp-widget-tab-panel id="market-panel"></ppp-widget-tab-panel>
          <ppp-widget-tab-panel id="limit-panel"></ppp-widget-tab-panel>
          <ppp-widget-tab-panel id="stop-panel"></ppp-widget-tab-panel>
        </ppp-widget-tabs>
        <div class="widget-nbbo-line">
          <div class="widget-nbbo-line-bid">
            Bid 146.76
            <div class="widget-nbbo-line-quantity">2416</div>
          </div>
          <div class="widget-nbbo-line-ask">Ask 146.94</div>
        </div>
        <div class="widget-buy-sell-sections">
          <div class="widget-buy-section"></div>
          <div class="widget-sell-section"></div>
        </div>
      </div>
    </div>
  </template>
`;

export class PppOrderWidget extends Widget {}

export async function widgetData(definition = {}) {
  return {
    type: WIDGET_TYPES.ORDER,
    collection: 'PPP',
    title: html`Заявка`,
    description: html`Виджет <span class="positive">Заявка</span> используется,
      чтобы выставлять рыночные, лимитные и отложенные биржевые заявки.`,
    customElement: PppOrderWidget.compose(definition)
  };
}
