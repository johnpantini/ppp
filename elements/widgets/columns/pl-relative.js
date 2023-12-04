import { html, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatRelativeChange, getUSMarketSession } from '../../../lib/intl.js';
import { columnStyles } from './column.js';
import { PLAbsoluteColumn } from './pl-absolute.js';
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
              typeof cell.pl !== 'number' ||
              isNaN(cell.pl) ||
              cell.currentUSMarketSession === 'regular'}"
            class="dot ${(cell) =>
              cell.currentUSMarketSession === 'premarket' ? 'dot-1' : 'dot-4'}"
          ></span>
          <span
            class="${(x) =>
              x.pl > 0 ? 'positive' : x.pl < 0 ? 'negative' : ''}"
          >
            ${(cell) => formatRelativeChange(cell.pl)}
          </span>
        </div>
      `
    )}
  </template>
`;

export class PLRelativeColumn extends PLAbsoluteColumn {
  recalculate() {
    this.currentUSMarketSession = getUSMarketSession();

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
