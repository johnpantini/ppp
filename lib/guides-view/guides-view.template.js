import { html } from '../template.js';

export const guidesViewTemplate = (context, definition) => html`
  <template>
    <iframe
      width="100%"
      height="100%"
      name="ppp-guides"
      seamless
      src="https://pantini.gitbook.io/pantini-co/ppp/getting-started"
    ></iframe>
  </template>
`;
