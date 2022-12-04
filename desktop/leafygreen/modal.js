import { Modal, modalTemplate } from '../../shared/modal.js';
import { css } from '../../shared/element/styles/css.js';
import { notDefined } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';
import { x } from './icons/x.js';

export const modalStyles = css`
  * {
    box-sizing: border-box;
  }

  ${notDefined}
  :host {
    background-color: rgba(6, 22, 33, 0.6);
    overflow-y: auto;
    position: fixed;
    inset: 0;
    transition: all 150ms ease-in-out 0s;
    opacity: 0;
    z-index: 100;
    visibility: hidden;
    scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.4);
    scrollbar-width: thin;
  }

  :host-context(*)::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  :host-context(*)::-webkit-scrollbar-track {
    background-color: rgba(255, 255, 255, 0.3);
  }

  :host-context(*)::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.4);
  }

  :host([visible]) {
    opacity: 1;
    visibility: visible;
  }

  .holder {
    position: absolute;
    min-height: 100%;
    padding: 64px 18px;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .content {
    transition: all 150ms ease-in-out 0s;
    margin: auto;
    max-height: calc(100% - 64px);
    padding: 40px 36px;
    border-radius: 24px;
    box-shadow: rgb(0 30 43 / 60%) 0 8px 20px -8px;
    position: relative;
    color: rgb(33, 49, 60);
    background-color: rgb(255, 255, 255);
    transform: translate3d(0, -16px, 0);
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }

  .content:focus-visible {
    outline: none;
  }

  :host([visible]) .content {
    transform: translate3d(0, 0, 0);
    opacity: 1;
    pointer-events: all;
    visibility: visible;
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
    top: 18px;
    right: 18px;
    transition: color 0.15s ease-in-out 0s;
    color: rgb(136, 147, 151);
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

  .close:hover {
    color: rgb(0, 30, 43);
  }

  .close:hover::before {
    opacity: 1;
    transform: scale(1);
    background-color: rgb(231, 238, 236);
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
    align-items: center;
    justify-content: center;
  }

  .title {
    margin: unset;
    font-family: ${bodyFont};
    color: rgb(33, 49, 60);
    font-size: 24px;
    line-height: 32px;
    letter-spacing: 0;
    box-sizing: border-box;
  }

  .body {
    margin: 0;
    padding: 18px 0;
  }
`;

export default Modal.compose({
  template: modalTemplate,
  styles: modalStyles,
  closeIcon: x()
});
