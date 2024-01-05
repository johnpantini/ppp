/** @decorator */

import {
  html,
  observable,
  when,
  ref
} from '../../../vendor/fast-element.min.js';
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
          ${ref('hideButton')}
          class="xsmall"
          ?hidden="${(x) => !x.column?.hideBalances}"
          @click="${(x) => {
            x.hideButton.setAttribute('hidden', '');
            x.hideButton.nextElementSibling.removeAttribute('hidden', '');
          }}"
        >
          Скрыто
        </ppp-button>
        <span class="balance-cell" ?hidden="${(x) => x.column?.hideBalances}">
          ${(x) =>
            formatAmount(x.size, {
              currency: x.payload?.symbol
            })}
        </span>
      `,
      html`<span>${(x) => formatQuantity(x.size * x.instrument?.lot)}</span>`
    )}
  </template>
`;

export class PositionAvailableColumn extends Column {
  @observable
  size;

  get value() {
    return this.size;
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
export default PositionAvailableColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
