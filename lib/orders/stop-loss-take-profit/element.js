/** @decorator */

import { OrderElement, makeDistance } from '../../order-element.js';
import {
  html,
  css,
  ref,
  when,
  observable,
  Updates
} from '../../../vendor/fast-element.min.js';
import { widgetCommonContentStyles } from '../../../elements/widget.js';
import { uuidv4 } from '../../ppp-crypto.js';
import { caretDown, caretUp } from '../../../static/svg/sprite.js';
import { normalize } from '../../../design/styles.js';
import { formatPriceWithoutCurrency, parseDistance } from '../../intl.js';
import '../../../elements/widget-controls.js';

export const stopLossTakeProfitOrderElementTemplate = html`
  <div class="widget-section">
    <div class="widget-subsection">
      <div class="widget-subsection-item">
        <div class="widget-text-label">Цена активации</div>
        <ppp-widget-trifecta-field
          kind="price"
          placeholder="Сразу"
          :instrument="${(x) => x.widget?.instrument}"
          :changeViaMouseWheel="${(x) =>
            x.widget?.document.changePriceQuantityViaMouseWheel}"
          value="${(x) => x.order?.stopPrice}"
          @input=${(x) => x.applyLimitPriceDistance()}
          @pppstep=${(x) => x.applyLimitPriceDistance()}
          @keydown=${(x, { event }) => {
            x.widget.handleHotkeys(event);

            return true;
          }}
          ${ref('stopPrice')}
        ></ppp-widget-trifecta-field>
      </div>
      <div class="widget-subsection-item">
        <div class="widget-text-label">Количество</div>
        <ppp-widget-trifecta-field
          kind="quantity"
          :instrument="${(x) => x.widget?.instrument}"
          :changeViaMouseWheel="${(x) =>
            x.widget?.document.changePriceQuantityViaMouseWheel}"
          value="${(x) => x.order?.quantity}"
          @keydown=${(x, { event }) => {
            x.widget.handleHotkeys(event);

            return true;
          }}
          ${ref('quantity')}
        ></ppp-widget-trifecta-field>
      </div>
    </div>
    <div class="widget-margin-spacer"></div>
    <div class="widget-subsection">
      <div class="widget-subsection-item">
        <div class="widget-text-label with-icon">
          <span>Цена исполнения</span>
          <span
            ?hidden=${(x) => !x.order?.order.limitPriceDistance}
            @click="${(x, { event }) =>
              x.toggleLimitPriceDistanceDirection(event)}"
            class="direction-icon${(x) =>
              x.limitPriceDistanceDirection === 'up'
                ? ' positive'
                : ' negative'}"
          >
            ${when(
              (x) => x.limitPriceDistanceDirection === 'down',
              html` ${html.partial(caretDown)} `,
              html` ${html.partial(caretUp)} `
            )}
          </span>
        </div>
        <ppp-widget-trifecta-field
          kind="price"
          placeholder="По рынку"
          :instrument="${(x) => x.widget?.instrument}"
          :changeViaMouseWheel="${(x) =>
            x.widget?.document.changePriceQuantityViaMouseWheel}"
          value="${(x) => x.order?.limitPrice}"
          @keydown=${(x, { event }) => {
            x.widget.handleHotkeys(event);

            return true;
          }}
          ${ref('limitPrice')}
        ></ppp-widget-trifecta-field>
      </div>
      <div class="widget-subsection-item">
        <div class="widget-text-label">Защитное время</div>
        <ppp-widget-trifecta-field
          disabled
          kind="quantity"
          placeholder="Нет"
          :instrument="${() => ({})}"
          :changeViaMouseWheel="${(x) =>
            x.widget?.document.changePriceQuantityViaMouseWheel}"
          value="${(x) => x.order?.timeDelay}"
          @keydown=${(x, { event }) => {
            x.widget.handleHotkeys(event);

            return true;
          }}
          ${ref('timeDelay')}
        ></ppp-widget-trifecta-field>
      </div>
    </div>
    <div class="widget-margin-spacer"></div>
    <div class="widget-subsection">
      <div class="widget-subsection-item">
        ${when(
          (x) => x.order?.order.orderType === 'stop-loss',
          html`
            <div class="widget-text-label">Дистанция Trailing Stop</div>
            <ppp-widget-trifecta-field
              disabled
              kind="distance"
              unit="${(x) => x.trailingStopDistance.unit}"
              placeholder="Нет"
              :instrument="${(x) => x.widget?.instrument}"
              :changeViaMouseWheel="${(x) =>
                x.widget?.document.changePriceQuantityViaMouseWheel}"
              value="${(x) => x.trailingStopDistance.value}"
              @keydown=${(x, { event }) => {
                x.widget.handleHotkeys(event);

                return true;
              }}
              ${ref('trailingStopDistanceRef')}
            ></ppp-widget-trifecta-field>
          `,
          html`
            <div class="widget-text-label">Коррекция Take Profit</div>
            <ppp-widget-trifecta-field
              disabled
              kind="distance"
              unit="${(x) => x.takeProfitCorrection.unit}"
              placeholder="Нет"
              :instrument="${(x) => x.widget?.instrument}"
              :changeViaMouseWheel="${(x) =>
                x.widget?.document.changePriceQuantityViaMouseWheel}"
              value="${(x) => x.takeProfitCorrection.value}"
              @keydown=${(x, { event }) => {
                x.widget.handleHotkeys(event);

                return true;
              }}
              ${ref('takeProfitCorrectionRef')}
            ></ppp-widget-trifecta-field>
          `
        )}
      </div>
    </div>
  </div>
`;

