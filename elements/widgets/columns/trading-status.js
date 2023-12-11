/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM, TRADING_STATUS } from '../../../lib/const.js';
import '../../button.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <div class="control-line dot-line">
          <span
            ?hidden="${(x) =>
              ![
                TRADING_STATUS.PREMARKET,
                TRADING_STATUS.NORMAL_TRADING,
                TRADING_STATUS.IPO_TODAY,
                TRADING_STATUS.AFTER_HOURS,
                TRADING_STATUS.DISCRETE_AUCTION,
                TRADING_STATUS.OPENING_AUCTION_PERIOD,
                TRADING_STATUS.CLOSING_AUCTION,
                TRADING_STATUS.OPENING_PERIOD,
                TRADING_STATUS.CLOSING_PERIOD,
                TRADING_STATUS.BREAK_IN_TRADING,
                TRADING_STATUS.NOT_AVAILABLE_FOR_TRADING,
                TRADING_STATUS.DEALER_BREAK_IN_TRADING,
                TRADING_STATUS.TRADING_SUSPENDED,
                TRADING_STATUS.DELISTED,
                TRADING_STATUS.DEALER_NOT_AVAILABLE_FOR_TRADING
              ].includes(x.status)}"
            class="dot ${(x) => {
              return (
                {
                  [TRADING_STATUS.PREMARKET]: 'dot-1',
                  [TRADING_STATUS.NORMAL_TRADING]: 'dot-2',
                  [TRADING_STATUS.IPO_TODAY]: 'dot-3',
                  [TRADING_STATUS.AFTER_HOURS]: 'dot-4',
                  [TRADING_STATUS.DISCRETE_AUCTION]: 'dot-4',
                  [TRADING_STATUS.OPENING_AUCTION_PERIOD]: 'dot-4',
                  [TRADING_STATUS.CLOSING_AUCTION]: 'dot-4',
                  [TRADING_STATUS.OPENING_PERIOD]: 'dot-4',
                  [TRADING_STATUS.CLOSING_PERIOD]: 'dot-4',
                  [TRADING_STATUS.BREAK_IN_TRADING]: 'dot-5',
                  [TRADING_STATUS.NOT_AVAILABLE_FOR_TRADING]: 'dot-5',
                  [TRADING_STATUS.DEALER_BREAK_IN_TRADING]: 'dot-5',
                  [TRADING_STATUS.TRADING_SUSPENDED]: 'dot-5',
                  [TRADING_STATUS.DELISTED]: 'dot-5',
                  [TRADING_STATUS.DEALER_NOT_AVAILABLE_FOR_TRADING]: 'dot-5'
                }[x.status] ?? ''
              );
            }}"
          ></span>
          <span title="${(x) => x.statusText}">${(x) => x.statusText}</span>
        </div>
      `
    )}
  </template>
`;

export class TradingStatusColumn extends Column {
  @observable
  status;

  get value() {
    return this.status;
  }

  statusChanged() {
    this.statusText = this.status
      ? ppp.t(`$const.tradingStatus.${this.status}`)
      : '—';
  }

  @observable
  statusText;

  async connectedCallback() {
    await super.connectedCallback();

    this.statusText = '—';

    if (!this.isBalance) {
      await this.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          status: TRADER_DATUM.TRADING_STATUS
        }
      });
    }
  }

  async disconnectedCallback() {
    if (!this.isBalance) {
      await this.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          status: TRADER_DATUM.TRADING_STATUS
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default TradingStatusColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
