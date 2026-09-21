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
  fontWeightBody1,
  lineHeightBody1,
  paletteBlack,
  paletteBlueBase,
  paletteBlueLight1,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayLight1,
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
        x?.defaultSlottedNodes?.length ? 'label' : 'label label hidden'}"
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
    font-weight: ${fontWeightBody1};
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
  }

  :host([disabled]) .control,
  :host([disabled]) .label {
    pointer-events: none;
  }

  :host([disabled]) .checked-indicator {
    pointer-events: none;
    border-color: ${themeConditional(paletteGrayLight1, paletteGrayDark1)};
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
  }

  :host([disabled][aria-checked='true']) .checked-indicator {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  :host([disabled][aria-checked='true']) .checked-indicator::after {
    background-color: ${themeConditional(paletteGrayLight1, paletteGrayDark2)};
  }

  :host([disabled]) .label {
    color: ${themeConditional(paletteGrayLight1, paletteGrayBase)} !important;
  }
`;

/** Radio choice supporting grouped or independent selection with keyboard access. */
export class Radio extends PPPElement {
  /** @type {boolean} Current radio selection. */
  @attr({ mode: 'boolean' })
  checked;

  /** @type {boolean} Prevents changes from keyboard and pointer interaction. */
  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  /** @type {string} Radio group name. */
  @attr
  name;

  /** @type {string} Value represented by this choice. */
  @attr
  value;

  /** @type {boolean} Disables selection and automatic keyboard focus. */
  @attr({ mode: 'boolean' })
  disabled;

  /** @type {Node[]} Nodes assigned to the label slot. */
  @observable
  defaultSlottedNodes;

  /** Initializes the value and guarded space-key selection handler. */
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

  /** Makes an enabled standalone radio focusable unless tabindex was supplied. */
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

  /** @returns {boolean} Whether an ancestor exposes the radiogroup role. */
  isInsideRadioGroup() {
    return !!this.closest('[role=radiogroup]');
  }

  /** Selects an unchecked enabled radio when editing is allowed. */
  clickHandler() {
    if (!this.disabled && !this.readOnly && !this.checked) {
      this.checked = true;
    }
  }

  /** @param {boolean | undefined} prev Previous state; initial setup does not emit change. @returns {void} */
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

/** Radio behavior presented with the boxed-choice template. */
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
