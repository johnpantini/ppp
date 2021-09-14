/** @decorator */

import { FoundationElement } from '../../../lib/foundation-element/foundation-element.js';
import { observable } from '../../../lib/element/observation/observable.js';
import { html } from '../../../lib/template.js';
import { css } from '../../../lib/element/styles/css.js';
import { notDefined } from '../../../lib/utilities/style/display.js';

export class SshServersPage extends FoundationElement {}

export const sshServersPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>
      <${'ppp-button'} appearance="primary" slot="controls">Добавить машину</ppp-button>
      Машины SSH
    </ppp-page-header>
  </template>
`;

export const sshServersPageStyles = (context, definition) =>
  css`
    ${notDefined}
  `;

export const sshServersPage = SshServersPage.compose({
  baseName: 'ssh-servers-page',
  template: sshServersPageTemplate,
  styles: sshServersPageStyles
});
