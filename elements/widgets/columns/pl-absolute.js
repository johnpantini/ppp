/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatAbsoluteChange } from '../../../lib/intl.js';
import { columnStyles } from './column.js';
import { LastPriceColumn } from './last-price.js';
import { TRADER_DATUM } from '../../../lib/const.js';

export const columnTemplate = html`
  <template>
    ${when((x) => x.isBalance, html`<span></span>`)}
    ${when(
      (x) => !x.isBalance,
      html`
        <span
          class="${(x) => (x.pl > 0 ? 'positive' : x.pl < 0 ? 'negative' : '')}"
        >
          ${(cell) => formatAbsoluteChange(cell.pl, cell.datum?.instrument)}
        </span>
      `
    )}
  </template>
`;

export class PLAbsoluteColumn extends LastPriceColumn {
  @observable
  pl;

  @observable
  size;

  @observable
  averagePrice;

  recalculate() {
    if (this.datum.instrument) {
      this.pl =
        (this.lastPrice - this.averagePrice) *
        this.size *
        this.datum.instrument.lot;
    }
  }

  lastPriceChanged() {
    this.recalculate();
  }

  sizeChanged() {
    this.recalculate();
  }

  averagePriceChanged() {
    this.recalculate();
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (this.defaultTrader && !this.isBalance) {
      await this.defaultTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          averagePrice: TRADER_DATUM.POSITION_AVERAGE,
          size: TRADER_DATUM.POSITION_SIZE
        }
      });
    }
  }

  async disconnectedCallback() {
    if (this.defaultTrader && !this.isBalance) {
      await this.defaultTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          averagePrice: TRADER_DATUM.POSITION_AVERAGE,
          size: TRADER_DATUM.POSITION_SIZE
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default PLAbsoluteColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
