import { TRADER_DATUM } from '../../../lib/const.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import { LastPriceColumn, columnTemplate } from './last-price.js';

export class ExtendedLastPriceColumn extends LastPriceColumn {
  constructor() {
    super(TRADER_DATUM.EXTENDED_LAST_PRICE);
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default ExtendedLastPriceColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
