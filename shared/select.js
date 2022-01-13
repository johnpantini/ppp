/** @decorator */

import { attr } from './element/components/attributes.js';
import { Observable, observable } from './element/observation/observable.js';
import { ARIAGlobalStatesAndProperties } from './patterns/aria-global.js';
import { StartEnd } from './patterns/start-end.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { html } from './element/templating/template.js';
import { ref } from './element/templating/ref.js';
import { slotted } from './element/templating/slotted.js';
import { Listbox } from './listbox.js';
import { endSlotTemplate, startSlotTemplate } from './patterns/start-end.js';
import { FormAssociated } from './form-associated.js';

class _Select extends Listbox {}

/**
 * A form-associated base class for the Select component.
 *
 * @internal
 */
export class FormAssociatedSelect extends FormAssociated(_Select) {
  constructor() {
    super(...arguments);
    this.proxy = document.createElement('select');
  }
}

/**
 * The template for the Select component.
 * @public
 */
export const selectTemplate = (context, definition) => html`
  <template
    class="${(x) => (x.open ? 'open' : '')} ${(x) =>
      x.disabled ? 'disabled' : ''} ${(x) => x.position}"
    role="${(x) => x.role}"
    tabindex="${(x) => (!x.disabled ? '0' : null)}"
    aria-disabled="${(x) => x.ariaDisabled}"
    aria-expanded="${(x) => x.ariaExpanded}"
    @click="${(x, c) => x.clickHandler(c.event)}"
    @focusout="${(x, c) => x.focusoutHandler(c.event)}"
    @keydown="${(x, c) => x.keydownHandler(c.event)}"
  >
    <div
      aria-activedescendant="${(x) => (x.open ? x.ariaActiveDescendant : null)}"
      aria-controls="listbox"
      aria-expanded="${(x) => x.ariaExpanded}"
      aria-haspopup="listbox"
      class="control"
      part="control"
      role="button"
      ?disabled="${(x) => x.disabled}"
    >
      ${startSlotTemplate(context, definition)}
      <slot name="button-container">
        <div class="selected-value" part="selected-value">
          <slot name="selected-value">${(x) => x.displayValue}</slot>
        </div>
        <div class="indicator" part="indicator">
          <slot name="indicator"> ${definition.indicator || ''}</slot>
        </div>
      </slot>
      ${endSlotTemplate(context, definition)}
    </div>
    <div
      aria-disabled="${(x) => x.disabled}"
      class="listbox"
      id="listbox"
      part="listbox"
      role="listbox"
      ?disabled="${(x) => x.disabled}"
      ?hidden="${(x) => !x.open}"
      ${ref('listbox')}
    >
      <slot
        ${slotted({
          filter: Listbox.slottedOptionFilter,
          flatten: true,
          property: 'slottedOptions'
        })}
      ></slot>
    </div>
  </template>
`;

/**
 * Positioning directions for the listbox when a select is open.
 * @public
 */
export let SelectPosition;
(function (SelectPosition) {
  SelectPosition['above'] = 'above';
  SelectPosition['below'] = 'below';
})(SelectPosition || (SelectPosition = {}));
/**
 * Select role.
 * @public
 */
export let SelectRole;
(function (SelectRole) {
  SelectRole['combobox'] = 'combobox';
})(SelectRole || (SelectRole = {}));

/**
 * A Select Custom HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#select | ARIA select }.
 *
 * @public
 */
export class Select extends FormAssociatedSelect {
  /**
   * The open attribute.
   *
   * @internal
   */
  @attr({ attribute: 'open', mode: 'boolean' })
  open;

  @attr
  placeholder;

  indexWhenOpened;

  /**
   * The internal value property.
   *
   * @internal
   */
  _value;

  /**
   * Reflects the placement for the listbox when the select is open.
   *
   * @public
   */
  @attr({ attribute: 'position' })
  positionAttribute;

  /**
   * Indicates the initial state of the position attribute.
   *
   * @internal
   */
  forcedPosition;

  /**
   * The role of the element.
   *
   * @public
   * @remarks
   * HTML Attribute: role
   */
  role;

  /**
   * Holds the current state for the calculated position of the listbox.
   *
   * @public
   */
  @observable
  position;

