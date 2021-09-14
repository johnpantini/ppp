/** @decorator */

import { FoundationElement } from '../../lib/foundation-element/foundation-element.js';
import { observable } from '../../lib/element/observation/observable.js';
import { html } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { notDefined } from '../../lib/utilities/style/display.js';

export class WardenKeysPage extends FoundationElement {
  @observable
  page;
}

export const wardenKeysPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Telegram Warden</ppp-page-header>
  </template>
`;

export const wardenKeysPageStyles = (context, definition) =>
  css`
    ${notDefined}
  `;

export const wardenKeysPage = WardenKeysPage.compose({
  baseName: 'warden-keys-page',
  template: wardenKeysPageTemplate,
  styles: wardenKeysPageStyles
});
