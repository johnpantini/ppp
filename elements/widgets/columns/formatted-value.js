/** @decorator */

import {
  html,
  observable,
  Observable
} from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import {
  formatPercentage,
  formatVolume,
  formatRelativeChange,
  formatAbsoluteChange,
  formatDateWithOptions,
  stringToFloat,
  formatAmount,
  formatQuantity,
  formatPrice
} from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';

export const columnTemplate = html`
  <template>
    <span class="${(x) => x.extraClass}">
      ${(x) => (x.isBalance ? '' : x.formatValue())}
    </span>
  </template>
`;

export class FormattedValueColumn extends Column {
  @observable
  value;

  @observable
  extraClass;

  formatter;

  formatterOptions;

  formatValue() {
    if (typeof this.formatter === 'function') {
      return this.formatter(this.value);
    } else if (this.formatter === 'price') {
      return formatPrice(
        stringToFloat(this.value),
        this.instrument,
        this.formatterOptions
      );
    } else if (this.formatter === 'percent') {
      return formatPercentage(stringToFloat(this.value));
    } else if (this.formatter === 'change') {
      const v = stringToFloat(this.value);

      if (this.formatterOptions?.colorize) {
        this.extraClass = v > 0 ? 'positive' : v < 0 ? 'negative' : '';
      }

      return formatRelativeChange(v);
    } else if (this.formatter === 'amount') {
      return formatAmount(stringToFloat(this.value), this.instrument);
    } else if (this.formatter === 'pnl') {
      const v = stringToFloat(this.value);

      if (this.formatterOptions?.colorize) {
        this.extraClass = v > 0 ? 'positive' : v < 0 ? 'negative' : '';
      }

      return formatAbsoluteChange(v, this.instrument, {
        maximumFractionDigits: 2
      });
    } else if (this.formatter === 'volume') {
      return formatVolume(stringToFloat(this.value), this.formatterOptions);
    } else if (this.formatter === 'quantity') {
      return formatQuantity(stringToFloat(this.value), this.formatterOptions);
    } else if (this.formatter === 'datetime') {
      if (isNaN(new Date(this.value).getTime())) return '—';

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

  async rebuild(options = {}) {
    if (!this.column?.valueKey) {
      this.value = '—';
    } else {
      const entry = this.payload.values?.[this.column.valueKey] ?? {};

      this.value = entry.value ?? '—';
      this.formatter = entry.formatter;
      this.formatterOptions = entry.formatterOptions;
      this.extraClass = entry.extraClass;

      Observable.notify(this, 'value');
    }

    if (options.updateInstrument) {
      return this.updateInstrument();
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (!this.isBalance) {
      return this.rebuild();
    }
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default FormattedValueColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
