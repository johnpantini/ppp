/** @decorator */

import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import { html } from './element/templating/template.js';
import { slotted } from './element/templating/slotted.js';
import { FoundationElement } from './foundation-element.js';
import { keySpace } from './web-utilities/key-codes.js';

/**
 * The template for the Checkbox component.
 * @public
 */
export const checkboxTemplate = (context, definition) => html`
  <template
    role="checkbox"
    aria-checked="${(x) => x.checked}"
    aria-required="${(x) => x.required}"
    aria-disabled="${(x) => x.disabled}"
    aria-readonly="${(x) => x.readOnly}"
    tabindex="${(x) => (x.disabled ? null : 0)}"
    @keypress="${(x, c) => x.keypressHandler(c.event)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
    class="${(x) => (x.readOnly ? 'readonly' : '')} ${(x) =>
      x.checked ? 'checked' : ''} ${(x) =>
      x.indeterminate ? 'indeterminate' : ''}"
  >
    <div part="control" class="control">
      <slot name="checked-indicator">
        ${definition.checkedIndicator || ''}
      </slot>
      <slot name="indeterminate-indicator">
        ${definition.indeterminateIndicator || ''}
      </slot>
    </div>
    <label
      part="label"
      class="${(x) =>
        x.defaultSlottedNodes && x.defaultSlottedNodes.length
          ? 'label'
          : 'label label hidden'}"
    >
      <slot ${slotted('defaultSlottedNodes')}></slot>
    </label>
  </template>
`;

/**
 * A Checkbox Custom HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#checkbox | ARIA checkbox }.
 *
 * @public
 */
export class Checkbox extends FoundationElement {
  /**
   * @public
   * @remarks
   * HTML Attribute: name
   */
  @attr
  name;

  /**
   * @public
   * @remarks
   * HTML Attribute: checked
   */
  @attr({ mode: 'boolean' })
  checked;

  /**
   * When true, the control will be immutable by user interaction. See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly | readonly HTML attribute} for more information.
   * @public
   * @remarks
   * HTML Attribute: readonly
   */
  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  @observable
  defaultSlottedNodes;

  /**
   * The indeterminate state of the control
   */
  @observable
  indeterminate;

  constructor() {
    super();

    /**
     * The indeterminate state of the control
     */
    this.indeterminate = false;
    /**
     * @internal
     */
    this.keypressHandler = (e) => {
      switch (e.key) {
        case keySpace:
          this.checked = !this.checked;

          break;
      }
    };
    /**
     * @internal
     */
    this.clickHandler = (e) => {
      if (!this.disabled && !this.readOnly) {
        this.checked = !this.checked;
      }
    };
  }

  checkedChanged(prev, next) {
    this.$emit('change');
  }
}
