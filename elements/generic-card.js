import { PPPElement } from '../lib/ppp-element.js';
import { css, html } from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { normalize, typography } from '../design/styles.js';
import {
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark4,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteWhite,
  themeConditional
} from '../design/design-tokens.js';

export function filterCards(cards, text) {
  for (const card of Array.from(cards)) {
    if (!text || new RegExp(text.trim(), 'ig').test(card.textContent))
      card.style.display = 'initial';
    else card.style.display = 'none';
  }
}

export const genericCardTemplate = html`
  <template>
    <div class="logo">
      <slot name="logo"></slot>
    </div>
    <div class="title">
      <slot name="title"></slot>
    </div>
    <div class="description">
      <slot name="description"></slot>
    </div>
    <div class="action">
      <slot name="action"></slot>
    </div>
  </template>
`;

export const genericCardStyles = css`
  ${normalize()}
  ${display('flex')}
  ${typography()}
  :host {
    flex-direction: column;
    min-height: 220px;
    padding: 22px 32px 22px;
    position: relative;
    width: 370px;
    border-radius: 12px;
    border: 1px solid ${paletteGrayBase};
    background-color: ${themeConditional(paletteWhite, paletteGrayDark4)};
  }

  .logo {
    height: 50px;
  }

  .title {
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
    margin: 5px 0;
  }

  .description {
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight1)};
    font-size: 14px;
    padding-bottom: 16px;
  }

  .action {
    margin-top: auto;
  }
`;

export class GenericCard extends PPPElement {}

export default GenericCard.compose({
  template: genericCardTemplate,
  styles: genericCardStyles
}).define();
