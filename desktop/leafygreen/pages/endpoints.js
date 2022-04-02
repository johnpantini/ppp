import { EndpointsPage } from '../../../shared/pages/endpoints.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { formatDate } from '../../../shared/intl.js';
import { trash } from '../icons/trash.js';

export const endpointsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) =>
          x.app.navigate({
            page: 'endpoint'
          })}"
      >
        Новая конечная точка HTTPS
      </ppp-button>
      Список конечных точек HTTPS
    </ppp-page-header>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <${'ppp-table'}
        ${ref('table')}
        :columns="${(x) => x.columns}"
        :rows="${(x) =>
          x.rows
            .filter((datum) => datum.route !== '/cloud_credentials')
            .map((datum) => {
              return {
                datum,
                cells: [
                  html`<a
                    @click="${() => {
                      x.app.navigate({
                        page: 'endpoint',
                        endpoint: datum._id
                      });

                      return false;
                    }}"
                    href="?page=endpoint&endpoint=${datum._id}"
                  >
                    ${datum.route}
                  </a>`,
                  html`<a
                    target="_blank"
                    href="https://realm.mongodb.com/groups/${x.app.ppp.keyVault.getKey(
                      'mongo-group-id'
                    )}/apps/${x.app.ppp.keyVault.getKey(
                      'mongo-app-id'
                    )}/endpoints/${datum._id}"
                    >${datum.route}</a
                  >`,
                  html`<a
                    target="_blank"
                    href="https://realm.mongodb.com/groups/${x.app.ppp.keyVault.getKey(
                      'mongo-group-id'
                    )}/apps/${x.app.ppp.keyVault.getKey(
                      'mongo-app-id'
                    )}/functions/${datum.function_id}"
                    >${datum.function_name}</a
                  >`,
                  formatDate(datum.last_modified * 1000),
                  html`
                    <${'ppp-button'}
                      class="xsmall"
                      @click="${() =>
                        x.removeEndpoint(datum._id, datum.function_id)}"
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

export const endpointsPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const endpointsPage = EndpointsPage.compose({
  baseName: 'endpoints-page',
  template: endpointsPageTemplate,
  styles: endpointsPageStyles
});
