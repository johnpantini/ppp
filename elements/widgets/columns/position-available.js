/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatAmount, formatQuantity } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';
import '../../button.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`
        <ppp-button
          class="xsmall"
          ?hidden="${(x) => !x.widget.document.hideBalances}"
        >
          Скрыто
        </ppp-button>
        <span
          class="balance-cell"
          ?hidden="${(x) => x.widget.document.hideBalances}"
        >
          ${(cell) => formatAmount(cell.size, cell.payload?.symbol)}
        </span>
      `
    )}
    ${when(
      (x) => !x.isBalance,
      html`
        <span>
          ${(cell) => formatQuantity(cell.size * cell.instrument?.lot)}
        </span>
      `
    )}
  </template>
`;

export class PositionAvailableColumn extends Column {
  @observable
  size;

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
export default PositionAvailableColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