  /**
   * Reference to the internal listbox element.
   *
   * @internal
   */
  listbox;

  /**
   * The max height for the listbox when opened.
   *
   * @internal
   */
  @observable
  maxHeight;

  /**
   * The value displayed on the button.
   *
   * @public
   */
  @observable
  displayValue;

  constructor() {
    super(...arguments);
    /**
     * The open attribute.
     *
     * @internal
     */
    this.open = false;
    /**
     * Indicates the initial state of the position attribute.
     *
     * @internal
     */
    this.forcedPosition = false;
    /**
     * The role of the element.
     *
     * @public
     * @remarks
     * HTML Attribute: role
     */
    this.role = SelectRole.combobox;
    /**
     * Holds the current state for the calculated position of the listbox.
     *
     * @public
     */
    this.position = SelectPosition.below;
    /**
     * The max height for the listbox when opened.
     *
     * @internal
     */
    this.maxHeight = 0;
    /**
     * The value displayed on the button.
     *
     * @public
     */
    this.displayValue = '';
  }

  openChanged() {
    this.ariaExpanded = this.open ? 'true' : 'false';

    if (this.open) {
      this.setPositioning();
      this.focusAndScrollOptionIntoView();
      this.indexWhenOpened = this.selectedIndex;
    }
  }

  /**
   * The value property.
   *
   * @public
   */
  get value() {
    Observable.track(this, 'value');

    return this._value;
  }

  set value(next) {
    const prev = `${this._value}`;

    if (this.$pppController.isConnected && this.options) {
      const selectedIndex = this.options.findIndex((el) => el.value === next);
      const prevSelectedOption = this.options[this.selectedIndex];
      const nextSelectedOption = this.options[selectedIndex];
      const prevSelectedValue = prevSelectedOption
        ? prevSelectedOption.value
        : null;
      const nextSelectedValue = nextSelectedOption
        ? nextSelectedOption.value
        : null;

      if (selectedIndex === -1 || prevSelectedValue !== nextSelectedValue) {
        next = this.placeholder;
        this.selectedIndex = selectedIndex;
      }

      if (this.firstSelectedOption) {
        next = this.firstSelectedOption.value;
      }
    }

    if (prev !== next) {
      if (this.options.length) this._value = next;
      else this._value = void 0;

      super.valueChanged(prev, next);
      Observable.notify(this, 'value');
    }
  }

  updateValue(shouldEmit) {
    if (this.$pppController.isConnected) {
      this.value = this.firstSelectedOption
        ? this.firstSelectedOption.value
        : void 0;

      this.displayValue = this.firstSelectedOption
        ? this.firstSelectedOption.textContent || this.firstSelectedOption.value
        : this.placeholder;
    }

    if (shouldEmit) {
      this.$emit('input');
      this.$emit('change', this, {
        bubbles: true,
        composed: undefined
      });
    }
  }

  /**
   * Updates the proxy value when the selected index changes.
   *
   * @param prev - the previous selected index
   * @param next - the next selected index
   *
   * @internal
   */
  selectedIndexChanged(prev, next) {
    super.selectedIndexChanged(prev, next);
    this.updateValue();
  }

  /**
   * Calculate and apply listbox positioning based on available viewport space.
   *
   * @public
   */
  setPositioning() {
    const currentBox = this.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const availableBottom = viewportHeight - currentBox.bottom;

    this.position = this.forcedPosition
      ? this.positionAttribute
      : currentBox.top > availableBottom
      ? SelectPosition.above
      : SelectPosition.below;
    this.positionAttribute = this.forcedPosition
      ? this.positionAttribute
      : this.position;
    this.maxHeight =
      this.position === SelectPosition.above
        ? ~~currentBox.top
        : ~~availableBottom;
  }

  maxHeightChanged() {
    if (this.listbox) {
      this.listbox.style.setProperty('--max-height', `${this.maxHeight}px`);
    }
  }

  /**
   * Synchronize the `aria-disabled` property when the `disabled` property changes.
   *
   * @param prev - The previous disabled value
   * @param next - The next disabled value
   *
   * @internal
   */
  disabledChanged(prev, next) {
    if (super.disabledChanged) {
      super.disabledChanged(prev, next);
    }

    this.ariaDisabled = this.disabled ? 'true' : 'false';
  }

