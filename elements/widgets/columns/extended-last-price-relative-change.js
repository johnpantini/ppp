import { TRADER_DATUM } from '../../../lib/const.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import {
  LastPriceRelativeChangeColumn,
  columnTemplate
} from './last-price-relative-change.js';

export class ExtendedLastPriceRelativeChangeColumn extends LastPriceRelativeChangeColumn {
  constructor() {
    super(TRADER_DATUM.EXTENDED_LAST_PRICE_RELATIVE_CHANGE);
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default ExtendedLastPriceRelativeChangeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
