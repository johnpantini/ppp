/** @decorator */

import { PPPAppearanceElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  when,
  html,
  observable,
  ref
} from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { normalize, typography } from '../design/styles.js';
import {
  checkmarkWithCircle,
  infoWithCircle,
  close,
  warning,
  importantWithCircle,
  settings
} from '../static/svg/sprite.js';
import {
  bodyFont,
  fontSizeBody1,
  lineHeightBody1,
  paletteBlueBase,
  paletteBlueDark2,
  paletteBlueDark3,
  paletteBlueLight1,
  paletteBlueLight2,
  paletteBlueLight3,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGreenBase,
  paletteGreenDark1,
  paletteGreenDark2,
  paletteGreenDark3,
  paletteGreenLight2,
  paletteGreenLight3,
  paletteRedBase,
  paletteRedDark2,
  paletteRedDark3,
  paletteRedLight1,
  paletteRedLight2,
  paletteRedLight3,
  paletteWhite,
  paletteYellowBase,
  paletteYellowDark2,
  paletteYellowDark3,
  paletteYellowLight2,
  paletteYellowLight3,
  spacing4,
  spacing6,
  themeConditional
} from '../design/design-tokens.js';
import './progress.js';

export const toastTemplate = html`
  <template>
    <div class="container">
      ${when(
        (x) => x.appearance === 'success',
        html`${html.partial(checkmarkWithCircle)}`
      )}
      ${when(
        (x) => x.appearance === 'note',
        html`${html.partial(infoWithCircle)}`
      )}
      ${when((x) => x.appearance === 'warning', html`${html.partial(warning)}`)}
      ${when(
        (x) => x.appearance === 'important',
        html`${html.partial(importantWithCircle)}`
      )}
      ${when(
        (x) => x.appearance === 'progress',
        html`${html.partial(`<div class="spinner-holder">${settings}</div>`)}`
      )}
      <div>
        <div class="title body1">${(x) => x.title}</div>
        <div class="text body1">${(x) => x.text}</div>
      </div>
    </div>
    ${when(
      (x) => x.dismissible,
      html`
        <button
          @click="${(x) => x.setAttribute('hidden', '')}"
          class="close"
          tabindex="0"
        >
          <div class="close-icon">${html.partial(close)}</div>
        </button>
      `
    )}
    ${when(
      (x) => x.appearance === 'progress',
      html` <div class="progress-container">
        <ppp-progress ${ref('progress')} min="0" max="100" value="0">
        </ppp-progress>
      </div>`
    )}
  </template>
`;

