/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatPrice } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM, TRADING_STATUS } from '../../../lib/const.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <div class="control-line dot-line">
          <span
            ?hidden="${(x) =>
              x.datum === TRADER_DATUM.LAST_PRICE ||
              typeof x.lastPrice !== 'number' ||
              isNaN(x.lastPrice) ||
              ![TRADING_STATUS.PREMARKET, TRADING_STATUS.AFTER_HOURS].includes(
                x.status
              )}"
            class="dot ${(x) =>
              x.status === TRADING_STATUS.PREMARKET ? 'dot-1' : 'dot-4'}"
          ></span>
          <span>
            ${(x) => formatPrice(x.lastPrice, x.payload?.instrument)}
          </span>
        </div>
      `
    )}
  </template>
`;

export class LastPriceColumn extends Column {
  #higlLightTimer;

  @observable
  lastPrice;

  @observable
  status;

  datum;

  constructor(datum = TRADER_DATUM.LAST_PRICE) {
    super();

    this.datum = datum;
  }

  lastPriceChanged(oldValue, newValue) {
    if (
      (typeof oldValue === 'number' &&
        typeof newValue === 'number' &&
        this.constructor.name === 'LastPriceColumn') ||
      this.constructor.name === 'ExtendedLastPriceColumn'
    ) {
      if (this.column?.highlightChanges) {
        if (oldValue !== newValue) {
          clearTimeout(this.#higlLightTimer);
          this.classList.remove('positive');
          this.classList.remove('negative');

          const newCls = oldValue < newValue ? 'positive' : 'negative';

          this.classList.add(newCls);

          this.#higlLightTimer = setTimeout(() => {
            this.classList.remove(newCls);
          }, 350);
        }
      }
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (!this.isBalance) {
      await this.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: this.datum,
          status: TRADER_DATUM.STATUS
        }
      });
    }
  }

  async disconnectedCallback() {
    if (!this.isBalance) {
      await this.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: this.datum,
          status: TRADER_DATUM.STATUS
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default LastPriceColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
