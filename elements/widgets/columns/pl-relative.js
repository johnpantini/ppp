import { html, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatRelativeChange } from '../../../lib/intl.js';
import { columnStyles } from './column.js';
import { PLAbsoluteColumn } from './pl-absolute.js';

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

export class PLRelativeColumn extends PLAbsoluteColumn {
  recalculate() {
    this.pl =
      ((this.lastPrice - this.averagePrice) / this.averagePrice) *
      Math.sign(this.size);
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default PLRelativeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
