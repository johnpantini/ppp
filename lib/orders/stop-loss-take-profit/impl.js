/** @decorator */

import { observable } from '../../vendor/fast-element.min.js';
import { TRADER_DATUM } from '../../const.js';
import { ConditionalOrder } from '../../conditional-order.js';

class StopLossTakeProfitOrder extends ConditionalOrder {}

export default StopLossTakeProfitOrder;