export const toastStyles = css`
  ${normalize()}
  ${display('flex')}
  ${typography()}
  :host {
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    line-height: ${lineHeightBody1};
    position: fixed;
    bottom: ${spacing6};
    left: ${spacing4};
    width: 400px;
    max-width: calc(100vw - ${spacing4} * 2);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid;
    z-index: 200000000;
  }

  :host .link {
    font-size: inherit;
    line-height: inherit;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
    outline: none;
  }

  :host .link:hover,
  :host .link:active,
  :host .link:focus {
    text-decoration: none;
  }

  .container {
    display: flex;
    width: inherit;
    align-items: center;
    padding: 12px 16px;
    border-radius: 4px;
  }

  :host([dismissible]) .container {
    padding: 12px 32px 12px 16px;
  }

  .container > svg,
  .container .spinner-holder > svg {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    margin-right: 16px;
  }

  :host(.success) {
    background-color: ${themeConditional(
      paletteGreenLight3,
      paletteGreenDark3
    )};
    border-color: ${themeConditional(paletteGreenLight2, paletteGreenDark2)};
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight2)};
  }

  :host(.success) .container > svg {
    color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  :host(.success) .close {
    background-color: ${themeConditional(
      paletteGreenLight3,
      paletteGreenDark3
    )};
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight2)};
  }

  :host(.success) .close:hover::before {
    background-color: ${themeConditional(
      paletteGreenLight2,
      paletteGreenDark2
    )};
  }

  :host(.note) {
    background-color: ${themeConditional(paletteBlueLight3, paletteBlueDark3)};
    border-color: ${themeConditional(paletteBlueLight2, paletteBlueDark2)};
    color: ${themeConditional(paletteBlueDark2, paletteBlueLight2)};
  }

  :host(.note) .container > svg {
    color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  :host(.note) .close {
    background-color: ${themeConditional(paletteBlueLight3, paletteBlueDark3)};
    color: ${themeConditional(paletteBlueDark2, paletteBlueLight2)};
  }

  :host(.note) .close:hover::before {
    background-color: ${themeConditional(paletteBlueLight2, paletteBlueDark2)};
  }

  :host(.warning) {
    background-color: ${themeConditional(paletteRedLight3, paletteRedDark3)};
    border-color: ${themeConditional(paletteRedLight2, paletteRedDark2)};
    color: ${themeConditional(paletteRedDark2, paletteRedLight2)};
  }

  :host(.warning) .container > svg {
    color: ${themeConditional(paletteRedBase, paletteRedLight1)};
  }

  :host(.warning) .close {
    background-color: ${themeConditional(paletteRedLight3, paletteRedDark3)};
    color: ${themeConditional(paletteRedDark2, paletteRedLight2)};
  }

  :host(.warning) .close:hover::before {
    background-color: ${themeConditional(paletteRedLight2, paletteRedDark2)};
  }

  :host(.important) {
    background-color: ${themeConditional(
      paletteYellowLight3,
      paletteYellowDark3
    )};
    border-color: ${themeConditional(paletteYellowLight2, paletteYellowDark2)};
    color: ${themeConditional(paletteYellowDark2, paletteYellowLight2)};
  }

  :host(.important) .container > svg {
    color: ${themeConditional(paletteYellowDark2, paletteYellowBase)};
  }

  :host(.important) .close {
    background-color: ${themeConditional(
      paletteYellowLight3,
      paletteYellowDark3
    )};
    color: ${themeConditional(paletteYellowDark2, paletteYellowLight2)};
  }

  :host(.important) .close:hover::before {
    background-color: ${themeConditional(
      paletteYellowLight2,
      paletteYellowDark2
    )};
  }

  :host(.progress) .progress-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
    border-radius: 0 0 2px 2px;
    overflow: hidden;
  }

  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(359deg);
    }
  }

  .spinner-holder > svg {
    animation: spin 2s linear infinite;
  }

  :host(.progress) {
    background-color: ${themeConditional(paletteWhite, paletteGrayDark3)};
    border-color: ${themeConditional(paletteBlueLight2, paletteGrayDark2)};
    color: ${themeConditional(paletteGrayDark2, paletteGrayLight2)};
  }

  :host(.progress) .container > svg {
    color: ${themeConditional(paletteGrayDark2, paletteGrayLight2)};
  }

  :host(.progress) .close {
    background-color: ${themeConditional(paletteWhite, paletteGrayDark3)};
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight1)};
  }

  :host(.progress) .close:hover::before {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  .title {
    font-weight: 700;
    padding-right: 4px;
  }

  .title + div {
    word-break: break-word;
  }

  .close-icon {
    display: flex;
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: center;
  }

  .close {
    border: none;
    appearance: unset;
    padding: unset;
    display: inline-block;
    border-radius: 100px;
    cursor: pointer;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    position: absolute;
    top: 8px;
    right: 12px;
  }

  .close:focus-visible {
    border: 1px solid ${paletteBlueLight1};
  }

  .close::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 100%;
    opacity: 0;
    transform: scale(0.8);
  }

  .close:hover::before {
    opacity: 1;
    transform: scale(1);
  }

  .close:focus-visible {
    outline: none;
  }

  .close svg {
    width: 16px;
    height: 16px;
  }
`;

export class Toast extends PPPAppearanceElement {
  @observable
  title;

  @observable
  text;

  @attr({ mode: 'boolean' })
  dismissible;
}

export default Toast.compose({
  template: toastTemplate,
  styles: toastStyles
}).define();
