import { html, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatRelativeChange } from '../../../lib/intl.js';
import { columnStyles } from './column.js';
import { PLAbsoluteColumn } from './pl-absolute.js';
import { TRADER_DATUM, TRADING_STATUS } from '../../../lib/const.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <div class="control-line dot-line">
          <span
            ?hidden="${(x) =>
              x.datum === TRADER_DATUM.LAST_PRICE ||
              typeof x.pl !== 'number' ||
              isNaN(x.pl) ||
              ![TRADING_STATUS.PREMARKET, TRADING_STATUS.AFTER_HOURS].includes(
                x.status
              )}"
            class="dot ${(x) =>
              x.status === TRADING_STATUS.PREMARKET ? 'dot-1' : 'dot-4'}"
          ></span>
          <span
            class="${(x) =>
              x.pl > 0 ? 'positive' : x.pl < 0 ? 'negative' : ''}"
          >
            ${(x) => formatRelativeChange(x.pl)}
          </span>
        </div>
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
