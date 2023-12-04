/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatAbsoluteChange, getUSMarketSession } from '../../../lib/intl.js';
import { columnStyles } from './column.js';
import { LastPriceColumn } from './last-price.js';
import { TRADER_DATUM } from '../../../lib/const.js';

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
              typeof cell.pl !== 'number' ||
              isNaN(cell.pl) ||
              cell.currentUSMarketSession === 'regular'}"
            class="dot ${(cell) =>
              cell.currentUSMarketSession === 'premarket' ? 'dot-1' : 'dot-4'}"
          ></span>
          <span
            class="${(x) =>
              x.pl > 0 ? 'positive' : x.pl < 0 ? 'negative' : ''}"
          >
            ${(cell) => formatAbsoluteChange(cell.pl, cell.payload?.instrument)}
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

  @observable
  currentUSMarketSession;

  recalculate() {
    if (this.payload.instrument) {
      this.currentUSMarketSession = getUSMarketSession();

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
    this.currentUSMarketSession = getUSMarketSession();

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
