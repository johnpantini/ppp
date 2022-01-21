import ppp from '../../../ppp.js';
import { ServicesPage } from '../../../shared/pages/services.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { formatDate } from '../../../shared/intl.js';

await ppp.i18n(import.meta.url);

export function stateAppearance(state) {
  switch (state) {
    case 'ok':
    case 'active':
      return 'green';
    case 'stopped':
      return 'lightgray';
    case 'failed':
      return 'red';
  }

  return 'lightgray';
}

export const servicesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
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
                    x.app.navigate({
                      page: `service-${datum.type}`,
                      service: datum._id
                    });

                    return false;
                  }}"
                  href="?page=service-${datum.type}&service=${datum._id}"
                  >${datum.name}</a
                >`,
                html`<a
                  @click="${() => {
                    x.app.navigate({
                      page: 'server',
                      server: datum.serverId
                    });

                    return false;
                  }}"
                  href="?page=server&server=${datum.serverId}"
                  >${datum.server[0].name}</a
                >`,
                x.t(`$const.service.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                datum.version,
                html`
                  <${'ppp-badge'} appearance="${stateAppearance(datum.state)}">
                    ${x.t(`$const.serviceState.${datum.state}`)}
                  </ppp-badge>`
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
    ${pageStyles}
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
