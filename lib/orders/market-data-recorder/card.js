/** @decorator */

import ppp from '../../../ppp.js';
import { OrderCard } from '../../order-card.js';
import { html, css, observable } from '../../../vendor/fast-element.min.js';
import { widgetCommonContentStyles } from '../../../elements/widget.js';
import { uuidv4 } from '../../ppp-crypto.js';
import { normalize, spacing } from '../../../design/styles.js';
import { formatNumber, formatDuration } from '../../intl.js';
import { trash, pause, play, stop } from '../../../static/svg/sprite.js';
import '../../../elements/widget-controls.js';

export const marketDataRecorderOrderCardTemplate = html`
  <ppp-widget-card
    oid="${(x) => x.order?.orderId}"
    progress="${(x) =>
      x.order?.status === 'working' || x.order?.status === 'executing'
        ? 100
        : null}"
    ?selectable="${(x) => x.widget?.document.disableInstrumentFiltering}"
    side="${(x) => x.getSide()}"
  >
    <div slot="indicator" class="${(x) => x.getSide()}"></div>
    <div slot="icon" style="${(x) => x.getIcon()}"></div>
    <span slot="icon-fallback">
      ${(x) => x.instrument?.fullName?.[0] ?? x.instrument?.symbol?.[0]}
    </span>
    <span slot="title-left">
      ${(x) => x.instrument?.fullName ?? x.instrument?.symbol}
    </span>
    <span class="${(x) => x.getStatusClass()}" slot="subtitle-left">
      ${(x) => x.getStatusText()}
    </span>
    <span slot="title-right">${(x) => x.duration}</span>
    <div class="dot-divider-line" slot="subtitle-right">
      Событий: ${(x) => formatNumber(x.order?.eventCounter ?? 0)}
    </div>
    <button
      ?hidden="${(x) => x.order?.status !== 'working'}"
      class="widget-action-button earth"
      slot="actions"
      action="pause"
    >
      <span>${html.partial(pause)}</span>
    </button>
    <button
      ?hidden="${(x) => x.order?.status !== 'paused'}"
      class="widget-action-button positive"
      slot="actions"
      action="start"
    >
      <span>${html.partial(play)}</span>
    </button>
    <button
      ?hidden="${(x) =>
        x.order?.status !== 'working' && x.order?.status !== 'paused'}"
      class="widget-action-button negative"
      slot="actions"
      action="stop"
    >
      <span>${html.partial(stop)}</span>
    </button>
    <button class="widget-action-button" slot="actions" action="cancel">
      <span>${html.partial(trash)}</span>
    </button>
  </ppp-widget-card>
`;

export const marketDataRecorderCardStyles = css`
  ${normalize()}
  ${spacing()}
  ${widgetCommonContentStyles()}
`;

export class MarketDataRecorderOderCard extends OrderCard {
  @observable
  duration;

  constructor() {
    super();

    this.duration = formatDuration(0);
    this.durationRefreshLoop = this.durationRefreshLoop.bind(this);
  }

  performCardAction(action, event) {
    if (action === 'pause') {
      this.widget.performConditionalOrderAction({
        order: this.order,
        action: 'pause'
      });
    } else if (action === 'start') {
      this.widget.performConditionalOrderAction({
        order: this.order,
        action: 'start'
      });
    } else if (action === 'stop') {
      this.widget.performConditionalOrderAction({
        order: this.order,
        action: 'stop'
      });
    } else if (action === 'cancel') {
      if (this.order?.status !== 'executed' && !event.shiftKey) {
        this.widget.notificationsArea?.error({
          text: 'Чтобы отменить заявку, остановите запись или зажмите Shift.'
        });
      } else {
        this.widget.cancelConditionalOrder(this.order, {
          force: event.shiftKey
        });
      }
    }
  }

  durationRefreshLoop() {
    if (this.order?.status === 'working') {
      this.duration = formatDuration(
        (Date.now() - new Date(this.order?.startedAt).valueOf()) / 1000 +
          (this.order?.elapsedSeconds ?? 0)
      );
    } else {
      this.duration = formatDuration(this.order?.elapsedSeconds ?? 0);
    }
  }

  getStatusText() {
    if (this.order?.status === 'working') {
      return 'Идёт запись';
    } else if (this.order?.status === 'executed') {
      return 'Запись завершена';
    } else if (this.order?.status === 'executing') {
      return 'Выгрузка в облако';
    } else if (this.order?.status === 'failed') {
      return 'Ошибка выгрузки';
    }

    return super.getStatusText();
  }

  connectedCallback() {
    super.connectedCallback();
    ppp.app.rafEnqueue(this.durationRefreshLoop);
  }

  disconnectedCallback() {
    ppp.app.rafDequeue(this.durationRefreshLoop);
    super.disconnectedCallback();
  }
}

export default MarketDataRecorderOderCard.compose({
  name: `ppp-${uuidv4()}`,
  template: marketDataRecorderOrderCardTemplate,
  styles: marketDataRecorderCardStyles
}).define();
