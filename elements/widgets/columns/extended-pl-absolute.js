import { TRADER_DATUM } from '../../../lib/const.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import { PLAbsoluteColumn, columnTemplate } from './pl-absolute.js';

export class ExtendedPLAbsoluteColumn extends PLAbsoluteColumn {
  constructor() {
    super(TRADER_DATUM.EXTENDED_LAST_PRICE);
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default ExtendedPLAbsoluteColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
