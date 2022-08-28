import { SideNav } from '../../shared/side-nav.js';
import { css } from '../../shared/element/styles/css.js';
import { notDefined } from '../../shared/utilities/style/display.js';
import { html } from '../../shared/template.js';
import { repeat } from '../../shared/element/templating/repeat.js';
import { slotted } from '../../shared/element/templating/slotted.js';
import { ref } from '../../shared/element/templating/ref.js';

import { chevronLeft } from './icons/chevron-left.js';
import { chevronRight } from './icons/chevron-right.js';

// TODO - aria attributes
export const sideNavTemplate = (context, definition) => html`
  <template>
    <div class="wrapper">
      <nav
        class="nav"
        ?expanded="${(x) => x.expanded}"
        aria-label="side-nav"
        @pointerover="${(x, c) => x.handlePointerEnter(c)}"
        @pointerout="${(x, c) => x.handlePointerLeave(c)}"
        @pointercancel="${(x, c) => x.handlePointerLeave(c)}"
      >
        <div class="expanded-content">
          <ul>
            <slot
              ${slotted({
                filter: (x) => {
                  return (
                    x.nodeType !== 3 && x.firstElementChild.slot === 'start'
                  );
                },
                property: 'topLevelItems'
              })}
            ></slot>
          </ul>
        </div>
        <div class="collapsed-content">
          <ul>
            ${repeat(
              (x) => x.topLevelItems,
              html` <li>${(x) => html`${x.firstElementChild.outerHTML}`}</li>`
            )}
          </ul>
        </div>
      </nav>
      <button
        ${ref('collapseToggle')}
        class="collapse-toggle"
        ?expanded="${(x) => x.expanded}"
        @click="${(x) => (x.expanded = !x.expanded)}"
      >
        <div class="icon-wrapper">
          ${(x) =>
            x.expanded
              ? chevronLeft({ role: 'presentation' })
              : chevronRight({ role: 'presentation' })}
        </div>
      </button>
    </div>
  </template>
`;

// TODO - design tokens
export const sideNavStyles = (context, definition) =>
  css`
    ${notDefined}
    :host {
      width: 48px;
      position: relative;
    }

    :host([ready]) {
      transition: width 200ms ease-in-out 0s;
    }

    :host([expanded]) {
      width: 184px;
    }

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }

    ::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
    }

    .wrapper {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      display: flex;
    }

    .nav {
      width: 48px;
      background-color: rgb(249, 251, 250);
      border-right: 1px solid rgb(231, 238, 236);
      position: relative;
      z-index: 0;
    }

    :host([ready]) .nav {
      transition: all 200ms ease-in-out 0s;
    }

    .nav[expanded] {
      width: 184px;
    }

    :host([hovered]) .nav:not([expanded]) {
      width: 184px;
      border-right: 1px solid rgb(249, 251, 250);
      box-shadow: rgb(6 22 33 / 10%) 2px 0 4px;
    }

    .expanded-content,
    .collapsed-content {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    :host([ready]) .expanded-content,
    :host([ready]) .collapsed-content {
      transition: opacity 200ms ease-in-out 0s, transform 200ms ease-in-out 0s;
    }

    .expanded-content {
      opacity: 1;
    }

    .collapsed-content {
      opacity: 0;
    }

    .expanded-content > ul,
    .collapsed-content > ul {
      scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
      scrollbar-width: thin;
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

    .nav:not([expanded]) .expanded-content {
      opacity: 0;
      pointer-events: none;
    }

    .nav:not([expanded]) .collapsed-content {
      opacity: 1;
      pointer-events: auto;
    }

    :host([hovered]) .expanded-content {
      opacity: 1;
      pointer-events: auto;
    }

    :host([hovered]) .collapsed-content {
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

    .collapse-toggle[expanded]:hover .icon-wrapper {
      transform: translate3d(-2px, 0, 0);
    }

    .collapse-toggle:hover .icon-wrapper {
      transform: translate3d(2px, 0, 0);
    }
  `;

// noinspection JSUnusedGlobalSymbols
export default SideNav.compose({
  template: sideNavTemplate,
  styles: sideNavStyles
});
