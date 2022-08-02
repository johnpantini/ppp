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
    border: 1px solid rgb(137, 151, 155);
    border-radius: 4px;
    transition: border 100ms ease-in-out 0s;
  }

  :host([disabled]) .control {
    color: rgb(137, 151, 155);
    background-color: rgb(231, 238, 236);
    cursor: ${disabledCursor};
  }

  :host([checked]) .control {
    transition: all 150ms ease-in-out 0s;
    border: none;
    z-index: -1;
    inset: 0;
    box-shadow: rgb(19 170 82) 0 0 0 3px;
    border-radius: 3px;
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
`;

// noinspection JSUnusedGlobalSymbols
export default Radio.compose({
  baseName: 'widget-type-radio',
  template: widgetTypeRadioTemplate,
  styles: widgetTypeRadioStyles
});
