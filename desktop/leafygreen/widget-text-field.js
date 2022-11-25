/** @decorator */

import { TextField } from '../../shared/text-field.js';
import { textFieldTemplate } from '../../shared/text-field.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';
import { attr } from '../../shared/element/components/attributes.js';

export const widgetTextFieldStyles = (context, definition) => css`
  ${display('flex')}
  :host {
    flex-direction: column;
    position: relative;
    width: 100%;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .label {
    display: none;
  }

  .description {
    display: none;
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
    display: none;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    border-radius: 4px;
    padding: 0 0 1px 8px;
    font-size: 12px;
    font-weight: normal;
    border: 1px solid #d9dae0;
    transition: border-color 150ms ease-in-out 0s;
    z-index: 1;
    outline: none;
    line-height: 24px;
    color: rgb(33, 49, 60);
    background-color: rgb(255, 255, 255);
    font-family: ${bodyFont};
    text-transform: inherit;
    position: relative;
  }

  :host(.lot-size-1) input {
    padding-right: 32px;
  }

  :host(.lot-size-2) input {
    padding-right: 39px;
  }

  :host(.lot-size-3) input {
    padding-right: 46px;
  }

  :host(.lot-size-4) input {
    padding-right: 53px;
  }

  :host(.lot-size-5) input {
    padding-right: 60px;
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

  :host(:not([disabled])) input:hover {
    border: 1px solid #c0c3c8;
  }

  :host(:not([disabled])) input:focus {
    border: 1px solid #007cff;
    box-shadow: 0 0 0 2px rgb(0 124 255 / 20%);
  }

  .end {
    position: absolute;
    right: 0;
    padding-right: 8px;
    top: 0;
    display: flex;
    height: 100%;
    align-items: center;
    color: rgb(123, 130, 136);
    font-size: 12px;
    overflow: hidden;
    cursor: default;
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

export class WidgetTextField extends TextField {
  @attr
  state;

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

export default WidgetTextField.compose({
  template: textFieldTemplate,
  styles: widgetTextFieldStyles,
  shadowOptions: {
    delegatesFocus: true
  }
});
