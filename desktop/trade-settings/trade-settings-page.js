/** @decorator */

import { FoundationElement } from '../../lib/foundation-element/foundation-element.js';
import { observable } from '../../lib/element/observation/observable.js';
import { html } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { notDefined } from '../../lib/utilities/style/display.js';

export class TradeSettingsPage extends FoundationElement {
  @observable
  page;
}

export const tradeSettingsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Настройки торговли</ppp-page-header>
  </template>
`;

export const tradeSettingsPageStyles = (context, definition) =>
  css`
    ${notDefined}
  `;

export const tradeSettingsPage = TradeSettingsPage.compose({
  baseName: 'trade-settings-page',
  template: tradeSettingsPageTemplate,
  styles: tradeSettingsPageStyles
});
