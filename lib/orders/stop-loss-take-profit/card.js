/** @decorator */

import ppp from '../../../ppp.js';
import { OrderCard } from '../../order-card.js';
import {
  html,
  css,
  when,
  observable
} from '../../../vendor/fast-element.min.js';
import { widgetCommonContentStyles } from '../../../elements/widget.js';
import { uuidv4 } from '../../ppp-crypto.js';
import { normalize } from '../../../design/styles.js';
import {
  formatQuantity,
  formatPrice,
  formatAmount,
  formatNumber,
  stringToFloat
} from '../../intl.js';
import { trash, clock } from '../../../static/svg/sprite.js';
import '../../../elements/widget-controls.js';

export const stopLossTakeProfitOrderCardTemplate = html`
  <ppp-widget-card
    ?selectable="${(x) => x.widget?.document.disableInstrumentFiltering}"
    side="${(x) => x.getSide()}"
    @click="${(x) => {
      if (x.widget?.document.disableInstrumentFiltering) {
        x.widget.selectInstrument(x.instrument.symbol);
      }

      return true;
    }}"
  >
    <div slot="indicator" class="${(x) => x.getSide()}"></div>
    <div slot="icon" style="${(x) => x.getIcon()}"></div>
    <span slot="icon-fallback">
      ${(x) => x.instrument?.fullName?.[0] ?? x.instrument?.symbol?.[0]}
    </span>
    <span slot="title-left">
      ${(x) => x.instrument?.fullName ?? x.instrument?.symbol}
    </span>
    <span
      slot="subtitle-left"
      class="${(x) => (x.getSide() === 'buy' ? 'positive' : 'negative')}"
    >
      ${(x) => (x.getSide() === 'buy' ? 'Покупка' : 'Продажа')}
    </span>
    <span slot="subtitle-left-extra">
      <div class="subtitle-rows">
        <div class="control-line centered">
          <span
            class="dot ${(x) =>
              x.payload?.order?.orderType === 'stop-loss' ? 'dot-5' : 'dot-2'}"
          ></span>
          <span>
            ${(x) =>
              x.payload?.order?.orderType === 'stop-loss' ? 'SL' : 'TP'}:
            ${(x) =>
              formatPrice(stringToFloat(x.payload.stopPrice), x.instrument)}
          </span>
        </div>
      </div>
    </span>
    <span slot="title-right">
      ${(x) =>
        x.payload.limitPrice
          ? formatAmount(
              x.instrument?.lot *
                stringToFloat(x.payload.limitPrice) *
                stringToFloat(x.payload.quantity),
              x.instrument
            )
          : 'По рынку'}
    </span>
    <div class="dot-divider-line" slot="subtitle-right">
      ${(x) => formatQuantity(stringToFloat(x.payload.quantity), x.instrument)}
      <span class="dot-divider">•</span>
      ${(x) =>
        x.payload.limitPrice
          ? formatPrice(stringToFloat(x.payload.limitPrice), x.instrument)
          : 'По рынку'}
    </div>
    <span slot="subtitle-right-extra">
      <div class="subtitle-rows">
        <div class="dot-divider-line">
          ${when(
            (x) =>
              x.remainingTimeDelay > 0 &&
              ['working', 'pending'].includes(x.order?.status),
            html`
              <span class="widget-action-icon">${html.partial(clock)}</span>
              <span class="dot-divider">
                ${(x) =>
                  (x.remainingTimeDelay >= 1 ? '' : '<') +
                  formatNumber(
                    x.remainingTimeDelay >= 1 ? x.remainingTimeDelay : 1,
                    {
                      style: 'unit',
                      unit: 'second',
                      unitDisplay: 'narrow',
                      maximumFractionDigits: 0
                    }
                  )}
              </span>
              <span class="dot-divider">•</span>
            `
          )}
          <span class="${(x) => x.getStatusClass()}">
            ${(x) => x.getStatusText()}
          </span>
        </div>
      </div>
    </span>
    <button
      class="widget-action-button"
      slot="actions"
      @click="${(x, c) => {
        c.event.preventDefault();
        c.event.stopPropagation();
        c.source.widget.cancelConditionalOrder(x.order);
      }}"
    >
      <span>${html.partial(trash)}</span>
    </button>
  </ppp-widget-card>
`;

export const stopLossTakeProfitOrderCardStyles = css`
  ${normalize()}
  ${widgetCommonContentStyles()}
`;

export class StopLossTakeProfitOrderCard extends OrderCard {
  @observable
  remainingTimeDelay;

  constructor() {
    super();

    this.delayCountdownLoop = this.delayCountdownLoop.bind(this);
  }

  delayCountdownLoop() {
    if (this.$fastController.isConnected) {
      const now = new Date();

      this.remainingTimeDelay = Math.max(
        0,
        this.timeDelay -
          (now - new Date(this.order.delayStartedAt).valueOf()) / 1000
      );

      if (this.remainingTimeDelay < 0) {
        ppp.app.rafDequeue(this.delayCountdownLoop);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();

    const now = new Date();

    this.timeDelay = stringToFloat(this.payload?.timeDelay);
    this.remainingTimeDelay = Math.max(
      0,
      this.timeDelay -
        (now - new Date(this.order.delayStartedAt ?? now).valueOf()) / 1000
    );

    if (this.order.status === 'pending') {
      ppp.app.rafEnqueue(this.delayCountdownLoop);
    }
  }

  disconnectedCallback() {
    ppp.app.rafDequeue(this.delayCountdownLoop);
    super.disconnectedCallback();
  }
}

export default StopLossTakeProfitOrderCard.compose({
  name: `ppp-${uuidv4()}`,
  template: stopLossTakeProfitOrderCardTemplate,
  styles: stopLossTakeProfitOrderCardStyles
}).define();
