/** @decorator */

import { FoundationElement } from '../../../lib/foundation-element/foundation-element.js';
import { observable } from '../../../lib/element/observation/observable.js';
import { html } from '../../../lib/template.js';
import { css } from '../../../lib/element/styles/css.js';
import { notDefined } from '../../../lib/utilities/style/display.js';

export class NewBrokerPage extends FoundationElement {
  @observable
  page;
}

export const newBrokerPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Новый профиль брокера</ppp-page-header>
  </template>
`;

export const newBrokerPageStyles = (context, definition) =>
  css`
    ${notDefined}
  `;

export const newBrokerPage = NewBrokerPage.compose({
  baseName: 'new-broker-page',
  template: newBrokerPageTemplate,
  styles: newBrokerPageStyles
});
