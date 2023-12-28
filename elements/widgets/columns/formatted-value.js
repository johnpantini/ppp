/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import {
  formatPercentage,
  formatVolume,
  formatRelativeChange,
  formatDateWithOptions,
  stringToFloat,
  formatAmount
} from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`<span>${(x) => x.formatValue()}</span>`
    )}
  </template>
`;

export class FormattedValueColumn extends Column {
  @observable
  value;

  formatter;

  formatterOptions;

  formatValue() {
    if (typeof this.formatter === 'function') {
      return this.formatter(this.value);
    } else if (this.formatter === 'percent') {
      return formatPercentage(stringToFloat(this.value));
    } else if (this.formatter === 'change') {
      return formatRelativeChange(stringToFloat(this.value));
    } else if (this.formatter === 'amount') {
      return formatAmount(stringToFloat(this.value), this.instrument);
    } else if (this.formatter === 'volume') {
      return formatVolume(stringToFloat(this.value), this.formatterOptions);
    } else if (this.formatter === 'datetime') {
      return formatDateWithOptions(
        this.value,
        {
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        },
        this.formatterOptions
      );
    } else {
      return this.value;
    }
  }

  rebuild() {
    if (!this.column?.valueKey) {
      this.value = '—';
    } else {
      const entry = this.payload.values?.[this.column.valueKey] ?? {};

      this.value = entry.value ?? '—';
      this.formatter = entry.formatter;
      this.formatterOptions = entry.formatterOptions;
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (!this.isBalance) {
      this.rebuild();
    }
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default FormattedValueColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
