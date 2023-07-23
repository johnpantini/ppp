/** @decorator */

import { observable } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import { LastPriceColumn } from './last-price.js';
import { columnTemplate } from './pl-absolute.js';

class PLDayAbsoluteColumn extends LastPriceColumn {
  @observable
  pl;

  lastPriceChanged(oldValue, lastPrice) {
    this.pl =
      (lastPrice - this.datum.averagePrice) * this.datum.lot * this.datum.size;
  }

  datumChanged(oldValue, datum) {
    this.pl = (this.lastPrice - datum.averagePrice) * datum.lot * datum.size;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default PLDayAbsoluteColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
