/** @decorator */

import { ServersPage } from '../../base/servers/servers-page.js';
import { html } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { when } from '../../lib/element/templating/when.js';
import { ref } from '../../lib/element/templating/ref.js';
import {
  basePageStyles,
  loadingIndicator
} from '../../design/leafygreen/styles/page.js';

await i18nImport(['servers']);

export const serversPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) => (x.app.page = 'new-server')}"
      >
        Добавить сервер
      </ppp-button>
      Список серверов
    </ppp-page-header>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <${'ppp-table'} ${ref('table')}
        :columns="${(x) => x.columns}">
      </ppp-table>
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
    </div>
  </template>
`;

export const serversPageStyles = (context, definition) =>
  css`
    ${basePageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

export const serversPage = ServersPage.compose({
  baseName: 'servers-page',
  template: serversPageTemplate,
  styles: serversPageStyles
});
