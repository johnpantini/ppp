/** @decorator */

import { attr } from './element/components/attributes.js';
import { Observable, observable } from './element/observation/observable.js';
import { FoundationElement } from './foundation-element.js';
import { ARIAGlobalStatesAndProperties } from './patterns/aria-global.js';
import { StartEnd } from './patterns/start-end.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { isHTMLElement } from './web-utilities/dom.js';
import { uniqueId } from './utilities/unique-id.js';
import { html } from './element/templating/template.js';
import { when } from './element/templating/when.js';
import { slotted } from './element/templating/slotted.js';
import { endSlotTemplate, startSlotTemplate } from './patterns/start-end.js';

/**
 * The template for the Listbox component.
 * @public
 */
export const listboxTemplate = (context, definition) => html`
  <template
    aria-activedescendant="${(x) => x.ariaActiveDescendant}"
    class="listbox"
    role="${(x) => x.role}"
    tabindex="${(x) => (!x.disabled ? '0' : null)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
    @focusin="${(x, c) => x.focusinHandler(c.event)}"
    @keydown="${(x, c) => x.keydownHandler(c.event)}"
    @mousedown="${(x, c) => x.mousedownHandler(c.event)}"
  >
    <slot
      ${slotted({
        filter: Listbox.slottedOptionFilter,
        flatten: true,
        property: 'slottedOptions'
      })}
    ></slot>
  </template>
`;

/**
 * The template for the ListboxOption component.
 * @public
 */
export const listboxOptionTemplate = (context, definition) => html`
  <template
    aria-selected="${(x) => x.selected}"
    class="${(x) => (x.selected ? 'selected' : '')} ${(x) =>
      x.disabled ? 'disabled' : ''}"
    role="option"
  >
    ${startSlotTemplate(context, definition)}
    <span class="content" part="content">
      <slot></slot>
    </span>
    ${when(
      (x) => x.selected,
      html`
        <slot name="checked-indicator">
          ${definition.selectedIndicator ?? ''}
        </slot>
      `
    )}
    ${endSlotTemplate(context, definition)}
  </template>
`;

/**
 * Determines if the element is a ListboxOption
 *
 * @param element - the element to test.
 * @public
 */
export function isListboxOption(element) {
  return (
    isHTMLElement(element) &&
    (element.getAttribute('role') === 'option' ||
      element instanceof HTMLOptionElement)
  );
}

/**
 * An Option Custom HTML Element.
 * Implements {@link https://www.w3.org/TR/wai-aria-1.1/#option | ARIA option }.
 *
 * @public
 */
export class ListboxOption extends FoundationElement {
  /**
   * @internal
   */
  _value;

  /**
   * @internal
   */
  proxy;

  /**
   * The defaultSelected state of the option.
   * @public
   */
  @observable
  defaultSelected;

  /**
   * Tracks whether the "selected" property has been changed.
   * @internal
   */
  dirtySelected;

  /**
   * The disabled state of the option.
   * @public
   * @remarks
   * HTML Attribute: disabled
   */
  @attr({ mode: 'boolean' })
  disabled;

  /**
   * The selected attribute value. This sets the initial selected value.
   *
   * @public
   * @remarks
   * HTML Attribute: selected
   */
  @attr({ attribute: 'selected', mode: 'boolean' })
  selectedAttribute;

  /**
   * The checked state of the control.
   *
   * @public
   */
  @observable
  selected;

  /**
   * Track whether the value has been changed from the initial value
   */
  dirtyValue;

  /**
   * The initial value of the option. This value sets the `value` property
   * only when the `value` property has not been explicitly set.
   *
   * @remarks
   * HTML Attribute: value
   */
  @attr({ attribute: 'value', mode: 'fromView' })
  initialValue;

