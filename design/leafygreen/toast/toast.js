import { Toast } from '../../../lib/toast/toast.js';
import { css } from '../../../lib/element/styles/css.js';
import { ref } from '../../../lib/element/templating/ref.js';
import { html } from '../../../lib/template.js';
import { appearanceBehavior } from '../../../lib/utilities/behaviors.js';
import { when } from '../../../lib/element/templating/when.js';

import { bodyFont } from '../design-tokens.js';

import { checkmarkWithCircle } from '../icons/checkmark-with-circle.js';
import { warning } from '../icons/warning.js';
import { settings } from '../icons/settings.js';
import { x } from '../icons/x.js';

// TODO - aria attributes
export const toastTemplate = (context, definition) => html`
  <template>
    <div class="container">
      ${when(
        (x) => x.appearance === 'success',
        checkmarkWithCircle({ size: 'xxlarge', viewBox: '0 0 16 16' })
      )}
      ${when(
        (x) => x.appearance === 'warning',
        warning({ size: 'xxlarge', viewBox: '0 0 16 16' })
      )}
      ${when(
        (x) => x.appearance === 'progress',
        settings({ size: 'xxlarge', viewBox: '0 0 16 16', cls: 'spinner-icon' })
      )}
      <div>
        <div class="title">${(x) => x.source?.toastTitle}</div>
        <div class="text">${(x) => x.source?.toastText}</div>
      </div>
    </div>
    ${when(
      (x) => !!x.dismissible,
      html` <button
        @click="${(x) => (x.visible = false)}"
        aria-label="Close Message"
        class="close"
        tabindex="0"
      >
        <div class="close-icon">${x({})}</div>
      </button>`
    )}
    ${when(
      (x) => x.appearance === 'progress',
      html`
        <div class="progress-container">
          <${'ppp-progress'} ${ref('progress')} min="0" max="100">
          </ppp-progress>
        </div>`
    )}
  </template>
`;

export const successToastStyles = (context, definition) => css`
  :host([appearance='success']) {
    background-color: rgb(228, 244, 228);
  }

  :host([appearance='success']) .container {
    border: 1px solid rgb(195, 231, 202);
  }

  :host([appearance='success']) .container > svg {
    color: rgb(9, 128, 76);
  }

  :host([appearance='success']) .title {
    color: rgb(17, 97, 73);
  }

  :host([appearance='success']) .text {
    color: rgb(17, 97, 73);
  }

  :host([appearance='success']) .close {
    color: rgb(17, 97, 73);
  }

  :host([appearance='success']) .close:hover::before {
    background-color: rgb(195, 231, 202);
  }
`;

export const warningToastStyles = (context, definition) => css`
  :host([appearance='warning']) {
    background-color: rgb(252, 235, 226);
  }

  :host([appearance='warning']) .container {
    border: 1px solid rgb(249, 211, 197);
  }

  :host([appearance='warning']) .container > svg {
    color: rgb(207, 74, 34);
  }

  :host([appearance='warning']) .title {
    color: rgb(143, 34, 27);
  }

  :host([appearance='warning']) .text {
    color: rgb(143, 34, 27);
  }

  :host([appearance='warning']) .close {
    color: rgb(177, 55, 31);
  }

  :host([appearance='warning']) .close:hover {
    color: rgb(11, 59, 53);
  }

  :host([appearance='warning']) .close:hover::before {
    background-color: rgb(249, 211, 197);
  }
`;

export const progressToastStyles = (context, definition) => css`
  :host([appearance='progress']) {
    background-color: rgb(255, 255, 255);
  }

  :host([appearance='progress']) .container {
    border-width: 1px 1px 0;
    border-top-style: solid;
    border-right-style: solid;
    border-left-style: solid;
    border-top-color: rgb(197, 228, 242);
    border-right-color: rgb(197, 228, 242);
    border-left-color: rgb(197, 228, 242);
    border-image: initial;
    border-bottom-style: initial;
    border-bottom-color: initial;
  }

  :host([appearance='progress']) .container > svg {
    color: rgb(61, 79, 88);
  }

  :host([appearance='progress']) .title {
    color: rgb(61, 79, 88);
  }

  :host([appearance='progress']) .text {
    color: rgb(61, 79, 88);
  }

  :host([appearance='progress']) .progress-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6px;
    background-color: rgb(231, 238, 236);
    border-radius: 0 0 4px 4px;
    overflow: hidden;
  }

  :host([appearance='progress']) .close {
    color: rgb(137, 151, 155);
  }

  :host([appearance='progress']) .close:hover {
    color: rgb(61, 79, 88);
  }

  :host([appearance='progress']) .close:hover::before {
    background-color: rgb(231, 238, 236);
  }
`;

// TODO - design tokens
export const toastStyles = (context, definition) =>
  css`
    :host {
      z-index: 1000;
      position: fixed;
      bottom: 64px;
      left: 24px;
      width: 400px;
      max-width: calc(100vw - 48px);
      border-radius: 4px;
      box-shadow: rgba(6, 22, 33, 0.3) 0 18px 18px -15px;
      overflow: hidden;
      transform-origin: center bottom;
      visibility: hidden;
      transition: all 150ms ease-in-out 0s;
      transform: translate3d(0, 16px, 0) scale(0.95);
      opacity: 0;
      pointer-events: none;
    }

    :host([visible]) {
      visibility: visible;
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .container {
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      padding: 16px;
      border-radius: 4px;
    }

    .title {
      font-family: ${bodyFont};
      margin: unset;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0;
      font-weight: bold;
    }

    .text {
      font-family: ${bodyFont};
      margin: unset;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0;
      font-weight: 400;
    }

    .close {
      border: none;
      appearance: unset;
      padding: unset;
      display: inline-block;
      border-radius: 100px;
      cursor: pointer;
      flex-shrink: 0;
      background-color: rgba(255, 255, 255, 0);
      height: 28px;
      width: 28px;
      position: absolute;
      top: 8px;
      right: 8px;
      transition: color 0.15s ease-in-out 0s;
    }

    .close::before {
      content: '';
      transition: all 150ms ease-in-out 0s;
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

    .close:focus {
      color: rgb(26, 86, 126);
      outline: none;
    }

    .close:focus::before {
      background-color: rgb(197, 228, 242);
      opacity: 1;
      transform: scale(1);
    }

    .close-icon {
      position: absolute;
      inset: 0;
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: center;
      justify-content: center;
    }

    .container > svg {
      flex-shrink: 0;
      margin-right: 16px;
    }

    @keyframes spin {
      0% {
        transform: rotate(0);
      }
      100% {
        transform: rotate(359deg);
      }
    }

    svg.spinner-icon {
      animation: spin 2s linear infinite;
    }
  `.withBehaviors(
    appearanceBehavior('success', successToastStyles(context, definition)),
    appearanceBehavior('warning', warningToastStyles(context, definition)),
    appearanceBehavior('progress', progressToastStyles(context, definition))
  );

export const toast = Toast.compose({
  baseName: 'toast',
  template: toastTemplate,
  styles: toastStyles
});
