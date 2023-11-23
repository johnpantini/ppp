/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatPrice } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';

export const columnTemplate = html`
  <template>
    ${when((x) => x.isBalance, html`<span></span>`)}
    ${when(
      (x) => !x.isBalance,
      html`
        <span>
          ${(cell) => formatPrice(cell.lastPrice, cell.datum?.instrument)}
        </span>
      `
    )}
  </template>
`;

export class LastPriceColumn extends Column {
  #higlLightTimer;

  @observable
  lastPrice;

  lastPriceChanged(oldValue, newValue) {
    if (
      typeof oldValue === 'number' &&
      typeof newValue === 'number' &&
      this.constructor.name === 'LastPriceColumn'
    ) {
      if (this.datum.highlightLastPriceChanges) {
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

    if (this.trader && !this.isBalance) {
      await this.trader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: TRADER_DATUM.LAST_PRICE
        }
      });
    }

    if (this.extraTrader && !this.isBalance) {
      await this.extraTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: TRADER_DATUM.LAST_PRICE
        }
      });
    }
  }

  async disconnectedCallback() {
    if (this.trader && !this.isBalance) {
      await this.trader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: TRADER_DATUM.LAST_PRICE
        }
      });
    }

    if (this.extraTrader && !this.isBalance) {
      await this.extraTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPrice: TRADER_DATUM.LAST_PRICE
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
