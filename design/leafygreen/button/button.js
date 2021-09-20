/** @decorator */

import { attr } from '../../../lib/element/components/attributes.js';
import { Button as FoundationButton } from '../../../lib/button/button.js';
import { css } from '../../../lib/element/styles/css.js';
import { display } from '../../../lib/utilities/style/display.js';
import { html } from '../../../lib/element/templating/template.js';
import { ref } from '../../../lib/element/templating/ref.js';
import {
  endSlotTemplate,
  startSlotTemplate
} from '../../../lib/patterns/start-end.js';
import { slotted } from '../../../lib/element/templating/slotted.js';
import { appearanceBehavior } from '../../../lib/utilities/behaviors.js';

import { bodyFont } from '../design-tokens.js';

// TODO - ripple
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
      <div class="ripple-container"></div>
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
    .ripple-container {
      overflow: hidden;
      border-radius: 3px;
      position: absolute;
      inset: 0;
    }

    .content-container {
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      height: 100%;
      width: 100%;
      pointer-events: none;
      position: relative;
      z-index: 0;
      -webkit-box-pack: justify;
      justify-content: space-between;
      padding-left: 12px;
      padding-right: 12px;
    }

    .control {
      appearance: none;
      padding: 0;
      margin: 0;
      background-color: transparent;
      border: 0 solid transparent;
      display: inline-flex;
      align-items: stretch;
      border-radius: 4px;
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
      -webkit-box-align: center;
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
    border: 1px solid rgb(137, 151, 155);
    box-shadow: rgb(6 22 33 / 30%) 0 1px 2px;
    color: rgb(61, 79, 88);
  }

  :host([appearance='default']) .control:hover,
  :host([appearance='default']) .control:active {
    color: rgb(61, 79, 88);
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(93, 108, 116);
    box-shadow: rgb(0 0 0 / 30%) 0 4px 4px, rgb(231 238 236) 0 0 0 3px;
  }

  :host([appearance='default']) .start,
  :host([appearance='default']) .end {
    color: rgb(93, 108, 116);
  }
`;

export const primaryButtonStyles = (context, definition) => css`
  :host([appearance='primary']) .control {
    background-color: #09804c;
    box-shadow: 0 2px 3px rgb(19 170 82 / 40%);
    color: #ffffff;
  }

  :host([appearance='primary']) .control:hover,
  :host([appearance='primary']) .control:active {
    color: #ffffff;
    background-color: #116149;
    box-shadow: 0 2px 3px rgb(19 170 82 / 40%), 0 0 0 3px #c3e7ca;
  }

  :host([appearance='primary']) .start,
  :host([appearance='primary']) .end {
    color: #e4f4e4;
  }
`;

export const disabledButtonStyles = (context, definition) =>
  css`
    :host(:disabled) button.control,
    :host(:disabled) button.control:hover {
      background-color: rgb(231, 238, 236);
      border: 1px solid rgb(231, 238, 236);
      box-shadow: rgb(184 196 194) 0 0 0 1px;
      cursor: not-allowed;
      color: rgb(93, 108, 116);
    }

    :host(:disabled) .content-container .start,
    :host(:disabled) .content-container .end {
      color: rgb(184, 196, 194);
    }
  `;

// TODO - design tokens
export const buttonStyles = (context, definition) =>
  css`
    ${baseButtonStyles(context, definition)}
    ${disabledButtonStyles(context, definition)}
    slot[name='end']::slotted(.spinner-icon) {
      color: #13aa52;
    }

    .xsmall {
      height: 22px;
      text-transform: uppercase;
      font-size: 12px;
      line-height: 1em;
      font-weight: bold;
      letter-spacing: 0.4px;
    }

    .small {
      height: 28px;
    }

    .large {
      height: 48px;
      font-size: 18px;
      line-height: 24px;
    }
  `.withBehaviors(
    appearanceBehavior('default', defaultButtonStyles(context, definition)),
    appearanceBehavior('primary', primaryButtonStyles(context, definition))
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
export const button = Button.compose({
  baseName: 'button',
  template: buttonTemplate,
  styles: buttonStyles,
  shadowOptions: {
    delegatesFocus: true
  }
});