  constructor(text, value, defaultSelected, selected) {
    super();
    /**
     * The defaultSelected state of the option.
     * @public
     */
    this.defaultSelected = false;
    /**
     * Tracks whether the "selected" property has been changed.
     * @internal
     */
    this.dirtySelected = false;
    /**
     * The checked state of the control.
     *
     * @public
     */
    this.selected = this.defaultSelected;
    /**
     * Track whether the value has been changed from the initial value
     */
    this.dirtyValue = false;
    this.initialValue = this.initialValue ?? '';

    if (text) {
      this.textContent = text;
    }

    if (value) {
      this.initialValue = value;
    }

    if (defaultSelected) {
      this.defaultSelected = defaultSelected;
    }

    if (selected) {
      this.selected = selected;
    }

    this.proxy = new Option(
      `${this.textContent}`,
      this.initialValue,
      this.defaultSelected,
      this.selected
    );
    this.proxy.disabled = this.disabled;
  }

  defaultSelectedChanged() {
    if (!this.dirtySelected) {
      this.selected = this.defaultSelected;

      if (this.proxy instanceof HTMLOptionElement) {
        this.proxy.selected = this.defaultSelected;
      }
    }
  }

  disabledChanged(prev, next) {
    if (this.proxy instanceof HTMLOptionElement) {
      this.proxy.disabled = this.disabled;
    }
  }

  selectedAttributeChanged() {
    this.defaultSelected = this.selectedAttribute;

    if (this.proxy instanceof HTMLOptionElement) {
      this.proxy.defaultSelected = this.defaultSelected;
    }
  }

  selectedChanged() {
    if (this.$pppController.isConnected) {
      if (!this.dirtySelected) {
        this.dirtySelected = true;
      }

      if (this.proxy instanceof HTMLOptionElement) {
        this.proxy.selected = this.selected;
      }
    }
  }

  initialValueChanged(previous, next) {
    // If the value is clean and the component is connected to the DOM
    // then set value equal to the attribute value.
    if (!this.dirtyValue) {
      this.value = this.initialValue;
      this.dirtyValue = false;
    }
  }

  get label() {
    return this.value ? this.value : this.textContent ? this.textContent : '';
  }

  get text() {
    return this.textContent;
  }

  set value(next) {
    this._value = next;
    this.dirtyValue = true;

    if (this.proxy instanceof HTMLElement) {
      this.proxy.value = next;
    }

    Observable.notify(this, 'value');
  }

  get value() {
    Observable.track(this, 'value');

    return this._value;
  }

  get form() {
    return this.proxy ? this.proxy.form : null;
  }
}

applyMixins(ListboxOption, StartEnd);

/**
 * Listbox role.
 * @public
 */
export let ListboxRole;
(function (ListboxRole) {
  ListboxRole['listbox'] = 'listbox';
})(ListboxRole || (ListboxRole = {}));

/**
 * A Listbox Custom HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#listbox | ARIA listbox }.
 *
 * @public
 */
export class Listbox extends FoundationElement {
  /**
   *
   * @internal
   */
  #options;

  /**
   * The index of the selected option
   *
   * @public
   */
  @observable
  selectedIndex;

  /**
   * @internal
   */
  @observable
  typeaheadBuffer;

  /**
   * The role of the element.
   *
   * @public
   * @remarks
   * HTML Attribute: role
   */
  @attr
  role;

  /**
   * The disabled state of the listbox.
   *
   * @public
   * @remarks
   * HTML Attribute: disabled
   */
  @attr({ mode: 'boolean' })
  disabled;

  /**
   * @internal
   */
  @observable
  slottedOptions;

  /**
   * A collection of the selected options.
   *
   * @public
   */
  @observable
  selectedOptions;

  constructor() {
    super(...arguments);
    /**
     * The index of the selected option
     *
     * @public
     */
    this.selectedIndex = -1;
    /**
     * @internal
     */
    this.typeaheadBuffer = '';
    /**
     * @internal
     */
    this.typeaheadTimeout = -1;
    /**
     * Flag for the typeahead timeout expiration.
     *
     * @internal
     */
    this.typeAheadExpired = true;
    /**
     * The role of the element.
     *
     * @public
     * @remarks
     * HTML Attribute: role
     */
    this.role = ListboxRole.listbox;
    /**
     * The internal unfiltered list of selectable options.
     *
     * @internal
     */
    this.#options = [];
    /**
     * A collection of the selected options.
     *
     * @public
     */
    this.selectedOptions = [];
    /**
     * A standard `click` event creates a `focus` event before firing, so a
     * `mousedown` event is used to skip that initial focus.
     *
     * @internal
     */
    this.shouldSkipFocus = false;
    /**
     * Move focus to an option whose label matches characters typed by the user.
     * Consecutive keystrokes are batched into a buffer of search text used
     * to match against the set of options.  If TYPE_AHEAD_TIMEOUT_MS passes
     * between consecutive keystrokes, the search restarts.
     *
     * @param key - the key to be evaluated
     */
    this.handleTypeAhead = (key) => {
      if (this.typeaheadTimeout) {
        window.clearTimeout(this.typeaheadTimeout);
      }

      this.typeaheadTimeout = window.setTimeout(
        () => (this.typeAheadExpired = true),
        Listbox.TYPE_AHEAD_TIMEOUT_MS
      );

      if (key.length > 1) {
        return;
      }

      this.typeaheadBuffer = `${
        this.typeAheadExpired ? '' : this.typeaheadBuffer
      }${key}`;
    };
  }

