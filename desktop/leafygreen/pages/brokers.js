import ppp from '../../../ppp.js';
import { BrokersPage } from '../../../shared/pages/brokers.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { formatDate } from '../../../shared/intl.js';

await ppp.i18n(import.meta.url);

export const brokersPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      <${'ppp-button'}
        disabled
        appearance="primary"
        slot="controls"
        @click="${(x) =>
          x.app.navigate({
            page: 'broker'
          })}"
      >
        Добавить брокера
      </ppp-button>
      Список брокеров
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
                      page: `broker-${datum.type}`,
                      broker: datum._id
                    });

                    return false;
                  }}"
                  href="?page=broker-${datum.type}&broker=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                x.t(`$const.broker.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                datum.version
              ]
            };
          })}"
      >
      </ppp-table>
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
    </div>
  </template>
`;

export const brokersPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const brokersPage = BrokersPage.compose({
  baseName: 'brokers-page',
  template: brokersPageTemplate,
  styles: brokersPageStyles
});
