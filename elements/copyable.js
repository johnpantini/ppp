/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import { css, ref, html, attr, when } from '../vendor/fast-element.min.js';
import { normalize, typography } from '../design/styles.js';
import { copy, checkmarkWithCircle } from '../static/svg/sprite.js';
import {
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteGreenDark1,
  paletteWhite,
  themeConditional,
  toColorComponents
} from '../design/design-tokens.js';
import { display } from '../vendor/fast-utilities.js';

export const copyableTemplate = html`
  <template>
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <code class="control code1" part="control">
        <slot ${ref('code')}></slot>
      </code>
      <span class="button-holder body1">
        <button
          @click="${(x) => x.copy()}"
          type="button"
          class="action-button"
          aria-disabled="false"
        >
          <div class="button-content">
            ${when((x) => x.copied, html`${html.partial(checkmarkWithCircle)}`)}
            ${when((x) => !x.copied, html`${html.partial(copy)}`)}
          </div>
        </button>
      </span>
    </div>
  </template>
`;

export const copyableStyles = css`
  ${display('block')}
  ${normalize()}
  ${typography()}
  .root {
    position: relative;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr auto;
    grid-template-areas: 'code button';
    height: 36px;
    width: 400px;
    margin: 2px 0;
  }

  .control {
    grid-area: code;
    display: inline-flex;
    align-items: center;
    height: 100%;
    width: 100%;
    border: 1px solid;
    border-right: unset;
    border-radius: 6px 0 0 6px;
    padding: 1px 12px 0 12px;
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
    background-color: ${themeConditional(paletteGrayLight3, paletteBlack)};
    border-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  .control::-webkit-scrollbar {
    width: 0;
    height: 0;
    background: transparent;
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
    height: 100%;
    width: 16px;
    transform: translate(-16px);
    background: linear-gradient(
      90deg,
      rgba(
          ${themeConditional(
            toColorComponents(paletteGrayLight3),
            toColorComponents(paletteBlack)
          )},
          0
        )
        0,
      rgba(
          ${themeConditional(
            toColorComponents(paletteGrayLight3),
            toColorComponents(paletteBlack)
          )},
          1
        )
        90%,
      rgba(
        ${themeConditional(
          toColorComponents(paletteGrayLight3),
          toColorComponents(paletteBlack)
        )},
        1
      )
    );
    border: 1px solid;
    border-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    border-left: unset;
    border-right: unset;
    top: 0;
  }

  .action-button {
    position: relative;
    appearance: none;
    padding: 0;
    margin: 0;
    color: ${themeConditional(paletteBlack, paletteWhite)};
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    border: 1px solid ${themeConditional(paletteGrayBase)};
    display: inline-flex;
    align-items: stretch;
    text-decoration: none;
    cursor: pointer;
    z-index: 0;
    font-size: 13px;
    font-weight: 500;
    height: 100%;
    border-radius: 0 6px 6px 0;
  }

  .action-button:hover {
    color: ${themeConditional(paletteBlack, paletteWhite)};
    background-color: ${themeConditional(paletteWhite, paletteGrayDark1)};
    border: 1px solid ${themeConditional(paletteGrayBase)};
    text-decoration: none;
  }

  .button-content {
    display: grid;
    grid-auto-flow: column;
    justify-content: center;
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
    color: ${themeConditional(paletteGrayBase, paletteGrayLight2)};
    height: 16px;
    width: 16px;
    justify-self: right;
  }

  :host([copied]) .button-content svg {
    color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }
`;

export class Copyable extends PPPElement {
  #timeout;

  @attr({ mode: 'boolean' })
  copied;

  async copy() {
    await navigator.clipboard.writeText(
      this.code.assignedNodes()[0].wholeText.trim()
    );

    this.copied = true;

    clearTimeout(this.#timeout);

    this.#timeout = setTimeout(() => (this.copied = false), 2000);
  }
}

export default Copyable.compose({
  template: copyableTemplate,
  styles: copyableStyles
}).define();
