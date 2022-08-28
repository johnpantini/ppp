import { ExtensionsPage } from '../../shared/extensions-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { formatDate } from '../../shared/intl.js';
import { Observable } from '../../shared/element/observation/observable.js';
import ppp from '../../ppp.js';

export const extensionsPageTemplate = (context, definition) => html`
  <template>
    <ppp-modal ${ref('newExtensionModal')} dismissible>
      <span slot="title">Установить дополнение</span>
      <div slot="body">
        <ppp-new-extension-modal-page></ppp-new-extension-modal-page>
      </div>
    </ppp-modal>
    <${'ppp-page'}>
      <span slot="header">
        Список дополнений
      </span>
      <${'ppp-button'}
        appearance="primary"
        slot="header-controls"
        @click="${(x) => x.handleNewExtensionClick()}"
      >
        Установить дополнение
      </ppp-button>
      <${'ppp-table'}
        ${ref('shiftLockContainer')}
        :columns="${() => [
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
                    @click="${async () => {
                      const index = ppp.app.extensions.findIndex(
                        (w) => w._id === datum._id
                      );

                      if (index > -1) {
                        ppp.app.extensions.splice(index, 1);
                        Observable.notify(ppp.app, 'extensions');
                      }

                      await x.removeDocumentFromListing(datum);
                    }}"
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
