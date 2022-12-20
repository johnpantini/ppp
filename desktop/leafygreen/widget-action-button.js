import { css } from '../../shared/element/styles/css.js';
import { html } from '../../shared/template.js';
import { FoundationElement } from '../../shared/foundation-element.js';

export const widgetActionButtonTemplate = (context, definition) => html`
  <template>
    <button type="button">
      <span>
        <slot></slot>
      </span>
    </button>
  </template>
`;

export const widgetActionButtonStyles = (context, definition) =>
  css`
    :host button {
      border-radius: 50%;
      min-height: 24px;
      min-width: 24px;
      background-color: rgb(232, 237, 243);
      color: rgb(90, 118, 143);
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      border: none;
      cursor: pointer;
      font-size: 12px;
      justify-content: center;
      text-align: left;
      vertical-align: middle;
      padding: 0 8px;
    }

    :host button:hover {
      background-color: rgb(223, 230, 237);
    }

    :host button span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 -8px;
      color: rgb(140, 167, 190);
      flex: 0 0 auto;
      vertical-align: text-bottom;
      box-sizing: border-box;
    }
  `;

export default FoundationElement.compose({
  baseName: 'widget-action-button',
  template: widgetActionButtonTemplate,
  styles: widgetActionButtonStyles
});
