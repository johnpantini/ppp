/** @decorator */

import { PPPAppearanceElement } from '../lib/ppp-element.js';
import {
  attr,
  observable,
  css,
  slotted,
  html,
  ref
} from '../vendor/fast-element.min.js';
import {
  ARIAGlobalStatesAndProperties,
  startSlotTemplate,
  endSlotTemplate
} from '../vendor/fast-patterns.js';
import { applyMixins, display } from '../vendor/fast-utilities.js';
import { ellipsis, normalize } from '../design/styles.js';
import {
  bodyFont,
  darken,
  fontSizeBody1,
  fontWeightBody1,
  lineHeightBody1,
  paletteBlack,
  paletteBlueLight1,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteGreenDark2,
  paletteGreenLight2,
  paletteRedBase,
  paletteRedDark1,
  paletteRedLight1,
  paletteRedLight2,
  paletteRedLight3,
  paletteWhite,
  spacing2,
  themeConditional
} from '../design/design-tokens.js';

export const buttonTemplate = html`
  <button
    @keydown="${(x, { event }) => {
      if (event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();
      }
    }}"
    class="control"
    part="control"
    ?autofocus="${(x) => x.autofocus}"
    ?disabled="${(x) => x.disabled}"
    name="${(x) => x.name}"
    type="${(x) => x.type}"
    value="${(x) => x.value}"
    aria-atomic="${(x) => x.ariaAtomic}"
    aria-busy="${(x) => x.ariaBusy}"
    aria-controls="${(x) => x.ariaControls}"
    aria-current="${(x) => x.ariaCurrent}"
    aria-describedBy="${(x) => x.ariaDescribedby}"
    aria-details="${(x) => x.ariaDetails}"
    aria-disabled="${(x) => x.ariaDisabled}"
    aria-errormessage="${(x) => x.ariaErrormessage}"
    aria-expanded="${(x) => x.ariaExpanded}"
    aria-flowto="${(x) => x.ariaFlowto}"
    aria-haspopup="${(x) => x.ariaHaspopup}"
    aria-hidden="${(x) => x.ariaHidden}"
    aria-invalid="${(x) => x.ariaInvalid}"
    aria-keyshortcuts="${(x) => x.ariaKeyshortcuts}"
    aria-label="${(x) => x.ariaLabel}"
    aria-labelledby="${(x) => x.ariaLabelledby}"
    aria-live="${(x) => x.ariaLive}"
    aria-owns="${(x) => x.ariaOwns}"
    aria-pressed="${(x) => x.ariaPressed}"
    aria-relevant="${(x) => x.ariaRelevant}"
    aria-roledescription="${(x) => x.ariaRoledescription}"
    ${ref('control')}
  >
    <div class="content-container">
      ${startSlotTemplate()}
      <span class="content" part="content">
        <slot ${slotted('defaultSlottedContent')}></slot>
      </span>
      ${endSlotTemplate()}
    </div>
  </button>
`;

