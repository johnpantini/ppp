import { ServicePppAspirantPage } from '../../shared/service-ppp-aspirant-page.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { serviceControlsTemplate } from './service-page.js';

export const servicePppAspirantPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Сервис - PPP Aspirant - ${x.document.name}`
              : 'Сервис - PPP Aspirant'}
        </span>
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
            <h5>Ключ Tailscale</h5>
            <p>Ключ для авторизации в сети <a href="https://tailscale.com/"
                                              target="_blank" rel="noopener">Tailscale</a>.
              Рекомендуется создать
              эфемерный ключ с возможностью повторных использований.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              type="password"
              placeholder="tskey-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxx"
              value="${(x) => x.document.tailscaleKey}"
              ${ref('tailscaleKey')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Платформа для развёртывания</h5>
            <p>
              <${'ppp-badge'}
                appearance="green">
                Northflank
              </ppp-badge>
            </p>
          </div>
          <div class="input-group">
            <${'ppp-collection-select'}
              ${ref('deploymentApiId')}
              value="${(x) => x.document.deploymentApiId}"
              :context="${(x) => x}"
              :preloaded="${(x) => x.document.deploymentApi ?? ''}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('apis')
                    .find({
                      $and: [
                        {
                          type: `[%#(await import('./const.js')).APIS.NORTHFLANK%]`,
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
            <${'ppp-button'}
              class="margin-top"
              @click="${() =>
                window.open('?page=api-northflank', '_blank').focus()}"
              appearance="primary"
            >
              Добавить API Northflank
            </ppp-button>
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
                          type: `[%#(await import('./const.js')).APIS.REDIS%]`,
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
export default ServicePppAspirantPage.compose({
  template: servicePppAspirantPageTemplate,
  styles: pageStyles
});
