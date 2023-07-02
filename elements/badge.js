import { PPPAppearanceElement } from '../lib/ppp-element.js';
import { css, html } from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { ellipsis, normalize, typography } from '../design/styles.js';
import {
  bodyFont,
  fontSizeBody1,
  lineHeightBody1,
  paletteBlueDark1,
  paletteBlueDark2,
  paletteBlueLight2,
  paletteBlueLight3,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteGreenDark2,
  paletteGreenDark3,
  paletteGreenLight2,
  paletteGreenLight3,
  paletteRedDark2,
  paletteRedDark3,
  paletteRedLight2,
  paletteRedLight3,
  paletteWhite,
  paletteYellowDark2,
  paletteYellowDark3,
  paletteYellowLight2,
  paletteYellowLight3,
  themeConditional
} from '../design/design-tokens.js';

export const badgeTemplate = html`
  <template>
    <slot></slot>
  </template>
`;

export const badgeStyles = css`
  ${normalize()}
  ${display('inline-flex')}
  ${typography()}
  :host {
    font-family: ${bodyFont};
    align-items: center;
    font-weight: 700;
    font-size: calc(${fontSizeBody1} - 1px);
    line-height: calc(${lineHeightBody1} - 4px);
    border-radius: 4px;
    height: 18px;
    padding-left: 6px;
    padding-right: 6px;
    text-transform: uppercase;
    ${ellipsis()};
  }

  :host(.lightgray) {
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark1)};
    border-color: ${themeConditional(paletteGrayLight2, paletteGrayBase)};
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight3)};
  }

  :host(.darkgray) {
    background-color: ${themeConditional(paletteGrayDark2, paletteGrayDark3)};
    border-color: ${themeConditional(paletteGrayDark3, paletteGrayDark2)};
    color: ${themeConditional(paletteWhite, paletteGrayLight2)};
  }

  :host(.red) {
    background-color: ${themeConditional(paletteRedLight3, paletteRedDark3)};
    border-color: ${themeConditional(paletteRedLight2, paletteRedDark2)};
    color: ${themeConditional(paletteRedDark2, paletteRedLight2)};
  }

  :host(.yellow) {
    background-color: ${themeConditional(
      paletteYellowLight3,
      paletteYellowDark3
    )};
    border-color: ${themeConditional(paletteYellowLight2, paletteYellowDark2)};
    color: ${themeConditional(paletteYellowDark2, paletteYellowLight2)};
  }

  :host(.blue) {
    background-color: ${themeConditional(paletteBlueLight3, paletteBlueDark2)};
    border-color: ${themeConditional(paletteBlueLight2, paletteBlueDark1)};
    color: ${themeConditional(paletteBlueDark1, paletteBlueLight2)};
  }

  :host(.green) {
    background-color: ${themeConditional(
      paletteGreenLight3,
      paletteGreenDark3
    )};
    border-color: ${themeConditional(paletteGreenLight2, paletteGreenDark2)};
    color: ${themeConditional(paletteGreenDark2, paletteGreenBase)};
  }
`;

export class Badge extends PPPAppearanceElement {}

export default Badge.compose({
  template: badgeTemplate,
  styles: badgeStyles
}).define();
