import { WorkspacesPage } from '../../shared/workspaces-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { formatDate } from '../../shared/intl.js';
import ppp from '../../ppp.js';

export const workspacesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Список терминалов
      </span>
      <${'ppp-button'}
        appearance="primary"
        slot="header-controls"
        @click="${() => ppp.app.handleNewWorkspaceClick()}"
      >
        Новый терминал
      </ppp-button>
      <${'ppp-table'}
        ${ref('table')}
        :columns="${() => [
          {
            label: 'Название',
            sortBy: (d) => d._id
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
          x.documents?.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  @click="${() => {
                    ppp.app.navigate({
                      page: 'workspace',
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=workspace&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <${'ppp-button'}
                    disabled
                    class="xsmall"
                    @click="${() => x.simpleRemove(datum._id)}"
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
`;

// noinspection JSUnusedGlobalSymbols
export default WorkspacesPage.compose({
  template: workspacesPageTemplate,
  styles: pageStyles
});
