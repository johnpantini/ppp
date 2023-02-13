import { PPPAppearanceElement } from '../lib/ppp-element.js';
import { css, when, html } from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { normalize, typography } from '../design/styles.js';
import {
  infoWithCircle,
  importantWithCircle,
  checkmarkWithCircle,
  warning
} from '../static/svg/sprite.js';
import {
  bodyFont, fontWeightBody1,
  paletteBlueBase,
  paletteBlueDark2,
  paletteBlueDark3,
  paletteBlueLight1,
  paletteBlueLight2,
  paletteBlueLight3,
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
  paletteYellowBase,
  paletteYellowDark2,
  paletteYellowDark3,
  paletteYellowLight2,
  paletteYellowLight3,
  themeConditional,
} from '../design/design-tokens.js'

export const bannerTemplate = html`
  <template role="alert">
    ${when(
      (x) => x.appearance === 'success',
      html`${html.partial(checkmarkWithCircle)}`
    )}
    ${when(
      (x) => x.appearance === 'info',
      html`${html.partial(infoWithCircle)}`
    )}
    ${when(
      (x) => x.appearance === 'warning',
      html`${html.partial(importantWithCircle)}`
    )}
    ${when((x) => x.appearance === 'danger', html`${html.partial(warning)}`)}
    <div class="content body1">
      <slot></slot>
    </div>
  </template>
`;

export const bannerStyles = css`
  ${normalize()}
  ${display('flex')}
  ${typography()}
  :host {
    position: relative;
    font-family: ${bodyFont};
    min-height: 40px;
    padding: 10px 12px 10px 20px;
    border-width: 1px 1px 1px 0;
    border-style: solid;
    border-radius: 12px;
  }

  :host(.inline) {
    display: inline-flex;
  }

  :host::before {
    content: '';
    position: absolute;
    width: 13px;
    top: -1px;
    bottom: -1px;
    left: 0;
    border-radius: 12px 0 0 12px;
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .content {
    align-self: center;
    flex-grow: 1;
    margin-left: 13px;
    margin-right: 10px;
  }

  :host a {
    font-size: inherit;
    line-height: inherit;
    font-weight: ${fontWeightBody1};
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
    border-radius: 4px;
    display: inline;
  }

  :host a:hover,
  :host a:focus,
  :host a:focus-visible {
    outline: none;
  }

  :host a:hover {
    text-decoration: none;
  }

  :host a:focus-visible {
    position: relative;
  }

  :host(.info) {
    color: ${themeConditional(paletteBlueDark2, paletteBlueLight2)};
    border-color: ${themeConditional(paletteBlueLight2, paletteBlueDark2)};
    border-left-color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
    background-color: ${themeConditional(paletteBlueLight3, paletteBlueDark3)};
  }

  :host(.info) a {
    color: ${themeConditional(paletteBlueDark3, paletteBlueLight3)};
  }

  :host(.info) a:hover {
    color: ${themeConditional(paletteBlueDark2, paletteBlueLight2)};
  }

  :host(.info)::before {
    background: linear-gradient(
      to left,
      transparent 6px,
      ${themeConditional(paletteBlueBase, paletteBlueLight1)} 6px
    );
  }

  :host(.info) svg {
    color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  :host(.success) {
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight2)};
    border-color: ${themeConditional(paletteGreenLight2, paletteGreenDark2)};
    border-left-color: ${themeConditional(paletteGreenBase, paletteGreenBase)};
    background-color: ${themeConditional(
      paletteGreenLight3,
      paletteGreenDark3
    )};
  }

  :host(.success) a {
    color: ${themeConditional(paletteGreenDark3, paletteGreenLight3)};
  }

  :host(.success) a:hover {
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight2)};
  }

  :host(.success)::before {
    background: linear-gradient(
      to left,
      transparent 6px,
      ${themeConditional(paletteGreenDark1, paletteGreenBase)} 6px
    );
  }

  :host(.success) svg {
    color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  :host(.warning) {
    color: ${themeConditional(paletteYellowDark2, paletteYellowLight2)};
    border-color: ${themeConditional(paletteYellowLight2, paletteYellowDark2)};
    border-left-color: ${themeConditional(
      paletteYellowBase,
      paletteYellowDark2
    )};
    background-color: ${themeConditional(
      paletteYellowLight3,
      paletteYellowDark3
    )};
  }

  :host(.warning) a {
    color: ${themeConditional(paletteYellowDark3, paletteYellowLight3)};
  }

  :host(.warning) a:hover {
    color: ${themeConditional(paletteYellowDark2, paletteYellowLight2)};
  }

  :host(.warning)::before {
    background: linear-gradient(
      to left,
      transparent 6px,
      ${themeConditional(paletteYellowBase, paletteYellowDark2)} 6px
    );
  }

  :host(.warning) svg {
    color: ${themeConditional(paletteYellowDark2, paletteYellowBase)};
  }

  :host(.danger) {
    color: ${themeConditional(paletteRedDark2, paletteRedLight2)};
    border-color: ${themeConditional(paletteRedLight2, paletteRedDark2)};
    border-left-color: ${themeConditional(paletteRedBase)};
    background-color: ${themeConditional(paletteRedLight3, paletteRedDark3)};
  }

  :host(.danger) a {
    color: ${themeConditional(paletteRedLight3)};
  }

  :host(.danger) a:hover {
    color: ${themeConditional(paletteRedLight2)};
  }

  :host(.danger)::before {
    background: linear-gradient(
      to left,
      transparent 6px,
      ${themeConditional(paletteRedBase)} 6px
    );
  }

  :host(.danger) svg {
    color: ${themeConditional(paletteRedBase, paletteRedLight1)};
  }
`;

export class Banner extends PPPAppearanceElement {}

export default Banner.compose({
  template: bannerTemplate,
  styles: bannerStyles
}).define();
