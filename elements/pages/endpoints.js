import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import { maybeFetchError } from '../../lib/ppp-errors.js';
import { getMongoDBRealmAccessToken } from '../../lib/realm.js';
import '../badge.js';
import '../button.js';
import '../table.js';

export const endpointsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список конечных точек
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'endpoint'
            })}"
        >
          Добавить конечную точку
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        @cleanup="${(x, c) =>
          x.cleanupFromListing({
            pageName: 'endpoint',
            documentId: c.event.detail.datum._id
          })}"
        :columns="${() => [
          {
            label: 'Маршрут'
          },
          {
            label: 'Конечная точка MongoDB Realm'
          },
          {
            label: 'Функция MongoDB Realm'
          },
          {
            label: 'Последнее изменение'
          },
          {
            label: 'Действия'
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
                    class="link"
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
                    class="link"
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
                    class="link"
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
                    <ppp-button
                      action="cleanup"
                      :datum="${() => datum}"
                      class="xsmall"
                    >
                      Удалить
                    </ppp-button>
                  `
                ]
              };
            })}"
      >
      </ppp-table>
    </form>
  </template>
`;

export const endpointsPageStyles = css`
  ${pageStyles}
`;

export class EndpointsPage extends Page {
  collection = 'endpoints';

  async populate() {
    const groupId = ppp.keyVault.getKey('mongo-group-id');
    const appId = ppp.keyVault.getKey('mongo-app-id');

    return await (
      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            body: JSON.stringify({
              method: 'GET',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints`,
              headers: {
                Authorization: `Bearer ${await getMongoDBRealmAccessToken()}`
              }
            })
          }
        ),
        'Не удалось получить список конечных точек.'
      )
    ).json();
  }
}

export default EndpointsPage.compose({
  template: endpointsPageTemplate,
  styles: endpointsPageStyles
}).define();
