/** @decorator */

import {
  TextField as FoundationTextField,
  textFieldTemplate
} from '../../shared/text-field.js';
import { observable } from '../../shared/element/observation/observable.js';
import { attr } from '../../shared/element/components/attributes.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont, heightNumber } from './design-tokens.js';
import { warning } from './icons/warning.js';
import { checkmark } from './icons/checkmark.js';

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
    align-items: center;
    z-index: 0;
  }

  .root-container {
    display: inline-flex;
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

  /* prettier-ignore */

  :host(:not([disabled])) .root-container:hover input:not(:focus) + .interaction-ring {
    box-shadow: rgb(232 237 235) 0 0 0 3px;
  }

  /* prettier-ignore */

  :host([state='error']:not([disabled])) .root-container:hover input:not(:focus) + .interaction-ring {
    border-color: rgb(219, 48, 48);
    box-shadow: rgb(255 205 199) 0 0 0 3px;
  }

  /* prettier-ignore */

  :host([state='valid']:not([disabled])) .root-container:hover input:not(:focus) + .interaction-ring {
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

  input::-ms-reveal,
  input::-ms-clear {
    display: none;
  }

  input[type='search'] {
    padding-right: 30px;
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  :host([disabled]) input {
    color: rgb(137, 151, 155);
    background-color: rgb(231, 238, 236);
    pointer-events: none;
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
    text-transform: none;
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
export default TextField.compose({
  template: textFieldTemplate,
  styles: textFieldStyles,
  shadowOptions: {
    delegatesFocus: true
  },
  errorIcon: warning({
    cls: 'error-icon'
  }),
  checkMarkIcon: checkmark({
    cls: 'checkmark-icon'
  })
});
