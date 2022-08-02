import { FoundationElement } from './foundation-element.js';
import { html } from './template.js';

export class GenericCard extends FoundationElement {}

export const genericCardTemplate = (context, definition) => html`
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

export function filterCards(cards, text) {
  for (const card of Array.from(cards)) {
    if (!text || new RegExp(text.trim(), 'ig').test(card.textContent))
      card.style.display = 'initial';
    else card.style.display = 'none';
  }
}
