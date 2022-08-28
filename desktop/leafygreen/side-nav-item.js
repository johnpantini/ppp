import { SideNavItem } from '../../shared/side-nav-item.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { html } from '../../shared/template.js';
import {
  endSlotTemplate,
  startSlotTemplate
} from '../../shared/patterns/start-end.js';

// TODO - aria attributes
export const sideNavItemTemplate = (context, definition) => html`
  <template>
    ${startSlotTemplate}
    <li class="content" part="content">
      <slot name="title"></slot>
    </li>
    ${endSlotTemplate}
  </template>
`;

// TODO - design tokens
export const sideNavItemStyles = (context, definition) =>
  css`
    ${display('list-item')}
    :host {
      margin: 0;
      appearance: none;
      background: none rgba(249, 251, 250, 0);
      border: none;
      cursor: pointer;
      width: 100%;
      min-height: 32px;
      padding: 4px 16px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      font-weight: normal;
      text-align: left;
      text-decoration: none;
      color: rgb(61, 79, 88);
      transition: background-color 150ms ease-in-out 0s;
      font-size: 14px;
      line-height: 20px;
    }

    :host(.ellipsis) .content {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 130px;
    }

    :host([disabled]) {
      color: rgb(184, 196, 194);
      background-color: rgba(249, 251, 250, 0);
      pointer-events: none;
    }

    :host(:hover) {
      background-color: rgb(231, 238, 236);
      text-decoration: none;
    }

    :host([active]:not([disabled])) {
      color: rgb(11, 59, 53);
      background-color: rgb(228, 244, 228);
      font-weight: bold;
    }

    :host([disabled]) slot[name='start']::slotted(.action-icon) {
      color: rgb(184, 196, 194) !important;
    }

    .start,
    .end {
      display: inline-flex;
      align-items: center;
    }

    .start {
      margin-inline-end: 8px;
    }

    .end {
      margin-inline-start: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export default SideNavItem.compose({
  template: sideNavItemTemplate,
  styles: sideNavItemStyles
});
