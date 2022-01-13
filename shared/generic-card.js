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
