/** @decorator */

import { FoundationElement } from '../../../lib/foundation-element/foundation-element.js';
import { observable } from '../../../lib/element/observation/observable.js';
import { html } from '../../../lib/template.js';
import { css } from '../../../lib/element/styles/css.js';
import { notDefined } from '../../../lib/utilities/style/display.js';

export class UpdatesPage extends FoundationElement {
  @observable
  page;
}

export const updatesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Обновление PPP</ppp-page-header>
  </template>
`;

export const updatesPageStyles = (context, definition) =>
  css`
    ${notDefined}
  `;

export const updatesPage = UpdatesPage.compose({
  baseName: 'updates-page',
  template: updatesPageTemplate,
  styles: updatesPageStyles
});
