import { html, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatPrice } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';

export const columnTemplate = html`
  <template>
    ${when((x) => x.isBalance, html`<span></span>`)}
    ${when(
      (x) => !x.isBalance,
      html`
        <span>
          ${(cell) =>
            formatPrice(cell.datum?.averagePrice, cell.datum?.instrument)}
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
