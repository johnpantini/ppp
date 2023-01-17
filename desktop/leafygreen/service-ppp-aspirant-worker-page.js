import { ServicePppAspirantWorkerPage } from '../../shared/service-ppp-aspirant-worker-page.js';
import { predefinedWorkerData } from '../../shared/predefined-worker-data.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import { serviceControlsTemplate } from './service-page.js';
import { css } from '../../shared/element/styles/css.js';
import ppp from '../../ppp.js';

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
                              type: `[%#(await import('./const.js')).SERVICES.CLOUD_PPP_ASPIRANT%]`
                            },
                            {
                              type: `[%#(await import('./const.js')).SERVICES.DEPLOYED_PPP_ASPIRANT%]`
                            },
                            {
                              type: `[%#(await import('./const.js')).SERVICES.SYSTEMD_PPP_ASPIRANT%]`
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
          <div class="implementation-area">
            <div class="label-group full" style="min-width: 600px">
              <h5>Реализация сервиса</h5>
              <p>Код для платформы Node.js с реализацией сервиса.</p>
              <${'ppp-codeflask'}
                style="height: 750px"
                :code="${(x) =>
                  x.document.sourceCode ??
                  predefinedWorkerData.default.content}"
                ${ref('sourceCode')}
              ></ppp-codeflask>
            </div>
            <div class="control-stack">
              <div class="label-group full">
                <h5>Переменные окружения</h5>
                <p>Объект JavaScript с переменными окружения, которые будут
                  переданы в Worker.</p>
                <${'ppp-codeflask'}
                  style="height: 150px"
                  :code="${(x) =>
                    x.document.environmentCode ??
                    predefinedWorkerData.default.env}"
                  ${ref('environmentCode')}
                ></ppp-codeflask>
              </div>
              <div class="label-group full">
                <h5>Шифруемые переменные окружения</h5>
                <p>Объект JavaScript с переменными окружения, которые будут
                  переданы в Worker в исходном виде, но сохранены в базе данных
                  в зашифрованном.</p>
                <${'ppp-codeflask'}
                  style="height: 150px"
                  :code="${(x) =>
                    x.document.environmentCodeSecret ??
                    predefinedWorkerData.default.envSecret}"
                  ${ref('environmentCodeSecret')}
                ></ppp-codeflask>
              </div>
              <div class="label-group full">
                <h5>Версионирование</h5>
                <p>Включите настройку, чтобы отслеживать версию сервиса и
                  предлагать обновления.</p>
                <${'ppp-checkbox'}
                  ?checked="${(x) => x.document.useVersioning ?? true}"
                  @change="${(x) => {
                    if (!x.useVersioning.checked)
                      x.versioningUrl.state = 'default';

                    x.scratchSet(
                      'useVersioningChecked',
                      x.useVersioning.checked
                    );
                  }}"
                  ${ref('useVersioning')}
                >
                  Отслеживать версию сервиса по этому файлу:
                </ppp-checkbox>
                <${'ppp-text-field'}
                  ?disabled="${(x) =>
                    !(x.scratch.useVersioningChecked ?? true)}"
                  placeholder="Введите ссылку"
                  value="${(x) => x.document.versioningUrl ?? ''}"
                  ${ref('versioningUrl')}
                ></ppp-text-field>
              </div>
              <${'ppp-banner'} class="margin-top" appearance="warning">
                <div class="label-group full">
                  <h5>Шаблоны готовых сервисов</h5>
                  <p>Воспользуйтесь шаблонами готовых сервисов для их быстрой
                    настройки.</p>
                  <${'ppp-select'}
                    value="default"
                    ${ref('workerPredefinedTemplate')}
                  >
                    <ppp-option value="default">
                      По умолчанию
                    </ppp-option>
                    <ppp-option value="auroraOnNorthflank">
                      Aurora в облачном сервисе Northflank
                    </ppp-option>
                    <ppp-option value="auroraOnRender">
                      Aurora в облачном сервисе Render
                    </ppp-option>
                  </ppp-select>
                  <${'ppp-button'}
                    @click="${(x) => x.fillOutFormWithTemplate()}"
                    class="margin-top"
                    appearance="primary"
                  >
                    Заполнить формы с кодом по этому шаблону
                  </ppp-button>
                </div>
              </ppp-banner>
            </div>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

export const servicePppAspirantWorkerPageStyles = (context, definition) => css`
  ${pageStyles}
  .implementation-area {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 0 20px;
  }

  .implementation-area .label-group:not(:first-child) {
    margin-top: 25px;
  }

  .implementation-area ppp-banner {
    width: 100%;
  }

  .implementation-area ppp-banner .label-group {
    padding-bottom: 8px;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default ServicePppAspirantWorkerPage.compose({
  template: servicePppAspirantWorkerPageTemplate,
  styles: servicePppAspirantWorkerPageStyles
});
