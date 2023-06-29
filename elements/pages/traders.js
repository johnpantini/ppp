import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import '../badge.js';
import '../button.js';
import '../table.js';
import { TRADERS } from '../../lib/const.js';

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
        @cleanup="${(x, c) => {
          let type = c.event.detail.datum.type;

          if (type === TRADERS.PSINA_ALOR_OPENAPI_V2) {
            type = TRADERS.CUSTOM;
          }

          x.cleanupFromListing({
            pageName: `trader-${type}`,
            documentId: c.event.detail.datum._id
          });
        }}"
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
                    let type = datum.type;

                    if (type === TRADERS.PSINA_ALOR_OPENAPI_V2) {
                      type = TRADERS.CUSTOM;
                    }

                    ppp.app.navigate({
                      page: `trader-${type}`,
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

export const tradersPageStyles = css`
  ${pageStyles}
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

export default TradersPage.compose({
  template: tradersPageTemplate,
  styles: tradersPageStyles
}).define();
