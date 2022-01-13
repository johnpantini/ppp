import { ListboxOption, listboxOptionTemplate } from '../../shared/listbox.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { focusVisible } from '../../shared/utilities/style/focus.js';
import { disabledCursor } from '../../shared/utilities/style/disabled.js';
import { bodyFont, designUnit, heightNumber } from './design-tokens.js';

const optionStyles = (context, definition) => css`
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

export const option = ListboxOption.compose({
  baseName: 'option',
  template: listboxOptionTemplate,
  styles: optionStyles
});
