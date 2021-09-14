/** @decorator */

import { FoundationElement } from '../../lib/foundation-element/foundation-element.js';
import { observable } from '../../lib/element/observation/observable.js';
import { html } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { notDefined } from '../../lib/utilities/style/display.js';

export class BrokersPage extends FoundationElement {}

export const brokersPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) => (x.app.page = 'new-broker')}"
      >
        Добавить брокера
      </ppp-button>
      Список брокеров
    </ppp-page-header>
  </template>
`;

export const brokersPageStyles = (context, definition) =>
  css`
    ${notDefined}
  `;

export const brokersPage = BrokersPage.compose({
  baseName: 'brokers-page',
  template: brokersPageTemplate,
  styles: brokersPageStyles
});
