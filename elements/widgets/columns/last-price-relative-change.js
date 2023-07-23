/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatRelativeChange } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';
import { level1TraderCondition } from '../order.js';

export const columnTemplate = html`
  <template>
    ${when((x) => x.isBalance, html`<span></span>`)}
    ${when(
      (x) => !x.isBalance,
      html`
        <span
          class="${(x) =>
            x.lastPriceRelativeChange > 0
              ? 'positive'
              : x.lastPriceRelativeChange < 0
              ? 'negative'
              : ''}"
        >
          ${(cell) => formatRelativeChange(cell.lastPriceRelativeChange / 100)}
        </span>
      `
    )}
  </template>
`;

export class LastPriceRelativeChangeColumn extends Column {
  @observable
  lastPriceRelativeChange;

  async connectedCallback() {
    await super.connectedCallback();

    if (this.trader && !this.isBalance) {
      await this.trader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceRelativeChange: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE
        },
        condition: level1TraderCondition
      });
    }

    if (this.extraTrader && !this.isBalance) {
      await this.extraTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceRelativeChange: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE
        },
        condition: level1TraderCondition
      });
    }
  }

  async disconnectedCallback() {
    if (this.trader && !this.isBalance) {
      await this.trader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceRelativeChange: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE
        }
      });
    }

    if (this.extraTrader && !this.isBalance) {
      await this.extraTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceRelativeChange: TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE
        }
      });
    }

    super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default LastPriceRelativeChangeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
