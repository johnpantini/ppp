/** @decorator */

import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import { html } from './element/templating/template.js';
import { slotted } from './element/templating/slotted.js';
import { FoundationElement } from './foundation-element.js';
import { keySpace } from './web-utilities/key-codes.js';

/**
 * The template for the Radio component.
 * @public
 */
export const radioTemplate = (context, definition) => html`
  <template
    role="radio"
    class="${(x) => (x.checked ? 'checked' : '')} ${(x) =>
      x.readOnly ? 'readonly' : ''}"
    aria-checked="${(x) => x.checked}"
    aria-required="${(x) => x.required}"
    aria-disabled="${(x) => x.disabled}"
    aria-readonly="${(x) => x.readOnly}"
    @keypress="${(x, c) => x.keypressHandler(c.event)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
  >
    <div part="control" class="control">
      <slot name="checked-indicator">
        ${definition.checkedIndicator || ''}
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
 * A Radio Custom HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#checkbox | ARIA checkbox }.
 *
 * @public
 */
export class Radio extends FoundationElement {
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

  /**
   * The name of the radio. See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname | name attribute} for more info.
   */
  @attr
  name;

  /**
   * @public
   * @remarks
   * HTML Attribute: value
   */
  @attr
  value;

  @attr({ mode: 'boolean' })
  disabled;

  /**
   * @internal
   */
  @observable
  defaultSlottedNodes;

  constructor() {
    super();

    this.value = '';

    /**
     * @internal
     */
    this.keypressHandler = (e) => {
      switch (e.key) {
        case keySpace:
          if (!this.checked && !this.readOnly) {
            this.checked = true;
          }

          return;
      }

      return true;
    };
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();

    if (
      this.parentElement?.getAttribute('role') !== 'radiogroup' &&
      this.getAttribute('tabindex') === null
    ) {
      if (!this.disabled) {
        this.setAttribute('tabindex', '0');
      }
    }
  }

  isInsideRadioGroup() {
    return !!this.closest('[role=radiogroup]');
  }

  /**
   * @internal
   */
  clickHandler() {
    if (!this.disabled && !this.readOnly && !this.checked) {
      this.checked = true;
    }
  }

  checkedChanged(prev, next) {
    if (prev !== undefined) {
      this.$emit('change');
    }
  }
}
