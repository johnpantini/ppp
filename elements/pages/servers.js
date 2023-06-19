import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { SERVER_STATE } from '../../lib/const.js';
import { formatDate } from '../../lib/intl.js';
import '../badge.js';
import '../button.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export function serverStateAppearance(state) {
  switch (state) {
    case SERVER_STATE.OK:
      return 'green';
    case SERVER_STATE.FAILED:
      return 'red';
  }

  return 'lightgray';
}

export const serversPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список серверов
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'server'
            })}"
        >
          Добавить сервер
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        @cleanup="${(x, c) =>
          x.cleanupFromListing({
            pageName: 'server',
            documentId: c.event.detail.datum._id
          })}"
        :columns="${() => [
          {
            label: 'Название'
          },
          {
            label: 'Тип авторизации'
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
            label: 'Состояние'
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
                      page: 'server',
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=server&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                ppp.t(`$const.server.${datum.authType}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <ppp-badge appearance="green">
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <ppp-badge
                    appearance="${serverStateAppearance(datum.state ?? 'N/A')}"
                  >
                    ${ppp.t(`$const.serverState.${datum.state ?? 'N/A'}`)}
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

export const serversPageStyles = css`
  ${pageStyles}
`;

export class ServersPage extends Page {
  collection = 'servers';

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

export default ServersPage.compose({
  template: serversPageTemplate,
  styles: serversPageStyles
}).define();
