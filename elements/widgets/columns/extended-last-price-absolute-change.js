import { TRADER_DATUM } from '../../../lib/const.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import {
  LastPriceAbsoluteChangeColumn,
  columnTemplate
} from './last-price-absolute-change.js';

export class ExtendedLastPriceAbsoluteChangeColumn extends LastPriceAbsoluteChangeColumn {
  constructor() {
    super(TRADER_DATUM.EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE);
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default ExtendedLastPriceAbsoluteChangeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
