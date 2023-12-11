/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatVolume } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';
import '../../button.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <span>
          ${(x) =>
            typeof x.volume === 'number'
              ? formatVolume(x.volume / x.instrument?.lot)
              : '—'}
        </span>
      `
    )}
  </template>
`;

export class DayVolumeColumn extends Column {
  @observable
  volume;

  get value() {
    return this.volume;
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (!this.isBalance) {
      await this.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          volume: TRADER_DATUM.DAY_VOLUME
        }
      });
    }
  }

  async disconnectedCallback() {
    if (!this.isBalance) {
      await this.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          volume: TRADER_DATUM.DAY_VOLUME
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default DayVolumeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
