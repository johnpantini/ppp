import { ServicesPage } from '../base/services.js';
import { html } from '../lib/template.js';
import { css } from '../lib/element/styles/css.js';
import { when } from '../lib/element/templating/when.js';
import { ref } from '../lib/element/templating/ref.js';
import {
  basePageStyles,
  loadingIndicator
} from '../design/leafygreen/styles/page.js';
import { formatDate } from '../lib/intl.js';
import { trash } from '../design/leafygreen/icons/trash.js';

export const servicesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) => (x.app.page = 'service')}"
      >
        Установить сервис
      </ppp-button>
      Список сервисов
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
                    // TODO
                    return false;

                    x.app.navigate(
                      x.app.url({ page: 'service', service: datum.uuid })
                    );

                    return false;
                  }}"
                  href="?page=service&service=${datum.uuid}"
                  >${datum._id}</a
                >`,
                html`<a
                  @click="${(x) => {
                    // TODO
                    return false;

                    x.app.navigate(
                      x.app.url({
                        page: 'server',
                        server: datum.server[0]?.uuid
                      })
                    );

                    return false;
                  }}"
                  href="?page=server&server=${datum.server[0]?.uuid}"
                  >${datum.server[0]?._id}</a
                >`,
                i18n.t(`$serviceType.${datum.type}`),
                formatDate(datum.created_at),
                formatDate(datum.updated_at),
                html`
                  <${'ppp-button'}
                    class="xsmall"
                    @click="${() => x.remove(datum._id)}"
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

export const servicesPageStyles = (context, definition) =>
  css`
    ${basePageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const servicesPage = ServicesPage.compose({
  baseName: 'services-page',
  template: servicesPageTemplate,
  styles: servicesPageStyles
});
