import { html } from '../../../lib/template.js';
import { endTemplate, startTemplate } from '../../../lib/patterns/start-end.js';

// TODO - aria attributes
export const sideNavItemTemplate = (context, definition) => html`
  <template>
    ${startTemplate}
    <li class="content" part="content">
      <slot name="title"></slot>
    </li>
    ${endTemplate}
  </template>
`;
