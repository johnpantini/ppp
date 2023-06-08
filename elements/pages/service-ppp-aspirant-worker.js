import ppp from '../../ppp.js';
import {
  html,
  css,
  ref,
  when,
  repeat,
  Observable
} from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  documentPageFooterPartial,
  documentPageHeaderPartial,
  Page,
  pageStyles,
  PageWithService
} from '../page.js';
import {
  servicePageFooterExtraControls,
  servicePageHeaderExtraControls
} from './service.js';
import { APIS, BROKERS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import { Tmpl } from '../../lib/tmpl.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../copyable.js';
import '../query-select.js';
import '../select.js';
import '../snippet.js';
import '../text-field.js';
import { trash } from '../../static/svg/sprite.js';

export const predefinedWorkerData = {
  default: {
    env: `{}`,
    envSecret: '{}',
    sourceCode: '',
    enableHttp: true,
    fileList: []
  }
};

export const servicePppAspirantWorkerPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: servicePageHeaderExtraControls
      })}
      <section>
        <div class="label-group">
          <h5>Название сервиса</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Введите название"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Сервис Aspirant</h5>
          <p class="description">
            Aspirant, на котором будет запущен Worker. Можно выбрать при
            создании или после удаления сервиса.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('aspirantServiceId')}
            ?disabled="${(x) => x.document._id && !x.document.removed}"
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
          ></ppp-query-select>
        </div>
      </section>
      <section>
        <div class="implementation-area">
          <div class="label-group full" style="min-width: 600px">
            <h5>Точка входа</h5>
            <p class="description">
              Код JavaScript или другое содержимое для исполнения.
            </p>
            <ppp-snippet
              style="height: 400px"
              :code="${(x) => x.document.sourceCode}"
              ${ref('sourceCode')}
            ></ppp-snippet>
            <div class="label-group full" style="min-width: 600px">
              <h5>Параметры запуска</h5>
              <p class="description">
                Можно переопределить команду и аргументы на запуск сервиса.
              </p>
              <ppp-text-field
                optional
                placeholder="/usr/bin/node"
                value="${(x) => x.document.command}"
                ${ref('command')}
              ></ppp-text-field>
              <ppp-text-field
                optional
                placeholder='["arg1","arg2","arg3"]'
                value="${(x) => x.document.args}"
                ${ref('args')}
              ></ppp-text-field>
              <p class="description">
                Если включить сетевой доступ, родительский сервис Aspirant
                обеспечит проксирование трафика к текущему сервису по
                относительной ссылке <code>/workers/{serviceID}</code>.
              </p>
              <ppp-checkbox
                ?checked="${(x) => x.document.enableHttp ?? false}"
                ${ref('enableHttp')}
              >
                Включить сетевой доступ
              </ppp-checkbox>
            </div>
            <div class="label-group full" style="min-width: 600px">
              <h5>Дополнительные файлы</h5>
              <p class="description">
                Ссылки на дополнительные файлы, которые будут размещены в
                файловой системе сервиса относительно файла точки входа.
              </p>
              ${repeat(
                (x) => x.document.fileList ?? [],
                html`
                  <div class="control-line">
                    <ppp-text-field
                      style="width: 320px;"
                      placeholder="URL"
                      value="${(x) => x.url}"
                    ></ppp-text-field>
                    <ppp-text-field
                      style="width: 256px;"
                      placeholder="Относительный путь"
                      value="${(x) => x.path}"
                    >
                    </ppp-text-field>
                    <ppp-button
                      style="margin-top: 8px;"
                      appearance="default"
                      @click="${(x, c) =>
                        c.parent.removeFileFromFileList(c.index)}"
                    >
                      Удалить
                      <span slot="start">${html.partial(trash)}</span>
                    </ppp-button>
                  </div>
                `,
                { positioning: true }
              )}
              <div class="spacing3"></div>
              <ppp-button
                appearance="primary"
                @click="${(x) => x.addFileToFileList()}"
              >
                Добавить файл
              </ppp-button>
            </div>
          </div>
          <div class="control-stack">
            <div class="label-group full">
              <h5>Версионирование</h5>
              <p class="description">
                Включите настройку, чтобы отслеживать версию сервиса и
                предлагать обновления.
              </p>
              <ppp-checkbox
                ?checked="${(x) => x.document.useVersioning ?? false}"
                @change="${(x) => {
                  if (!x.useVersioning.checked)
                    x.versioningUrl.appearance = 'default';
                }}"
                ${ref('useVersioning')}
              >
                Отслеживать версию сервиса по этому файлу:
              </ppp-checkbox>
              <ppp-text-field
                ?disabled="${(x) => !x.useVersioning.checked}"
                placeholder="Введите ссылку"
                value="${(x) => x.document.versioningUrl ?? ''}"
                ${ref('versioningUrl')}
              ></ppp-text-field>
            </div>
            <div class="label-group full">
              <h5>Шаблоны готовых сервисов</h5>
              <p class="description">
                Воспользуйтесь шаблонами готовых сервисов для их быстрой
                настройки.
              </p>
              <ppp-select
                value="${(x) =>
                  x.document.workerPredefinedTemplate ?? 'default'}"
                ${ref('workerPredefinedTemplate')}
              >
                <ppp-option value="default">По умолчанию</ppp-option>
                <ppp-option value="aurora">
                  Рыночные данные UTEX Aurora
                </ppp-option>
              </ppp-select>
              ${when(
                (x) => x.workerPredefinedTemplate.value === 'aurora',
                html`
                  <div class="control-line">
                    <ppp-query-select
                      ${ref('utexAuroraBrokerId')}
                      placeholder="Выберите брокерский профиль UTEX"
                      :context="${(x) => x}"
                      :query="${() => {
                        return (context) => {
                          return context.services
                            .get('mongodb-atlas')
                            .db('ppp')
                            .collection('brokers')
                            .find({
                              $and: [
                                {
                                  type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.UTEX%]`
                                },
                                {
                                  removed: { $ne: true }
                                }
                              ]
                            })
                            .sort({ updatedAt: -1 });
                        };
                      }}"
                      :transform="${() => ppp.decryptDocumentsTransformation()}"
                    ></ppp-query-select>
                    <ppp-button
                      style="margin-top: 8px;"
                      appearance="default"
                      @click="${() =>
                        ppp.app.mountPage(`broker-${BROKERS.UTEX}`, {
                          size: 'xlarge',
                          adoptHeader: true
                        })}"
                    >
                      +
                    </ppp-button>
                  </div>
                `
              )}
              <div class="spacing2"></div>
              <ppp-button
                @click="${(x) => x.fillOutFormsWithTemplate()}"
                appearance="primary"
              >
                Заполнить формы по этому шаблону
              </ppp-button>
            </div>
            <div class="label-group full">
              <h5>Переменные окружения</h5>
              <p class="description">
                Объект JavaScript с переменными окружения, которые будут
                переданы в Worker.
              </p>
              <ppp-snippet
                style="height: 150px"
                :code="${(x) =>
                  x.document.environmentCode ??
                  predefinedWorkerData.default.env}"
                ${ref('environmentCode')}
              ></ppp-snippet>
            </div>
            <div class="label-group full">
              <h5>Шифруемые переменные окружения</h5>
              <p class="description">
                Объект JavaScript с переменными окружения, которые будут
                переданы в Worker в исходном виде, но сохранены в базе данных в
                зашифрованном.
              </p>
              <ppp-snippet
                style="height: 150px"
                :code="${(x) =>
                  x.document.environmentCodeSecret ??
                  predefinedWorkerData.default.envSecret}"
                ${ref('environmentCodeSecret')}
              ></ppp-snippet>
            </div>
          </div>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: 'Сохранить в PPP и обновить в Aspirant',
        extraControls: servicePageFooterExtraControls
      })}
    </form>
  </template>
`;

