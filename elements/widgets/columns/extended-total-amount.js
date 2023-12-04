import { TRADER_DATUM } from '../../../lib/const.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import { TotalAmountColumn, columnTemplate } from './total-amount.js';

export class ExtendedTotalAmountColumn extends TotalAmountColumn {
  constructor() {
    super(TRADER_DATUM.EXTENDED_LAST_PRICE);
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default ExtendedTotalAmountColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
