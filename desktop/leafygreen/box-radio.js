import { Radio } from '../../shared/radio.js';
import { css } from '../../shared/element/styles/css.js';
import { html } from '../../shared/element/templating/template.js';
import { disabledCursor } from '../../shared/utilities/style/disabled.js';

export const boxRadioTemplate = (context, definition) => html`
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
        <slot> </slot>
    </div>
  </template>
`;

export const boxRadioStyles = (context, definition) => css`
  :host(:focus-visible) {
    outline: none;
  }

  .control {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    overflow-wrap: break-word;
    background-color: rgb(255, 255, 255);
    color: rgb(0, 30, 43);
    cursor: pointer;
    pointer-events: auto;
    padding: 16px 24px;
    border-radius: 6px;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(136, 147, 151);
    border-image: initial;
    transition: all 150ms ease-in-out 0s;
    flex: 1 1 0;
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
`;

// noinspection JSUnusedGlobalSymbols
export default Radio.compose({
  baseName: 'box-radio',
  template: boxRadioTemplate,
  styles: boxRadioStyles
});