export const stopLossTakeProfitOrderElementStyles = css`
  ${normalize()}
  ${widgetCommonContentStyles()}
  .direction-icon {
    cursor: pointer;
    display: flex;
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }

  .with-icon {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
  }
`;

export class StopLossTakeProfitOrderElement extends OrderElement {
  @observable
  limitPriceDistanceDirection;

  // Parsed from string.
  limitPriceDistance;

  @observable
  trailingStopDistance;

  @observable
  takeProfitCorrection;

  get priceField() {
    return this.stopPrice;
  }

  constructor() {
    super();

    this.limitPriceDistanceDirection = 'down';
    this.trailingStopDistance = makeDistance();
    this.takeProfitCorrection = makeDistance();
  }

  applyLimitPriceDistance() {
    if (
      this.limitPriceDistance.value > 0 &&
      typeof this.widget.ordersTrader !== 'undefined'
    ) {
      const newPrice = this.widget.ordersTrader.calcDistantPrice(
        this.widget.instrument,
        this.stopPrice.value,
        this.limitPriceDistance,
        this.limitPriceDistanceDirection
      );

      if (newPrice > 0) {
        this.limitPrice.value = formatPriceWithoutCurrency(newPrice);
      } else {
        this.limitPrice.value = '';
      }
    }
  }

  toggleLimitPriceDistanceDirection(event) {
    const oldValue = this.limitPriceDistanceDirection ?? 'down';

    if (oldValue === 'up') {
      this.limitPriceDistanceDirection = 'down';
    } else {
      this.limitPriceDistanceDirection = 'up';
    }

    this.applyLimitPriceDistance();

    return this.onChange(event);
  }

  connectedCallback() {
    super.connectedCallback();

    this.limitPriceDistanceDirection =
      this.order.limitPriceDistanceDirection ?? 'down';

    if (
      this.limitPriceDistanceDirection !== 'up' &&
      this.limitPriceDistanceDirection !== 'down'
    ) {
      this.limitPriceDistanceDirection = 'down';
    }

    this.limitPriceDistance = parseDistance(
      this.order?.order.limitPriceDistance
    );
    this.trailingStopDistance = parseDistance(
      this.order.trailingStopDistance ?? this.order?.order.trailingStopDistance
    );

    this.takeProfitCorrection = parseDistance(
      this.order.takeProfitCorrection ?? this.order?.order.takeProfitCorrection
    );
  }

  instrumentChanged() {
    this.stopPrice.value = '';
    this.stopPrice.$emit('input');

    Updates.enqueue(() => {
      this.stopPrice.input.focus();
    });
  }

  async load() {
    Updates.enqueue(() => this.stopPrice.input.focus());
  }

  serialize() {
    const result = {
      stopPrice: this.stopPrice.value,
      quantity: this.quantity.value,
      limitPrice: this.limitPrice.value,
      timeDelay: this.timeDelay.value,
      limitPriceDistanceDirection: this.limitPriceDistanceDirection
    };

    if (this.order?.order.orderType === 'stop-loss') {
      result.trailingStopDistance = this.trailingStopDistanceRef.distanceString;
    } else if (this.order?.order.orderType === 'take-profit') {
      result.takeProfitCorrection = this.takeProfitCorrectionRef.distanceString;
    }

    return result;
  }
}

export default StopLossTakeProfitOrderElement.compose({
  name: `ppp-${uuidv4()}`,
  template: stopLossTakeProfitOrderElementTemplate,
  styles: stopLossTakeProfitOrderElementStyles
}).define();
