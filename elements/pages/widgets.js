import ppp from '../../ppp.js';
import { css, html, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles, PageWithShiftLock } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { hotkey } from '../../design/styles.js';
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
        ${ref('shiftLockContainer')}
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
                      <div
                        style="display: flex; flex-direction: column; gap: 8px 0; align-items: flex-start"
                      >
                        <div>
                          ${(_) => ppp.t(`$const.widget.${datum.reportedType}`)}
                        </div>
                        <ppp-badge appearance="blue"> По ссылке</ppp-badge>
                      </div>
                    `
                  : ppp.t(`$const.widget.${datum.reportedType}`),
                datum.collection,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <ppp-button
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
    </form>
  </template>
`;

export const widgetsPageStyles = css`
  ${pageStyles}
  ${hotkey()}
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

applyMixins(WidgetsPage, PageWithShiftLock);

export default WidgetsPage.compose({
  template: widgetsPageTemplate,
  styles: widgetsPageStyles
}).define();
