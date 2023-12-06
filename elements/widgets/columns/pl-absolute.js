/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatAbsoluteChange } from '../../../lib/intl.js';
import { columnStyles } from './column.js';
import { LastPriceColumn } from './last-price.js';
import { TRADER_DATUM, TRADING_STATUS } from '../../../lib/const.js';

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
              typeof x.pl !== 'number' ||
              isNaN(x.pl) ||
              ![TRADING_STATUS.PREMARKET, TRADING_STATUS.AFTER_HOURS].includes(
                x.status
              )}"
            class="dot ${(x) =>
              x.status === TRADING_STATUS.PREMARKET ? 'dot-1' : 'dot-4'}"
          ></span>
          <span
            class="${(x) =>
              x.pl > 0 ? 'positive' : x.pl < 0 ? 'negative' : ''}"
          >
            ${(x) => formatAbsoluteChange(x.pl, x.payload?.instrument)}
          </span>
        </div>
      `
    )}
  </template>
`;

export class PLAbsoluteColumn extends LastPriceColumn {
  @observable
  pl;

  @observable
  size;

  @observable
  averagePrice;

  recalculate() {
    if (this.payload.instrument) {
      this.pl =
        (this.lastPrice - this.averagePrice) *
        this.size *
        this.payload.instrument.lot;
    }
  }

  lastPriceChanged() {
    super.lastPriceChanged();
    this.recalculate();
  }

  sizeChanged() {
    this.recalculate();
  }

  averagePriceChanged() {
    this.recalculate();
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (!this.isBalance) {
      await this.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          averagePrice: TRADER_DATUM.POSITION_AVERAGE,
          size: TRADER_DATUM.POSITION_SIZE
        }
      });
    }
  }

  async disconnectedCallback() {
    if (!this.isBalance) {
      await this.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          averagePrice: TRADER_DATUM.POSITION_AVERAGE,
          size: TRADER_DATUM.POSITION_SIZE
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default PLAbsoluteColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
