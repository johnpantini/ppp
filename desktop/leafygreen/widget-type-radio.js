import { Radio } from '../../shared/radio.js';
import { css } from '../../shared/element/styles/css.js';
import { bodyFont } from './design-tokens.js';
import { html } from '../../shared/element/templating/template.js';
import { disabledCursor } from '../../shared/utilities/style/disabled.js';

export const widgetTypeRadioTemplate = (context, definition) => html`
  <template
    role="radio"
    class="${(x) => (x.checked ? 'checked' : '')}"
    aria-checked="${(x) => x.checked}"
    aria-required="${(x) => x.required}"
    aria-disabled="${(x) => x.disabled}"
    aria-readonly="${(x) => x.readOnly}"
    @keypress="${(x, c) => x.keypressHandler(c.event)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
  >
    <div class="control">
      <div class="content">
        <slot name="text">
        </slot>
        <slot name="icon"></slot>
      </div>
    </div>
  </template>
`;

export const widgetTypeRadioStyles = (context, definition) => css`
  :host(:focus-visible) {
    outline: none;
  }

  .control {
    box-sizing: border-box;
    width: 100%;
    padding: 15px;
    cursor: pointer;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(136, 147, 151);
    border-image: initial;
    border-radius: 4px;
    transition: all 150ms ease-in-out 0s;
  }

  :host([disabled]) .control {
    color: rgb(137, 151, 155);
    background-color: rgb(231, 238, 236);
    cursor: ${disabledCursor};
  }

  :host(:not([checked]):not([disabled])) .control:hover {
    box-shadow: rgb(232 237 235) 0 0 0 3px;
  }

  :host([checked]) .control {
    box-shadow: rgb(19 170 82) 0 0 0 3px;
    border-color: transparent;
  }

  .content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  [name='text']::slotted(*) {
    font-family: ${bodyFont};
    display: flex;
    flex-direction: column;
    font-size: 17px;
    font-weight: bold;
  }

  [name='icon']::slotted(img) {
    height: 20px;
  }

  :host([disabled]) {
    display: none;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default Radio.compose({
  baseName: 'widget-type-radio',
  template: widgetTypeRadioTemplate,
  styles: widgetTypeRadioStyles
});
