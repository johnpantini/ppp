/** @decorator */

import Prism from '../vendor/prism.min.js';
import { PPPAppearanceElement, PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  html,
  observable,
  ref,
  when
} from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { normalize, scrollbars, typography } from '../design/styles.js';
import {
  bodyFont,
  fontSizeBody1,
  fontSizeCode1,
  fontWeightCode1,
  lineHeightCode1,
  monospaceFont,
  paletteBlack,
  paletteBlueBase,
  paletteBlueDark1,
  paletteBlueDark3,
  paletteBlueLight1,
  paletteBlueLight2,
  paletteBlueLight3,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteGreenDark1,
  paletteGreenLight3,
  palettePurpleBase,
  palettePurpleLight2,
  palettePurpleLight3,
  paletteRedBase,
  paletteRedLight1,
  paletteRedLight2,
  paletteRedLight3,
  paletteWhite,
  spacing1,
  themeConditional,
  toColorComponents
} from '../design/design-tokens.js';
import {
  checkmarkWithCircle,
  copy,
  library,
  revert
} from '../static/svg/sprite.js';

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

export function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=/]/g, function (s) {
    return entityMap[s];
  });
}

export const snippetTemplate = html`
  <template class="${(x) => (x.readOnly ? 'readonly' : '')}">
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        <textarea
          ?disabled="${(x) => x.disabled}"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          part="control"
          class="control"
          id="control"
          @input="${(x, c) => x.onInput(c)}"
          @scroll="${(x, c) => x.onScroll(c)}"
          ${ref('control')}
        ></textarea>
        <pre tabindex="-1" ${ref('pre')} class="pre language-js"><code ${ref(
          'codeHolder'
        )} class="code language-js"></code></pre>
      </div>
      <div class="panel">
        <button title="Скопировать" class="copy" @click="${(x) => x.copy()}">
          <span class="icon">
            ${when((x) => x.copied, html`${html.partial(checkmarkWithCircle)}`)}
            ${when((x) => !x.copied, html`${html.partial(copy)}`)}
          </span>
        </button>
        ${when(
          (x) => x.revertable,
          html`
            <button
              class="revert"
              title="Восстановить значение по умолчанию"
              @click="${(x) => x.revert()}"
            >
              <span class="icon">
                ${when(
                  (x) => x.reverted,
                  html`${html.partial(checkmarkWithCircle)}`
                )}
                ${when((x) => !x.reverted, html`${html.partial(revert)}`)}
              </span>
            </button>
          `
        )}
        ${when(
          (x) => x.wizard,
          html`
            <button
              class="wizard"
              title="Воспользоваться библиотекой шаблонов"
              @click="${(x) => {
                x.$emit('wizard', {
                  snippet: x
                });
              }}"
            >
              <span class="icon"> ${html.partial(library)} </span>
            </button>
          `
        )}
      </div>
    </div>
    ${when(
      (x) => x.appearance === 'error' && !!x.errorMessage,
      html` <div class="helper error">
        <label>${(x) => x.errorMessage}</label>
      </div>`
    )}
  </template>
`;