export const buttonStyles = css`
  ${normalize()}
  ${display('inline-flex')}
  :host {
    --slotted-content-width: 16px;
    --slotted-content-height: 16px;
  }

  .control {
    appearance: none;
    padding: 0;
    margin: 0;
    background-color: transparent;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: stretch;
    border-radius: 6px;
    position: relative;
    text-decoration: none;
    cursor: pointer;
    z-index: 0;
    height: 36px;
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    line-height: ${lineHeightBody1};
    font-weight: ${fontWeightBody1};
  }

  :host(.squared) .control {
    width: 36px;
  }

  .content-container {
    display: grid;
    grid-auto-flow: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    pointer-events: none;
    position: relative;
    z-index: 0;
    padding: 0 15px;
    gap: ${spacing2};
    ${ellipsis()};
  }

  :host(.xsmall) .control {
    height: 22px;
    text-transform: uppercase;
    font-size: calc(${fontSizeBody1} - 1px);
    line-height: 1em;
    font-weight: bold;
    letter-spacing: 0.4px;
  }

  :host(.xsmall) .content-container {
    padding-left: 6px;
    padding-right: 6px;
  }

  :host(.xsmall) {
    --slotted-content-width: 14px;
    --slotted-content-height: 14px;
  }

  :host(.small) .control {
    height: 28px;
  }

  :host(.large) .control {
    height: 48px;
    font-size: 18px;
    line-height: 24px;
  }

  :host(.large) {
    --slotted-content-width: 20px;
    --slotted-content-height: 20px;
  }

  :host ::slotted(span[slot='start']),
  :host ::slotted(span[slot='end']) {
    color: ${themeConditional(paletteGrayBase, paletteGrayLight2)};
  }

  :host .control {
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    border-color: ${themeConditional(paletteGrayBase)};
    color: ${themeConditional(paletteBlack, paletteWhite)};
  }

  :host .control:hover,
  :host .control:active {
    color: ${themeConditional(paletteBlack, paletteWhite)};
    background-color: ${themeConditional(paletteWhite, paletteGrayDark1)};
    border-color: ${themeConditional(paletteGrayBase)};
  }

  :host(.primary) .control {
    background-color: ${themeConditional(paletteGreenDark2)};
    border-color: ${themeConditional(paletteGreenDark2, paletteGreenBase)};
    color: ${themeConditional(paletteWhite)};
  }

  :host(.primary) .control:hover,
  :host(.primary) .control:active {
    color: ${themeConditional(paletteWhite)};
    background-color: ${themeConditional(darken(paletteGreenDark2, 15))};
    border-color: ${themeConditional(
      darken(paletteGreenDark2, 15),
      paletteGreenBase
    )};
  }

  :host(.primary) ::slotted(span[slot='start']),
  :host(.primary) ::slotted(span[slot='end']) {
    color: ${themeConditional(paletteGreenLight2)};
  }

  :host(.danger) .control {
    background-color: ${themeConditional(paletteRedBase)};
    border-color: ${themeConditional(paletteRedBase, paletteRedLight1)};
    color: ${themeConditional(paletteWhite)};
  }

  :host(.danger) .control:hover,
  :host(.danger) .control:active {
    color: ${themeConditional(paletteWhite)};
    background-color: ${themeConditional(
      darken(paletteRedBase, 15),
      paletteRedDark1
    )};
    border-color: ${themeConditional(
      darken(paletteRedDark1, 15),
      paletteRedLight1
    )};
  }

  :host(.danger) ::slotted(span[slot='start']),
  :host(.danger) ::slotted(span[slot='end']) {
    color: ${themeConditional(paletteRedLight3, paletteRedLight2)};
  }

  ::slotted(span[slot='start']),
  ::slotted(span[slot='end']) {
    width: var(--slotted-content-width);
    height: var(--slotted-content-height);
  }

  :host .control:focus,
  :host .control:focus-visible {
    outline: none;
  }

  :host .control:focus-visible {
    border-color: ${themeConditional(paletteBlueLight1)};
  }

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .control {
    cursor: not-allowed;
    pointer-events: all;
    user-select: none;
  }

  :host([disabled]) .control {
    background-color: ${themeConditional(
      paletteGrayLight2,
      paletteGrayDark3
    )} !important;
    border-color: ${themeConditional(
      paletteGrayLight1,
      paletteGrayDark1
    )} !important;
    color: ${themeConditional(paletteGrayBase, paletteGrayDark1)} !important;
  }

  :host([disabled]) ::slotted(span[slot='start']),
  :host([disabled]) ::slotted(span[slot='end']) {
    color: ${themeConditional(paletteGrayLight1, paletteGrayDark1)} !important;
  }
`;

export class Button extends PPPAppearanceElement {
  @observable
  defaultSlottedContent;

  @attr({ mode: 'boolean' })
  disabled;
}

export class DelegatesARIAButton {
  @attr({ attribute: 'aria-expanded', mode: 'fromView' })
  ariaExpanded;

  @attr({ attribute: 'aria-pressed', mode: 'fromView' })
  ariaPressed;
}

applyMixins(Button, DelegatesARIAButton, ARIAGlobalStatesAndProperties);

export default Button.compose({
  template: buttonTemplate,
  styles: buttonStyles,
  shadowOptions: {
    delegatesFocus: true
  }
}).define();
