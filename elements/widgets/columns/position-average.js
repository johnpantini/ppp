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
          ${(cell) => formatPrice(cell.averagePrice, cell.payload?.instrument)}
        </span>
      `
    )}
  </template>
`;

export class PositionAverageColumn extends Column {
  @observable
  averagePrice;

  async connectedCallback() {
    await super.connectedCallback();

    if (this.defaultTrader && !this.isBalance) {
      await this.defaultTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          averagePrice: TRADER_DATUM.POSITION_AVERAGE
        }
      });
    }
  }

  async disconnectedCallback() {
    if (this.defaultTrader && !this.isBalance) {
      await this.defaultTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          averagePrice: TRADER_DATUM.POSITION_AVERAGE
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default PositionAverageColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
