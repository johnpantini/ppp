import ppp from '../../ppp.js';
import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  documentPageFooterPartial,
  documentPageHeaderPartial,
  Page,
  pageStyles,
  PageWithService
} from '../page.js';
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import {
  servicePageFooterExtraControls,
  servicePageHeaderExtraControls
} from './service.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../text-field.js';

export const serviceCloudPppAspirantTemplate = html`
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
            placeholder="Aspirant"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Хранилище Redis</h5>
          <p class="description">Персистентность для сервиса.</p>
        </div>
        <div class="input-group">
          <ppp-query-select
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
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.REDIS%]`
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
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            @click="${() =>
              ppp.app.mountPage(`api-${APIS.REDIS}`, {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить API Redis
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Профиль API облачного провайдера</h5>
          <p class="description">
            Northflank или Render. Можно выбрать только на этапе создания или
            после удаления сервиса.
          </p>
          <div class="spacing2"></div>
          <ppp-banner class="inline" appearance="warning">
            Northflank: у вас должен быть заранее создан проект под названием
            ppp в облаке.
          </ppp-banner>
          <div class="spacing1"></div>
          <ppp-banner class="inline" appearance="warning">
            Render: создайте пустой сервис (тип Docker) с именем
            aspirant-<i>суффикс</i>. Суффикс сгенерируйте ниже.
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('deploymentApiId')}
            ?disabled="${(x) => x.document._id && !x.document.removed}"
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
                        $or: [
                          {
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.NORTHFLANK%]`
                          },
                          {
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.RENDER%]`
                          }
                        ]
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.deploymentApiId ?? ''%]`
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
          <div class="spacing2"></div>
          <div class="control-line">
            <ppp-button
              ?disabled="${(x) => x.document._id && !x.document.removed}"
              @click="${() =>
                ppp.app.mountPage(`api-${APIS.NORTHFLANK}`, {
                  size: 'xlarge',
                  adoptHeader: true
                })}"
              appearance="primary"
            >
              Добавить API Northflank
            </ppp-button>
            <ppp-button
              ?disabled="${(x) => x.document._id && !x.document.removed}"
              @click="${() =>
                ppp.app.mountPage(`api-${APIS.RENDER}`, {
                  size: 'xlarge',
                  adoptHeader: true
                })}"
              appearance="primary"
            >
              Добавить API Render
            </ppp-button>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Суффикс сервиса в облачном провайдере (11 символов)</h5>
          <p class="description">
            Это значение должно быть уникальным и конфиденциальным. Его можно
            задать только при создании или после удаления сервиса.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            ?disabled="${(x) => x.document._id && !x.document.removed}"
            placeholder="Сгенерируйте уникальное значение кнопкой"
            value="${(x) => x.document.slug}"
            ${ref('slug')}
          ></ppp-text-field>
          <div class="spacing2"></div>
          <ppp-button
            ?disabled="${(x) => x.document._id && !x.document.removed}"
            @click="${(x) =>
              (x.slug.value = `${uuidv4().replaceAll('-', '').slice(0, 11)}`)}"
            appearance="primary"
          >
            Сгенерировать уникальное значение
          </ppp-button>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: 'Сохранить в PPP и развернуть в облаке',
        extraControls: html`
          <ppp-button
            class="clear-data"
            ?hidden="${(x) => !x.document._id}"
            ?disabled="${(x) => !x.isSteady() || x.document.removed}"
            appearance="danger"
            @click="${(x) => x.clearRedisData()}"
          >
            Очистить хранилище Redis
          </ppp-button>
          ${servicePageFooterExtraControls}
        `
      })}
    </form>
  </template>
`;

export const serviceCloudPppAspirantStyles = css`
  ${pageStyles}
  .clear-data {
    margin-right: auto;
  }
`;

export class ServiceCloudPppAspirantPage extends Page {
  collection = 'services';

