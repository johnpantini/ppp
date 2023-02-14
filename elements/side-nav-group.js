/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import { css, html } from '../vendor/fast-element.min.js';
import {
  startSlotTemplate,
  endSlotTemplate
} from '../vendor/fast-patterns.js';
import {
  bodyFont, fontSizeBody1,
  paletteGreenDark2,
  paletteGreenLight1,
  spacing2,
  spacing3,
  themeConditional,
} from '../design/design-tokens.js'
import { display } from '../vendor/fast-utilities.js';
import { normalize } from '../design/styles.js';

export const sideNavGroupTemplate = html`
  <template>
    <div class="title">
      <div class="title-container">
        ${startSlotTemplate()}
        <slot name="title"></slot>
        ${endSlotTemplate()}
      </div>
    </div>
    <ul class="items-container">
      <slot name="items"></slot>
    </ul>
  </template>
`;

export const sideNavGroupStyles = css`
  ${display('flex')}
  ${normalize()}
  :host {
    display: flex;
    position: relative;
    flex-direction: column;
  }

  ::slotted(span[slot='start']),
  ::slotted(span[slot='end']) {
    display: inline-flex;
    align-items: center;
    width: 16px;
    height: 16px;
  }

  .title {
    display: flex;
    position: relative;
    font-family: ${bodyFont};
    font-size: calc(${fontSizeBody1} - 1px);
    font-weight: bold;
    padding: ${spacing3} ${spacing3} ${spacing2};
    align-items: center;
    letter-spacing: 0.4px;
    justify-content: space-between;
    text-transform: uppercase;
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight1)};
    margin: unset;
  }

  .title-container {
    display: inline-flex;
    align-items: center;
    gap: ${spacing2};
  }

  .items-container {
    margin-block: 0;
    padding-inline-start: 0;
    padding: 0;
    list-style-type: none;
  }
`;

export class SideNavGroup extends PPPElement {}

export default SideNavGroup.compose({
  template: sideNavGroupTemplate,
  styles: sideNavGroupStyles
}).define();