export const servicePppAspirantWorkerPageStyles = css`
  ${pageStyles}
`;

export class ServicePppAspirantWorkerPage extends Page {
  collection = 'services';

  addFileToFileList() {
    if (typeof this.document.fileList === 'undefined') {
      this.document.fileList = [];
    }

    this.document.fileList.push({
      url: '',
      path: ''
    });

    Observable.notify(this, 'document');
  }

  removeFileFromFileList(index) {
    if (typeof this.document.fileList === 'undefined') {
      this.document.fileList = [];
    }

    this.document.fileList.splice(index, 1);

    Observable.notify(this, 'document');
  }

  async validate() {
    await validate(this.name);
    await validate(this.aspirantServiceId);
    await validate(this.sourceCode);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'aspirantServiceId',
              foreignField: '_id',
              as: 'aspirantService'
            }
          },
          {
            $unwind: '$aspirantService'
          },
          {
            $lookup: {
              from: 'servers',
              localField: 'aspirantService.serverId',
              foreignField: '_id',
              as: 'server'
            }
          },
          {
            $unwind: {
              path: '$server',
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.PPP_ASPIRANT_WORKER,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  #getInternalEnv() {
    return {
      PPP_WORKER_ID: this.document._id,
      SERVICE_MACHINE_URL: ppp.keyVault.getKey('service-machine-url'),
      PPP_ROOT_URL: ppp.rootUrl.replace('github.io.dev', 'pages.dev')
    };
  }

  #deployAspirantWorker() {}

  async submit() {
    const state =
      this.document.state === SERVICE_STATE.ACTIVE
        ? SERVICE_STATE.ACTIVE
        : SERVICE_STATE.STOPPED;

    return [
      {
        $set: {
          name: this.name.value.trim(),
          useVersioning: this.useVersioning.checked,
          versioningUrl: this.versioningUrl.value.trim(),
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.PPP_ASPIRANT_WORKER,
          createdAt: new Date()
        }
      },
      this.#deployAspirantWorker,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }

  async update() {}

  async cleanup() {}
}

applyMixins(ServicePppAspirantWorkerPage, PageWithService);

export default ServicePppAspirantWorkerPage.compose({
  template: servicePppAspirantWorkerPageTemplate,
  styles: servicePppAspirantWorkerPageStyles
}).define();
