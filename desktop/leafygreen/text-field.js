/** @decorator */

import { TextField as FoundationTextField } from '../../shared/text-field.js';
import { observable } from '../../shared/element/observation/observable.js';
import { html } from '../../shared/element/templating/template.js';
import { attr } from '../../shared/element/components/attributes.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { endSlotTemplate } from '../../shared/patterns/start-end.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont, heightNumber } from './design-tokens.js';
import { warning } from './icons/warning.js';
import { checkmark } from './icons/checkmark.js';

// TODO - startTemplate
export const textFieldTemplate = (context, definition) => html`
  <template class="${(x) => (x.readOnly ? 'readonly' : '')}">
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        <input
          class="control"
          part="control"
          id="control"
          @input="${(x) => x.handleTextInput()}"
          @change="${(x) => x.handleChange()}"
          ?autofocus="${(x) => x.autofocus}"
          ?disabled="${(x) => x.disabled}"
          list="${(x) => x.list}"
          maxlength="${(x) => x.maxlength}"
          minlength="${(x) => x.minlength}"
          pattern="${(x) => x.pattern}"
          placeholder="${(x) => x.placeholder}"
          ?readonly="${(x) => x.readOnly}"
          ?required="${(x) => x.required}"
          size="${(x) => x.size}"
          ?spellcheck="${(x) => x.spellcheck}"
          :value="${(x) => x.value}"
          type="${(x) => x.type}"
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
          ${ref('control')}
        />
        <div class="interaction-ring"></div>
      </div>
      ${when(
        (x) => x.state === 'default',
        endSlotTemplate(context, definition)
      )}
      ${when(
        (x) => x.state === 'error' && x.errorMessage,
        html` <div class="end">
          ${warning({
            cls: 'error-icon'
          })}
        </div>`
      )}
      ${when(
        (x) => x.optional,
        html`
          <div class="end">
            <div class="optional-text">
              <p>Опционально</p>
            </div>
          </div>
        `
      )}
      ${when(
        (x) => x.state === 'valid',
        html` <div class="end">
          ${checkmark({
            cls: 'checkmark-icon'
          })}
        </div>`
      )}
    </div>
    ${when(
      (x) => x.state === 'error' && x.errorMessage,
      html` <div class="helper error">
        <label>${(x) => x.errorMessage}</label>
      </div>`
    )}
  </template>
`;

// TODO - design tokens
export const textFieldStyles = (context, definition) => css`
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
    border-radius: 6px;
  }

  :host .root-container:hover input:not(:focus):not([disabled]) + .interaction-ring {
    box-shadow: rgb(232 237 235) 0 0 0 3px;
  }

  /* prettier-ignore */

  :host([state='error']) .root-container:hover input:not(:focus):not([disabled]) + .interaction-ring {
    border-color: rgb(219, 48, 48);
    box-shadow: rgb(255 205 199) 0 0 0 3px;
  }

  /* prettier-ignore */

  :host([state='valid']) .root-container:hover input:not(:focus) + .interaction-ring {
    box-shadow: rgb(192 250 230) 0 0 0 3px;
    border-color: rgb(0, 163, 92);
  }

  input {
    box-sizing: border-box;
    width: 100%;
    height: calc(${heightNumber} * 1px);
    border-radius: 6px;
    padding: 0 12px;
    font-size: 14px;
    font-weight: normal;
    border: 1px solid rgb(136, 147, 151);
    transition: border-color 150ms ease-in-out 0s;
    z-index: 1;
    outline: none;
    color: rgb(33, 49, 60);
    background-color: rgb(255, 255, 255);
    font-family: ${bodyFont};
    text-transform: inherit;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  input[type='search'] {
    padding-right: 30px;
  }

  :host([disabled]) input {
    color: rgb(137, 151, 155);
    background-color: rgb(231, 238, 236);
    cursor: not-allowed;
  }

  :host([optional]) input {
    padding-right: 90px;
  }

  :host([state='error']) input {
    border-color: rgb(219, 48, 48);
    padding-right: 30px;
  }

  :host([state='valid']) input {
    border-color: rgb(0, 163, 92);
    padding-right: 30px;
  }

  :host input:focus {
    border: 1px solid rgb(255, 255, 255);
  }

  :host input:focus ~ .interaction-ring {
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

  .optional-text {
    font-size: 12px;
    font-style: italic;
    font-weight: normal;
    color: rgb(93, 108, 116);
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

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
`;

export class TextField extends FoundationTextField {
  @attr
  state;

  @attr({ mode: 'boolean' })
  optional;

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
export const textField = TextField.compose({
  baseName: 'text-field',
  template: textFieldTemplate,
  styles: textFieldStyles,
  shadowOptions: {
    delegatesFocus: true
  }
});
