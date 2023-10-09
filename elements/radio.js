/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  observable,
  css,
  slotted,
  html
} from '../vendor/fast-element.min.js';
import { display, keySpace } from '../vendor/fast-utilities.js';
import { ellipsis, normalize } from '../design/styles.js';
import { whitespaceFilter } from '../vendor/fast-utilities.js';
import {
  bodyFont,
  fontSizeBody1,
  lineHeightBody1,
  paletteBlack,
  paletteBlueBase,
  paletteBlueLight1,
  paletteGrayBase,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteWhite,
  themeConditional
} from '../design/design-tokens.js';

export const radioTemplate = html`
  <template
    role="radio"
    aria-checked="${(x) => x.checked}"
    aria-required="${(x) => x.required}"
    aria-disabled="${(x) => x.disabled}"
    aria-readonly="${(x) => x.readOnly}"
    @keypress="${(x, c) => x.keypressHandler(c.event)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
  >
    <div part="control" class="control">
      <slot name="checked-indicator">
        <div part="checked-indicator" class="checked-indicator"></div>
      </slot>
    </div>
    <label
      part="label"
      class="${(x) =>
        x.defaultSlottedNodes && x.defaultSlottedNodes.length
          ? 'label'
          : 'label label hidden'}"
    >
      <slot
        ${slotted({
          property: 'defaultSlottedNodes',
          filter: whitespaceFilter
        })}
      ></slot>
    </label>
  </template>
`;

export const radioStyles = css`
  ${normalize()}
  ${display('inline-flex')}
  :host {
    user-select: none;
    outline: none;
    cursor: pointer;
  }

  :host(:focus-visible) .control {
    border: 2px solid ${themeConditional(paletteGrayDark3, paletteGrayLight2)};
    border-radius: 100px;
  }

  .control {
    display: inline-flex;
    position: relative;
    align-items: stretch;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  .label {
    margin-left: 10px;
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    line-height: ${lineHeightBody1};
    font-weight: 700;
    cursor: pointer;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  .checked-indicator {
    position: absolute;
    inset: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 100%;
    border-style: solid;
    border-color: ${themeConditional(paletteGrayDark2, paletteGrayBase)};
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    border-width: 3px;
  }

  .checked-indicator::before {
    content: '';
    position: absolute;
    border-radius: 100%;
  }

  .checked-indicator::after {
    width: 8px;
    height: 8px;
    content: '';
    background-color: ${paletteWhite};
    border-radius: 100%;
    transform: scale(0);
  }

  :host([aria-checked='true']) .checked-indicator {
    background-color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
    border-color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  :host([aria-checked='true']) .checked-indicator::after {
    transform: scale(1);
  }

  :host([disabled]) {
    cursor: not-allowed;
    pointer-events: none;
  }

  :host([disabled]) .control,
  :host([disabled]) .label {
    pointer-events: none;
  }

  :host([disabled]) .checked-indicator {
    pointer-events: none;
    border-color: ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark3)};
  }

  :host([disabled][aria-checked='true']) .checked-indicator {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark3)};
  }

  :host([disabled][aria-checked='true']) .checked-indicator:after {
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
  }
`;

export class Radio extends PPPElement {
  @attr({ mode: 'boolean' })
  checked;

  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  @attr
  name;

  @attr
  value;

  @attr({ mode: 'boolean' })
  disabled;

  @observable
  defaultSlottedNodes;

  constructor() {
    super();

    this.value = '';

    this.keypressHandler = (e) => {
      switch (e.key) {
        case keySpace:
          if (!this.checked && !this.readOnly && !this.disabled) {
            this.checked = true;
          }

          return;
      }

      return true;
    };
  }

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

  clickHandler() {
    if (!this.disabled && !this.readOnly && !this.checked) {
      this.checked = true;
    }
  }

  checkedChanged(prev) {
    if (prev !== undefined) {
      this.$emit('change', this);
    }
  }
}

export const boxRadioTemplate = html`
  <template
    role="radio"
    aria-checked="${(x) => x.checked}"
    aria-required="${(x) => x.required}"
    aria-disabled="${(x) => x.disabled}"
    aria-readonly="${(x) => x.readOnly}"
    @keypress="${(x, c) => x.keypressHandler(c.event)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
  >
    <div class="control">
      <div class="text">
        <slot></slot>
      </div>
    </div>
  </template>
`;

export const boxRadioStyles = css`
  :host(:focus-visible) {
    outline: none;
  }

  .control {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    text-align: center;
    overflow-wrap: break-word;
    cursor: pointer;
    pointer-events: auto;
    padding: 16px 24px;
    border-radius: 4px;
    flex: 1 1 0;
  }

  .text {
    ${ellipsis()};
  }

  :host([disabled]) .control {
    cursor: not-allowed;
  }

  :host(:not([checked]):not([disabled])) .control:hover {
  }

  :host([checked]) .control {
  }
`;

export class BoxRadio extends Radio {}

export default {
  RadioComposition: Radio.compose({
    template: radioTemplate,
    styles: radioStyles
  }).define(),
  BoxRadioComposition: BoxRadio.compose({
    template: boxRadioTemplate,
    styles: boxRadioStyles
  }).define()
};
