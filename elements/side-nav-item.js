/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import { attr, css, html } from '../vendor/fast-element.min.js';
import {
  startSlotTemplate,
  endSlotTemplate
} from '../vendor/fast-patterns.js';
import { display } from '../vendor/fast-utilities.js';
import {
  bodyFont,
  fontSizeBody1,
  fontWeightBody1,
  lineHeightBody1,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark3,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteGreenDark1,
  paletteGreenDark2,
  paletteGreenDark3,
  paletteGreenLight1,
  paletteGreenLight3,
  paletteWhite,
  spacing1,
  spacing2,
  spacing3,
  themeConditional,
  toColorComponents
} from '../design/design-tokens.js';
import { ellipsis } from '../design/styles.js';
import { normalize } from '../design/styles.js';

export const sideNavItemTemplate = html`
  <template>
    ${startSlotTemplate()}
    <li class="content" part="content">
      <slot name="title"></slot>
    </li>
    ${endSlotTemplate()}
  </template>
`;

export const sideNavItemStyles = css`
  ${display('flex')}
  ${normalize()}
  :host {
    position: relative;
    gap: ${spacing2};
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    font-weight: ${fontWeightBody1};
    line-height: ${lineHeightBody1};
    margin: 0;
    appearance: none;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    min-height: 32px;
    padding: ${spacing1} ${spacing3};
    align-items: center;
    text-align: left;
    text-decoration: none;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  :host(.ellipsis) .content {
    ${ellipsis()};
    max-width: 130px;
  }

  :host([disabled]) {
    color: ${paletteGrayBase};
    background-color: rgba(${toColorComponents(paletteGrayLight3)}, 0);
    pointer-events: none;
  }

  :host(:hover) {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark3)};
    text-decoration: none;
  }

  :host([active]:not([disabled])) {
    color: ${themeConditional(paletteGreenDark2, paletteWhite)};
    background-color: ${themeConditional(
      paletteGreenLight3,
      paletteGreenDark3
    )};
    font-weight: bold;
  }

  :host(:not([disabled])) .content::before {
    content: '';
    position: absolute;
    background-color: transparent;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 4px;
    border-radius: 0 6px 6px 0;
    transform: scaleY(0.3);
  }

  :host([active]:not([disabled])) .content::before {
    transform: scaleY(1);
    background-color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  :host([disabled]) slot[name='start']::slotted(.action-icon) {
    color: ${paletteGrayBase} !important;
  }

  .content {
    ${ellipsis()};
  }

  ::slotted(span[slot='start']),
  ::slotted(span[slot='end']) {
    display: inline-flex;
    align-items: center;
    width: 16px;
    height: 16px;
  }

  ::slotted(.action-icon) {
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight1)};
  }
`;

export class SideNavItem extends PPPElement {
  @attr({ mode: 'boolean' })
  disabled;

  @attr({ mode: 'boolean' })
  active;
}

export default SideNavItem.compose({
  template: sideNavItemTemplate,
  styles: sideNavItemStyles
}).define();
