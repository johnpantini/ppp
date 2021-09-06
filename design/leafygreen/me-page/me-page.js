/** @decorator */

import { FoundationElement } from '../../../lib/foundation-element/foundation-element.js';
import { observable } from '../../../lib/element/observation/observable.js';
import { html } from '../../../lib/template.js';
import { css } from '../../../lib/element/styles/css.js';
import { notDefined } from '../../../lib/utilities/style/display.js';

export class MePage extends FoundationElement {
  @observable
  page;
}

export const mePageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Мой профиль</ppp-page-header>
  </template>
`;

export const mePageStyles = (context, definition) =>
  css`
    ${notDefined}
  `;

export const mePage = MePage.compose({
  baseName: 'me-page',
  template: mePageTemplate,
  styles: mePageStyles
});
