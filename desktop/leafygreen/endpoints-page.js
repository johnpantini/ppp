import { EndpointsPage } from '../../shared/endpoints-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { formatDate } from '../../shared/intl.js';
import { actionPageMountPoint } from '../../shared/page.js';
import ppp from '../../ppp.js';

export const endpointsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
    <span slot="header">
      Список конечных точек
    </span>
      <${'ppp-button'}
        appearance="primary"
        slot="header-controls"
        @click="${() =>
          ppp.app.navigate({
            page: 'endpoint'
          })}"
      >
        Добавить конечную точку
      </ppp-button>
      <${'ppp-table'}
        ${ref('shiftLockContainer')}
        :columns="${() => [
          {
            label: 'Маршрут'
          },
          {
            label: 'Конечная точка MongoDB Realm',
            sortBy: (d) => d.route
          },
          {
            label: 'Функция MongoDB Realm',
            sortBy: (d) => d.function_name
          },
          {
            label: 'Последнее изменение',
            sortBy: (d) => d.last_modified
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
          x.documents
            .filter(
              (datum) =>
                datum.route !== '/cloud_credentials' &&
                !datum.route.startsWith('/psina')
            )
            .map((datum) => {
              return {
                datum,
                cells: [
                  html`<a
                    @click="${() => {
                      ppp.app.navigate({
                        page: 'endpoint',
                        document: datum._id
                      });

                      return false;
                    }}"
                    href="?page=endpoint&document=${datum._id}"
                  >
                    ${datum.route}
                  </a>`,
                  html`<a
                    target="_blank"
                    rel="noopener"
                    href="https://realm.mongodb.com/groups/${ppp.keyVault.getKey(
                      'mongo-group-id'
                    )}/apps/${ppp.keyVault.getKey(
                      'mongo-app-id'
                    )}/endpoints/${datum._id}"
                  >
                    ${datum.route}
                  </a>`,
                  html`<a
                    target="_blank"
                    rel="noopener"
                    href="https://realm.mongodb.com/groups/${ppp.keyVault.getKey(
                      'mongo-group-id'
                    )}/apps/${ppp.keyVault.getKey(
                      'mongo-app-id'
                    )}/functions/${datum.function_id}"
                  >
                    ${datum.function_name}
                  </a>`,
                  formatDate(datum.last_modified * 1000),
                  html`
                  <${'ppp-button'}
                    disabled
                    shiftlock
                    class="xsmall"
                    @click="${() => x.removeEndpoint(datum)}"
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
export default EndpointsPage.compose({
  template: endpointsPageTemplate,
  styles: pageStyles
});
