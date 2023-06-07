import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import '../badge.js';
import '../button.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export const widgetsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список виджетов
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'widget'
            })}"
        >
          Добавить виджет
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        @cleanup="${(x, c) =>
          x.cleanupFromListing({
            pageName: 'widget',
            documentId: c.event.detail.datum._id
          })}"
        :columns="${() => [
          {
            label: 'Название'
          },
          {
            label: 'Тип'
          },
          {
            label: 'Коллекция'
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
                html`<a
                  class="link"
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
                      <div class="control-stack">
                        <div>
                          ${(_) => ppp.t(`$const.widget.${datum.reportedType}`)}
                        </div>
                        <ppp-badge appearance="yellow">По ссылке</ppp-badge>
                      </div>
                    `
                  : ppp.t(`$const.widget.${datum.reportedType}`),
                datum.collection,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
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

export const widgetsPageStyles = css`
  ${pageStyles}
`;

export class WidgetsPage extends Page {
  collection = 'widgets';

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

export default WidgetsPage.compose({
  template: widgetsPageTemplate,
  styles: widgetsPageStyles
}).define();
