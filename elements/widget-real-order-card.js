/** @decorator */

import ppp from '../ppp.js';
import { formatAmount, formatPrice } from '../lib/intl.js';
import { PPPElement } from '../lib/ppp-element.js';
import { html, when, observable } from '../vendor/fast-element.min.js';
import { widgetCommonContentStyles } from './widget.js';
import { trash } from '../static/svg/sprite.js';

export const widgetRealOrderCardTemplate = html`
  <template>
    <ppp-widget-card
      real
      oid="${(x) => x.order?.orderId}"
      ?selectable="${(x) => x.disableInstrumentFiltering}"
      side="${(x) => x.order.side}"
    >
      <div slot="indicator" class="${(x) => x.order.side}"></div>
      <div
        slot="icon"
        style="${(x) =>
          `background-image:url(${x.widget?.searchControl.getInstrumentIconUrl(
            x.order.instrument
          )})`}"
      ></div>
      <span slot="icon-fallback">
        ${(x) =>
          x.order.instrument?.fullName?.[0] ?? x.order.instrument?.symbol[0]}
      </span>
      <span slot="title-left">
        ${(x) => x.order.instrument?.fullName ?? x.order.symbol}
      </span>
      <span slot="title-right">
        ${(x) =>
          x.order.price
            ? formatAmount(
                x.order.instrument?.lot *
                  x.order.price *
                  (x.order.quantity - x.order.filled),
                x.order.instrument
              )
            : ppp.t('$g.atMarket')}
      </span>
      <span
        slot="subtitle-left"
        class="${(x) => (x.order.side === 'buy' ? 'positive' : 'negative')}"
      >
        ${(x) => (x.order.side === 'buy' ? 'Buy' : 'Sell')}
      </span>
      <div class="dot-divider-line" slot="subtitle-right">
        ${when(
          (x) => typeof x.order.destination === 'string',
          html`
            ${(x) => x.order.destination.toUpperCase()}
            <span class="dot-divider">•</span>
          `
        )}
        ${(x) => x.widget?.formatRestQuantity(x.order)}
        <span class="dot-divider">•</span>
        ${(x) =>
          x.order.price
            ? formatPrice(x.order.price, x.order.instrument)
            : ppp.t('$g.atMarket')}
      </div>
      <button class="widget-action-button" action="cancel" slot="actions">
        <span>${html.partial(trash)}</span>
      </button>
    </ppp-widget-card>
  </template>
`;

export class WidgetRealOrderCard extends PPPElement {
  @observable
  disableInstrumentFiltering;

  @observable
  order;

  constructor() {
    super();

    this.order = {};
  }

  connectedCallback() {
    this.widget = this.getRootNode().host;

    super.connectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default WidgetRealOrderCard.compose({
  template: widgetRealOrderCardTemplate,
  styles: widgetCommonContentStyles()
}).define();
