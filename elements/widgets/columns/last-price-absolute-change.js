/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatAbsoluteChange } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';

export const columnTemplate = html`
  <template>
    ${when((x) => x.isBalance, html`<span></span>`)}
    ${when(
      (x) => !x.isBalance,
      html`
        <span
          class="${(x) =>
            x.lastPriceAbsoluteChange > 0
              ? 'positive'
              : x.lastPriceAbsoluteChange < 0
              ? 'negative'
              : ''}"
        >
          ${(cell) =>
            formatAbsoluteChange(
              cell.lastPriceAbsoluteChange,
              cell.payload?.instrument
            )}
        </span>
      `
    )}
  </template>
`;

export class LastPriceAbsoluteChangeColumn extends Column {
  @observable
  lastPriceAbsoluteChange;

  async connectedCallback() {
    await super.connectedCallback();

    if (this.trader && !this.isBalance) {
      await this.trader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceAbsoluteChange: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE
        }
      });
    }

    if (this.extraTrader && !this.isBalance) {
      await this.extraTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceAbsoluteChange: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE
        }
      });
    }
  }

  async disconnectedCallback() {
    if (this.trader && !this.isBalance) {
      await this.trader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceAbsoluteChange: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE
        }
      });
    }

    if (this.extraTrader && !this.isBalance) {
      await this.extraTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceAbsoluteChange: TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default LastPriceAbsoluteChangeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
