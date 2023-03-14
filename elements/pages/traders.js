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

export const tradersPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список трейдеров
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'trader'
            })}"
        >
          Добавить трейдера
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
            label: 'Дата создания'
          },
          {
            label: 'Последнее изменение'
          },
          {
            label: 'Версия'
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
                  @click="${() => {
                    ppp.app.navigate({
                      page: `trader-${datum.type}`,
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=trader-${datum.type}&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                ppp.t(`$const.trader.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <ppp-badge appearance="green">
                    ${() => datum.version}
                  </ppp-badge>
                `,
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

export const tradersPageStyles = css`
  ${pageStyles}
  ${hotkey()}
`;

export class TradersPage extends Page {
  collection = 'traders';

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

applyMixins(TradersPage, PageWithShiftLock);

export default TradersPage.compose({
  template: tradersPageTemplate,
  styles: tradersPageStyles
}).define();
