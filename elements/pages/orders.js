import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import '../badge.js';
import '../button.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export const ordersPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${() => ppp.t('$ordersPage.listHeader')}
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'order'
            })}"
        >
          ${() => ppp.t('$ordersPage.addOrderTemplate')}
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        @cleanup="${(x, c) =>
          x.cleanupFromListing({
            pageName: `order-${c.event.detail.datum.type}`,
            documentId: c.event.detail.datum._id
          })}"
        :columns="${() => [
          {
            label: ppp.t('$g.name')
          },
          {
            label: ppp.t('$ordersPage.typeColumn')
          },
          {
            label: ppp.t('$ordersPage.createdAtColumn')
          },
          {
            label: ppp.t('$ordersPage.updatedAtColumn')
          },
          {
            label: ppp.t('$ordersPage.versionColumn')
          },
          {
            label: ppp.t('$ordersPage.actionsColumn')
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
                      page: `order-${datum.type}`,
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=order-${datum.type}&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                ppp.t(`$const.order.${datum.type}`),
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
                    ${() => ppp.t('$g.delete')}
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

export const ordersPageStyles = css`
  ${pageStyles}
`;

export class OrdersPage extends Page {
  collection = 'orders';

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

export default OrdersPage.compose({
  template: ordersPageTemplate,
  styles: ordersPageStyles
}).define();
