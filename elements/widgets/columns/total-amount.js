/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { TRADER_DATUM, TRADING_STATUS } from '../../../lib/const.js';
import { LastPriceColumn } from './last-price.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import { formatAmount } from '../../../lib/intl.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <div class="control-line dot-line">
          <span
            ?hidden="${(x) =>
              x.datum === TRADER_DATUM.LAST_PRICE ||
              typeof x.totalAmount !== 'number' ||
              isNaN(x.totalAmount) ||
              ![TRADING_STATUS.PREMARKET, TRADING_STATUS.AFTER_HOURS].includes(
                x.status
              )}"
            class="dot ${(x) =>
              x.status === TRADING_STATUS.PREMARKET ? 'dot-1' : 'dot-4'}"
          ></span>
          <span>
            ${(x) =>
              formatAmount(
                x.totalAmount,
                x.payload?.instrument?.currency,
                x.payload?.instrument
              )}
          </span>
        </div>
      `
    )}
  </template>
`;

export class TotalAmountColumn extends LastPriceColumn {
  @observable
  totalAmount;

  get value() {
    return this.totalAmount;
  }

  @observable
  size;

  recalculate() {
    if (this.payload.instrument) {
      this.totalAmount =
        this.lastPrice * this.size * this.payload.instrument.lot;
    }
  }

  lastPriceChanged() {
    super.lastPriceChanged();
    this.recalculate();
  }

  sizeChanged() {
    this.recalculate();
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (this.defaultTrader) {
      await this.defaultTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          size: TRADER_DATUM.POSITION_SIZE
        }
      });
    }
  }

  async disconnectedCallback() {
    if (this.defaultTrader) {
      await this.defaultTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          size: TRADER_DATUM.POSITION_SIZE
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default TotalAmountColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
