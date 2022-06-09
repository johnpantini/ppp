/** @decorator */

import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import { html } from './element/templating/template.js';
import { slotted } from './element/templating/slotted.js';
import { FoundationElement } from './foundation-element.js';
import { CheckableFormAssociated } from './form-associated.js';
import { keySpace } from './web-utilities/key-codes.js';

class _Radio extends FoundationElement {}

/**
 * A form-associated base class for the Radio component.
 *
 * @internal
 */
export class FormAssociatedRadio extends CheckableFormAssociated(_Radio) {
  constructor() {
    super(...arguments);
    this.proxy = document.createElement('input');
  }
}

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
export class Radio extends FormAssociatedRadio {
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
  @observable
  name;

  /**
   * @internal
   */
  @observable
  defaultSlottedNodes;

  constructor() {
    super();
    /**
     * The element's value to be included in form submission when checked.
     * Default to "on" to reach parity with input[type="radio"]
     *
     * @internal
     */
    this.initialValue = 'on';
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
    this.proxy.setAttribute('type', 'radio');
  }

  readOnlyChanged() {
    if (this.proxy instanceof HTMLInputElement) {
      this.proxy.readOnly = this.readOnly;
    }
  }

  /**
   * @internal
   */
  defaultCheckedChanged() {
    if (this.$pppController.isConnected && !this.dirtyChecked) {
      // Setting this.checked will cause us to enter a dirty state,
      // but if we are clean when defaultChecked is changed, we want to stay
      // in a clean state, so reset this.dirtyChecked
      if (!this.isInsideRadioGroup()) {
        this.checked = this.defaultChecked ?? false;
        this.dirtyChecked = false;
      }
    }
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();
    this.validate();

    if (
      this.parentElement?.getAttribute('role') !== 'radiogroup' &&
      this.getAttribute('tabindex') === null
    ) {
      if (!this.disabled) {
        this.setAttribute('tabindex', '0');
      }
    }

    if (this.checkedAttribute) {
      if (!this.dirtyChecked) {
        // Setting this.checked will cause us to enter a dirty state,
        // but if we are clean when defaultChecked is changed, we want to stay
        // in a clean state, so reset this.dirtyChecked
        if (!this.isInsideRadioGroup()) {
          this.checked = this.defaultChecked ?? false;
          this.dirtyChecked = false;
        }
      }
    }
  }

  isInsideRadioGroup() {
    const parent = this.closest('[role=radiogroup]');

    return parent !== null;
  }

  /**
   * @internal
   */
  clickHandler(e) {
    if (!this.disabled && !this.readOnly && !this.checked) {
      this.checked = true;
    }
  }
}
