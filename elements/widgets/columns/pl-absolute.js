/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatAbsoluteChange } from '../../../lib/intl.js';
import { columnStyles } from './column.js';
import { LastPriceColumn } from './last-price.js';

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

class PLAbsoluteColumn extends LastPriceColumn {
  @observable
  pl;

  lastPriceChanged(oldValue, lastPrice) {
    this.pl =
      (lastPrice - this.datum.averagePrice) * this.datum.lot * this.datum.size;
  }

  datumChanged(oldValue, datum) {
    this.pl = (this.lastPrice - datum.averagePrice) * datum.lot * datum.size;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default PLAbsoluteColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
