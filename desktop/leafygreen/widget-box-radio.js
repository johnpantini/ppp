import { Radio } from '../../shared/radio.js';
import { css } from '../../shared/element/styles/css.js';
import { boxRadioTemplate } from './box-radio.js';
import { disabledCursor } from '../../shared/utilities/style/disabled.js';

export const widgetBoxRadioStyles = (context, definition) => css`
  :host(:focus-visible) {
    outline: none;
  }

  .control {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    cursor: pointer;
    height: 22px;
    font-size: 12px;
    line-height: 22px;
    text-align: center;
    overflow-wrap: break-word;
    background-color: rgb(255, 255, 255);
    color: rgb(0, 30, 43);
    pointer-events: auto;
    border-image: initial;
    flex: 1 1 0;
    border: 1px solid rgb(223, 230, 237);
    border-radius: 4px;
    padding: 0 10px;
    transition: background-color 150ms ease-in-out 0s;
  }

  :host([disabled]) .control {
    color: rgb(137, 151, 155);
    cursor: ${disabledCursor};
  }

  :host(:not([checked]):not([disabled])) .control:hover {
    background-color: rgb(243, 245, 248);
    border: 1px solid rgb(223, 230, 237);
  }

  :host([checked]) .control {
    color: #0b90ff;
    border: 1px solid rgba(11, 144, 255, 0.3);
    background: rgba(11, 144, 255, 0.1);
  }
`;

// noinspection JSUnusedGlobalSymbols
export default Radio.compose({
  baseName: 'widget-box-radio',
  template: boxRadioTemplate,
  styles: widgetBoxRadioStyles
});
