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
await ppp.i18n(import.meta.url);

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
  },
  psinaUsNewsBodyExtraction: {
    url: '/lib/cloudflare-workers/psina-us-news-body-extraction.js',
    env: (astraDbApi) => {
      return {
        GLOBAL_PROXY_URL: "[%#ppp.keyVault.getKey('global-proxy-url')%]",
        ASTRA_DB_ID: astraDbApi.dbID,
        ASTRA_DB_REGION: astraDbApi.dbRegion,
        ASTRA_DB_KEYSPACE: astraDbApi.dbKeyspace
      };
    },
    envSecret: (astraDbApi) => {
      return {
        ASTRA_DB_APPLICATION_TOKEN: astraDbApi.dbToken
      };
    }
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
                ${() => ppp.t('$serviceCloudflareWorkerPage.globalLinkBanner')}
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
          <h5>${() => ppp.t('$page.serviceName')}</h5>
          <p class="description">
            ${() => ppp.t('$page.arbitraryProfileName')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="${() => ppp.t('$page.enterName')}"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>
            ${() => ppp.t('$serviceCloudflareWorkerPage.cloudflareApiProfile')}
          </h5>
          <p class="description">
            ${() =>
              ppp.t(
                '$serviceCloudflareWorkerPage.cloudflareApiProfileDescription'
              )}
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
            ${() => ppp.t('$serviceCloudflareWorkerPage.addCloudflareApi')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="implementation-area">
          <div class="label-group full" style="min-width: 600px">
            <h5>
              ${() =>
                ppp.t('$serviceCloudflareWorkerPage.serviceImplementation')}
            </h5>
            <p class="description">
              ${() =>
                ppp.t(
                  '$serviceCloudflareWorkerPage.serviceImplementationDescription'
                )}
            </p>
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
              <h5>${() => ppp.t('$serviceCloudflareWorkerPage.versioning')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$serviceCloudflareWorkerPage.versioningDescription')}
              </p>
              <ppp-checkbox
                ?checked="${(x) => x.document.useVersioning ?? false}"
                @change="${(x) => {
                  if (!x.useVersioning.checked)
                    x.versioningUrl.appearance = 'default';
                }}"
                ${ref('useVersioning')}
              >
                ${() => ppp.t('$serviceCloudflareWorkerPage.trackVersionByFile')}
              </ppp-checkbox>
              <ppp-text-field
                ?disabled="${(x) => !x.useVersioning.checked}"
                placeholder="${() =>
                  ppp.t('$serviceCloudflareWorkerPage.enterUrlPlaceholder')}"
                value="${(x) => x.document.versioningUrl ?? ''}"
                @input="${(x) => (x.workerPredefinedTemplate.value = 'custom')}"
                ${ref('versioningUrl')}
              ></ppp-text-field>
            </div>
            <div class="label-group full">
              <h5>
                ${() =>
                  ppp.t('$serviceCloudflareWorkerPage.predefinedTemplates')}
              </h5>
              <p class="description">
                ${() =>
                  ppp.t(
                    '$serviceCloudflareWorkerPage.predefinedTemplatesDescription'
                  )}
              </p>
              <div class="control-stack" style="align-items: unset">
                <ppp-select
                  value="${(x) =>
                    x.document.workerPredefinedTemplate ?? 'default'}"
                  ${ref('workerPredefinedTemplate')}
                >
                  <ppp-option value="custom">
                    ${() =>
                      ppp.t('$serviceCloudflareWorkerPage.customTemplate')}
                  </ppp-option>
                  <ppp-option value="default">
                    ${() =>
                      ppp.t('$serviceCloudflareWorkerPage.defaultTemplate')}
                  </ppp-option>
                  <ppp-option value="tradingview">
                    ${() =>
                      ppp.t('$serviceCloudflareWorkerPage.tradingviewTemplate')}
                  </ppp-option>
                  <ppp-option value="thefly">
                    ${() =>
                      ppp.t('$serviceCloudflareWorkerPage.theflyTemplate')}
                  </ppp-option>
                  <ppp-option value="psinaPusher">
                    ${() =>
                      ppp.t('$serviceCloudflareWorkerPage.psinaPusherTemplate')}
                  </ppp-option>
                  <ppp-option value="psinaUsNewsBodyExtraction">
                    ${() =>
                      ppp.t(
                        '$serviceCloudflareWorkerPage.psinaUsNewsBodyExtractionTemplate'
                      )}
                  </ppp-option>
                </ppp-select>
                ${when(
                  (x) => x.workerPredefinedTemplate.value === 'psinaPusher',
                  html`
                    <div class="spacing2"></div>
                    <div class="control-line flex-start">
                      <ppp-query-select
                        ${ref('psinaPusherApiId')}
                        standalone
                        placeholder="${() =>
                          ppp.t('$serviceCloudflareWorkerPage.choosePusherApi')}"
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
                        :transform="${() =>
                          ppp.decryptDocumentsTransformation()}"
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
                ${when(
                  (x) =>
                    x.workerPredefinedTemplate.value ===
                    'psinaUsNewsBodyExtraction',
                  html`
                    <div class="spacing2"></div>
                    <div class="control-line flex-start">
                      <ppp-query-select
                        ${ref('psinaUsNewsAstraDbApiId')}
                        standalone
                        placeholder="${() =>
                          ppp.t('$serviceCloudflareWorkerPage.chooseAstraDbApi')}"
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
                                    type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.ASTRADB%]`
                                  },
                                  {
                                    removed: { $ne: true }
                                  }
                                ]
                              })
                              .sort({ updatedAt: -1 });
                          };
                        }}"
                        :transform="${() =>
                          ppp.decryptDocumentsTransformation()}"
                      ></ppp-query-select>
                      <ppp-button
                        appearance="default"
                        @click="${() =>
                          ppp.app.mountPage(`api-${APIS.ASTRADB}`, {
                            size: 'xlarge',
                            adoptHeader: true
                          })}"
                      >
                        +
                      </ppp-button>
                    </div>
                  `
                )}
                <ppp-checkbox ${ref('doNotFillEnvVars')}>
                  ${() =>
                    ppp.t('$serviceCloudflareWorkerPage.doNotFillEnvVars')}
                </ppp-checkbox>
                <ppp-button
                  @click="${(x) => x.fillOutFormsWithTemplate()}"
                  appearance="primary"
                >
                  ${() =>
                    ppp.t('$serviceCloudflareWorkerPage.fillFormsWithTemplate')}
                </ppp-button>
              </div>
            </div>
            <div class="label-group full">
              <h5>${() => ppp.t('$serviceCloudflareWorkerPage.envVars')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$serviceCloudflareWorkerPage.envVarsDescription')}
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
              <h5>
                ${() => ppp.t('$serviceCloudflareWorkerPage.secretEnvVars')}
              </h5>
              <p class="description">
                ${() =>
                  ppp.t(
                    '$serviceCloudflareWorkerPage.secretEnvVarsDescription'
                  )}
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
        text: ppp.t('$serviceCloudflareWorkerPage.saveAndUpdateInCloudflare')
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
      const doNotFillEnvVars = this.doNotFillEnvVars.checked;

      if (!doNotFillEnvVars) {
        if (this.workerPredefinedTemplate.value === 'psinaPusher') {
          await validate(this.psinaPusherApiId);
        }

        if (
          this.workerPredefinedTemplate.value === 'psinaUsNewsBodyExtraction'
        ) {
          await validate(this.psinaUsNewsAstraDbApiId);
        }
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
        const contentsResponse = await fetch(
          ppp.getWorkerTemplateFullUrl(data.url).toString(),
          {
            cache: 'reload'
          }
        );

        await maybeFetchError(
          contentsResponse,
          ppp.t('$serviceCloudflareWorkerPage.cannotLoadTemplateFile')
        );

        const code = await contentsResponse.text();

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

          !doNotFillEnvVars &&
            this.environmentCode.updateCode(
              JSON.stringify(data.env(pusherApi), null, 2)
            );
          !doNotFillEnvVars &&
            this.environmentCodeSecret.updateCode(
              JSON.stringify(data.envSecret(pusherApi), null, 2)
            );
        } else if (
          this.workerPredefinedTemplate.value === 'psinaUsNewsBodyExtraction'
        ) {
          const astraDbApi = this.psinaUsNewsAstraDbApiId.datum();

          !doNotFillEnvVars &&
            this.environmentCode.updateCode(
              JSON.stringify(data.env(astraDbApi), null, 2)
            );
          !doNotFillEnvVars &&
            this.environmentCodeSecret.updateCode(
              JSON.stringify(data.envSecret(astraDbApi), null, 2)
            );
        } else {
          !doNotFillEnvVars &&
            this.environmentCode.updateCode(data.env ?? '{}');
          !doNotFillEnvVars &&
            this.environmentCodeSecret.updateCode(data.envSecret ?? '{}');
        }

        this.versioningUrl.value = data.url;
        this.useVersioning.checked = true;

        this.showSuccessNotification(
          ppp.t('$serviceCloudflareWorkerPage.templateLoaded', {
            template: this.workerPredefinedTemplate.displayValue.trim()
          })
        );
      } catch (e) {
        invalidate(this.versioningUrl, {
          errorMessage: ppp.t('$serviceCloudflareWorkerPage.invalidUrl'),
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
    const subdomainResponse = await ppp.fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/subdomain`,
      {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey
        }
      }
    );

    await maybeFetchError(
      subdomainResponse,
      ppp.t('$serviceCloudflareWorkerPage.cannotReadSubdomain')
    );

    const subdomainData = await subdomainResponse.json();
    const subdomain = subdomainData?.result?.subdomain;

    if (!subdomain) {
      invalidate(this.cloudflareApiId, {
        errorMessage: ppp.t(
          '$serviceCloudflareWorkerPage.subdomainNotConfigured'
        ),
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
          errorMessage: ppp.t('$serviceCloudflareWorkerPage.invalidUrl'),
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
        errorMessage: ppp.t(
          '$serviceCloudflareWorkerPage.codeContainsErrors'
        ),
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
        errorMessage: ppp.t(
          '$serviceCloudflareWorkerPage.codeContainsErrors'
        ),
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

    const updateWorkerResponse = await ppp.fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/scripts/${name}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey
        },
        body: await new Blob(chunks, {
          type: contentType
        }).text()
      }
    );

    await maybeFetchError(
      updateWorkerResponse,
      ppp.t('$serviceCloudflareWorkerPage.cannotDeployWorker')
    );

    const enableSubdomainResponse = await ppp.fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/scripts/${name}/subdomain`,
      {
        method: 'POST',
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: true
        })
      }
    );

    await maybeFetchError(
      enableSubdomainResponse,
      ppp.t('$serviceCloudflareWorkerPage.cannotEnableSubdomain')
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

    const contentsResponse = await fetch(
      ppp.getWorkerTemplateFullUrl(data.url).toString(),
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      contentsResponse,
      ppp.t('$serviceCloudflareWorkerPage.cannotLoadTemplateFile')
    );

    this.sourceCode.updateCode(await contentsResponse.text());
  }

  async cleanup() {
    const { email, apiKey, accountID } = this.cloudflareApiId.datum();
    const name = `ppp-${this.document._id}`;

    await ppp.fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/scripts/${name}`,
      {
        method: 'DELETE',
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey
        }
      }
    );
  }
}

applyMixins(ServiceCloudflareWorkerPage, PageWithService);

export default ServiceCloudflareWorkerPage.compose({
  template: serviceCloudflareWorkerPageTemplate,
  styles: serviceCloudflareWorkerPageStyles
}).define();