  async clearRedisData() {
    if (
      await ppp.app.confirm(
        'Очистка хранилища Redis',
        `Будет удалена информация о дочерних рабочих процессах. Подтвердите действие.`
      )
    ) {
      this.beginOperation();

      try {
        const api = this.document.redisApi;

        await fetch(
          new URL(
            'redis',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              options: {
                host: api.host,
                port: api.port,
                tls: api.tls
                  ? {
                      servername: api.host
                    }
                  : void 0,
                username: api.username,
                db: api.database,
                password: api.password
              },
              command: 'del',
              // Delete legacy too
              args: [
                `aspirant:${this.document._id}`,
                `ppp-aspirant:${this.document._id}:workers`
              ]
            })
          }
        );
      } finally {
        this.showSuccessNotification('Команда на очистку отправлена.');
        this.endOperation();
      }
    }
  }

  async validate() {
    await validate(this.name);
    await validate(this.redisApiId);
    await validate(this.deploymentApiId);
    await validate(this.slug);
    await validate(this.slug, {
      hook: async (value) => value.trim().length === 11,
      errorMessage: 'Значение должно содержать 11 символов'
    });
    await validate(this.slug, {
      hook: async (value) => /^[a-z0-9]+$/i.test(value),
      errorMessage: 'Допустимы только цифры и латинские буквы'
    });
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.CLOUD_PPP_ASPIRANT%]`
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'redisApiId',
              foreignField: '_id',
              as: 'redisApi'
            }
          },
          {
            $unwind: '$redisApi'
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'deploymentApiId',
              foreignField: '_id',
              as: 'deploymentApi'
            }
          },
          {
            $unwind: '$deploymentApi'
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.CLOUD_PPP_ASPIRANT,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async #deployOnNorthflank() {
    const serviceMachineUrl = ppp.keyVault.getKey('service-machine-url');
    const rProjectList = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          url: 'https://api.northflank.com/v1/projects',
          headers: {
            Authorization: `Bearer ${this.deploymentApiId.datum().token}`
          }
        })
      }
    );

    await maybeFetchError(
      rProjectList,
      'Не удалось получить список проектов Northflank.'
    );

    const project = (await rProjectList.json()).data.projects.find(
      (p) => p.name.toLowerCase() === 'ppp'
    );

    if (!project) {
      invalidate(ppp.app.toast, {
        errorMessage: 'Проект под названием ppp не найден в облаке Northflank.',
        raiseException: true
      });
    }

    this.projectID = project.id;

    const redisApi = this.redisApiId.datum();
    const runtimeEnvironment = {
      ASPIRANT_ID: this.document._id,
      SERVICE_MACHINE_URL: serviceMachineUrl,
      REDIS_HOST: redisApi.host,
      REDIS_PORT: redisApi.port.toString(),
      REDIS_TLS: !!redisApi.tls ? 'true' : '',
      REDIS_USERNAME: redisApi.username?.toString() ?? 'default',
      REDIS_PASSWORD: redisApi.password?.toString(),
      REDIS_DATABASE: redisApi.database.toString()
    };

    const rPutService = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'PUT',
          url: `https://api.northflank.com/v1/projects/${project.id}/services/combined`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.deploymentApiId.datum().token}`
          },
          body: JSON.stringify({
            name: `aspirant-${this.document.slug}`,
            description: 'PPP Aspirant Service',
            billing: {
              deploymentPlan: 'nf-compute-20'
            },
            deployment: {
              instances: 1
            },
            ports: [
              {
                name: 'ppp',
                public: true,
                internalPort: 80,
                protocol: 'HTTP'
              }
            ],
            vcsData: {
              projectUrl: `https://github.com/${ppp.keyVault.getKey(
                'github-login'
              )}/ppp`,
              projectType: 'github',
              accountLogin: ppp.keyVault.getKey('github-login'),
              projectBranch: location.origin.endsWith('.io.dev')
                ? 'johnpantini'
                : 'main'
            },
            buildSettings: {
              dockerfile: {
                buildEngine: 'kaniko',
                useCache: false,
                dockerFilePath: '/salt/states/ppp/lib/aspirant/Dockerfile',
                dockerWorkDir: '/salt/states/ppp/lib'
              }
            },
            buildConfiguration: {
              pathIgnoreRules: [
                '*',
                '!salt/states/ppp/lib/aspirant',
                '!salt/states/ppp/lib/aspirant/*'
              ]
            },
            runtimeEnvironment
          })
        })
      }
    );

    await maybeFetchError(
      rPutService,
      'Не удалось создать сервис Aspirant, подробности в консоли браузера.'
    );

    this.serviceID = (await rPutService.json()).data.id;
  }

  async #deployOnRender() {}

  async submit() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          redisApiId: this.redisApiId.value,
          deploymentApiId: this.deploymentApiId.value,
          slug: this.slug.value.trim(),
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.CLOUD_PPP_ASPIRANT,
          createdAt: new Date()
        }
      },
      this.deploymentApiId.datum().type === APIS.NORTHFLANK
        ? this.#deployOnNorthflank
        : this.#deployOnRender,
      () => ({
        $set: {
          projectID: this.projectID,
          serviceID: this.serviceID,
          state: SERVICE_STATE.ACTIVE,
          updatedAt: new Date()
        }
      })
    ];
  }

  async restart() {
    if (this.deploymentApiId.datum().type === APIS.NORTHFLANK) {
      await fetch(
        new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          body: JSON.stringify({
            method: 'POST',
            url: `https://api.northflank.com/v1/projects/${this.document.projectID}/services/${this.document.serviceID}/resume`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.document.deploymentApi.token}`
            }
          })
        }
      );

      return maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            body: JSON.stringify({
              method: 'POST',
              url: `https://api.northflank.com/v1/projects/${this.document.projectID}/services/${this.document.serviceID}/restart`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.document.deploymentApi.token}`
              }
            })
          }
        ),
        'Не удалось перезапустить сервис в облаке Northflank.'
      );
    } else {
    }
  }

  async stop() {
    if (this.deploymentApiId.datum().type === APIS.NORTHFLANK) {
      return maybeFetchError(async () => {
        const request = await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            body: JSON.stringify({
              method: 'POST',
              url: `https://api.northflank.com/v1/projects/${this.document.projectID}/services/${this.document.serviceID}/pause`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.document.deploymentApi.token}`
              }
            })
          }
        );

        return {
          request,
          ok: request.ok || request.status === 409
        };
      }, 'Не удалось остановить сервис в облаке Northflank.');
    } else {
    }
  }

  async cleanup() {
    if (this.deploymentApiId.datum().type === APIS.NORTHFLANK) {
      return maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            body: JSON.stringify({
              method: 'DELETE',
              url: `https://api.northflank.com/v1/projects/${this.document.projectID}/services/${this.document.serviceID}`,
              headers: {
                Authorization: `Bearer ${this.document.deploymentApi.token}`
              }
            })
          }
        ),
        'Не удалось полностью удалить сервис. Удалите его вручную в панели управления Northflank.'
      ).catch(async (error) => {
        await this.updateDocumentFragment({
          $set: {
            state: SERVICE_STATE.STOPPED,
            updatedAt: new Date()
          }
        });

        throw error;
      });
    } else {
    }
  }
}

applyMixins(ServiceCloudPppAspirantPage, PageWithService);

export default ServiceCloudPppAspirantPage.compose({
  template: serviceCloudPppAspirantTemplate,
  styles: serviceCloudPppAspirantStyles
}).define();
