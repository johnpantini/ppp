import { ServicesPage } from '../../shared/services-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { formatDate } from '../../shared/intl.js';
import { when } from '../../shared/element/templating/when.js';
import { actionPageMountPoint } from '../../shared/page.js';
import { SERVICE_STATE, VERSIONING_STATUS } from '../../shared/const.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

export function stateAppearance(state) {
  switch (state) {
    case SERVICE_STATE.ACTIVE:
      return 'green';
    case SERVICE_STATE.STOPPED:
      return 'lightgray';
    case SERVICE_STATE.FAILED:
      return 'red';
  }

  return 'lightgray';
}

export const servicesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Список сервисов
      </span>
      <${'ppp-button'}
        appearance="primary"
        slot="header-controls"
        @click="${() =>
          ppp.app.navigate({
            page: 'service'
          })}"
      >
        Установить сервис
      </ppp-button>
      <${'ppp-table'}
        ${ref('shiftLockContainer')}
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
            label: 'Последняя версия',
            sortBy: (d) => d.actualVersion
          },
          {
            label: 'Состояние',
            sortBy: (d) => d.state
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
          x.documents.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  @click="${() => {
                    ppp.app.navigate({
                      page: `service-${datum.type}`,
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=service-${datum.type}&document=${datum._id}"
                  >${datum.name}</a
                >`,
                x.t(`$const.service.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <${'ppp-badge'}
                    appearance="${() => {
                      const vs = datum.versioningStatus;

                      if (vs === VERSIONING_STATUS.OK) return 'green';
                      else if (vs === VERSIONING_STATUS.OLD) {
                        return 'yellow';
                      } else if (vs === VERSIONING_STATUS.OFF) {
                        return 'blue';
                      }
                    }}">
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <${'ppp-badge'}
                    appearance="${() => {
                      const vs = datum.versioningStatus;

                      if (vs === VERSIONING_STATUS.OFF) {
                        return 'blue';
                      } else return 'green';
                    }}">
                    ${() => datum.actualVersion}
                  </ppp-badge>
                `,
                html`
                  <${'ppp-badge'}
                    appearance="${stateAppearance(datum.state ?? 'N/A')}">
                    ${x.t(`$const.serviceState.${datum.state ?? 'N/A'}`)}
                  </ppp-badge>`,
                html`
                  ${when(
                    () => datum.versioningStatus === VERSIONING_STATUS.OLD,
                    html`
                      <${'ppp-button'}
                        style="margin-right: 4px"
                        disabled
                        shiftlock
                        class="xsmall"
                        @click="${() => x.updateService(datum)}"
                      >
                        Обновить
                      </ppp-button>
                    `
                  )}
                  <${'ppp-button'}
                    disabled
                    shiftlock
                    class="xsmall"
                    @click="${() => x.removeService(datum)}"
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
    ${actionPageMountPoint}
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ServicesPage.compose({
  template: servicesPageTemplate,
  styles: pageStyles
});