  selectedIndexChanged(prev, next) {
    this.setSelectedOptions();
  }

  typeaheadBufferChanged(prev, next) {
    if (this.$pppController.isConnected) {
      const pattern = this.typeaheadBuffer.replace(
        /[.*+\-?^${}()|[\]\\]/g,
        '\\$&'
      );
      const re = new RegExp(`^${pattern}`, 'gi');
      const filteredOptions = this.options.filter((o) =>
        o.text.trim().match(re)
      );

      if (filteredOptions.length) {
        const selectedIndex = this.options.indexOf(filteredOptions[0]);

        if (selectedIndex > -1) {
          this.selectedIndex = selectedIndex;
        }
      }

      this.typeAheadExpired = false;
    }
  }

  slottedOptionsChanged(prev, next) {
    if (this.$pppController.isConnected) {
      this.options = next.reduce((options, item) => {
        if (isListboxOption(item)) {
          options.push(item);
        }

        return options;
      }, []);

      this.options.forEach((o) => {
        o.id = o.id || uniqueId('option-');
      });
      this.setSelectedOptions();
      this.setDefaultSelectedOption();
    }
  }

  /**
   * The list of options.
   *
   * @public
   */
  get options() {
    Observable.track(this, 'options');

    return this.#options;
  }

  set options(value) {
    this.#options = value;
    Observable.notify(this, 'options');
  }

  selectedOptionsChanged(prev, next) {
    if (this.$pppController.isConnected) {
      this.options.forEach((o) => {
        o.selected = next.includes(o);
      });
    }
  }

  /**
   * @internal
   */
  get firstSelectedOption() {
    return this.selectedOptions[0];
  }

  /**
   * @internal
   */
  focusAndScrollOptionIntoView() {
    if (this.contains(document.activeElement) && this.firstSelectedOption) {
      this.firstSelectedOption.focus();
      requestAnimationFrame(() => {
        this.firstSelectedOption.scrollIntoView({ block: 'nearest' });
      });
    }
  }

  /**
   * @internal
   */
  focusinHandler(e) {
    if (!this.shouldSkipFocus && e.target === e.currentTarget) {
      this.setSelectedOptions();
      this.focusAndScrollOptionIntoView();
    }

    this.shouldSkipFocus = false;
  }

  /**
   * Prevents `focusin` events from firing before `click` events when the
   * element is unfocused.
   *
   * @internal
   */
  mousedownHandler(e) {
    this.shouldSkipFocus = !this.contains(document.activeElement);

    return true;
  }

  /**
   * @internal
   */
  setDefaultSelectedOption() {
    if (this.options && this.$pppController.isConnected) {
      const selectedIndex = this.options.findIndex(
        (el) => el.getAttribute('selected') !== null
      );

      if (selectedIndex !== -1) {
        this.selectedIndex = selectedIndex;

        return;
      }

      this.selectedIndex = 0;
    }
  }

  /**
   * Sets an option as selected and gives it focus.
   *
   * @public
   */
  setSelectedOptions() {
    if (this.$pppController.isConnected && this.options) {
      const selectedOption = this.options[this.selectedIndex] || null;

      this.selectedOptions = this.options.filter((el) =>
        el.isSameNode(selectedOption)
      );
      this.ariaActiveDescendant = this.firstSelectedOption
        ? this.firstSelectedOption.id
        : '';
      this.focusAndScrollOptionIntoView();
    }
  }

