import { css } from '../../../lib/element/styles/css.js';
import { notDefined } from '../../../lib/utilities/style/display.js';

// TODO - design tokens
export const sideNavStyles = (context, definition) =>
  css`
    ${notDefined}

    :host {
      width: 48px;
      transition: width 200ms ease-in-out 0s;
      position: relative;
    }

    :host([data-expanded]) {
      width: 184px;
    }

    ::-webkit-scrollbar {
      width: 4px;
    }

    ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      border-radius: 2px;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 2px;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
    }

    .wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      display: flex;
    }

    .nav {
      width: 48px;
      transition: all 200ms ease-in-out 0s;
      background-color: rgb(249, 251, 250);
      border-right: 1px solid rgb(231, 238, 236);
      position: relative;
      z-index: 0;
    }

    .nav[data-expanded] {
      width: 184px;
    }

    :host([data-hovered]) .nav:not([data-expanded]) {
      width: 184px;
      border-right: 1px solid rgb(249, 251, 250);
      box-shadow: rgb(6 22 33 / 10%) 2px 0 4px;
    }

    .expanded-content,
    .collapsed-content {
      transition: opacity 200ms ease-in-out 0s, transform 200ms ease-in-out 0s;
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .expanded-content {
      opacity: 1;
    }

    .collapsed-content {
      opacity: 0;
    }

    .expanded-content > ul,
    .collapsed-content > ul {
      margin-block: 0;
      padding-inline-start: 0;
      padding: 16px 0;
      list-style-type: none;
      overflow: hidden auto;
      position: absolute;
      inset: 0;
    }

    .expanded-content > ul {
      width: 184px;
    }

    .collapsed-content > ul li:first-of-type {
      border-top: 1px solid rgb(231, 238, 236);
    }

    .collapsed-content > ul li {
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: center;
      justify-content: center;
      height: 40px;
      border-bottom: 1px solid rgb(231, 238, 236);
      color: rgb(17, 97, 73);
    }

    .collapsed-content .action-icon {
      color: #007cad;
    }

    .nav:not([data-expanded]) .expanded-content {
      opacity: 0;
      pointer-events: none;
    }

    .nav:not([data-expanded]) .collapsed-content {
      opacity: 1;
      pointer-events: auto;
    }

    :host([data-hovered]) .expanded-content {
      opacity: 1;
      pointer-events: auto;
    }

    :host([data-hovered]) .collapsed-content {
      opacity: 0;
      pointer-events: none;
    }

    .collapse-toggle {
      transition: all 150ms ease-in-out 0s;
      position: absolute;
      bottom: 16px;
      right: -16px;
      width: 32px;
      height: 32px;
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: center;
      justify-content: center;
      border-radius: 100%;
      color: rgb(17, 97, 73);
      box-shadow: rgb(6 22 33 / 10%) 0 3px 4px;
      background-color: rgb(255, 255, 255);
      border: 1px solid rgb(231, 238, 236);
      cursor: pointer;
    }

    .collapse-toggle:focus {
      outline: none;
    }

    .icon-wrapper {
      transition: transform 80ms ease-in-out 0s;
      display: inline-block;
      height: 16px;
    }

    .collapse-toggle:hover {
      background-color: rgb(249, 251, 250);
      box-shadow: rgb(6 22 33 / 20%) 0 2px 2px;
    }

    .collapse-toggle[data-expanded]:hover .icon-wrapper {
      transform: translate3d(-2px, 0, 0);
    }

    .collapse-toggle:hover .icon-wrapper {
      transform: translate3d(2px, 0, 0);
    }
  `;
