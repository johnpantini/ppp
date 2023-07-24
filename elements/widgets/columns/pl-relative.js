/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatRelativeChange } from '../../../lib/intl.js';
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
          ${(cell) => formatRelativeChange(cell.pl)}
        </span>
      `
    )}
  </template>
`;

class PLRelativeColumn extends LastPriceColumn {
  @observable
  pl;

  lastPriceChanged(oldValue, lastPrice) {
    this.pl =
      ((lastPrice - this.datum.averagePrice) / this.datum.averagePrice);
  }

  datumChanged(oldValue, datum) {
    this.pl =
      ((this.lastPrice - datum.averagePrice) / datum.averagePrice);
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default PLRelativeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
