import { CmdistPage } from '[%#payload.baseExtensionUrl%]/shared/pages/cmdist.js';
import { html } from '[%#ctx.ppp.rootUrl%]/shared/template.js';
import { css } from '[%#ctx.ppp.rootUrl%]/shared/element/styles/css.js';

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
export default CmdistPage.compose({
  baseName: 'cmdist-[%#payload.extension._id%]-page',
  template: cmdistPageTemplate,
  styles: cmdistPageStyles
});
