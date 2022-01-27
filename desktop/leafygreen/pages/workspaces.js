import { WorkspacesPage } from '../../../shared/pages/workspaces.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { formatDate } from '../../../shared/intl.js';
import { trash } from '../icons/trash.js';

export const workspacesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) => x.app.handleNewWorkspaceClick()}"
      >
        Новый терминал
      </ppp-button>
      Список терминалов
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
                datum._id,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <${'ppp-button'}
                    class="xsmall"
                    @click="${() => {
                      const index = x.app.workspaces.findIndex(
                        (x) => x._id === datum._id
                      );

                      if (index > -1) x.app.workspaces.splice(index, 1);

                      Observable.notify(x.app, 'workspaces');

                      return x.simpleRemove('workspaces', datum._id);
                    }}"
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

export const workspacesPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const workspacesPage = WorkspacesPage.compose({
  baseName: 'workspaces-page',
  template: workspacesPageTemplate,
  styles: workspacesPageStyles
});
