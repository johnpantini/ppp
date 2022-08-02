import { InstrumentsImportPage } from '../../shared/instruments-import-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import ppp from '../../ppp.js';

export const instrumentsImportPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} headless>
        <span slot="submit-control-text">Импортировать инструменты</span>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default InstrumentsImportPage.compose({
  template: instrumentsImportPageTemplate,
  styles: pageStyles
});
