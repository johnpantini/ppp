import { ServersPage } from '../../shared/servers-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { formatDate } from '../../shared/intl.js';
import { actionPageMountPoint } from '../../shared/page.js';
import { SERVER_STATE } from '../../shared/const.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

export function stateAppearance(state) {
  switch (state) {
    case SERVER_STATE.OK:
      return 'green';
    case SERVER_STATE.FAILED:
      return 'red';
  }

  return 'lightgray';
}

export const serversPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Список серверов
      </span>
      <${'ppp-button'}
        appearance="primary"
        slot="header-controls"
        @click="${() =>
          ppp.app.navigate({
            page: 'server'
          })}"
      >
        Добавить сервер
      </ppp-button>
      <${'ppp-table'}
        ${ref('shiftLockContainer')}
        :columns="${() => [
          {
            label: 'Название',
            sortBy: (d) => d.name
          },
          {
            label: 'Тип авторизации',
            sortBy: (d) => d.authType
          },
          {
            label: 'Дата создания',
            sortBy: (d) => d.createdAt
          },
          {
            label: 'Последнее изменение',
            sortBy: (d) => d.updatedAt
          },
          {
            label: 'Версия',
            sortBy: (d) => d.version
          },
          {
            label: 'Состояние',
            sortBy: (d) => d.state
          },
          {
            label: html`
              <div
                style="display: flex; flex-direction: row; gap: 0 6px; align-items: center"
              >
                <span>Действия</span><code class="hotkey">Shift</code>
              </div>
            `
          }
        ]}"
        :rows="${(x) =>
          x.documents.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  @click="${() => {
                    ppp.app.navigate({
                      page: 'server',
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=server&document=${datum._id}"
                  >${datum.name}</a
                >`,
                x.t(`$const.server.${datum.authType}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <${'ppp-badge'}
                    appearance="green">
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <${'ppp-badge'}
                    appearance="${stateAppearance(datum.state ?? 'N/A')}">
                    ${x.t(`$const.serverState.${datum.state ?? 'N/A'}`)}
                  </ppp-badge>
                `,
                html`
                  <${'ppp-button'}
                    disabled
                    shiftlock
                    class="xsmall"
                    @click="${() => x.removeServer(datum)}"
                  >
                    Удалить
                  </ppp-button>
                `
              ]
            };
          })}"
      >
      </ppp-table>
      <span slot="actions"></span>
    </ppp-page>
    ${actionPageMountPoint}
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ServersPage.compose({
  template: serversPageTemplate,
  styles: pageStyles
});
