import { Radio, radioTemplate } from '../../shared/radio.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';

// TODO - design tokens
export const radioStyles = (context, definition) =>
  css`
    ${display('inline-flex')}
    :host {
      margin: calc(c * 1px) 0;
      user-select: none;
      outline: none;
    }

    .control {
      display: inline-flex;
      position: relative;
      align-items: stretch;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .label {
      margin-left: 10px;
      font-family: ${bodyFont};
      font-size: 14px;
      cursor: pointer;
      color: rgb(0, 30, 43);
    }

    .checked-indicator {
      position: absolute;
      inset: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 100%;
      border-style: solid;
      border-color: rgb(61, 79, 88);
      background-color: rgb(255, 255, 255);
      border-width: 3px;
    }

    .checked-indicator::before {
      content: '';
      position: absolute;
      border-radius: 100%;
    }

    .checked-indicator::after {
      width: 8px;
      height: 8px;
      transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s,
        border-color 0.15s ease-in-out 0s;
      content: '';
      background-color: white;
      border-radius: 100%;
      transform: scale(0);
    }

    .interaction-ring {
      transition: all 150ms ease-in-out 0s;
      position: absolute;
      z-index: -1;
      inset: 0;
      pointer-events: none;
      border-radius: 100%;
    }

    :host(:hover) .interaction-ring {
      box-shadow: rgb(232 237 235) 0 0 0 3px;
    }

    :host([aria-checked='true']) .checked-indicator {
      background-color: rgb(1, 107, 248);
      border-color: rgb(1, 107, 248);
    }

    :host([aria-checked='true']) .checked-indicator::after {
      transform: scale(1);
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const radio = Radio.compose({
  baseName: 'radio',
  template: radioTemplate,
  styles: radioStyles,
  checkedIndicator: `<div part="checked-indicator" class="checked-indicator"></div><div part="interaction-ring" class="interaction-ring"></div>`
});
