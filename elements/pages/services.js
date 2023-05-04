import ppp from '../../ppp.js';
import { css, html, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles, PageWithShiftLock } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { hotkey } from '../../design/styles.js';
import { SERVICE_STATE, SERVICES, VERSIONING_STATUS } from '../../lib/const.js';
import { parsePPPScript } from '../../lib/ppp-script.js';
import { cloud } from '../../static/svg/sprite.js';
import '../badge.js';
import '../button.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export function stateAppearance(document) {
  if (document.removed) return 'lightgray';

  switch (document.state) {
    case SERVICE_STATE.ACTIVE:
      return 'green';
    case SERVICE_STATE.STOPPED:
      return 'lightgray';
    case SERVICE_STATE.FAILED:
      return 'red';
  }

  return 'lightgray';
}

export const serviceControlsPartial = html`
  ${when(
    (x) => x.document._id,
    html`
      <ppp-badge
        slot="controls"
        appearance="${(x) => stateAppearance(x.document)}"
      >
        ${(x) =>
          x.document.removed
            ? 'Удалён'
            : ppp.t(`$const.serviceState.${x.document.state}`)}
      </ppp-badge>
      <ppp-badge
        slot="controls"
        appearance="${(x) => {
          const vs = x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK;

          if (vs === VERSIONING_STATUS.OK) return 'green';
          else if (vs === VERSIONING_STATUS.OLD) {
            return 'yellow';
          } else if (vs === VERSIONING_STATUS.OFF) {
            return 'blue';
          }
        }}"
      >
        ${(x) =>
          ppp.t(
            `$const.versioningStatus.${
              x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK
            }`
          )}
      </ppp-badge>
      ${when(
        (x) =>
          typeof x.updateService === 'function' &&
          (x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK) ===
            VERSIONING_STATUS.OLD,
        html`
          <ppp-button
            ?disabled="${(x) => !x.isSteady()}"
            slot="controls"
            appearance="primary"
            @click="${(x) => x.updateService?.()}"
          >
            Обновить
            <span slot="start">${html.partial(cloud)}</span>
          </ppp-button>
        `
      )}
    `
  )}
`.inline();

export const servicesPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список сервисов
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'service'
            })}"
        >
          Установить сервис
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        ${ref('shiftLockContainer')}
        :columns="${() => [
          {
            label: 'Название'
          },
          {
            label: 'Тип'
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
            label: 'Последняя версия'
          },
          {
            label: 'Состояние'
          },
          {
            label: html`
              <div class="control-line centered">
                <span>Действия</span><code class="hotkey static">Shift</code>
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
                  class="link"
                  @click="${() => {
                    ppp.app.navigate({
                      page: `service-${datum.type}`,
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=service-${datum.type}&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                ppp.t(`$const.service.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <ppp-badge
                    appearance="${() => {
                      const vs = datum.versioningStatus;

                      if (vs === VERSIONING_STATUS.OK) return 'green';
                      else if (vs === VERSIONING_STATUS.OLD) {
                        return 'yellow';
                      } else if (vs === VERSIONING_STATUS.OFF) {
                        return 'blue';
                      }
                    }}"
                  >
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <ppp-badge
                    appearance="${() => {
                      const vs = datum.versioningStatus;

                      if (vs === VERSIONING_STATUS.OFF) {
                        return 'blue';
                      } else return 'green';
                    }}"
                  >
                    ${() => datum.actualVersion}
                  </ppp-badge>
                `,
                html`
                  <ppp-badge appearance="${stateAppearance(datum)}">
                    ${datum.removed
                      ? 'Удалён'
                      : ppp.t(`$const.serviceState.${datum.state ?? 'N/A'}`)}
                  </ppp-badge>
                `,
                html`
                  ${when(
                    () => datum.versioningStatus === VERSIONING_STATUS.OLD,
                    html`
                      <ppp-button
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
                  <ppp-button
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
    </form>
  </template>
`;

export const servicesPageStyles = css`
  ${pageStyles}
  ${hotkey()}
`;

export class ServicesPage extends Page {
  collection = 'services';

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

  async transformMany() {
    return Promise.all(
      this.documents.map((doc) => {
        if (
          doc.type !== SERVICES.PPP_ASPIRANT_WORKER &&
          doc.type !== SERVICES.CLOUDFLARE_WORKER
        ) {
          doc.versioningStatus = VERSIONING_STATUS.OK;
          doc.actualVersion = 1;

          return doc;
        }

        if (!doc.useVersioning || !doc.versioningUrl) {
          doc.versioningStatus = VERSIONING_STATUS.OFF;
          doc.actualVersion = 'N/A';

          return doc;
        }

        return (async () => {
          let url;

          if (doc.versioningUrl.startsWith('/')) {
            const rootUrl = window.location.origin;

            if (rootUrl.endsWith('.github.io'))
              url = new URL('/ppp' + doc.versioningUrl, rootUrl);
            else url = new URL(doc.versioningUrl, rootUrl);
          } else {
            url = new URL(doc.versioningUrl);
          }

          const fcRequest = await fetch(url.toString(), {
            cache: 'reload'
          });
          const parsed = parsePPPScript(await fcRequest.text());

          if (parsed && Array.isArray(parsed.meta?.version)) {
            const [version] = parsed.meta?.version;

            doc.actualVersion = Math.abs(+version) || 1;
            doc.versioningStatus =
              doc.version < doc.actualVersion
                ? VERSIONING_STATUS.OLD
                : VERSIONING_STATUS.OK;
          }

          return doc;
        })();
      })
    );
  }

  async updateService(datum) {}

  async removeService(datum) {}
}

applyMixins(ServicesPage, PageWithShiftLock);

export default ServicesPage.compose({
  template: servicesPageTemplate,
  styles: servicesPageStyles
}).define();
