import { CmdistPage } from '[%#payload.baseUrl%]/shared/pages/cmdist.js';
import { html } from '[%#globalThis.location.origin%]/shared/template.js';
import { css } from '[%#globalThis.location.origin%]/shared/element/styles/css.js';

export const cmdistPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Cmdist (work in progress, not ready yet!)</ppp-page-header>
    </div>
  </template>
`;

export const cmdistPageStyles = (context, definition) => css`
  :host {
  }
`;

// noinspection JSUnusedGlobalSymbols
export const cmdistPage = CmdistPage.compose({
  baseName: 'cmdist-page',
  template: cmdistPageTemplate,
  styles: cmdistPageStyles
});
