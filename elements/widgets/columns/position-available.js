import { html, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatAmount, formatQuantity } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import '../../button.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`
        <ppp-button
          class="xsmall"
          ?hidden="${(x) => !x.widget.document.hideBalances}"
        >
          Скрыто
        </ppp-button>
        <span
          class="balance-cell"
          ?hidden="${(x) => x.widget.document.hideBalances}"
        >
          ${(cell) => formatAmount(cell.datum?.size, cell.datum?.symbol)}
        </span>
      `
    )}
    ${when(
      (x) => !x.isBalance,
      html`
        <span>
          ${(cell) => formatQuantity(cell.datum?.size * cell.datum?.lot)}
        </span>
      `
    )}
  </template>
`;

// noinspection JSVoidFunctionReturnValueUsed
export default (class extends Column {}
  .compose({
    name: `ppp-${uuidv4()}`,
    template: columnTemplate,
    styles: columnStyles
  })
  .define());
