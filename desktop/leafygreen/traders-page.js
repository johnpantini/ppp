import { TradersPage } from '../../shared/traders-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { formatDate } from '../../shared/intl.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

export const tradersPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Список трейдеров
      </span>
      <${'ppp-button'}
        appearance="primary"
        slot="header-controls"
        @click="${() =>
          ppp.app.navigate({
            page: 'trader'
          })}"
      >
        Добавить трейдера
      </ppp-button>
      <${'ppp-table'}
        ${ref('table')}
        :columns="${() => [
          {
            label: 'Название',
            sortBy: (d) => d.name
          },
          {
            label: 'Тип',
            sortBy: (d) => d.type
          },
          {
            label: 'Дата создания',
            sortBy: (d) => d.createdAt
          },
          {
            label: 'Последнее изменение',
            sortBy: (d) => d.updatedAt
          },
          {
            label: 'Версия',
            sortBy: (d) => d.version
          },
          {
            label: html`
              <div
                style="display: flex; flex-direction: row; gap: 0 6px; align-items: center"
              >
                <span>Действия</span><code class="hotkey">Shift</code>
              </div>
            `
          }
        ]}"
        :rows="${(x) =>
          x.documents?.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  @click="${() => {
                    ppp.app.navigate({
                      page: `trader-${datum.type}`,
                      trader: datum._id
                    });

                    return false;
                  }}"
                  href="?page=trader-${datum.type}&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                x.t(`$const.trader.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <${'ppp-badge'}
                    appearance="green">
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <${'ppp-button'}
                    disabled
                    class="xsmall"
                    @click="${() => x.simpleRemove(datum._id)}"
                  >
                    Удалить
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

// noinspection JSUnusedGlobalSymbols
export default TradersPage.compose({
  template: tradersPageTemplate,
  styles: pageStyles
});
