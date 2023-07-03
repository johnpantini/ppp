import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import '../button.js';
import '../table.js';

export const workspacesPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список терминалов
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() => ppp.app.handleNewWorkspaceClick()}"
        >
          Новый терминал
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        @cleanup="${(x, c) =>
          x.cleanupFromListing({
            pageName: 'workspace-manage',
            documentId: c.event.detail.datum._id
          })}"
        :columns="${() => [
          {
            label: 'Название'
          },
          {
            label: 'Дата создания'
          },
          {
            label: 'Последнее изменение'
          },
          {
            label: 'Действия'
          }
        ]}"
        :rows="${(x) =>
          x.documents.map((datum) => {
            return {
              datum,
              cells: [
                html`
                  <a
                    class="link"
                    @click="${() => {
                      ppp.app.navigate({
                        page: 'workspace-manage',
                        document: datum._id
                      });

                      return false;
                    }}"
                    href="?page=workspace-manage&document=${datum._id}"
                  >
                    ${datum.name}
                  </a>
                `,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <div class="control-line">
                    <ppp-button
                      class="xsmall"
                      appearance="primary"
                      @click="${() => {
                        ppp.app.navigate({
                          page: 'workspace',
                          document: datum._id
                        });

                        return false;
                      }}"
                    >
                      Перейти в терминал
                    </ppp-button>
                    <ppp-button
                      action="cleanup"
                      :datum="${() => datum}"
                      class="xsmall"
                    >
                      Удалить
                    </ppp-button>
                  </div>
                `
              ]
            };
          })}"
      >
      </ppp-table>
    </form>
  </template>
`;

export const workspacesPageStyles = css`
  ${pageStyles}
`;

export class WorkspacesPage extends Page {
  collection = 'workspaces';

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .find({
          removed: { $ne: true }
        })
        .sort({ updatedAt: -1 });
    };
  }
}

export default WorkspacesPage.compose({
  template: workspacesPageTemplate,
  styles: workspacesPageStyles
}).define();
