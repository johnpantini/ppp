/** @decorator */

import ppp from '../../ppp.js';
import {
  css,
  html,
  Observable,
  observable,
  ref,
  repeat,
  when
} from '../../vendor/fast-element.min.js';
import { invalidate, maybeFetchError, validate } from '../../lib/ppp-errors.js';
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
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import { Tmpl } from '../../lib/tmpl.js';
import { getMongoDBRealmAccessToken } from '../../lib/realm.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { trash } from '../../static/svg/sprite.js';
import {
  paletteGrayDark2,
  paletteGrayLight2,
  themeConditional
} from '../../design/design-tokens.js';
import '../../vendor/zip-full.min.js';
import '../../vendor/spark-md5.min.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../copyable.js';
import '../query-select.js';
import '../select.js';
import '../snippet.js';
import '../text-field.js';

export const predefinedWorkerData = {
  default: {
    env: `{}`,
    envSecret: '{}',
    url: '/salt/states/ppp/lib/aspirant-worker/example-worker.mjs',
    sourceCode: `// ==PPPScript==
// @version 1
// ==/PPPScript==

import uWS from '/salt/states/ppp/lib/uWebSockets.js/uws.js';

uWS
  .App({})
  .get('/*', (res) => {
    res.end('Hello from PPP!');
  })
  .listen('0.0.0.0', process.env.NOMAD_PORT_HTTP ?? 9001, () => {});
`,
    enableHttp: true,
    fileList: []
  },
  utexAlpaca: {
    env: `{
  UTEX_USER_AGENT: '[%#navigator.userAgent%]'
}`,
    envSecret: '{}',
    url: '/salt/states/ppp/lib/aspirant-worker/utex-alpaca/utex-alpaca.mjs',
    enableHttp: true,
    fileList: [
      {
        url: '/salt/states/ppp/lib/aspirant-worker/utex-alpaca/lib/message-type.mjs',
        path: 'lib/message-type.mjs'
      },
      {
        url: '/salt/states/ppp/lib/aspirant-worker/utex-alpaca/lib/utex.proto',
        path: 'lib/utex.proto'
      },
      {
        url: '/salt/states/ppp/lib/aspirant-worker/utex-alpaca/lib/utex-connection.mjs',
        path: 'lib/utex-connection.mjs'
      }
    ]
  }
};

export async function getAspirantBaseUrl(datum) {
  if (datum.type === SERVICES.DEPLOYED_PPP_ASPIRANT) {
    return datum.url.endsWith('/') ? datum.url.slice(0, -1) : datum.url;
  } else if (datum.type === SERVICES.CLOUD_PPP_ASPIRANT) {
    const deployment = await ppp.decrypt(
      await ppp.user.functions.findOne(
        { collection: 'apis' },
        {
          _id: datum.deploymentApiId
        }
      )
    );

    if (deployment.type === APIS.NORTHFLANK) {
      const rNFService = await fetch(
        new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          body: JSON.stringify({
            method: 'GET',
            url: `https://api.northflank.com/v1/projects/${datum.projectID}/services/${datum.serviceID}`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${deployment.token}`
            }
          })
        }
      );

      await maybeFetchError(
        rNFService,
        'Не удалось получить ссылку на сервис в облаке Northflank.'
      );

      const nfService = await rNFService.json();

      return `https://${
        nfService.data.ports.find((p) => p.name === 'ppp').dns
      }`;
    } else if (deployment.type === APIS.RENDER) {
      return `https://aspirant-${datum.slug}.onrender.com`;
    }
  }
}

export const servicePppAspirantWorkerPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: html`
          <ppp-button
            appearance="primary"
            slot="controls"
            @click="${(x) => (x.shouldShowFrame = true)}"
          >
            Показать сервис в Nomad
          </ppp-button>
          ${servicePageHeaderExtraControls}
        `
      })}
      ${when(
        (x) => x.shouldShowFrame && x.frameUrl,
        html` <iframe
          src="${(x) => x.frameUrl}"
          width="100%"
          height="800"
        ></iframe>`
      )}
      ${when(
        (x) => x.url,
        html`
          <section>
            <div class="control-stack">
              <ppp-banner class="inline" appearance="warning">
                Глобальная ссылка сервиса:
              </ppp-banner>
              <ppp-copyable> ${(x) => x.url}</ppp-copyable>
            </div>
          </section>
        `
      )}
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
        <div class="label-group">
          <h5>Прокси MongoDB Realm</h5>
          <p class="description">
            Сервис Cloudflare Worker для проксирования запросов к MongoDB Realm.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('mongodbRealmProxyServiceId')}
            value="${(x) => x.document.mongodbRealmProxyServiceId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.mongodbRealmProxyService ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('services')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.CLOUDFLARE_WORKER%]`
                      },
                      { sourceCode: { $regex: 'realm\\.mongodb\\.com' } },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.mongodbRealmProxyServiceId ?? ''%]`
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
              :code="${(x) =>
                x.document.sourceCode ??
                predefinedWorkerData.default.sourceCode}"
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
                ?checked="${(x) =>
                  x.document.enableHttp ??
                  predefinedWorkerData.default.enableHttp}"
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
                  <div class="control-line file-entry">
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
                <ppp-option value="utexAlpaca">
                  Alpaca-совместимый API UTEX
                </ppp-option>
              </ppp-select>
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
  iframe {
    background: transparent;
    margin-top: 15px;
    border-radius: 4px;
    border: 1px ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }
`;

