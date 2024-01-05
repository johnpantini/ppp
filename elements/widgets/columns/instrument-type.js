import ppp from '../../../ppp.js';
import { html } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { Column, columnStyles } from './column.js';

export const columnTemplate = html`
  <template>
    <span>
      ${(x) =>
        x.isBalance
          ? 'balance'
          : ppp.t(`$const.instrumentType.${x.instrument?.type ?? 'unknown'}`)}
    </span>
  </template>
`;

// noinspection JSVoidFunctionReturnValueUsed
export default (class extends Column {
  get value() {
    return this.isBalance
      ? 'balance'
      : ppp.t(`$const.instrumentType.${this.instrument?.type ?? 'unknown'}`);
  }
}
  .compose({
    name: `ppp-${uuidv4()}`,
    template: columnTemplate,
    styles: columnStyles
  })
  .define());
