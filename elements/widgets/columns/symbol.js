import { html } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { Column, columnStyles } from './column.js';
import '../../button.js';

export const columnTemplate = html`
  <template>
    <span>${(x) => x.payload?.symbol}</span>
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
