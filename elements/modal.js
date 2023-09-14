/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  css,
  ref,
  html,
  attr,
  when,
  Observable,
  observable
} from '../vendor/fast-element.min.js';
import { normalize, scrollbars, typography } from '../design/styles.js';
import { close } from '../static/svg/sprite.js';
import {
  paletteBlack,
  paletteBlueLight1,
  paletteBlueLight2,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteWhite,
  spacing2,
  spacing3,
  themeConditional,
  toColorComponents
} from '../design/design-tokens.js';
import { display } from '../vendor/fast-utilities.js';
import ppp from '../ppp.js';

export const modalTemplate = html`
  <template>
    <div class="holder">
      <div aria-modal="true" role="dialog" tabindex="-1" class="content">
        <slot name="title-icon"></slot>
        <h3 class="title">
          <slot name="title"></slot>
        </h3>
        <p class="description">
          <slot name="description"></slot>
        </p>
        <div class="body body1">
          <slot name="body"></slot>
        </div>
        ${when(
          (x) => x.dismissible,
          html` <button
            @click="${(x) => {
              x.setAttribute('hidden', '');
              x.result = false;
            }}"
            aria-disabled="false"
            class="close"
            tabindex="0"
          >
            <div class="close-icon">${html.partial(close)}</div>
          </button>`
        )}
      </div>
    </div>
  </template>
`;

export const modalStyles = css`
  ${normalize()}
  ${typography()}
  ${display('block')}
  ${scrollbars()}
  ${scrollbars(':host-context(*)')}
  :host {
    background-color: rgba(
      ${themeConditional(
        toColorComponents(paletteBlack),
        toColorComponents(paletteGrayBase)
      )},
      0.4
    );
    overflow-y: auto;
    position: fixed;
    inset: 0;
    z-index: 100000000;
  }

  .holder {
    position: absolute;
    min-height: 100%;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .title {
    margin-bottom: 10px;
    padding: 40px 36px 0;
  }

  :host([with-icon]) .title {
    padding: 40px 36px 0 78px;
  }

  .description {
    color: ${themeConditional(paletteBlack, paletteGrayLight1)};
    padding: 0 36px;
  }

  :host([with-icon]) .description {
    padding: 0 36px 0 78px;
  }

  .content {
    position: relative;
    margin: auto;
    width: 600px;
    max-height: calc(100% - 64px);
    padding: initial;
    border-radius: 24px;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
  }

  :host(.auto) .content {
    width: auto;
  }

  :host(.small) .content {
    width: 400px;
  }

  :host(.large) .content {
    width: 720px;
  }

  :host(.xlarge) .content {
    width: 900px;
  }

  :host(.xxlarge) .content {
    width: 1200px;
  }

  .content:focus-visible {
    outline: none;
  }

  .body {
    margin-top: ${spacing3};
  }

  .close {
    border: none;
    appearance: unset;
    padding: unset;
    display: inline-block;
    border-radius: 100px;
    cursor: pointer;
    flex-shrink: 0;
    background-color: transparent;
    height: 28px;
    width: 28px;
    position: absolute;
    top: 18px;
    right: 18px;
    color: ${themeConditional(paletteGrayDark1, paletteGrayBase)};
  }

  .close::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 100%;
  }

  .close:hover {
    color: ${themeConditional(paletteBlack, paletteGrayLight3)};
  }

  .close:hover::before {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  .close:focus {
    border: 1px solid ${paletteBlueLight1};
    outline: none;
  }

  .close-icon {
    display: flex;
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: center;
  }

  .close-icon svg {
    width: 16px;
    height: 16px;
  }

  ::slotted(.mount) {
    padding: 0 11px 11px 10px;
  }
`;

export class Modal extends PPPElement {
  @observable
  result;

  @attr({ mode: 'boolean' })
  hidden;

  @attr({ mode: 'boolean' })
  dismissible;

  hiddenChanged(oldValue, newValue) {
    if (typeof oldValue !== 'undefined') {
      if (newValue && ppp.app.toast.getAttribute('appearance') !== 'note') {
        ppp.app.toast.setAttribute('hidden', '');
      }
    }
  }
}

export default Modal.compose({
  template: modalTemplate,
  styles: modalStyles
}).define();