export class ServicePppAspirantWorkerPage extends Page {
  collection = 'services';

  fileList = [];

  zipWriter;

  zipBlob = null;

  @observable
  url;

  @observable
  frameUrl;

  @observable
  shouldShowFrame;

  async connectedCallback() {
    await super.connectedCallback();

    if (
      this.document._id &&
      this.document.aspirantService &&
      this.document.enableHttp
    ) {
      const aspirantUrl = await getAspirantBaseUrl(
        this.document.aspirantService
      );

      if ((await fetch(`${aspirantUrl}/nomad/health`)).ok) {
        this.url = `${aspirantUrl}/workers/${this.document._id}`;
        this.frameUrl = `${aspirantUrl}/ui/jobs/worker-${this.document._id}@default`;
      }
    }
  }

  addFileToFileList() {
    if (!Array.isArray(this.document.fileList)) {
      this.document.fileList = [];
    }

    this.document.fileList.push({
      url: '',
      path: ''
    });

    Observable.notify(this, 'document');
  }

  removeFileFromFileList(index) {
    if (!Array.isArray(this.document.fileList)) {
      this.document.fileList = [];
    }

    this.document.fileList.splice(index, 1);

    Observable.notify(this, 'document');
  }

  async fillOutFormsWithTemplate() {
    this.beginOperation();

    try {
      const data = predefinedWorkerData[this.workerPredefinedTemplate.value];

      try {
        const fcRequest = await fetch(
          ppp.getWorkerTemplateFullUrl(data.url).toString(),
          {
            cache: 'reload'
          }
        );

        await maybeFetchError(
          fcRequest,
          'Не удалось загрузить файл с шаблоном.'
        );

        this.document.fileList = structuredClone(data.fileList ?? []);

        this.sourceCode.updateCode(await fcRequest.text());
        this.environmentCode.updateCode(data.env);
        this.environmentCodeSecret.updateCode(data.envSecret);
        this.enableHttp.checked = data.enableHttp;
        this.command.value = data.command;
        this.args.value = data.args;
        this.versioningUrl.value = data.url;
        this.useVersioning.checked = true;

        this.document.name = this.name.value;
        this.document.aspirantServiceId = this.aspirantServiceId.value;
        this.document.mongodbRealmProxyServiceId =
          this.mongodbRealmProxyServiceId.value;
        this.document.sourceCode = this.sourceCode.value;
        this.document.environmentCode = this.environmentCode.value;
        this.document.environmentCodeSecret = this.environmentCodeSecret.value;
        this.document.enableHttp = data.enableHttp;
        this.document.command = data.command;
        this.document.args = data.args;
        this.document.workerPredefinedTemplate =
          this.workerPredefinedTemplate.value;
        this.document.versioningUrl = data.url;
        this.document.useVersioning = true;

        Observable.notify(this, 'document');
        this.showSuccessNotification(
          `Шаблон «${this.workerPredefinedTemplate.displayValue.trim()}» успешно загружен.`
        );
      } catch (e) {
        invalidate(this.versioningUrl, {
          errorMessage: 'Неверный URL',
          raiseException: true
        });
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async validate() {
    await validate(this.name);
    await validate(this.aspirantServiceId);
    await validate(this.mongodbRealmProxyServiceId);

    if (this.useVersioning.checked) {
      await validate(this.versioningUrl);

      // URL validation
      try {
        ppp.getWorkerTemplateFullUrl(this.versioningUrl.value);
      } catch (e) {
        invalidate(this.versioningUrl, {
          errorMessage: 'Неверный URL',
          raiseException: true
        });
      }
    }

    await validate(this.sourceCode);

    const zip = globalThis.zip;

    this.zipWriter = new zip.ZipWriter(new zip.BlobWriter('application/zip'));

    try {
      if (this.document.fileList?.length > 0) {
        for (const [e, index] of Array.from(
          this.shadowRoot.querySelectorAll('.file-entry')
        ).map((item, index) => [item, index])) {
          const [urlField, pathField] = Array.from(
            e.querySelectorAll('ppp-text-field')
          );

          await validate(urlField);
          await validate(pathField);

          let url;

          try {
            url = ppp.getWorkerTemplateFullUrl(urlField.value).toString();
          } catch (e) {
            invalidate(urlField, {
              errorMessage: 'Неверный URL',
              raiseException: true
            });
          }

          const path = pathField.value.trim();

          try {
            await this.zipWriter.add(
              path,
              new zip.HttpReader(url, {
                preventHeadRequest: true
              })
            );
          } catch (e) {
            console.error(e);

            invalidate(urlField, {
              errorMessage: 'Не удалось загрузить файл',
              raiseException: true
            });
          }

          this.document.fileList[index] = {
            url: urlField.value.trim(),
            path
          };
        }
      }

      await validate(this.environmentCode);
      await validate(this.environmentCodeSecret);

      try {
        new Function(
          `return ${await new Tmpl().render(
            this,
            this.environmentCode.value,
            {}
          )}`
        )();
      } catch (e) {
        invalidate(this.environmentCode, {
          errorMessage: 'Код содержит ошибки',
          raiseException: true
        });
      }

      try {
        new Function(
          `return ${await new Tmpl().render(
            this,
            this.environmentCodeSecret.value,
            {}
          )}`
        )();
      } catch (e) {
        invalidate(this.environmentCodeSecret, {
          errorMessage: 'Код содержит ошибки',
          raiseException: true
        });
      }

      await this.zipWriter.add(
        `${this.document._id}.mjs`,
        new zip.TextReader(this.sourceCode.value)
      );
    } finally {
      this.zipBlob = null;

      if (typeof this.zipWriter !== 'undefined') {
        this.zipBlob = await this.zipWriter.close();
      }
    }
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
            $unwind: {
              path: '$aspirantService',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'mongodbRealmProxyServiceId',
              foreignField: '_id',
              as: 'mongodbRealmProxyService'
            }
          },
          {
            $unwind: {
              path: '$mongodbRealmProxyService',
              preserveNullAndEmptyArrays: true
            }
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
      PPP_ROOT_URL: ppp.rootUrl.replace('github.io.dev', 'pages.dev')
    };
  }

  async #deployAspirantWorker() {
    if (this.zipBlob) {
      const groupId = ppp.keyVault.getKey('mongo-group-id');
      const appId = ppp.keyVault.getKey('mongo-app-id');
      const mongoDBRealmAccessToken = await getMongoDBRealmAccessToken();
      const serviceMachineUrl = ppp.keyVault.getKey('service-machine-url');

      const rHostingConfiguration = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'reload',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'GET',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/hosting/config`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            }
          })
        }
      );

      await maybeFetchError(
        rHostingConfiguration,
        'Не удалось получить конфигурацию хостинга MongoDB Realm.'
      );

      const hostingConfiguration = await rHostingConfiguration.json();

      if (!hostingConfiguration.enabled) {
        await fetch(new URL('fetch', serviceMachineUrl).toString(), {
          cache: 'reload',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'PATCH',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/hosting/config`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: JSON.stringify({
              enabled: true
            })
          })
        });

        invalidate(ppp.app.toast, {
          errorMessage:
            'Хостинг MongoDB Realm был выключен и сейчас приводится в состояние готовности, попробуйте повторить через несколько минут.',
          raiseException: true
        });
      } else if (hostingConfiguration.status !== 'setup_ok') {
        invalidate(ppp.app.toast, {
          errorMessage:
            'Хостинг MongoDB Realm ещё не готов, попробуйте повторить через несколько минут.',
          raiseException: true
        });
      }

      const formData = new FormData();
      const reader = new FileReader();

      reader.readAsArrayBuffer(this.zipBlob);

      const hash = await new Promise((resolve) => {
        reader.onloadend = async function () {
          resolve(SparkMD5.ArrayBuffer.hash(reader.result));
        };
      });

      const artifactRelativeUrl = `/aspirant/${
        this.aspirantServiceId.datum()._id
      }/workers/${this.document._id}.zip`;

      formData.set(
        'meta',
        JSON.stringify({
          path: artifactRelativeUrl,
          size: this.zipBlob.size,
          attrs: [
            {
              name: 'Cache-Control',
              value: 'reload'
            }
          ],
          hash
        })
      );
      formData.set('file', this.zipBlob);

      const proxyDatum = this.mongodbRealmProxyServiceId.datum();

      await maybeFetchError(
        await fetch(
          `https://ppp-${proxyDatum._id}.${proxyDatum.subdomain}.workers.dev/api/admin/v3.0/groups/${groupId}/apps/${appId}/hosting/assets/asset`,
          {
            cache: 'reload',
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: formData
          }
        ),
        'Не удалось загрузить файлы сервиса в облачное хранилище MongoDB Realm.'
      );

      await maybeFetchError(
        await fetch(
          `https://ppp-${proxyDatum._id}.${proxyDatum.subdomain}.workers.dev/api/admin/v3.0/groups/${groupId}/apps/${appId}/hosting/cache`,
          {
            cache: 'reload',
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: JSON.stringify({ invalidate: true, path: '/*' })
          }
        ),
        'Не удалось сбросить кэш облачного хранилища MongoDB Realm.'
      );

      const aspirantUrl = await getAspirantBaseUrl(
        this.aspirantServiceId.datum()
      );

      const aspirantDocument = await ppp.decrypt(
        await ppp.user.functions.findOne(
          {
            collection: 'services'
          },
          {
            _id: this.aspirantServiceId.datum()._id
          }
        )
      );

      const redisApi = await ppp.decrypt(
        await ppp.user.functions.findOne(
          { collection: 'apis' },
          {
            _id: aspirantDocument.redisApiId
          }
        )
      );

      const artifactUrl = `https://${ppp.keyVault.getKey(
        'mongo-app-client-id'
      )}.mongodbstitch.com${artifactRelativeUrl}`;
      const env = Object.assign(
        {},
        new Function(
          `return Object.assign({}, ${await new Tmpl().render(
            this,
            this.document.environmentCode
          )}, ${await new Tmpl().render(
            this,
            this.document.environmentCodeSecret
          )});`
        )(),
        this.#getInternalEnv()
      );

      await maybeFetchError(
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
                host: redisApi.host,
                port: redisApi.port,
                tls: redisApi.tls
                  ? {
                      servername: redisApi.host
                    }
                  : void 0,
                username: redisApi.username,
                db: redisApi.database,
                password: redisApi.password
              },
              command: 'hset',
              args: [
                `aspirant:${this.aspirantServiceId.datum()._id}`,
                this.document._id,
                JSON.stringify({
                  env,
                  artifactUrl,
                  enableHttp: this.enableHttp.checked,
                  command: this.document.command,
                  args: this.document.args
                })
              ]
            })
          }
        ),
        'Не удалось создать запись сервиса в Redis.'
      );

      await maybeFetchError(
        await fetch(`${aspirantUrl}/api/v1/workers`, {
          cache: 'reload',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workerId: this.document._id,
            artifactUrl,
            enableHttp: this.enableHttp.checked,
            env,
            command: this.document.command,
            args: this.document.args
          })
        }),
        'Не удалось запланировать сервис на исполнение.'
      );
    }
  }

  async submit() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          aspirantServiceId: this.aspirantServiceId.value,
          mongodbRealmProxyServiceId: this.mongodbRealmProxyServiceId.value,
          sourceCode: this.sourceCode.value,
          command: this.command.value.trim(),
          args: this.args.value.trim(),
          enableHttp: this.enableHttp.checked,
          fileList: structuredClone(this.document.fileList),
          environmentCode: this.environmentCode.value,
          environmentCodeSecret: this.environmentCodeSecret.value,
          version: this.getVersionFromSnippet(
            this.sourceCode,
            this.useVersioning.checked
          ),
          workerPredefinedTemplate: this.workerPredefinedTemplate.value,
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
          state: SERVICE_STATE.ACTIVE,
          updatedAt: new Date()
        }
      })
    ];
  }

  async update() {
    const data = predefinedWorkerData[this.workerPredefinedTemplate.value];
    const fcRequest = await fetch(
      ppp.getWorkerTemplateFullUrl(data.url).toString(),
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(fcRequest, 'Не удалось загрузить файл с шаблоном.');

    this.sourceCode.updateCode(await fcRequest.text());

    this.document.fileList = structuredClone(data.fileList);
  }

  async stop() {
    const aspirantUrl = await getAspirantBaseUrl(
      this.aspirantServiceId.datum()
    );

    await maybeFetchError(
      await fetch(`${aspirantUrl}/api/v1/workers`, {
        cache: 'reload',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workerId: this.document._id
        })
      }),
      'Не удалось остановить сервис.'
    );

    const api = await ppp.decrypt(
      await ppp.user.functions.findOne(
        { collection: 'apis' },
        {
          _id: this.aspirantServiceId.datum().redisApiId
        }
      )
    );

    await maybeFetchError(
      await fetch(
        new URL('redis', ppp.keyVault.getKey('service-machine-url')).toString(),
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
            command: 'hdel',
            args: [
              `aspirant:${this.aspirantServiceId.datum()._id}`,
              this.document._id
            ]
          })
        }
      ),
      'Не удалось удалить запись сервиса из Redis.'
    );
  }

  async restart() {
    if (this.document.state === SERVICE_STATE.STOPPED) {
      return this.submitDocument();
    }

    const aspirantUrl = await getAspirantBaseUrl(
      this.aspirantServiceId.datum()
    );

    await maybeFetchError(
      await fetch(`${aspirantUrl}/api/v1/workers`, {
        cache: 'reload',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workerId: this.document._id
        })
      }),
      'Не удалось перезапустить сервис.'
    );
  }

  async cleanup() {
    await this.stop();
  }
}

applyMixins(ServicePppAspirantWorkerPage, PageWithService);

export default ServicePppAspirantWorkerPage.compose({
  template: servicePppAspirantWorkerPageTemplate,
  styles: servicePppAspirantWorkerPageStyles
}).define();
