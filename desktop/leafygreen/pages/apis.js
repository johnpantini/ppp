import ppp from '../../../ppp.js';
import { ApisPage } from '../../../shared/pages/apis.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles } from '../page.js';
import { formatDate } from '../../../shared/intl.js';
import { trash } from '../icons/trash.js';

await ppp.i18n(import.meta.url);

export const apisPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Список внешних API
      </span>
      <${'ppp-button'}
        appearance="primary"
        slot="header-controls"
        @click="${(x) =>
          x.app.navigate({
            page: 'api'
          })}"
      >
        Подключить API
      </ppp-button>
      <${'ppp-table'}
        ${ref('table')}
        :columns="${(x) => x.columns}"
        :rows="${(x) =>
          x.documents?.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  @click="${() => {
                    x.app.navigate({
                      page: `api-${datum.type}`,
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=api-${datum.type}&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                x.t(`$const.api.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                datum.version,
                html`
                  <${'ppp-button'}
                    class="xsmall"
                    @click="${() => x.simpleRemove(datum._id)}"
                  >
                    ${trash()}
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

export const apisPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export default ApisPage.compose({
  template: apisPageTemplate,
  styles: apisPageStyles
});
