import { CmdistPage } from '../../../shared/pages/cmdist.js';
import { html } from '../../../../../shared/template.js';
import { css } from '../../../../../shared/element/styles/css.js';

export const cmdistPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Cmdist (в разработке)</ppp-page-header>
    </div>
  </template>
`;

export const cmdistPageStyles = (context, definition) => css``;

// noinspection JSUnusedGlobalSymbols
export const cmdistPage = CmdistPage.compose({
  baseName: 'cmdist-page',
  template: cmdistPageTemplate,
  styles: cmdistPageStyles
});
