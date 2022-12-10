import { WidgetsPage } from '../../shared/widgets-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { formatDate } from '../../shared/intl.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

export const widgetsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Список виджетов
      </span>
      <${'ppp-button'}
        appearance="primary"
        slot="header-controls"
        @click="${() =>
          ppp.app.navigate({
            page: 'widget'
          })}"
      >
        Добавить виджет
      </ppp-button>
      <${'ppp-table'}
        ${ref('shiftLockContainer')}
        :columns="${() => [
          {
            label: 'Название',
            sortBy: (d) => d._id
          },
          {
            label: 'Тип',
            sortBy: (d) => d.reportedType
          },
          {
            label: 'Коллекция',
            sortBy: (d) => d.collection
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
              <div class="label-with-hotkey">
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
                      page: 'widget',
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=widget&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                datum.type === 'custom'
                  ? html`
                    <div
                      style="display: flex; flex-direction: column; gap: 4px 0">
                      <div>
                        ${(_) => x.t(`$const.widget.${datum.reportedType}`)}
                      </div>
                      <${'ppp-badge'} appearance="blue">
                        По ссылке
                      </ppp-badge>
                    </div>
                  `
                  : x.t(`$const.widget.${datum.reportedType}`),
                datum.collection,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <${'ppp-button'}
                    disabled
                    shiftlock
                    class="xsmall"
                    @click="${() => x.removeDocumentFromListing(datum)}"
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
export default WidgetsPage.compose({
  template: widgetsPageTemplate,
  styles: pageStyles
});
