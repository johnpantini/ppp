import { ServersPage } from '../../../shared/pages/servers.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { formatDate } from '../../../shared/intl.js';
import { trash } from '../icons/trash.js';
import { stateAppearance } from './services.js';

export const serversPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) => (x.app.page = 'server-selector')}"
      >
        Добавить сервер
      </ppp-button>
      Список серверов
    </ppp-page-header>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <${'ppp-table'}
        ${ref('table')}
        :columns="${(x) => x.columns}"
        :rows="${(x) =>
          x.rows.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  @click="${() => {
                    x.app.navigate({
                      page: 'server',
                      server: datum._id
                    });

                    return false;
                  }}"
                  href="?page=server&server=${datum._id}"
                  >${datum.name}</a
                >`,
                datum.host,
                datum.port,
                datum.username,
                x.t(`$const.server.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                datum.version,
                html`
                  <${'ppp-badge'} appearance="${stateAppearance(datum.state)}">
                    ${x.t(`$const.serverState.${datum.state}`)}
                  </ppp-badge>`,
                html`
                  <${'ppp-button'}
                    class="xsmall"
                    @click="${() => x.simpleRemove('servers', datum._id)}"
                  >
                    ${trash()}
                  </ppp-button>`
              ]
            };
          })}"
      >
      </ppp-table>
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
    </div>
  </template>
`;

export const serversPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const serversPage = ServersPage.compose({
  baseName: 'servers-page',
  template: serversPageTemplate,
  styles: serversPageStyles
});
