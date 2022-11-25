/** @decorator */

import { attr } from '../../shared/element/components/attributes.js';
import { Button as FoundationButton } from '../../shared/button.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { html } from '../../shared/element/templating/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import {
  endSlotTemplate,
  startSlotTemplate
} from '../../shared/patterns/start-end.js';
import { slotted } from '../../shared/element/templating/slotted.js';
import { appearanceBehavior } from '../../shared/utilities/behaviors.js';

import { bodyFont } from './design-tokens.js';

export const buttonTemplate = (context, definition) => html`
  <template>
    <button
      class="control"
      part="control"
      ?autofocus="${(x) => x.autofocus}"
      ?disabled="${(x) => x.disabled}"
      form="${(x) => x.formId}"
      formaction="${(x) => x.formaction}"
      formenctype="${(x) => x.formenctype}"
      formmethod="${(x) => x.formmethod}"
      formnovalidate="${(x) => x.formnovalidate}"
      formtarget="${(x) => x.formtarget}"
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
        ${startSlotTemplate(context, definition)}
        <span class="content" part="content">
          <slot ${slotted('defaultSlottedContent')}></slot>
        </span>
        ${endSlotTemplate(context, definition)}
      </div>
    </button>
  </template>
`;

export const baseButtonStyles = (context, definition) =>
  css`
    ${display('inline-flex')}

    .content-container {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      pointer-events: none;
      position: relative;
      z-index: 0;
      justify-content: space-between;
      padding-left: 12px;
      padding-right: 12px;
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
      transition: all 150ms ease-in-out;
      position: relative;
      text-decoration: none;
      cursor: pointer;
      z-index: 0;
      font-size: 14px;
      height: 36px;
      font-family: ${bodyFont};
    }

    .control:focus {
      outline: none;
    }

    .control:disabled {
      pointer-events: none;
    }

    .control:active,
    .control:focus,
    .control:hover {
      text-decoration: none;
    }

    .start,
    .end {
      display: inline-flex;
      align-items: center;
    }

    .start {
      margin-inline-end: 8px;
    }

    .end {
      margin-inline-start: 8px;
    }
  `;

// TODO - focus styles
export const defaultButtonStyles = (context, definition) => css`
  :host([appearance='default']) .control {
    background-color: rgb(249, 251, 250);
    border: 1px solid rgb(136, 147, 151);
    color: rgb(28, 45, 56);
  }

  :host([appearance='default']) .control:hover,
  :host([appearance='default']) .control:active {
    background-color: rgb(255, 255, 255);
    box-shadow: rgb(232 237 235) 0 0 0 3px;
  }

  :host([appearance='default']) .start,
  :host([appearance='default']) .end {
    color: rgb(136, 147, 151);
  }
`;

export const primaryButtonStyles = (context, definition) => css`
  :host([appearance='primary']) .control {
    background-color: #00684a;
    border-color: #00684a;
    color: #ffffff;
  }

  :host([appearance='primary']) .control:hover,
  :host([appearance='primary']) .control:active {
    color: #ffffff;
    background-color: #00593f;
    border-color: #00593f;
    box-shadow: 0 0 0 3px #c0fae6;
  }

  :host([appearance='primary']) .start,
  :host([appearance='primary']) .end {
    color: #c0fae6;
  }
`;

export const dangerButtonStyles = (context, definition) => css`
  :host([appearance='danger']) .control {
    border: 1px solid rgb(219, 48, 48);
    background-color: rgb(219, 48, 48);
    color: #ffffff;
  }

  :host([appearance='danger']) .control:hover,
  :host([appearance='danger']) .control:active {
    color: #ffffff;
    background-color: rgb(200, 34, 34);
    border-color: rgb(200, 34, 34);
    box-shadow: rgb(255 234 229) 0 0 0 3px;
  }

  :host([appearance='danger']) .start,
  :host([appearance='danger']) .end {
    color: rgb(255, 234, 229);
  }
`;

export const disabledButtonStyles = (context, definition) =>
  css`
    :host([disabled]) {
      pointer-events: none;
    }

    :host([disabled]) button.control,
    :host([disabled]) button.control:hover {
      pointer-events: none;
      cursor: not-allowed;
      background-color: rgb(232, 237, 235);
      border-color: rgb(193, 199, 198);
      color: rgb(136, 147, 151);
    }

    :host([disabled]) .content-container .start,
    :host([disabled]) .content-container .end {
      color: rgb(184, 196, 194);
    }
  `;

// TODO - design tokens
export const buttonStyles = (context, definition) =>
  css`
    ${baseButtonStyles(context, definition)}
    ${disabledButtonStyles(context, definition)}

    :host(.xsmall) .control {
      height: 22px;
      text-transform: uppercase;
      font-size: 12px;
      line-height: 1em;
      font-weight: bold;
      letter-spacing: 0.4px;
    }

    :host(.xsmall) .content-container {
      padding-left: 6px;
      padding-right: 6px;
    }

    :host(.small) .control {
      height: 28px;
    }

    :host(.large) .control {
      height: 48px;
      font-size: 18px;
      line-height: 24px;
    }
  `.withBehaviors(
    appearanceBehavior('default', defaultButtonStyles(context, definition)),
    appearanceBehavior('primary', primaryButtonStyles(context, definition)),
    appearanceBehavior('danger', dangerButtonStyles(context, definition))
  );

export class Button extends FoundationButton {
  @attr
  appearance;

  @attr
  size;

  appearanceChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.classList.add(newValue);
      this.classList.remove(oldValue);
    }
  }

  sizeChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.classList.add(newValue);
      this.classList.remove(oldValue);
    }
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();

    if (!this.appearance) {
      this.appearance = 'default';
    }
  }
}

/**
 *
 * @public
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus | delegatesFocus}
 */
export default Button.compose({
  template: buttonTemplate,
  styles: buttonStyles,
  shadowOptions: {
    delegatesFocus: true
  }
});
