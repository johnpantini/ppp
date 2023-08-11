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
import { servicePageHeaderExtraControls } from './service.js';
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import { Tmpl } from '../../lib/tmpl.js';
import { createWorkerUploadForm } from '../../lib/cloudflare.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { parsePPPScript } from '../../lib/ppp-script.js';
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
    // Default value
    sourceCode: `// ==PPPScript==
// @version 1
// ==/PPPScript==

export default {
  async fetch(request) {
    return new Response("Hello from PPP!");
  },
};`,
    url: '/lib/cloudflare-workers/example-worker.js'
  },
  tradingview: {
    env: `{
  INJECTION_LIB_URL: '[%#ppp.rootUrl%]/lib/cloudflare-workers/tradingview/tradingview.js'
}`,
    envSecret: '{}',
    url: '/lib/cloudflare-workers/tradingview/worker.js'
  },
  thefly: {
    env: `{}`,
    envSecret: '{}',
    url: '/lib/cloudflare-workers/thefly.js'
  },
  mongoDBRealm: {
    env: `{}`,
    envSecret: '{}',
    url: '/lib/cloudflare-workers/mongodb-realm.js'
  },
  psinaPusher: {
    env: (pusherApi) => {
      return {
        PUSHER_APPID: pusherApi.appid,
        PUSHER_KEY: pusherApi.key,
        PUSHER_CLUSTER: pusherApi.cluster
      };
    },
    envSecret: (pusherApi) => {
      return {
        PUSHER_SECRET: pusherApi.secret
      };
    },
    url: '/lib/cloudflare-workers/psina-pusher.js'
  }
};

export const serviceCloudflareWorkerPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: servicePageHeaderExtraControls
      })}
      ${when(
        (x) => x.document._id && x.document.subdomain,
        html`
          <section>
            <div class="control-stack">
              <ppp-banner class="inline" appearance="warning">
                Глобальная ссылка сервиса в Cloudflare:
              </ppp-banner>
              <ppp-copyable>
                ${(x) =>
                  `https://ppp-${x.document._id}.${x.document.subdomain}.workers.dev/`}
              </ppp-copyable>
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
          <h5>Профиль Cloudflare API</h5>
          <p class="description">
            Необходим для авторизации, нельзя изменить после создания.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('cloudflareApiId')}
            ?disabled="${(x) => x.document._id}"
            value="${(x) => x.document.cloudflareApiId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.cloudflareApi ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('apis')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.CLOUDFLARE%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.cloudflareApiId ?? ''%]`
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
          <ppp-button
            @click="${() =>
              ppp.app.mountPage(`api-${APIS.CLOUDFLARE}`, {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить API Cloudflare
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="implementation-area">
          <div class="label-group full" style="min-width: 600px">
            <h5>Реализация сервиса</h5>
            <p class="description">Код Cloudflare Worker.</p>
            <ppp-snippet
              style="height: 750px"
              :code="${(x) =>
                x.document.sourceCode ??
                predefinedWorkerData.default.sourceCode}"
              ${ref('sourceCode')}
            ></ppp-snippet>
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
                @input="${(x) => (x.workerPredefinedTemplate.value = 'custom')}"
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
                <ppp-option value="custom">По файлу отслеживания</ppp-option>
                <ppp-option value="default">Тестовый пример</ppp-option>
                <ppp-option value="tradingview">
                  Прокси для ru.tradingview.com
                </ppp-option>
                <ppp-option value="thefly">Прокси для thefly.com</ppp-option>
                <ppp-option value="mongoDBRealm">
                  Прокси для MongoDB Realm
                </ppp-option>
                <ppp-option value="psinaPusher">
                  Интеграция Pusher и Psina
                </ppp-option>
              </ppp-select>
              ${when(
                (x) => x.workerPredefinedTemplate.value === 'psinaPusher',
                html`
                  <div class="spacing2"></div>
                  <div class="control-line baseline">
                    <ppp-query-select
                      ${ref('psinaPusherApiId')}
                      standalone
                      placeholder="Выберите профиль API Pusher"
                      :context="${(x) => x}"
                      :query="${() => {
                        return (context) => {
                          return context.services
                            .get('mongodb-atlas')
                            .db('ppp')
                            .collection('apis')
                            .find({
                              $and: [
                                {
                                  type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.PUSHER%]`
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
                      appearance="default"
                      @click="${() =>
                        ppp.app.mountPage(`api-${APIS.PUSHER}`, {
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
        text: 'Сохранить в PPP и обновить в Cloudflare'
      })}
    </form>
  </template>
`;

export const serviceCloudflareWorkerPageStyles = css`
  ${pageStyles}
`;

export class ServiceCloudflareWorkerPage extends Page {
  collection = 'services';

  async fillOutFormsWithTemplate() {
    this.beginOperation();

    try {
      if (this.workerPredefinedTemplate.value === 'psinaPusher') {
        await validate(this.psinaPusherApiId);
      }

      let data;

      if (this.workerPredefinedTemplate.value === 'custom') {
        data = {
          url: this.versioningUrl.value
        };
      } else {
        data = predefinedWorkerData[this.workerPredefinedTemplate.value];
      }

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

        const code = await fcRequest.text();

        try {
          const { meta } = parsePPPScript(code);

          Object.assign(data, JSON.parse(meta.meta[0] ?? '{}') ?? {});
        } catch (e) {
          // Bad or empty metadata
          void 0;
        }

        this.sourceCode.updateCode(code);

        if (this.workerPredefinedTemplate.value === 'psinaPusher') {
          const pusherApi = this.psinaPusherApiId.datum();

          this.environmentCode.updateCode(
            JSON.stringify(data.env(pusherApi), null, 2)
          );
          this.environmentCodeSecret.updateCode(
            JSON.stringify(data.envSecret(pusherApi), null, 2)
          );
        } else {
          this.environmentCode.updateCode(data.env ?? '{}');
          this.environmentCodeSecret.updateCode(data.envSecret ?? '{}');
        }

        this.versioningUrl.value = data.url;
        this.useVersioning.checked = true;

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
    await validate(this.cloudflareApiId);

    const { email, apiKey, accountID } = this.cloudflareApiId.datum();

    const subdomainRequest = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          url: `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/subdomain`,
          headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': apiKey
          }
        })
      }
    );

    await maybeFetchError(
      subdomainRequest,
      'Ошибка чтения поддомена Cloudflare Workers.'
    );

    const subdomainResponse = await subdomainRequest.json();
    const subdomain = subdomainResponse?.result?.subdomain;

    if (!subdomain) {
      invalidate(this.cloudflareApiId, {
        errorMessage: 'В сервисе Cloudflare Workers не настроен поддомен',
        raiseException: true
      });
    }

    this.document.subdomain = subdomain;

    await validate(this.environmentCode);
    await validate(this.environmentCodeSecret);

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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.CLOUDFLARE_WORKER%]`
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'cloudflareApiId',
              foreignField: '_id',
              as: 'cloudflareApi'
            }
          },
          {
            $unwind: '$cloudflareApi'
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.CLOUDFLARE_WORKER,
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

  async #deployCloudflareWorker() {
    const name = `ppp-${this.document._id}`;
    const fd = createWorkerUploadForm({
      name,
      main: {
        name,
        content: this.sourceCode.value,
        type: 'esm'
      },
      bindings: {
        kv_namespaces: [],
        vars: Object.assign(
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
        ),
        durable_objects: { bindings: [] },
        r2_buckets: [],
        services: [],
        wasm_modules: {},
        text_blobs: {},
        data_blobs: {},
        worker_namespaces: [],
        logfwdr: { schema: undefined, bindings: [] },
        unsafe: []
      },
      modules: [],
      migrations: undefined,
      compatibility_date: undefined,
      compatibility_flags: undefined,
      usage_model: undefined
    });

    const { contentType, chunks } = fd.toPayload();
    const { email, apiKey, accountID } = this.cloudflareApiId.datum();

    const updateWorkerRequest = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')),
      {
        method: 'POST',
        body: JSON.stringify({
          url: `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/scripts/${name}`,
          method: 'PUT',
          headers: {
            'Content-Type': contentType,
            'X-Auth-Email': email,
            'X-Auth-Key': apiKey
          },
          body: await new Blob(chunks, {
            type: contentType
          }).text()
        })
      }
    );

    await maybeFetchError(
      updateWorkerRequest,
      'Не удалось развернуть сервис в Cloudflare.'
    );

    const enableSubdomainRequest = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')),
      {
        method: 'POST',
        body: JSON.stringify({
          url: `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/scripts/${name}/subdomain`,
          method: 'POST',
          headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': apiKey
          },
          body: {
            enabled: true
          }
        })
      }
    );

    await maybeFetchError(
      enableSubdomainRequest,
      'Не удалось активировать поддомен *.dev для сервиса в Cloudflare.'
    );
  }

  async submit() {
    const state = SERVICE_STATE.ACTIVE;

    return [
      {
        $set: {
          name: this.name.value.trim(),
          cloudflareApiId: this.cloudflareApiId.value,
          sourceCode: this.sourceCode.value,
          environmentCode: this.environmentCode.value,
          environmentCodeSecret: this.environmentCodeSecret.value,
          version: this.getVersionFromSnippet(
            this.sourceCode,
            this.useVersioning.checked
          ),
          workerPredefinedTemplate: this.workerPredefinedTemplate.value,
          subdomain: this.document.subdomain,
          useVersioning: this.useVersioning.checked,
          versioningUrl: this.versioningUrl.value.trim(),
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.CLOUDFLARE_WORKER,
          createdAt: new Date()
        }
      },
      this.#deployCloudflareWorker,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }

  async update() {
    let data;

    if (this.workerPredefinedTemplate.value === 'custom') {
      data = {
        url: this.versioningUrl.value
      };
    } else {
      data = predefinedWorkerData[this.workerPredefinedTemplate.value];
    }

    const fcRequest = await fetch(
      ppp.getWorkerTemplateFullUrl(data.url).toString(),
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(fcRequest, 'Не удалось загрузить файл с шаблоном.');

    this.sourceCode.updateCode(await fcRequest.text());
  }

  async cleanup() {
    const { email, apiKey, accountID } = this.cloudflareApiId.datum();
    const name = `ppp-${this.document._id}`;

    await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        body: JSON.stringify({
          method: 'DELETE',
          url: `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/scripts/${name}`,
          headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': apiKey
          }
        })
      }
    );
  }
}

applyMixins(ServiceCloudflareWorkerPage, PageWithService);

export default ServiceCloudflareWorkerPage.compose({
  template: serviceCloudflareWorkerPageTemplate,
  styles: serviceCloudflareWorkerPageStyles
}).define();
