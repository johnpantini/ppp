import { ServicePppAspirantWorkerPage } from '../../shared/service-ppp-aspirant-worker-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import { serviceControlsTemplate } from './service-page.js';
import ppp from '../../ppp.js';

const exampleEnvironmentCode = `{
  SERVICE_MACHINE_URL: '[%#ppp.keyVault.getKey("service-machine-url")%]';
}`;

const exampleSourceCode = `console.log(process.env.SERVICE_MACHINE_URL);`;

export const servicePppAspirantWorkerPageTemplate = (
  context,
  definition
) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Сервис - PPP Aspirant Worker - ${x.document.name}`
              : 'Сервис - PPP Aspirant Worker'}
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
              placeholder="Введите название"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Сервис PPP Aspirant</h5>
            <p>Хост-процесс PPP Aspirant, на котором будет запущен Worker. Это
              значение нельзя изменить после создания сервиса.</p>
          </div>
          <div class="input-group">
            <${'ppp-collection-select'}
              ${ref('aspirantServiceId')}
              ?disabled="${(x) => x.document._id}"
              value="${(x) => x.document.aspirantServiceId}"
              :context="${(x) => x}"
              :preloaded="${(x) => x.document.aspirantService ?? ''}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('services')
                    .find({
                      $and: [
                        {
                          $or: [
                            {
                              type: `[%#(await import('./const.js')).SERVICES.DEPLOYED_PPP_ASPIRANT%]`
                            },
                            {
                              type: `[%#(await import('./const.js')).SERVICES.PPP_ASPIRANT%]`
                            }
                          ]
                        },
                        {
                          $or: [
                            { removed: { $ne: true } },
                            {
                              _id: `[%#this.document.aspirantServiceId ?? ''%]`
                            }
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
              ?disabled="${(x) => x.document._id}"
              class="margin-top"
              @click="${() =>
                window.open('?page=service-ppp-aspirant', '_blank').focus()}"
              appearance="primary"
            >
              Добавить сервис PPP Aspirant
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Переменные окружения</h5>
            <p>Объект JavaScript с переменными окружения, которые будет перданы
              в Worker.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) =>
                x.document.environmentCode ?? exampleEnvironmentCode}"
              ${ref('environmentCode')}
            ></ppp-codeflask>
            <ppp-button
              class="margin-top"
              @click="${(x) =>
                x.environmentCode.updateCode(exampleEnvironmentCode)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group full">
            <h5>Реализация сервиса</h5>
            <p>Код для платформы Node.js с реализацией сервиса</p>
            <${'ppp-codeflask'}
              :code="${(x) => x.document.sourceCode ?? exampleSourceCode}"
              ${ref('sourceCode')}
            ></ppp-codeflask>
            <ppp-button
              class="margin-top"
              @click="${(x) => x.sourceCode.updateCode(exampleSourceCode)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
            </ppp-button>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ServicePppAspirantWorkerPage.compose({
  template: servicePppAspirantWorkerPageTemplate,
  styles: pageStyles
});
