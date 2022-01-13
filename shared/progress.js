/** @decorator */

import {
  attr,
  nullableNumberConverter
} from './element/components/attributes.js';
import { FoundationElement } from './foundation-element.js';
import { html } from './element/templating/template.js';
import { when } from './element/templating/when.js';

export const progressTemplate = (context, definition) => html`
  <template
    role="progressbar"
    aria-valuenow="${(x) => x.value}"
    aria-valuemin="${(x) => x.min}"
    aria-valuemax="${(x) => x.max}"
    class="${(x) => (x.paused ? 'paused' : '')}"
  >
    ${when(
      (x) => typeof x.value === 'number',
      html`
        <div class="progress" part="progress" slot="determinate">
          <div
            class="determinate"
            part="determinate"
            style="width: ${(x) => x.value}%"
          ></div>
        </div>
      `
    )}
    ${when(
      (x) => typeof x.value !== 'number',
      html`
        <div class="progress" part="progress" slot="indeterminate">
          <slot class="indeterminate" name="indeterminate">
            ${definition.indeterminateIndicator1 || ''}
            ${definition.indeterminateIndicator2 || ''}
          </slot>
        </div>
      `
    )}
  </template>
`;

/**
 * A Progress HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#progressbar | ARIA progressbar }.
 *
 * @public
 */
export class BaseProgress extends FoundationElement {
  /**
   * The value of the progress
   * @public
   * @remarks
   * HTML Attribute: value
   */
  @attr({ converter: nullableNumberConverter })
  value;

  /**
   * The minimum value
   * @public
   * @remarks
   * HTML Attribute: min
   */
  @attr({ converter: nullableNumberConverter })
  min;

  /**
   * The maximum value
   * @public
   * @remarks
   * HTML Attribute: max
   */
  @attr({ converter: nullableNumberConverter })
  max;

  /**
   * Indicates the progress is paused
   * @public
   * @remarks
   * HTML Attribute: paused
   */
  @attr({ mode: 'boolean' })
  paused;
}