  /**
   * Moves focus to the first selectable option
   *
   * @public
   */
  selectFirstOption() {
    if (!this.disabled) {
      this.selectedIndex = 0;
    }
  }

  /**
   * Moves focus to the last selectable option
   *
   * @internal
   */
  selectLastOption() {
    if (!this.disabled) {
      this.selectedIndex = this.options.length - 1;
    }
  }

  /**
   * Moves focus to the next selectable option
   *
   * @internal
   */
  selectNextOption() {
    if (
      !this.disabled &&
      this.options &&
      this.selectedIndex < this.options.length - 1
    ) {
      this.selectedIndex += 1;
    }
  }

  get length() {
    if (this.options) {
      return this.options.length;
    }

    return 0;
  }

  /**
   * Moves focus to the previous selectable option
   *
   * @internal
   */
  selectPreviousOption() {
    if (!this.disabled && this.selectedIndex > 0) {
      this.selectedIndex = this.selectedIndex - 1;
    }
  }

  /**
   * Handles click events for listbox options
   *
   * @internal
   */
  clickHandler(e) {
    const captured = e.target.closest(`option, [role=option]`);

    if (captured && !captured.disabled) {
      this.selectedIndex = this.options.indexOf(captured);

      return true;
    }
  }

  /**
   * Handles keydown actions for listbox navigation and typeahead
   *
   * @internal
   */
  keydownHandler(e) {
    if (this.disabled) {
      return true;
    }

    this.shouldSkipFocus = false;

    const key = e.key;

    switch (key) {
      // Select the first available option
      case 'Home': {
        if (!e.shiftKey) {
          e.preventDefault();
          this.selectFirstOption();
        }

        break;
      }
      // Select the next selectable option
      case 'ArrowDown': {
        if (!e.shiftKey) {
          e.preventDefault();
          this.selectNextOption();
        }

        break;
      }
      // Select the previous selectable option
      case 'ArrowUp': {
        if (!e.shiftKey) {
          e.preventDefault();
          this.selectPreviousOption();
        }

        break;
      }
      // Select the last available option
      case 'End': {
        e.preventDefault();
        this.selectLastOption();

        break;
      }
      case 'Tab': {
        this.focusAndScrollOptionIntoView();

        return true;
      }
      case 'Enter':
      case 'Escape': {
        return true;
      }
      case ' ': {
        if (this.typeAheadExpired) {
          return true;
        }
      }
      // Send key to Typeahead handler
      default: {
        if (key.length === 1) {
          this.handleTypeAhead(`${key}`);
        }

        return true;
      }
    }
  }
}

/**
 * Typeahead timeout in milliseconds.
 *
 * @internal
 */
Listbox.TYPE_AHEAD_TIMEOUT_MS = 1000;
/**
 * A static filter to include only enabled elements
 *
 * @param n - element to filter
 * @public
 */
Listbox.slottedOptionFilter = (n) =>
  isListboxOption(n) && !n.disabled && !n.hidden;

/**
 * Includes ARIA states and properties relating to the ARIA listbox role
 *
 * @public
 */
export class DelegatesARIAListbox {
  /**
   * See {@link https://www.w3.org/WAI/PF/aria/roles#listbox} for more information
   * @public
   * @remarks
   * HTML Attribute: aria-activedescendant
   */
  @observable
  ariaActiveDescendant;

  /**
   * See {@link https://www.w3.org/WAI/PF/aria/roles#listbox} for more information
   * @public
   * @remarks
   * HTML Attribute: aria-disabled
   */
  @observable
  ariaDisabled;

  /**
   * See {@link https://www.w3.org/WAI/PF/aria/roles#listbox} for more information
   * @public
   * @remarks
   * HTML Attribute: aria-expanded
   */
  @observable
  ariaExpanded;

  constructor() {
    /**
     * See {@link https://www.w3.org/WAI/PF/aria/roles#listbox} for more information
     * @public
     * @remarks
     * HTML Attribute: aria-activedescendant
     */
    this.ariaActiveDescendant = '';
  }
}

applyMixins(DelegatesARIAListbox, ARIAGlobalStatesAndProperties);
applyMixins(Listbox, DelegatesARIAListbox);
