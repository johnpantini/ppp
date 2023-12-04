import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';
import { PLRelativeColumn, columnTemplate } from './pl-relative.js';

export class ExtendedPLRelativeColumn extends PLRelativeColumn {
  constructor() {
    super(TRADER_DATUM.EXTENDED_LAST_PRICE);
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default ExtendedPLRelativeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
