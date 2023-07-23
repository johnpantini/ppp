/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatPrice } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';
import { level1TraderCondition } from '../order.js';

export const columnTemplate = html`
  <template>
    ${when((x) => x.isBalance, html`<span></span>`)}
    ${when(
      (x) => !x.isBalance,
      html`
        <span class="positive">
          ${(cell) => formatPrice(cell.bestBid, cell.datum?.instrument)}
        </span>
      `
    )}
  </template>
`;

export class BestBidColumn extends Column {
  @observable
  bestBid;

  async connectedCallback() {
    await super.connectedCallback();

    if (this.trader && !this.isBalance) {
      await this.trader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          bestBid: TRADER_DATUM.BEST_BID
        },
        condition: level1TraderCondition
      });
    }

    if (this.extraTrader && !this.isBalance) {
      await this.extraTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          bestBid: TRADER_DATUM.BEST_BID
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
          bestBid: TRADER_DATUM.BEST_BID
        }
      });
    }

    if (this.extraTrader && !this.isBalance) {
      await this.extraTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          bestBid: TRADER_DATUM.BEST_BID
        }
      });
    }

    super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default BestBidColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
