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
import { normalize } from '../design/styles.js';
import {
  bodyFont,
  fontSizeBody1,
  fontWeightBody1,
  lineHeightBody1,
  paletteBlack,
  paletteBlueBase,
  paletteBlueLight1,
  paletteGrayBase,
  paletteGrayDark2,
  paletteGrayLight2,
  paletteWhite,
  themeConditional
} from '../design/design-tokens.js';
import { checkedIndicator } from '../static/svg/sprite.js';

export const checkboxTemplate = html`
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
        ${html.partial(checkedIndicator)}
      </slot>
      <slot name="indeterminate-indicator">
        <div part="indeterminate-indicator"
             class="indeterminate-indicator"></div
      </slot>
    </div>
    <label
      ?hidden="${(x) => x.standalone}"
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

export const checkboxStyles = css`
  ${normalize()}
  ${display('inline-flex')}
  :host {
    align-items: center;
    outline: none;
    user-select: none;
    cursor: pointer;
  }

  :host .checked-indicator path {
    fill: transparent;
  }

  .control {
    position: relative;
    width: 14px;
    height: 14px;
    outline: none;
    cursor: inherit;
    border-radius: 3px;
    border: 2px solid ${themeConditional(paletteGrayDark2, paletteGrayBase)};
    overflow: hidden;
  }

  .label {
    margin-left: 10px;
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    font-weight: ${fontWeightBody1};
    line-height: ${lineHeightBody1};
    cursor: inherit;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  .checked-indicator {
    width: 100%;
    height: 100%;
    display: block;
    opacity: 0;
    pointer-events: none;
  }

  .checked-indicator path {
    stroke: ${paletteWhite};
  }

  :host([aria-checked='true']:not(.indeterminate):not([disabled])) .control {
    border: 2px solid ${themeConditional(paletteBlueBase, paletteBlueLight1)};
    background-color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  :host([aria-checked='true']:not(.indeterminate)) .checked-indicator,
  :host(.indeterminate) .indeterminate-indicator {
    opacity: 1;
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  :host([disabled]) .checked-indicator path {
  }

  :host([disabled]) .control {
  }

  :host([disabled][checked]) .control {
  }
`;

export class Checkbox extends PPPElement {
  @attr
  name;

  @attr({ mode: 'boolean' })
  checked;

  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  @attr({ mode: 'boolean' })
  standalone;

  @observable
  defaultSlottedNodes;

  @observable
  indeterminate;

  @attr({ mode: 'boolean' })
  disabled;

  constructor() {
    super();

    this.checked = false;
    this.indeterminate = false;

    this.keypressHandler = (e) => {
      switch (e.key) {
        case keySpace:
          this.checked = !this.checked;

          break;
      }
    };

    this.clickHandler = () => {
      if (!this.disabled && !this.readOnly) {
        this.checked = !this.checked;
      }
    };
  }

  checkedChanged() {
    this.$emit('change', this);
  }
}

export default Checkbox.compose({
  template: checkboxTemplate,
  styles: checkboxStyles
}).define();
