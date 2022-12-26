import { ServiceSystemdPppAspirantPage } from '../../shared/service-systemd-ppp-aspirant-page.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { serviceControlsTemplate } from './service-page.js';
import { repeat } from '../../shared/element/templating/repeat.js';

export const serviceSystemdPppAspirantPageTemplate = (
  context,
  definition
) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          <div class="control-stack">
            ${(x) =>
              x.document.name
                ? `Сервис - PPP Aspirant - ${x.document.name}`
                : 'Сервис - PPP Aspirant'}
            <${'ppp-badge'} appearance="blue">
              systemd
            </ppp-badge>
          </div>
        </span>
        ${when(
          (x) => x.scratch.inspectorUrl,
          html`
            <${'ppp-banner'} class="inline margin-top" appearance="warning">
              <a
                rel="noopener"
                target="_blank"
                href="${(x) => x.scratch.inspectorUrl}"
              >
                ${(x) => x.scratch.inspectorUrl}
              </a>
            </ppp-banner>
          `
        )}
        ${when((x) => x.document._id, serviceControlsTemplate)}
        <section>
          <div class="label-group">
            <h5>Название сервиса</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Aspirant"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Сервер</h5>
            <p>Поддерживаются только RHEL-совместимые операционные системы.
              Сервер должен находиться в сети Tailscale.</p>
          </div>
          <div class="input-group">
            <${'ppp-collection-select'}
              ${ref('serverId')}
              @change="${(x) => {
                x.scratchSet('server', x.serverId.datum());
              }}"
              value="${(x) => x.document.serverId}"
              :context="${(x) => x}"
              :preloaded="${(x) => x.document.server ?? ''}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('servers')
                    .find({
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.serverId ?? ''%]` }
                      ]
                    })
                    .sort({ updatedAt: -1 });
                };
              }}"
              :transform="${() => ppp.decryptDocumentsTransformation()}"
            ></ppp-collection-select>
            <ppp-button
              class="margin-top"
              @click="${() => window.open('?page=server', '_blank').focus()}"
              appearance="primary"
            >
              Добавить сервер
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Порт</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="number"
              placeholder="32456"
              value="${(x) => x.document.port}"
              ${ref('port')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Домен</h5>
            <p>Опциональный домен сервера (Let's Encrypt).</p>
          </div>
          <div class="input-group">
            <${'ppp-select'}
              ?disabled="${(x) =>
                !x.scratch.server || !x.scratch.server?.domains}"
              placeholder="Опционально, нажмите для выбора"
              value="${(x) => x.document.domain ?? ''}"
              ${ref('domain')}
            >
              <ppp-option value="">Без домена</ppp-option>
              ${repeat(
                (x) => x.scratch.server?.domains ?? [],
                html` <ppp-option value="${(x) => x}">${(x) => x}</ppp-option> `
              )}
            </ppp-select>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Хранилище Redis</h5>
            <p>Персистентность для PPP Aspirant.</p>
          </div>
          <div class="input-group">
            <ppp-collection-select
              ${ref('redisApiId')}
              value="${(x) => x.document.redisApiId}"
              :context="${(x) => x}"
              :preloaded="${(x) => x.document.redisApi ?? ''}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('apis')
                    .find({
                      $and: [
                        {
                          type: `[%#(await import('./const.js')).APIS.REDIS%]`
                        },
                        {
                          $or: [
                            { removed: { $ne: true } },
                            { _id: `[%#this.document.redisApiId ?? ''%]` }
                          ]
                        }
                      ]
                    })
                    .sort({ updatedAt: -1 });
                };
              }}"
              :transform="${() => ppp.decryptDocumentsTransformation()}"
            ></ppp-collection-select>
            <ppp-button
              class="margin-top"
              @click="${() => window.open('?page=api-redis', '_blank').focus()}"
              appearance="primary"
            >
              Добавить API Redis
            </ppp-button>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ServiceSystemdPppAspirantPage.compose({
  template: serviceSystemdPppAspirantPageTemplate,
  styles: pageStyles
});
