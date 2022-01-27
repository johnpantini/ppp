import ppp from '../../../ppp.js';
import { ApisPage } from '../../../shared/pages/apis.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { formatDate } from '../../../shared/intl.js';
import { trash } from '../icons/trash.js';

await ppp.i18n(import.meta.url);

export const apisPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) =>
          x.app.navigate({
            page: 'api'
          })}"
      >
        Подключить API
      </ppp-button>
      Список внешних API
    </ppp-page-header>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <${'ppp-table'}
        ${ref('table')}
        :columns="${(x) => x.columns}"
        :rows="${(x) =>
          x.rows.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  @click="${() => {
                    x.app.navigate({
                      page: `api-${datum.type}`,
                      api: datum._id
                    });

                    return false;
                  }}"
                  href="?page=api-${datum.type}&api=${datum._id}"
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
                    @click="${() => x.simpleRemove('apis', datum._id)}"
                  >
                    ${trash()}
                  </ppp-button>`
              ]
            };
          })}"
      >
      </ppp-table>
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
    </div>
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
export const apisPage = ApisPage.compose({
  baseName: 'apis-page',
  template: apisPageTemplate,
  styles: apisPageStyles
});
