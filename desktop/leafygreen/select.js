/** @decorator */

import {
  Select as FoundationSelect,
  selectTemplate
} from '../../shared/select.js';
import { attr } from '../../shared/element/components/attributes.js';
import { observable } from '../../shared/element/observation/observable.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont, designUnit, heightNumber } from './design-tokens.js';
import { disabledCursor } from '../../shared/utilities/style/disabled.js';
import { requireComponent } from '../../shared/template.js';
import { warning } from './icons/warning.js';
import { caretDown } from './icons/caret-down.js';

await requireComponent(
  'ppp-option',
  import.meta.url.replaceAll(/select/gi, 'option')
);

// TODO - design tokens
export const selectStyles = (context, definition) => css`
  ${display('flex')}
  :host {
    flex-direction: column;
    position: relative;
    z-index: 2;
  }

  :host(.open) {
    z-index: 100;
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

  .control {
    box-sizing: border-box;
    width: 100%;
    height: calc(${heightNumber} * 1px);
    border-radius: 6px;
    padding: 0 12px;
    font-size: 14px;
    font-weight: normal;
    border: 1px solid rgb(136, 147, 151);
    z-index: 1;
    outline: none;
    color: rgb(28, 45, 56);
    background-color: rgb(255, 255, 255);
    font-family: ${bodyFont};
    position: relative;
    user-select: none;
    min-width: 250px;
    vertical-align: top;
    transition: all 150ms ease-in-out 0s;
    align-items: center;
    cursor: pointer;
    display: flex;
    line-height: 20px;
    min-height: 100%;
  }

  :host([disabled]) {
    cursor: ${disabledCursor};
  }

  :host([disabled]) .control {
    pointer-events: none;
    background-color: rgb(231, 238, 236);
    border: 1px solid rgb(136, 147, 151);
    color: rgb(137, 151, 155);
  }

  :host([disabled]) .indicator {
    color: rgb(184, 196, 194);
  }

  .listbox {
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(232, 237, 235);
    border-radius: 12px;
    box-shadow: rgb(0 30 43 / 25%) 0 4px 7px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    left: 0;
    max-height: calc(var(--max-height) - (${heightNumber} * 4px));
    overflow-y: auto;
    position: absolute;
    width: 100%;
    z-index: 1;
    visibility: visible;
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
    scrollbar-width: thin;
  }

  .listbox[hidden] {
    visibility: hidden;
    display: none;
  }

  .listbox::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .listbox::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .listbox::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
  }

  :host(:not([disabled])) .root:hover .control {
    background-color: rgb(255, 255, 255);
    box-shadow: rgb(232 237 235) 0 0 0 3px;
  }

  :host(:not([disabled])[state='error']) .control {
    border: 1px solid rgb(207, 74, 34);
  }

  :host([disabled]) .control {
    cursor: ${disabledCursor};
    user-select: none;
  }

  :host([disabled]:hover) {
    fill: currentcolor;
  }

  :host([open][position='above']) .listbox {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  :host([open][position='below']) .listbox {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  :host([open][position='above']) .listbox {
    border-bottom: 0;
    bottom: calc(${heightNumber} * 1px + 4px);
  }

  :host([open][position='below']) .listbox {
    border-top: 0;
    top: calc(${heightNumber} * 1px + 4px);
  }

  .selected-value {
    flex: 1 1 auto;
    font-family: inherit;
    text-align: start;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .indicator {
    flex: 0 0 auto;
    margin-inline-start: 1em;
  }

  slot[name='listbox'] {
    display: none;
    width: 100%;
  }

  :host([open]) slot[name='listbox'] {
    display: flex;
    position: absolute;
  }

  .end {
    margin-inline-start: auto;
  }

  .start,
  .end,
  .indicator,
  .select-indicator,
  ::slotted(svg) {
    fill: currentcolor;
    height: 1em;
    min-height: calc(${designUnit} * 4px);
    min-width: calc(${designUnit} * 4px);
    width: 1em;
  }

  ::slotted([role='option']),
  ::slotted(option) {
    flex: 0 0 auto;
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

  .error-icon {
    color: rgb(207, 74, 34);
  }

  :host([state='error']) .control {
    border: 1px solid rgb(207, 74, 34);
  }

  /* prettier-ignore */

  :host([state='error']:not([disabled])) .root:hover .control {
    border-color: rgb(219, 48, 48);
    box-shadow: rgb(255 205 199) 0 0 0 3px;
  }
`;

export class Select extends FoundationSelect {
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

export default Select.compose({
  template: selectTemplate,
  styles: selectStyles,
  indicator: caretDown(),
  warningIndicator: warning({ cls: 'error-icon' })
});
