import ppp from '../../ppp.js';
import { css, html, Observable, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles, PageWithShiftLock } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { hotkey } from '../../design/styles.js';
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
        ${ref('shiftLockContainer')}
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
            label: html`
              <div class="control-line centered">
                <span>Действия</span><code class="hotkey static">Shift</code>
              </div>
            `
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
                  <div style="display: flex; flex-direction: column; gap: 8px">
                    <ppp-button
                      class="xsmall"
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
                      shiftlock
                      disabled
                      class="xsmall"
                      @click="${async () => {
                        const index = ppp.workspaces.findIndex(
                          (w) => w._id === datum._id
                        );

                        if (index > -1) {
                          ppp.workspaces.splice(index, 1);
                          Observable.notify(ppp.app, 'workspaces');
                        }

                        await x.removeDocumentFromListing(datum);
                      }}"
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
  ${hotkey()}
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

applyMixins(WorkspacesPage, PageWithShiftLock);

export default WorkspacesPage.compose({
  template: workspacesPageTemplate,
  styles: workspacesPageStyles
}).define();
