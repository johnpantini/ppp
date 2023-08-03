/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  observable,
  css,
  html,
  Observable,
  when
} from '../vendor/fast-element.min.js';
import { isHTMLElement, display } from '../vendor/fast-utilities.js';
import { normalize } from '../design/styles.js';
import { endSlotTemplate, startSlotTemplate } from '../vendor/fast-patterns.js';
import { checkmark } from '../static/svg/sprite.js';
import {
  bodyFont,
  fontSizeBody1,
  fontWeightBody1,
  lineHeightBody1,
  paletteBlueBase,
  paletteBlueLight1,
  paletteGrayDark3,
  paletteGrayDark4,
  paletteGrayLight2,
  paletteRedBase,
  paletteRedLight1,
  themeConditional
} from '../design/design-tokens.js';

export const listboxOptionTemplate = html`
  <template
    aria-selected="${(x) => x.selected}"
    class="${(x) => (x.selected ? 'selected' : '')} ${(x) =>
      x.disabled ? 'disabled' : ''}"
    role="option"
  >
    ${when(
      (x) => x.selected,
      html`
        <span class="checked-indicator">
          <slot name="checked-indicator"> ${html.partial(checkmark)}</slot>
        </span>
      `
    )}
    ${startSlotTemplate()}
    <span class="content" part="content">
      <slot></slot>
    </span>
    ${endSlotTemplate()}
  </template>
`;

export const listboxOptionStyles = css`
  ${normalize()}
  ${display('flex')}
  :host {
    align-items: center;
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    font-weight: ${fontWeightBody1};
    line-height: ${lineHeightBody1};
    color: ${themeConditional(paletteGrayDark3, paletteGrayLight2)};
    cursor: pointer;
    height: 36px;
    outline: none;
    overflow-wrap: anywhere;
    padding: 0 12px;
    user-select: none;
    white-space: nowrap;
  }

  :host([removed]) .content {
    color: ${themeConditional(paletteRedBase, paletteRedLight1)} !important;
  }

  :host([aria-selected='true']) {
    font-weight: bold;
  }

  :host(:hover) {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark4)};
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  :host([disabled]:hover) {
    background-color: inherit;
  }

  .content {
    display: flex;
    justify-content: space-between;
    width: 100%;
    text-overflow: ellipsis;
    height: 100%;
    align-items: center;
  }

  .checked-indicator {
    color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
    width: 16px;
    height: 16px;
    margin-right: 6px;
  }
`;

export function isListboxOption(element) {
  return (
    isHTMLElement(element) &&
    (element.getAttribute('role') === 'option' ||
      element instanceof HTMLOptionElement)
  );
}

export class ListboxOption extends PPPElement {
  _value;

  proxy;

  @observable
  defaultSelected;

  dirtySelected;

  @attr({ mode: 'boolean' })
  disabled;

  @attr({ attribute: 'selected', mode: 'boolean' })
  selectedAttribute;

  @observable
  selected;

  dirtyValue;

  @attr({ attribute: 'value', mode: 'fromView' })
  initialValue;

  constructor(text, value, defaultSelected, selected) {
    super();

    this.defaultSelected = false;
    this.dirtySelected = false;
    this.selected = this.defaultSelected;
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
    if (this.$fastController.isConnected) {
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
}

export default ListboxOption.compose({
  name: 'ppp-option',
  template: listboxOptionTemplate,
  styles: listboxOptionStyles
}).define();
