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
import { startSlotTemplate } from './patterns/start-end.js';
import { DOM } from './element/dom.js';
import { when } from './element/templating/when.js';

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
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        <div
          aria-activedescendant="${(x) =>
            x.open ? x.ariaActiveDescendant : null}"
          aria-controls="listbox"
          aria-expanded="${(x) => x.ariaExpanded}"
          aria-haspopup="listbox"
          class="control"
          part="control"
          role="button"
          ?disabled="${(x) => x.disabled}"
        >
          <div class="interaction-ring"></div>
          ${startSlotTemplate(context, definition)}
          <slot name="button-container">
            <div class="selected-value" part="selected-value">
              <slot name="selected-value">${(x) => x.displayValue}</slot>
            </div>
            ${when(
              (x) => x.state === 'error' && x.errorMessage,
              html`
                <div class="indicator" part="indicator">
                  <slot name="indicator">
                    ${definition.warningIndicator ?? ''}
                  </slot>
                </div>
              `
            )}
            ${when(
              (x) => x.state === 'default',
              html`
                <div class="indicator" part="indicator">
                  <slot name="indicator"> ${definition.indicator ?? ''}</slot>
                </div>
              `
            )}
          </slot>
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
        <div class="interaction-ring"></div>
      </div>
    </div>
    ${when(
      (x) => x.state === 'error' && x.errorMessage,
      html` <div class="helper error">
        <label>${(x) => x.errorMessage}</label>
      </div>`
    )}
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
export class Select extends Listbox {
  /**
   * The open attribute.
   *
   * @internal
   */
  @attr({ mode: 'boolean' })
  open;

  @attr
  placeholder;

  indexWhenOpened;

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

  /**
   * @public
   * @remarks
   * HTML Attribute: value
   */
  @attr
  value;

  /**
   * When true, the control will be immutable by user interaction. See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly | readonly HTML attribute} for more information.
   * @public
   * @remarks
   * HTML Attribute: readonly
   */
  @attr({ mode: 'boolean' })
  readOnly;

  /**
   * The name of the select.
   */
  @attr
  name;

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

    this.$emit('openchange');
  }

  update() {
    if (Array.isArray(this.options)) {
      this.selectedIndex = this.options.findIndex(
        (el) => el.value === this.value
      );

      this.setSelectedOptions();

      this.displayValue = this.firstSelectedOption
        ? this.firstSelectedOption.textContent ?? this.firstSelectedOption.value
        : this.placeholder;
    }
  }

  valueChanged(prev, next) {
    if (this.$pppController.isConnected && this.options) {
      this.update();

      this.$emit('input');
      this.$emit('change', this, {
        bubbles: true,
        composed: undefined
      });
    }
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
   * Handle opening and closing the listbox when the select is clicked.
   *
   * @param e - the mouse event
   * @internal
   */
  clickHandler(e) {
    if (this.disabled) {
      return;
    }

    if (!this.slottedOptions.length) return;

    if (this.open) {
      const captured = e.target.closest(`option, [role=option]`);

      if (captured && captured.disabled) {
        return;
      }
    }

    super.clickHandler(e);
    this.open = !this.open;

    if (!this.open) {
      // OK
      this.value = this.firstSelectedOption
        ? this.firstSelectedOption.value
        : void 0;
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
        this.update();
      }
    }
  }

  /**
   *
   * @param prev - the previous selected index
   * @param next - the next selected index
   *
   * @internal
   */
  selectedIndexChanged(prev, next) {
    super.selectedIndexChanged(prev, next);
  }

  /**
   * Update the value property of the element.
   *
   * @param prev - the previous collection of slotted option elements
   * @param next - the next collection of slotted option elements
   *
   * @internal
   */
  slottedOptionsChanged(prev, next) {
    super.slottedOptionsChanged(prev, next);
    this.update();
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

    if (this.open) {
      if (this.selectedOptions)
        this.value = this.firstSelectedOption
          ? this.firstSelectedOption.value
          : void 0;
    } else
      this.update();

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
