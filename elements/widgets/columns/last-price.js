/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatPrice, getUSMarketSession } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <div class="control-line dot-line">
          <span
            ?hidden="${(cell) =>
              cell.datum === TRADER_DATUM.LAST_PRICE ||
              typeof cell.lastPrice !== 'number' ||
              isNaN(cell.lastPrice) ||
              cell.currentUSMarketSession === 'regular'}"
            class="dot ${(cell) =>
              cell.currentUSMarketSession === 'premarket' ? 'dot-1' : 'dot-4'}"
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
  currentUSMarketSession;

  datum;

  constructor(datum = TRADER_DATUM.LAST_PRICE) {
    super();

    this.datum = datum;
  }

  lastPriceChanged(oldValue, newValue) {
    this.currentUSMarketSession = getUSMarketSession();

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
    this.currentUSMarketSession = getUSMarketSession();

    await super.connectedCallback();

    if (!this.isBalance) {
      await this.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: this.datum
        }
      });
    }
  }

  async disconnectedCallback() {
    if (!this.isBalance) {
      await this.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: this.datum
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
