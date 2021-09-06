/** @decorator */

import { FoundationElement } from '../../../lib/foundation-element/foundation-element.js';
import { observable } from '../../../lib/element/observation/observable.js';
import { html } from '../../../lib/template.js';
import { css } from '../../../lib/element/styles/css.js';
import { notDefined } from '../../../lib/utilities/style/display.js';

export class PersonalServerPage extends FoundationElement {
  @observable
  page;
}

export const personalServerPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Настройки персонального сервера</ppp-page-header>
  </template>
`;

export const personalServerPageStyles = (context, definition) =>
  css`
    ${notDefined}
  `;

export const personalServerPage = PersonalServerPage.compose({
  baseName: 'personal-server-page',
  template: personalServerPageTemplate,
  styles: personalServerPageStyles
});
