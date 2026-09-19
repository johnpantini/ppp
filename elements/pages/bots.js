import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import '../badge.js';
import '../button.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export const botsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${() => ppp.t('$botsPage.listHeader')}
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'bot'
            })}"
        >
          ${() => ppp.t('$botsPage.addBot')}
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        @cleanup="${(x, c) =>
          x.cleanupFromListing({
            pageName: 'bot',
            documentId: c.event.detail.datum._id
          })}"
        :columns="${() => [
          {
            label: ppp.t('$g.name')
          },
          {
            label: ppp.t('$botsPage.createdAtColumn')
          },
          {
            label: ppp.t('$botsPage.updatedAtColumn')
          },
          {
            label: ppp.t('$botsPage.versionColumn')
          },
          {
            label: ppp.t('$botsPage.actionsColumn')
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
                      page: 'bot',
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=bot&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
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

export const botsPageStyles = css`
  ${pageStyles}
`;

export class BotsPage extends Page {
  collection = 'bots';

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

export default BotsPage.compose({
  template: botsPageTemplate,
  styles: botsPageStyles
}).define();
