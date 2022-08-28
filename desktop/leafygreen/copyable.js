import { Copyable } from '../../shared/copyable.js';
import { css } from '../../shared/element/styles/css.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { bodyFont } from './design-tokens.js';
import { copy } from './icons/copy.js';

export const copyableTemplate = (context, definition) => html`
  <template>
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <code class="control" part="control">
        <slot ${ref('code')}></slot>
      </code>
      <span class="button-holder">
        <button
          @click="${(x) => x.copy()}"
          type="button"
          class="action-button"
          aria-disabled="false"
        >
          <div class="button-content">
            ${copy({ size: 20, viewBox: '0 0 16 16 ' })}
          </div>
        </button>
      </span>
    </div>
  </template>
`;

// TODO - design tokens
export const copyableStyles = (context, definition) =>
  css`
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
      display: grid;
      grid-auto-flow: column;
      grid-template-columns: 1fr auto;
      width: 100%;
      margin: 2px 0;
      height: 36px;
    }

    .control {
      box-sizing: border-box;
      transition: all 0.15s ease-in-out 0s;
      font-family: 'Source Code Pro', Menlo, monospace;
      font-size: 15px;
      line-height: 24px;
      letter-spacing: 0;
      display: inline-flex;
      -webkit-box-align: center;
      align-items: center;
      height: 100%;
      width: 100%;
      padding-left: 12px;
      border: 1px solid rgb(232, 237, 235);
      border-radius: 6px;
      white-space: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      grid-area: 1 / 1 / 2 / -1;
      color: rgb(28, 45, 56);
      background-color: rgb(249, 251, 250);
    }

    .control::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    .control::-webkit-scrollbar-track {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .control::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .button-holder {
      position: relative;
      display: inline-block;
      height: 100%;
      grid-area: 1 / 2 / 2 / -1;
    }

    .button-holder::before {
      content: '';
      display: block;
      position: absolute;
      height: calc(100% - 6px);
      width: 16px;
      left: 0;
      top: 3px;
      border-radius: 100%;
      box-shadow: rgba(92, 108, 117, 0.35) 0 0 10px 0;
      transition: box-shadow 100ms ease-in-out 0s;
    }

    .action-button {
      appearance: none;
      padding: 0;
      margin: 0;
      border: 1px solid rgb(136, 147, 151);
      display: inline-flex;
      -webkit-box-align: stretch;
      align-items: stretch;
      transition: all 150ms ease-in-out 0s;
      text-decoration: none;
      cursor: pointer;
      z-index: 0;
      font-family: ${bodyFont};
      background-color: rgb(249, 251, 250);
      color: rgb(28, 45, 56);
      font-size: 13px;
      font-weight: 500;
      position: relative;
      height: 100%;
      border-radius: 0 6px 6px 0;
    }

    .action-button:hover {
      background-color: rgb(255, 255, 255);
      box-shadow: rgb(232 237 235) 0 0 0 3px;
      text-decoration: none;
    }

    .button-content {
      display: grid;
      grid-auto-flow: column;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      -webkit-justify-content: center;
      justify-content: center;
      -webkit-align-items: center;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      height: 100%;
      width: 100%;
      pointer-events: none;
      position: relative;
      z-index: 0;
      padding: 0 12px;
      gap: 6px;
    }

    .button-content svg {
      flex-shrink: 0;
      color: rgb(136, 147, 151);
      height: 16px;
      width: 16px;
      justify-self: right;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export default Copyable.compose({
  template: copyableTemplate,
  styles: copyableStyles
});
