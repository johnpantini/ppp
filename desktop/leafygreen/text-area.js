/** @decorator */

import {
  TextArea as FoundationTextArea,
  textAreaTemplate
} from '../../shared/text-area.js';
import { attr } from '../../shared/element/components/attributes.js';
import { observable } from '../../shared/element/observation/observable.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';

// TODO - design tokens
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

  :host .root-container:hover textarea:not(:focus):not([disabled]) + .interaction-ring {
    box-shadow: rgb(231 238 236) 0 0 0 3px;
  }

  /* prettier-ignore */

  :host([state='error']) .root-container:hover textarea:not(:focus):not([disabled]) + .interaction-ring {
    border-color: rgb(219, 48, 48);
    box-shadow: rgb(255 205 199) 0 0 0 3px;
  }

  /* prettier-ignore */

  :host([state='valid']) .root-container:hover textarea:not(:focus):not([disabled]) + .interaction-ring {
    box-shadow: rgb(192 250 230) 0 0 0 3px;
    border-color: rgb(0, 163, 92);
  }

  textarea {
    resize: none;
    width: 100%;
    height: 128px;
    border-radius: 6px;
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
    border-color: rgb(219, 48, 48);
    padding-right: 30px;
  }

  :host([state='valid']) textarea {
    border-color: rgb(0, 163, 92);
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
export default TextArea.compose({
  template: textAreaTemplate,
  styles: textAreaStyles,
  shadowOptions: {
    delegatesFocus: true
  }
});