export const snippetStyles = css`
  ${normalize()}
  ${typography()}
  ${display('flex')}
  ${scrollbars('.control')}
  :host {
    position: relative;
    flex-direction: column;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .label,
  .description {
    padding-bottom: ${spacing1};
  }

  .root {
    position: relative;
    display: grid;
    grid-template-areas: 'code panel';
    grid-template-columns: auto 38px;
    overflow: hidden;
    border-radius: 4px;
    border: 1px solid ${paletteGrayBase};
    height: 100%;
  }

  .panel {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 4px;
    background-color: ${themeConditional(paletteWhite, paletteGrayDark2)};
    flex-direction: column;
    padding: 6px;
    border-left: 1px solid ${paletteGrayBase};
    z-index: 2;
    grid-area: panel;
  }

  .panel button {
    border: medium none;
    appearance: unset;
    padding: unset;
    display: inline-block;
    border-radius: 100px;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
    background-color: transparent;
    height: 28px;
    width: 28px;
    align-self: center;
  }

  .panel button:focus-visible {
    border: 1px solid ${paletteBlueLight1};
  }

  .panel button::before {
    position: absolute;
    inset: 0;
    border-radius: 100%;
    opacity: 0;
    transform: scale(0.8);
    content: '';
  }

  .panel button:hover::before {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    opacity: 1;
    transform: scale(1);
  }

  .panel button span {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel button span svg {
    width: 16px;
    height: 16px;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight2)};
  }

  :host([copied]) .panel button.copy span svg {
    color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  :host([reverted]) .panel button.revert span svg {
    color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  .root-container {
    grid-area: code;
    overflow: hidden;
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border: 0 none;
    padding-top: 8px;
    padding-bottom: 8px;
    margin: 0;
    position: relative;
    white-space: pre;
    background-color: ${themeConditional(paletteGrayLight3, paletteBlack)};
  }

  :host(:not([disabled])) .root:hover {
    border-color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  .control {
    font-family: ${monospaceFont};
    font-size: ${fontSizeCode1};
    line-height: ${lineHeightCode1};
    font-weight: ${fontWeightCode1};
    background-color: ${themeConditional(paletteGrayLight3, paletteBlack)};
    white-space: pre;
    position: absolute;
    padding: 10px;
    top: 0;
    left: 0;
    overflow: auto;
    margin: 0 !important;
    outline: none;
    text-align: left;
    border: none;
    resize: none;
    caret-color: ${themeConditional(paletteBlack, paletteWhite)};
    color: transparent;
    width: 100%;
    height: 100%;
  }

  :host(:not([disabled])) .root:has(.control:focus),
  :host(:not([disabled])) .root:has(.control:focus-visible) {
    border-color: ${paletteBlueLight1};
  }

  :host(.error:not([disabled])) .root {
    border-color: ${themeConditional(paletteRedBase, paletteRedLight1)};
  }

  .control::selection {
    background: rgba(
      ${themeConditional(
        toColorComponents(paletteGrayBase),
        toColorComponents(paletteGrayLight3)
      )},
      0.1
    );
  }

  .control::-moz-selection {
    background: rgba(
      ${themeConditional(
        toColorComponents(paletteGrayBase),
        toColorComponents(paletteGrayLight3)
      )},
      0.1
    );
  }

  .pre {
    font-family: ${monospaceFont};
    font-size: ${fontSizeCode1};
    line-height: ${lineHeightCode1};
    font-weight: ${fontWeightCode1};
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
    padding: 10px;
    white-space: pre;
    position: absolute;
    top: 0;
    left: 0;
    overflow: auto;
    margin: 0 !important;
    outline: none;
    text-align: left;
    pointer-events: none;
    z-index: 3;
  }

  .code {
    display: block;
    font-family: ${monospaceFont};
    overflow: hidden;
  }

  .helper {
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    text-transform: none;
    min-height: 20px;
    padding-top: ${spacing1};
  }

  :host(.error) .helper {
    color: ${themeConditional(paletteRedBase, paletteRedLight1)};
  }

  .token.punctuation {
    color: ${themeConditional(paletteBlack, paletteWhite)};
  }

  .token.keyword {
    color: ${themeConditional(paletteRedLight1, palettePurpleBase)};
  }

  .token.operator {
    color: ${themeConditional(paletteBlack, paletteWhite)};
  }

  .token.string {
    color: ${themeConditional(paletteGreenBase, paletteGreenLight3)};
  }

  .token.comment {
    color: ${paletteGrayLight1};
  }

  .token.function {
    color: ${themeConditional(paletteBlueBase, paletteBlueLight3)};
  }

  .token.boolean {
    color: ${themeConditional(paletteBlueLight1, paletteBlueLight3)};
  }

  .token.number {
    color: ${themeConditional(paletteBlueLight1, paletteBlueLight3)};
  }

  .token.selector {
    color: ${themeConditional(paletteRedBase, paletteRedLight3)};
  }

  .token.property {
    color: ${themeConditional(paletteRedBase, paletteRedLight3)};
  }

  .token.tag {
    color: ${themeConditional(paletteRedBase, paletteRedLight3)};
  }

  .token.attr-value {
    color: ${themeConditional(paletteRedBase, paletteRedLight3)};
  }
`;

export class Snippet extends PPPAppearanceElement {
  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  @attr({ mode: 'boolean' })
  disabled;

  @observable
  code;

  get value() {
    return this.code;
  }

  @observable
  errorMessage;

  #copyTimeout;

  #revertTimeout;

  @attr({ mode: 'boolean' })
  copied;

  @attr({ mode: 'boolean' })
  reverted;

  @attr({ mode: 'boolean' })
  revertable;

  @attr({ mode: 'boolean' })
  wizard;

  async copy() {
    await navigator.clipboard.writeText(this.value);

    this.copied = true;

    clearTimeout(this.#copyTimeout);

    this.#copyTimeout = setTimeout(() => (this.copied = false), 2000);
  }

  async revert() {
    this.$emit('revert');

    this.reverted = true;

    clearTimeout(this.#revertTimeout);

    this.#revertTimeout = setTimeout(() => (this.reverted = false), 2000);
  }

  onInput(c) {
    this.code = c.event.target.value;
    this.codeHolder.innerHTML = escapeHtml(c.event.target.value);
    this.highlight();

    if (this.code) this.appearance = 'default';
  }

  onScroll(c) {
    const e = c.event;

    this.pre.style.transform = `translate3d(-${e.target.scrollLeft}px, -${e.target.scrollTop}px, 0)`;
  }

  updateCode(code = '') {
    this.code = code;
    this.control.value = code;
    this.codeHolder.innerHTML = escapeHtml(code);
    this.highlight();
  }

  highlight() {
    Prism.highlightElement(this.codeHolder, false);
  }

  connectedCallback() {
    super.connectedCallback();

    this.updateCode(this.code);
  }

  codeChanged(oldValue, newValue = '') {
    if (this.$fastController.isConnected) {
      this.updateCode(newValue);
    }
  }
}

export default Snippet.compose({
  template: snippetTemplate,
  styles: snippetStyles
}).define();