  /**
   * Reset the element to its first selectable option when its parent form is reset.
   *
   * @internal
   */
  formResetCallback() {
    this.setProxyOptions();
    this.setDefaultSelectedOption();
    this.value = this.firstSelectedOption.value;
  }

  /**
   * Handle opening and closing the listbox when the select is clicked.
   *
   * @param e - the mouse event
   * @internal
   */
  clickHandler(e) {
    if (this.disabled) {
      return;
    }

    if (this.open) {
      const captured = e.target.closest(`option, [role=option]`);

      if (captured && captured.disabled) {
        return;
      }
    }

    super.clickHandler(e);
    this.open = !this.open;

    if (!this.open && this.indexWhenOpened !== this.selectedIndex) {
      this.updateValue(true);
    }

    return true;
  }

  /**
   * Handle focus state when the element or its children lose focus.
   *
   * @param e - The focus event
   * @internal
   */
  focusoutHandler(e) {
    if (!this.open) {
      return true;
    }

    const focusTarget = e.relatedTarget;

    if (this.isSameNode(focusTarget)) {
      this.focus();

      return;
    }

    if (!this.options?.includes(focusTarget)) {
      this.open = false;

      if (this.indexWhenOpened !== this.selectedIndex) {
        this.updateValue(true);
      }
    }
  }

  /**
   * Synchronize the form-associated proxy and update the value property of the element.
   *
   * @param prev - the previous collection of slotted option elements
   * @param next - the next collection of slotted option elements
   *
   * @internal
   */
  slottedOptionsChanged(prev, next) {
    super.slottedOptionsChanged(prev, next);

    if (this.initialValue) this.value = this.initialValue;

    this.setProxyOptions();
    this.updateValue();
  }

  /**
   * Reset and fill the proxy to match the component's options.
   *
   * @internal
   */
  setProxyOptions() {
    if (this.proxy instanceof HTMLSelectElement && this.options) {
      this.proxy.options.length = 0;
      this.options.forEach((option) => {
        const proxyOption =
          option.proxy ||
          (option instanceof HTMLOptionElement ? option.cloneNode() : null);

        if (proxyOption) {
          this.proxy.appendChild(proxyOption);
        }
      });
    }
  }

  /**
   * Handle keyboard interaction for the select.
   *
   * @param e - the keyboard event
   * @internal
   */
  keydownHandler(e) {
    super.keydownHandler(e);

    const key = e.key || e.key.charCodeAt(0);

    switch (key) {
      case ' ': {
        if (this.typeAheadExpired) {
          e.preventDefault();
          this.open = !this.open;
        }

        break;
      }
      case 'Enter': {
        e.preventDefault();
        this.open = !this.open;

        break;
      }
      case 'Escape': {
        if (this.open) {
          e.preventDefault();
          this.open = false;
        }

        break;
      }
      case 'Tab': {
        if (!this.open) {
          return true;
        }

        e.preventDefault();
        this.open = false;
      }
    }

    if (!this.open && this.indexWhenOpened !== this.selectedIndex) {
      this.updateValue(true);
      this.indexWhenOpened = this.selectedIndex;
    }

    return true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.forcedPosition = !!this.positionAttribute;
  }
}

/**
 * Includes ARIA states and properties relating to the ARIA select role.
 *
 * @public
 */
export class DelegatesARIASelect {
  /**
   * See {@link https://www.w3.org/WAI/PF/aria/roles#button} for more information
   * @public
   * @remarks
   * HTML Attribute: aria-expanded
   */
  @observable
  ariaExpanded;

  /**
   * See {@link https://www.w3.org/WAI/PF/aria/roles#button} for more information
   * @public
   * @remarks
   * HTML Attribute: aria-pressed
   */
  @attr({ attribute: 'aria-pressed', mode: 'fromView' })
  ariaPressed;
}

applyMixins(DelegatesARIASelect, ARIAGlobalStatesAndProperties);
applyMixins(Select, StartEnd, DelegatesARIASelect);
