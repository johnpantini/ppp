import { html } from '../../../lib/template.js';
import { endTemplate, startTemplate } from '../../../lib/patterns/start-end.js';

// TODO - aria attributes
export const sideNavGroupTemplate = (context, definition) => html`
  <template>
    <div class="title">
      <div class="title-container">
        ${startTemplate}
        <slot name="title"></slot>
        ${endTemplate}
      </div>
    </div>
    <ul class="items-container">
      <slot name="items"></slot>
    </ul>
  </template>
`;
