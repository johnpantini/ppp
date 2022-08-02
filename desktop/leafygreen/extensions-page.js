import { ExtensionsPage } from '../../shared/extensions-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { formatDate } from '../../shared/intl.js';
import ppp from '../../ppp.js';

// TODO - modal
export const extensionsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Список дополнений
      </span>
      <${'ppp-button'}
        disabled
        appearance="primary"
        slot="header-controls"
      >
        Установить дополнение
      </ppp-button>
      <${'ppp-table'}
        ${ref('shiftLockContainer')}
        :columns="${(x) => [
          {
            label: 'Название',
            sortBy: (d) => d.title
          },
          {
            label: 'Автор',
            sortBy: (d) => d.author
          },
          {
            label: 'Дата добавления',
            sortBy: (d) => d.createdAt
          },
          {
            label: 'Последнее изменение',
            sortBy: (d) => d.createdAt
          },
          {
            label: 'Версия',
            sortBy: (d) => d.version
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
                    ppp.app.extension = datum._id;

                    ppp.app.navigate({
                      page: datum.page,
                      extension: datum._id
                    });

                    return false;
                  }}"
                  href="?page=${datum.page}&extension=${datum._id}"
                >
                  ${datum.title}
                </a>`,
                datum.author,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <${'ppp-badge'}
                    appearance="green">
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <${'ppp-button'}
                    shiftlock
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
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ExtensionsPage.compose({
  template: extensionsPageTemplate,
  styles: pageStyles
});
