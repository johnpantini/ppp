/** @decorator */

import {
  TextArea as FoundationTextArea,
  TextAreaResize
} from '../../../lib/text-area/text-area.js';
import { attr } from '../../../lib/element/components/attributes.js';
import { observable } from '../../../lib/element/observation/observable.js';
import { css } from '../../../lib/element/styles/css.js';
import { display } from '../../../lib/utilities/style/display.js';
import { html } from '../../../lib/element/templating/template.js';
import { ref } from '../../../lib/element/templating/ref.js';
import { when } from '../../../lib/element/templating/when.js';

import { bodyFont } from '../design-tokens.js';

export const textAreaTemplate = (context, definition) => html`
  <template
    class="
            ${(x) => (x.readOnly ? 'readonly' : '')}
            ${(x) =>
      x.resize !== TextAreaResize.none ? `resize-${x.resize}` : ''}"
  >
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        <textarea
          part="control"
          class="control"
          id="control"
          ?autofocus="${(x) => x.autofocus}"
          cols="${(x) => x.cols}"
          ?disabled="${(x) => x.disabled}"
          list="${(x) => x.list}"
          maxlength="${(x) => x.maxlength}"
          minlength="${(x) => x.minlength}"
          name="${(x) => x.name}"
          placeholder="${(x) => x.placeholder}"
          ?readonly="${(x) => x.readOnly}"
          ?required="${(x) => x.required}"
          rows="${(x) => x.rows}"
          ?spellcheck="${(x) => x.spellcheck}"
          :value="${(x) => x.value}"
          aria-atomic="${(x) => x.ariaAtomic}"
          aria-busy="${(x) => x.ariaBusy}"
          aria-controls="${(x) => x.ariaControls}"
          aria-current="${(x) => x.ariaCurrent}"
          aria-describedBy="${(x) => x.ariaDescribedby}"
          aria-details="${(x) => x.ariaDetails}"
          aria-disabled="${(x) => x.ariaDisabled}"
          aria-errormessage="${(x) => x.ariaErrormessage}"
          aria-flowto="${(x) => x.ariaFlowto}"
          aria-haspopup="${(x) => x.ariaHaspopup}"
          aria-hidden="${(x) => x.ariaHidden}"
          aria-invalid="${(x) => x.ariaInvalid}"
          aria-keyshortcuts="${(x) => x.ariaKeyshortcuts}"
          aria-label="${(x) => x.ariaLabel}"
          aria-labelledby="${(x) => x.ariaLabelledby}"
          aria-live="${(x) => x.ariaLive}"
          aria-owns="${(x) => x.ariaOwns}"
          aria-relevant="${(x) => x.ariaRelevant}"
          aria-roledescription="${(x) => x.ariaRoledescription}"
          @input="${(x, c) => x.handleTextInput()}"
          @change="${(x) => x.handleChange()}"
          ${ref('control')}
        ></textarea>
        <div class="interaction-ring"></div>
      </div>
    </div>
    ${when(
      (x) => x.state === 'error' && !!x.errorMessage,
      html` <div class="helper error">
        <label>${(x) => x.errorMessage}</label>
      </div>`
    )}
  </template>
`;

// TODO - design tokens, scrollbars
export const textAreaStyles = (context, definition) => css`
  ${display('flex')}
  :host {
    flex-direction: column;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .label {
    font-size: 14px;
    font-weight: bold;
    line-height: 16px;
    padding-bottom: 4px;
    color: rgb(61, 79, 88);
  }

  .description {
    font-size: 14px;
    line-height: 16px;
    font-weight: normal;
    padding-bottom: 4px;
    margin-top: 0;
    margin-bottom: 0;
    color: rgb(93, 108, 116);
  }

  .root {
    position: relative;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    z-index: 0;
  }

  .root-container {
    display: inline-flex;
    -webkit-box-align: stretch;
    align-items: stretch;
    position: relative;
    z-index: 0;
    width: 100%;
  }

  .interaction-ring {
    transition: all 150ms ease-in-out 0s;
    position: absolute;
    z-index: -1;
    inset: 0;
    pointer-events: none;
    border-radius: 4px;
  }

  :host .root-container:hover textarea:not(:focus) + .interaction-ring {
    box-shadow: rgb(231 238 236) 0 0 0 3px;
  }

  // prettier-ignore
  :host([state='error']) .root-container:hover textarea:not(:focus) + .interaction-ring {
    box-shadow: rgb(252 235 226) 0 0 0 3px;
  }

  // prettier-ignore
  :host([state='valid']) .root-container:hover textarea:not(:focus) + .interaction-ring {
    box-shadow: rgb(228 244 228) 0 0 0 3px;
  }

  textarea {
    resize: none;
    width: 100%;
    height: 128px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: normal;
    border: 1px solid rgb(137, 151, 155);
    transition: border-color 150ms ease-in-out 0s;
    z-index: 1;
    outline: none;
    color: rgb(33, 49, 60);
    background-color: rgb(255, 255, 255);
    padding: 10px 12px;
    font-family: ${bodyFont};
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
    scrollbar-width: thin;
  }

  textarea::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  textarea::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  textarea::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
  }

  :host([monospace]) textarea {
    font-family: 'SF Mono', SFMono-Regular, ui-monospace, 'DejaVu Sans Mono',
      Menlo, Consolas, monospace;
  }

  :host([state='error']) textarea {
    border: 1px solid rgb(207, 74, 34);
    padding-right: 30px;
  }

  :host([state='valid']) textarea {
    border: 1px solid rgb(19, 170, 82);
    padding-right: 30px;
  }

  :host textarea:focus {
    border: 1px solid rgb(255, 255, 255);
  }

  :host textarea:focus ~ .interaction-ring {
    box-shadow: rgb(1, 158, 226) 0 0 0 3px;
  }

  .helper {
    font-size: 14px;
    min-height: 20px;
    padding-top: 4px;
    font-weight: normal;
  }

  .helper.error {
    color: rgb(207, 74, 34);
  }

  .end {
    position: absolute;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    right: 12px;
    z-index: 1;
  }

  .error-icon {
    flex-shrink: 0;
    color: rgb(207, 74, 34);
  }

  .checkmark-icon {
    flex-shrink: 0;
    color: rgb(19, 170, 82);
  }
`;

export class TextArea extends FoundationTextArea {
  @attr({ mode: 'boolean' })
  monospace;

  @attr
  state;

  @observable
  errorMessage;

  stateChanged(oldValue, newValue) {
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

    if (!this.state) {
      this.state = 'default';
    }
  }
}

/**
 *
 * @public
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus | delegatesFocus}
 */
export const textArea = TextArea.compose({
  baseName: 'text-area',
  template: textAreaTemplate,
  styles: textAreaStyles,
  shadowOptions: {
    delegatesFocus: true
  }
});
