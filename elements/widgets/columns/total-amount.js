/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { TRADER_DATUM } from '../../../lib/const.js';
import { LastPriceColumn } from './last-price.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { columnStyles } from './column.js';
import { formatAmount, getUSMarketSession } from '../../../lib/intl.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <div class="control-line dot-line">
          <span
            ?hidden="${(cell) =>
              cell.datum === TRADER_DATUM.LAST_PRICE ||
              typeof cell.totalAmount !== 'number' ||
              isNaN(cell.totalAmount) ||
              cell.currentUSMarketSession === 'regular'}"
            class="dot ${(cell) =>
              cell.currentUSMarketSession === 'premarket' ? 'dot-1' : 'dot-4'}"
          ></span>
          <span>
            ${(cell) =>
              formatAmount(
                cell.totalAmount,
                cell.payload?.instrument?.currency,
                cell.payload?.instrument
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

  @observable
  size;

  @observable
  currentUSMarketSession;

  recalculate() {
    if (this.payload.instrument) {
      this.currentUSMarketSession = getUSMarketSession();
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
    this.currentUSMarketSession = getUSMarketSession();

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
