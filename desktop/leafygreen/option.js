import { ListboxOption, listboxOptionTemplate } from '../../shared/listbox.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { focusVisible } from '../../shared/utilities/style/focus.js';
import { disabledCursor } from '../../shared/utilities/style/disabled.js';
import { bodyFont, designUnit, heightNumber } from './design-tokens.js';

export const optionStyles = (context, definition) => css`
  ${display('flex')}
  :host {
    align-items: center;
    transition: background-color 150ms ease-in-out 0s;
    font-family: ${bodyFont};
    box-sizing: border-box;
    color: rgb(33, 49, 60);
    cursor: pointer;
    font-size: 14px;
    height: calc(${heightNumber} * 1px);
    outline: none;
    overflow-wrap: anywhere;
    padding: 10px 12px;
    user-select: none;
    white-space: nowrap;
  }

  :host(:${focusVisible}) {
  }

  :host([removed]) .content {
    color: #ac0f0f !important;
  }

  :host([aria-selected='true']) {
    font-weight: bold;
  }

  :host(:hover) {
    background-color: rgb(231, 238, 236);
  }

  :host(:active) {
  }

  :host(:not([aria-selected='true']):hover) {
  }

  :host(:not([aria-selected='true']):active) {
  }

  :host([disabled]) {
    cursor: ${disabledCursor};
  }

  :host([disabled]:hover) {
    background-color: inherit;
  }

  .content {
    display: flex;
    -webkit-box-pack: justify;
    justify-content: space-between;
    width: 100%;
    text-overflow: ellipsis;
  }

  .start,
  .end,
  ::slotted(svg) {
    display: flex;
  }

  ::slotted(svg) {
    height: calc(${designUnit} * 4px);
    width: calc(${designUnit} * 4px);
  }

  ::slotted([slot='end']) {
    margin-inline-start: 1ch;
  }

  ::slotted([slot='start']) {
    margin-inline-end: 1ch;
  }
`;

export default ListboxOption.compose({
  baseName: 'option',
  template: listboxOptionTemplate,
  styles: optionStyles,
  selectedIndicator:
    '<svg style="color: rgb(1, 107, 248); margin-right: 6px;" height="16" width="16" role="img" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.30583 9.05037L11.7611 3.59509C12.1516 3.20457 12.7848 3.20457 13.1753 3.59509L13.8824 4.3022C14.273 4.69273 14.273 5.32589 13.8824 5.71642L6.81525 12.7836C6.38819 13.2106 5.68292 13.1646 5.31505 12.6856L2.26638 8.71605C1.92998 8.27804 2.01235 7.65025 2.45036 7.31385L3.04518 6.85702C3.59269 6.43652 4.37742 6.53949 4.79792 7.087L6.30583 9.05037Z" fill="currentColor"></path></svg>'
});

export const loadingOptionStyles = (context, definition) => css`
  ${optionStyles(context, definition)}
  :host {
    pointer-events: none;
    display: none;
  }
`;

export const loadingOption = ListboxOption.compose({
  baseName: 'loading-option',
  template: listboxOptionTemplate,
  styles: loadingOptionStyles
});
