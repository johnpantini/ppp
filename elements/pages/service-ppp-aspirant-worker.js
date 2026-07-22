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
import {
  AllocationNotFoundError,
  invalidate,
  maybeFetchError,
  validate
} from '../../lib/ppp-errors.js';
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
import { HMAC, uuidv4, sha256 } from '../../lib/ppp-crypto.js';
import { getYCPsinaFolder, generateYCAWSSigningKey } from '../../lib/yc.js';
import * as jose from '../../vendor/jose.min.js';
import { later } from '../../lib/ppp-decorators.js';
import { parsePPPScript } from '../../lib/ppp-script.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { trash } from '../../static/svg/sprite.js';
import {
  paletteGrayDark2,
  paletteGrayLight2,
  themeConditional
} from '../../design/design-tokens.js';
import '../../vendor/zip-full.min.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../copyable.js';
import '../query-select.js';
import '../radio-group.js';
import '../select.js';
import '../snippet.js';
import '../text-field.js';
import '../terminal.js';

await ppp.i18n(import.meta.url);

export const predefinedWorkerData = {
  default: {
    env: '{}',
    envSecret: '{}',
    url: '/lib/aspirant-worker/example-worker.mjs',
    sourceCode: `// ==PPPScript==
// @version 1
// ==/PPPScript==

import uWS from '/ppp/vendor/uWebSockets.js/uws.js';

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
    url: '/lib/aspirant-worker/utex-alpaca/utex-alpaca.mjs',
    enableHttp: true,
    fileList: [
      {
        url: '/lib/aspirant-worker/utils.mjs',
        path: 'lib/aspirant-worker/utils.mjs'
      },
      {
        url: '/lib/utex/utex-connection.mjs',
        path: 'lib/utex/utex-connection.mjs'
      },
      {
        url: '/lib/utex/message-type.mjs',
        path: 'lib/utex/message-type.mjs'
      },
      {
        url: '/lib/utex/utex.proto',
        path: 'lib/utex/utex.proto'
      },
      {
        url: '/vendor/protobuf.min.js',
        path: 'vendor/protobuf.min.js'
      },
      {
        url: '/vendor/lzma/index.js',
        path: 'vendor/lzma/index.js'
      },
      {
        url: '/vendor/lzma/src/lzma.js',
        path: 'vendor/lzma/src/lzma.js'
      },
      {
        url: '/vendor/lzma/src/lzma-c.js',
        path: 'vendor/lzma/src/lzma-c.js'
      },
      {
        url: '/vendor/lzma/src/lzma-d.js',
        path: 'vendor/lzma/src/lzma-d.js'
      },
      {
        url: '/vendor/lzma/src/lzma_worker.js',
        path: 'vendor/lzma/src/lzma_worker.js'
      }
    ]
  },
  ibGateway: {
    env: '{}',
    envSecret: '{}',
    url: '/lib/aspirant-worker/ib-gateway/ib-gateway.mjs',
    enableHttp: true,
    fileList: [
      {
        url: '/vendor/ib.min.js',
        path: 'vendor/ib.min.js'
      },
      {
        url: '/lib/aspirant-worker/utils.mjs',
        path: 'lib/aspirant-worker/utils.mjs'
      }
    ]
  },
  ppf: {
    env: '{}',
    envSecret: '{}',
    url: '/lib/aspirant-worker/ppf/ppf.mjs',
    enableHttp: true,
    fileList: [
      {
        url: '/vendor/mongodb.min.js',
        path: 'vendor/mongodb.min.js'
      }
    ]
  },
  pppTraderRuntime: {
    env: "{\n  USER_AGENT: '[%#navigator.userAgent%]'\n}",
    envSecret: '{}',
    url: '/lib/aspirant-worker/ppp-trader-runtime/ppp-trader-runtime.mjs',
    enableHttp: true,
    fileList: [
      {
        url: '/lib/aspirant-worker/ppp-trader-runtime/runtime-classes.mjs',
        path: 'lib/aspirant-worker/ppp-trader-runtime/runtime-classes.mjs'
      },
      {
        url: '/lib/aspirant-worker/utils.mjs',
        path: 'lib/aspirant-worker/utils.mjs'
      },
      {
        url: '/vendor/zip-full.min.js',
        path: 'vendor/zip-full.min.js'
      },
      {
        url: '/vendor/jose.min.mjs',
        path: 'vendor/jose.min.mjs'
      },
      {
        url: '/lib/debug.js',
        path: 'lib/debug.js'
      }
    ]
  },
  connectors: {
    env: '{}',
    envSecret: '{}',
    url: '/lib/aspirant-worker/connectors/connectors.mjs',
    enableHttp: true,
    fileList: [
      {
        url: '/vendor/pg/connection.min.mjs',
        path: 'vendor/pg/connection.min.mjs'
      },
      {
        url: '/vendor/ssh2/ssh2.min.js',
        path: 'vendor/ssh2/ssh2.min.js'
      }
    ]
  },
  psinaUsNews: {
    enableHttp: false,
    url: '/lib/aspirant-worker/psina/us-news.mjs',
    env: (pusherApi, astraDbApi) => {
      return {
        US_NEWS_FEED_URL: 'wss://johnpantini.com:38083',
        PUSHER_APPID: pusherApi.appid,
        PUSHER_KEY: pusherApi.key,
        PUSHER_CLUSTER: pusherApi.cluster,
        ASTRA_DB_ID: astraDbApi.dbID,
        ASTRA_DB_REGION: astraDbApi.dbRegion,
        ASTRA_DB_KEYSPACE: astraDbApi.dbKeyspace
      };
    },
    envSecret: (pusherApi, astraDbApi, psinaBroker) => {
      return {
        PUSHER_SECRET: pusherApi.secret,
        ASTRA_DB_APPLICATION_TOKEN: astraDbApi.dbToken,
        KEY: psinaBroker.login,
        SECRET: psinaBroker.password
      };
    },
    fileList: []
  }
};

export async function getAspirantBaseUrl(datum) {
  if (typeof datum === 'string') {
    datum = await ppp.user.functions.findOne(
      { collection: 'services' },
      {
        _id: datum
      }
    );
  }

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
      const rNFService = await ppp.fetch(
        `https://api.northflank.com/v1/projects/${datum.projectID}/services/${datum.serviceID}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deployment.token}`
          }
        }
      );

      await maybeFetchError(
        rNFService,
        ppp.t('$servicePppAspirantWorkerPage.northflankServiceLinkFailed')
      );

      const nfService = await rNFService.json();

      return `https://${
        nfService.data.ports.find((p) => p.name === 'ppp').dns
      }`;
    } else if (deployment.type === APIS.RENDER) {
      return `https://aspirant-${datum.slug}.onrender.com`;
    }
  } else if (datum.type === SERVICES.SYSTEMD_PPP_ASPIRANT) {
    return `https://${datum.tailnetDomain}`;
  }
}

export async function getAspirantWorkerBaseUrl(datum) {
  if (typeof datum === 'string') {
    datum = await ppp.user.functions.findOne(
      { collection: 'services' },
      {
        _id: datum
      }
    );
  }

  if (datum.url) {
    return datum.url;
  } else {
    const aspirantUrl = await getAspirantBaseUrl(datum.aspirantServiceId);

    return `${aspirantUrl}/workers/${datum._id}/`;
  }
}

export const psinaUsNewsTemplate = () =>
  when(
    (x) => x.workerPredefinedTemplate.value === 'psinaUsNews',
    html`
      <div class="spacing2"></div>
      <div class="control-line flex-start">
        <ppp-query-select
          ${ref('psinaUsNewsBrokerId')}
          standalone
          placeholder="${() =>
            ppp.t('$servicePppAspirantWorkerPage.selectPsinaBroker')}"
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
                      type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.PSINA%]`
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
            ppp.app.mountPage(`broker-${BROKERS.PSINA}`, {
              size: 'xlarge',
              adoptHeader: true
            })}"
        >
          +
        </ppp-button>
      </div>
      <div class="spacing2"></div>
      <div class="control-line flex-start">
        <ppp-query-select
          ${ref('psinaUsNewsPusherApiId')}
          standalone
          placeholder="${() =>
            ppp.t('$servicePppAspirantWorkerPage.selectPusherApi')}"
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
      <div class="spacing2"></div>
      <div class="control-line flex-start">
        <ppp-query-select
          ${ref('psinaUsNewsAstraDbApiId')}
          standalone
          placeholder="${() =>
            ppp.t('$servicePppAspirantWorkerPage.selectAstraDbApi')}"
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
          :transform="${() => ppp.decryptDocumentsTransformation()}"
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
  );

export const servicePppAspirantWorkerPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: html`
          <ppp-button
            ?hidden="${(x) =>
              x.document?.url || !x.frameUrl || x.shouldShowFrame}"
            appearance="primary"
            slot="controls"
            @click="${(x) => (x.shouldShowFrame = true)}"
          >
            ${() => ppp.t('$servicePppAspirantWorkerPage.showServiceInNomad')}
          </ppp-button>
          <ppp-button
            ?hidden="${(x) =>
              x.document?.url || !x.frameUrl || x.shouldShowLogs}"
            appearance="primary"
            slot="controls"
            @click="${(x) => (x.shouldShowLogs = true)}"
          >
            ${() => ppp.t('$servicePppAspirantWorkerPage.showLogs')}
          </ppp-button>
          ${servicePageHeaderExtraControls}
        `
      })}
      ${when(
        (x) => x.shouldShowFrame && x.frameUrl,
        html`
          <iframe src="${(x) => x.frameUrl}" width="100%" height="800"></iframe>
        `
      )}
      ${when(
        (x) => x.url,
        html`
          <section>
            <div class="control-line">
              <div class="control-stack">
                <ppp-banner class="inline" appearance="warning">
                  ${() =>
                    ppp.t('$servicePppAspirantWorkerPage.globalServiceLink')}
                </ppp-banner>
                <ppp-copyable> ${(x) => x.url}</ppp-copyable>
              </div>
            </div>
          </section>
        `
      )}
      ${when(
        (x) => x.shouldShowLogs,
        html`
          <section style="gap: 0 8px;">
            <div class="label-group">
              <h5 class="positive">stdout</h5>
              <p class="description">
                ${() => ppp.t('$servicePppAspirantWorkerPage.stdoutDescription')}
              </p>
              <div class="spacing2"></div>
              <ppp-terminal
                font-size="12"
                cols="120"
                ${ref('stdoutTerminal')}
              ></ppp-terminal>
            </div>
            <div class="label-group">
              <h5 class="negative">stderr</h5>
              <p class="description">
                ${() => ppp.t('$servicePppAspirantWorkerPage.stderrDescription')}
              </p>
              <div class="spacing2"></div>
              <ppp-terminal
                font-size="12"
                cols="120"
                ${ref('stderrTerminal')}
              ></ppp-terminal>
            </div>
          </section>
          <section ?hidden="${(x) => !x.url}">
            <div class="label-group">
              <h5>
                ${() => ppp.t('$servicePppAspirantWorkerPage.debugNamespaces')}
              </h5>
              <p class="description">
                ${() =>
                  ppp.t(
                    '$servicePppAspirantWorkerPage.debugNamespacesDescription'
                  )}
              </p>
              <div class="spacing2"></div>
              <ppp-button
                appearance="danger"
                @click="${(x) => x.enableDebug()}"
              >
                ${() =>
                  ppp.t('$servicePppAspirantWorkerPage.disableDebugMessages')}
              </ppp-button>
            </div>
            <div class="input-group">
              <ppp-text-field
                placeholder="*"
                value="*"
                ${ref('debugNamespaces')}
              >
              </ppp-text-field>
              <div class="spacing2"></div>
              <ppp-button
                appearance="primary"
                @click="${(x) => x.enableDebug(x.debugNamespaces.value)}"
              >
                ${() =>
                  ppp.t('$servicePppAspirantWorkerPage.saveDebugNamespaces')}
              </ppp-button>
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
          <h5>${() => ppp.t('$servicePppAspirantWorkerPage.serviceDescription')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$servicePppAspirantWorkerPage.serviceDescriptionNotes')}
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            standalone
            :code="${(x) => x.document.description ?? ''}"
            ${ref('description')}
          ></ppp-snippet>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$servicePppAspirantWorkerPage.serviceType')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$servicePppAspirantWorkerPage.serviceTypeDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            ?disabled="${(x) => x.document._id && !x.document.removed}"
            value="${(x) => (x.document.url ? 'url' : 'aspirant')}"
            ${ref('serviceTypeSelector')}
          >
            <ppp-radio value="aspirant">
              ${() => ppp.t('$servicePppAspirantWorkerPage.setUpInAspirant')}
            </ppp-radio>
            <ppp-radio value="url">
              ${() => ppp.t('$servicePppAspirantWorkerPage.specifyUrl')}
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      ${when(
        (x) => x.serviceTypeSelector.value === 'aspirant',
        html`
          <section>
            <div class="label-group">
              <h5>
                ${() => ppp.t('$servicePppAspirantWorkerPage.aspirantService')}
              </h5>
              <p class="description">
                ${() =>
                  ppp.t(
                    '$servicePppAspirantWorkerPage.aspirantServiceDescription'
                  )}
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
              <h5>API Yandex Cloud</h5>
              <p class="description">
                ${() =>
                  ppp.t('$servicePppAspirantWorkerPage.ycApiDescription')}
              </p>
            </div>
            <div class="input-group">
              <ppp-query-select
                ${ref('ycApiId')}
                value="${(x) => x.document.ycApiId}"
                :context="${(x) => x}"
                :preloaded="${(x) => x.document.ycApi ?? ''}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('apis')
                      .find({
                        $and: [
                          {
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.YC%]`
                          },
                          {
                            $or: [
                              { removed: { $ne: true } },
                              {
                                _id: `[%#this.document.ycApiId ?? ''%]`
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
                  ppp.app.mountPage(`api-${APIS.YC}`, {
                    size: 'xlarge',
                    adoptHeader: true
                  })}"
                appearance="primary"
              >
                ${() => ppp.t('$servicePppAspirantWorkerPage.addYcApi')}
              </ppp-button>
            </div>
          </section>
          <section>
            <div class="implementation-area">
              <div class="label-group full" style="min-width: 600px">
                <h5>${() => ppp.t('$servicePppAspirantWorkerPage.entryPoint')}</h5>
                <p class="description">
                  ${() =>
                    ppp.t('$servicePppAspirantWorkerPage.entryPointDescription')}
                </p>
                <ppp-snippet
                  style="height: 400px"
                  :code="${(x) =>
                    x.document.sourceCode ??
                    predefinedWorkerData.default.sourceCode}"
                  ${ref('sourceCode')}
                ></ppp-snippet>
                <div class="label-group full" style="min-width: 600px">
                  <h5>
                    ${() =>
                      ppp.t('$servicePppAspirantWorkerPage.launchParameters')}
                  </h5>
                  <p class="description">
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.launchParametersDescription'
                      )}
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
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.enableHttpDescription'
                      )}
                    <code>/workers/{serviceID}/</code>.
                  </p>
                  <ppp-checkbox
                    ?checked="${(x) =>
                      x.document.enableHttp ??
                      predefinedWorkerData.default.enableHttp}"
                    ${ref('enableHttp')}
                  >
                    ${() => ppp.t('$servicePppAspirantWorkerPage.enableHttp')}
                  </ppp-checkbox>
                </div>
                <div class="label-group full" style="min-width: 600px">
                  <h5>
                    ${() => ppp.t('$servicePppAspirantWorkerPage.extraFiles')}
                  </h5>
                  <p class="description">
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.extraFilesDescription'
                      )}
                  </p>
                  <div class="spacing2"></div>
                  ${repeat(
                    (x) => x.document.fileList ?? [],
                    html`
                      <div class="control-line file-entry flex-start">
                        <ppp-text-field
                          standalone
                          style="width: 320px;"
                          placeholder="URL"
                          value="${(x) => x.url}"
                        ></ppp-text-field>
                        <ppp-text-field
                          standalone
                          style="width: 256px;"
                          placeholder="${() =>
                            ppp.t('$servicePppAspirantWorkerPage.relativePath')}"
                          value="${(x) => x.path}"
                        >
                        </ppp-text-field>
                        <ppp-button
                          appearance="default"
                          @click="${(x, c) =>
                            c.parent.removeFileFromFileList(c.index)}"
                        >
                          ${() => ppp.t('$g.delete')}
                          <span slot="start">${html.partial(trash)}</span>
                        </ppp-button>
                      </div>
                      <div class="spacing2"></div>
                    `,
                    { positioning: true }
                  )}
                  <div class="spacing3"></div>
                  <ppp-button
                    appearance="primary"
                    @click="${(x) => x.addFileToFileList()}"
                  >
                    ${() => ppp.t('$servicePppAspirantWorkerPage.addFile')}
                  </ppp-button>
                </div>
              </div>
              <div class="control-stack">
                <div class="label-group full">
                  <h5>
                    ${() => ppp.t('$servicePppAspirantWorkerPage.versioning')}
                  </h5>
                  <p class="description">
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.versioningDescription'
                      )}
                  </p>
                  <ppp-checkbox
                    ?checked="${(x) => x.document.useVersioning ?? false}"
                    @change="${(x) => {
                      if (!x.useVersioning.checked)
                        x.versioningUrl.appearance = 'default';
                    }}"
                    ${ref('useVersioning')}
                  >
                    ${() =>
                      ppp.t('$servicePppAspirantWorkerPage.trackVersionByFile')}
                  </ppp-checkbox>
                  <ppp-text-field
                    ?disabled="${(x) => !x.useVersioning.checked}"
                    placeholder="${() =>
                      ppp.t('$servicePppAspirantWorkerPage.enterLink')}"
                    value="${(x) => x.document.versioningUrl ?? ''}"
                    @input="${(x) =>
                      (x.workerPredefinedTemplate.value = 'custom')}"
                    ${ref('versioningUrl')}
                  ></ppp-text-field>
                </div>
                <div class="label-group full">
                  <h5>
                    ${() =>
                      ppp.t('$servicePppAspirantWorkerPage.predefinedTemplates')}
                  </h5>
                  <p class="description">
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.predefinedTemplatesDescription'
                      )}
                  </p>
                  <div class="control-stack">
                    <ppp-select
                      value="${(x) =>
                        x.document.workerPredefinedTemplate ?? 'default'}"
                      ${ref('workerPredefinedTemplate')}
                    >
                      <ppp-option value="custom">
                        ${() =>
                          ppp.t(
                            '$servicePppAspirantWorkerPage.templateByWatchedFile'
                          )}
                      </ppp-option>
                      <ppp-option value="default">
                        ${() =>
                          ppp.t('$servicePppAspirantWorkerPage.templateDefault')}
                      </ppp-option>
                      <ppp-option value="utexAlpaca">
                        ${() =>
                          ppp.t(
                            '$servicePppAspirantWorkerPage.templateUtexAlpaca'
                          )}
                      </ppp-option>
                      <ppp-option value="ibGateway">
                        ${() =>
                          ppp.t(
                            '$servicePppAspirantWorkerPage.templateIbGateway'
                          )}
                      </ppp-option>
                      <ppp-option value="ppf">
                        ${() =>
                          ppp.t('$servicePppAspirantWorkerPage.templatePpf')}
                      </ppp-option>
                      <ppp-option value="connectors">
                        ${() =>
                          ppp.t(
                            '$servicePppAspirantWorkerPage.templateConnectors'
                          )}
                      </ppp-option>
                      <ppp-option value="pppTraderRuntime">
                        ${() =>
                          ppp.t(
                            '$servicePppAspirantWorkerPage.templateTraderRuntime'
                          )}
                      </ppp-option>
                      <ppp-option value="psinaUsNews">
                        ${() =>
                          ppp.t(
                            '$servicePppAspirantWorkerPage.templatePsinaUsNews'
                          )}
                      </ppp-option>
                    </ppp-select>
                    ${psinaUsNewsTemplate()}
                    <ppp-checkbox ${ref('doNotFillEnvVars')}>
                      ${() =>
                        ppp.t('$servicePppAspirantWorkerPage.doNotFillEnvVars')}
                    </ppp-checkbox>
                    <ppp-button
                      @click="${(x) => x.fillOutFormsWithTemplate()}"
                      appearance="primary"
                    >
                      ${() =>
                        ppp.t(
                          '$servicePppAspirantWorkerPage.fillOutFormsWithTemplate'
                        )}
                    </ppp-button>
                  </div>
                </div>
                <div class="label-group full">
                  <h5>
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.environmentVariables'
                      )}
                  </h5>
                  <p class="description">
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.environmentVariablesDescription'
                      )}
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
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.secretEnvironmentVariables'
                      )}
                  </h5>
                  <p class="description">
                    ${() =>
                      ppp.t(
                        '$servicePppAspirantWorkerPage.secretEnvironmentVariablesDescription'
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
            text: ppp.t(
              '$servicePppAspirantWorkerPage.saveToPPPAndUpdateInAspirant'
            ),
            extraControls: servicePageFooterExtraControls
          })}
        `,
        html`
          <section>
            <div class="label-group">
              <h5>
                ${() => ppp.t('$servicePppAspirantWorkerPage.serviceTemplate')}
              </h5>
              <p class="description">
                ${() =>
                  ppp.t(
                    '$servicePppAspirantWorkerPage.serviceTemplateDescription'
                  )}
              </p>
            </div>
            <div class="input-group">
              <ppp-select
                value="${(x) =>
                  x.document.workerPredefinedTemplate ?? 'custom'}"
                ${ref('urlWorkerPredefinedTemplate')}
              >
                <ppp-option value="custom">
                  ${() =>
                    ppp.t('$servicePppAspirantWorkerPage.templateNone')}
                </ppp-option>
                <ppp-option value="default">
                  ${() =>
                    ppp.t('$servicePppAspirantWorkerPage.templateDefault')}
                </ppp-option>
                <ppp-option value="utexAlpaca">
                  ${() =>
                    ppp.t('$servicePppAspirantWorkerPage.templateUtexAlpaca')}
                </ppp-option>
                <ppp-option value="ibGateway">
                  ${() =>
                    ppp.t('$servicePppAspirantWorkerPage.templateIbGateway')}
                </ppp-option>
                <ppp-option value="ppf">
                  ${() => ppp.t('$servicePppAspirantWorkerPage.templatePpf')}
                </ppp-option>
                <ppp-option value="connectors">
                  ${() =>
                    ppp.t('$servicePppAspirantWorkerPage.templateConnectors')}
                </ppp-option>
                <ppp-option value="pppTraderRuntime">
                  ${() =>
                    ppp.t(
                      '$servicePppAspirantWorkerPage.templateTraderRuntime'
                    )}
                </ppp-option>
              </ppp-select>
            </div>
          </section>
          <section>
            <div class="label-group">
              <h5>${() => ppp.t('$servicePppAspirantWorkerPage.serviceUrl')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$servicePppAspirantWorkerPage.serviceUrlDescription')}
              </p>
            </div>
            <div class="input-group">
              <ppp-text-field
                type="url"
                placeholder="https://example.com"
                value="${(x) => x.document.url}"
                ${ref('serviceUrl')}
              ></ppp-text-field>
            </div>
          </section>
          ${documentPageFooterPartial({
            text: ppp.t('$page.saveToPPP')
          })}
        `
      )}
    </form>
  </template>
`;

export const servicePppAspirantWorkerPageStyles = css`
  ${pageStyles}
  iframe {
    background: transparent;
    margin-top: 15px;
    border-radius: 4px;
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  ppp-terminal {
    display: inline-flex;
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }
`;

export class ServicePppAspirantWorkerPage extends Page {
  collection = 'services';

  zipWriter;

  @observable
  url;

  @observable
  frameUrl;

  @observable
  shouldShowFrame;

  @observable
  shouldShowLogs;

  shouldShowLogsChanged() {
    if (this.shouldShowLogs) {
      return this.startLogStreaming();
    }
  }

  async connectedCallback() {
    await super.connectedCallback();
    await this.#generateLinks();
  }

  async enableDebug(namespaces = '') {
    let url;

    this.beginOperation();

    try {
      if (this.document.url) {
        url = this.document.url;
      } else if (this.document._id && this.document.aspirantService) {
        const aspirantUrl = await getAspirantBaseUrl(
          this.document.aspirantService
        );

        url = `${aspirantUrl}/workers/${this.document._id}/`;
      }

      if (url) {
        if (!url.endsWith('/')) {
          url += '/';
        }

        await maybeFetchError(
          await fetch(`${url}debug`, {
            method: 'POST',
            body: JSON.stringify({ namespaces })
          }),
          ppp.t('$servicePppAspirantWorkerPage.debugNotSupported')
        );

        this.showSuccessNotification();
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async #generateLinks() {
    if (this.document.url) {
      // URL-based service.
      this.url = this.document.url;
    } else if (this.document._id && this.document.aspirantService) {
      if (this.document?.state !== SERVICE_STATE.ACTIVE) {
        return;
      }

      const aspirantUrl = await getAspirantBaseUrl(
        this.document.aspirantService
      );

      if ((await fetch(`${aspirantUrl}/nomad/health`)).ok) {
        if (this.document.enableHttp) {
          this.url = `${aspirantUrl}/workers/${this.document._id}/`;
        }

        this.frameUrl = `${aspirantUrl}/ui/jobs/worker-${this.document._id}@default`;
      }
    }
  }

  async #readLogChunk(reader, decoder, terminal) {
    const result = await reader.read();
    const chunk = decoder.decode(result.value || new Uint8Array(), {
      stream: !result.done
    });

    if (chunk.length) {
      const string = chunk.toString();

      try {
        const parsed = JSON.parse(string).Data;

        if (parsed) {
          terminal.write(atob(parsed));
        }
      } catch (e) {
        // No-op.
      }
    }

    if (!result.done) {
      return this.#readLogChunk(reader, decoder, terminal);
    }
  }

  async startLogStreaming() {
    try {
      if (
        !this.document.url &&
        this.document._id &&
        this.document.aspirantService
      ) {
        if (this.document?.state !== SERVICE_STATE.ACTIVE) {
          return;
        }

        const aspirantUrl = await getAspirantBaseUrl(
          this.document.aspirantService
        );

        const allocationsResponse = await maybeFetchError(
          await fetch(`${aspirantUrl}/v1/allocations?task_states=false`),
          ppp.t('$servicePppAspirantWorkerPage.allocationListFailed')
        );

        const alloc = (await allocationsResponse.json()).find(
          (a) =>
            a.JobID === `worker-${this.document._id}` &&
            a.ClientStatus === 'running'
        );

        if (!alloc?.ID) {
          throw new AllocationNotFoundError();
        }

        const stdoutResponse = await maybeFetchError(
          await fetch(
            `${aspirantUrl}/v1/client/fs/logs/${alloc.ID}?follow=true&offset=50000&origin=end&task=worker&type=stdout`
          ),
          ppp.t('$servicePppAspirantWorkerPage.streamReadError', {
            stream: 'stdout'
          })
        );

        const stderrResponse = await maybeFetchError(
          await fetch(
            `${aspirantUrl}/v1/client/fs/logs/${alloc.ID}?follow=true&offset=50000&origin=end&task=worker&type=stderr`
          ),
          ppp.t('$servicePppAspirantWorkerPage.streamReadError', {
            stream: 'stderr'
          })
        );

        this.stdoutTerminal.terminal.clear();
        this.stdoutTerminal.terminal.reset();
        this.stderrTerminal.terminal.clear();
        this.stderrTerminal.terminal.reset();

        this.#readLogChunk(
          stdoutResponse.body.getReader(),
          new TextDecoder(),
          this.stdoutTerminal.terminal
        );
        this.#readLogChunk(
          stderrResponse.body.getReader(),
          new TextDecoder(),
          this.stderrTerminal.terminal
        );
      }
    } catch (e) {
      this.failOperation(e);
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
      if (
        this.workerPredefinedTemplate.value === 'psinaUsNews' &&
        !this.doNotFillEnvVars.checked
      ) {
        await validate(this.psinaUsNewsBrokerId);
        await validate(this.psinaUsNewsPusherApiId);
        await validate(this.psinaUsNewsAstraDbApiId);
      }

      let data;

      // Watched file.
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
          ppp.t('$servicePppAspirantWorkerPage.couldNotLoadTemplateFile')
        );

        const code = await contentsResponse.text();

        try {
          const { meta } = parsePPPScript(code);

          Object.assign(data, JSON.parse(meta.meta[0] ?? '{}') ?? {});
        } catch (e) {
          // Bad or empty metadata
          void 0;
        }

        this.document.fileList = structuredClone(data.fileList ?? []);

        this.sourceCode.updateCode(code);

        const doNotFillEnvVars = this.doNotFillEnvVars.checked;

        if (this.workerPredefinedTemplate.value === 'psinaUsNews') {
          const pusherApi = this.psinaUsNewsPusherApiId.datum();
          const psinaBroker = this.psinaUsNewsBrokerId.datum();
          const astraDbApi = this.psinaUsNewsAstraDbApiId.datum();

          !doNotFillEnvVars &&
            this.environmentCode.updateCode(
              JSON.stringify(
                data.env(pusherApi, astraDbApi, psinaBroker),
                null,
                2
              )
            );
          !doNotFillEnvVars &&
            this.environmentCodeSecret.updateCode(
              JSON.stringify(
                data.envSecret(pusherApi, astraDbApi, psinaBroker),
                null,
                2
              )
            );
        } else {
          !doNotFillEnvVars &&
            this.environmentCode.updateCode(data.env ?? '{}');
          !doNotFillEnvVars &&
            this.environmentCodeSecret.updateCode(data.envSecret ?? '{}');
        }

        this.enableHttp.checked = !!data.enableHttp;
        this.command.value = data.command;
        this.args.value = data.args;
        this.versioningUrl.value = data.url;
        this.useVersioning.checked = true;

        this.document.name = this.name.value;
        this.document.description = this.description.value;
        this.document.aspirantServiceId = this.aspirantServiceId.value;
        this.document.ycApiId = this.ycApiId.value;
        this.document.sourceCode = this.sourceCode.value;
        this.document.environmentCode = this.environmentCode.value;
        this.document.environmentCodeSecret = this.environmentCodeSecret.value;
        this.document.enableHttp = !!data.enableHttp;
        this.document.command = data.command;
        this.document.args = data.args;
        this.document.workerPredefinedTemplate =
          this.workerPredefinedTemplate.value;
        this.document.versioningUrl = data.url;
        this.document.useVersioning = true;

        Observable.notify(this, 'document');
        this.showSuccessNotification(
          ppp.t('$servicePppAspirantWorkerPage.templateLoaded', {
            name: this.workerPredefinedTemplate.displayValue.trim()
          })
        );
      } catch (e) {
        invalidate(this.versioningUrl, {
          errorMessage: ppp.t('$servicePppAspirantWorkerPage.invalidUrl'),
          raiseException: true
        });
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async #checkAspirantConnection() {
    let aspirantUrl;

    try {
      aspirantUrl = await getAspirantBaseUrl(this.aspirantServiceId.datum());

      await maybeFetchError(
        await fetch(`${aspirantUrl}/nomad/health`),
        ppp.t('$servicePppAspirantWorkerPage.noAspirantConnection')
      );

      return aspirantUrl;
    } catch (e) {
      invalidate(this.aspirantServiceId, {
        errorMessage: ppp.t(
          '$servicePppAspirantWorkerPage.noAspirantConnectionError'
        ),
        raiseException: true
      });
    }
  }

  async validate() {
    await validate(this.name);

    if (this.serviceTypeSelector.value === 'url') {
      await validate(this.serviceUrl);

      let json;

      // URL validation.
      try {
        const response = await maybeFetchError(
          await fetch(new URL(this.serviceUrl.value).toString())
        );

        json = await response.json();
      } catch (e) {
        invalidate(this.serviceUrl, {
          errorMessage: ppp.t('$page.urlCannotBeUsed'),
          raiseException: true
        });
      }

      if (!json.ok) {
        invalidate(this.serviceUrl, {
          errorMessage: ppp.t(
            '$servicePppAspirantWorkerPage.invalidServiceResponse'
          ),
          raiseException: true
        });
      }
    } else {
      await validate(this.aspirantServiceId);
      await validate(this.ycApiId);

      if (this.useVersioning.checked) {
        await validate(this.versioningUrl);

        // URL validation.
        try {
          ppp.getWorkerTemplateFullUrl(this.versioningUrl.value);
        } catch (e) {
          invalidate(this.versioningUrl, {
            errorMessage: ppp.t('$servicePppAspirantWorkerPage.invalidUrl'),
            raiseException: true
          });
        }
      }

      await validate(this.sourceCode);

      const zip = globalThis.zip;

      this.zipWriter = new zip.ZipWriter(new zip.BlobWriter('application/zip'));

      // Update text fields.
      await later(1000);

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
              errorMessage: ppp.t('$servicePppAspirantWorkerPage.invalidUrl'),
              raiseException: true
            });
          }

          const path = pathField.value.trim();

          await caches.delete('offline');

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
              errorMessage: ppp.t(
                '$servicePppAspirantWorkerPage.couldNotLoadFile'
              ),
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
          errorMessage: ppp.t(
            '$servicePppAspirantWorkerPage.codeContainsErrors'
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
            '$servicePppAspirantWorkerPage.codeContainsErrors'
          ),
          raiseException: true
        });
      }

      // We need document _id here. Continue to the deployment phase.
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
              from: 'apis',
              localField: 'ycApiId',
              foreignField: '_id',
              as: 'ycApi'
            }
          },
          {
            $unwind: {
              path: '$ycApi',
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
    const aspirantUrl = await this.#checkAspirantConnection();

    await this.zipWriter.add(
      `${this.document._id}.mjs`,
      new zip.TextReader(this.sourceCode.value)
    );

    const zipBlob = await this.zipWriter?.close?.();

    if (zipBlob) {
      const {
        ycServiceAccountID,
        ycPublicKeyID,
        ycPrivateKey,
        ycStaticKeyID,
        ycStaticKeySecret
      } = this.ycApiId.datum();
      const { psinaFolderId, iamToken } = await getYCPsinaFolder({
        jose,
        ycServiceAccountID,
        ycPublicKeyID,
        ycPrivateKey
      });

      const rBucketList = await maybeFetchError(
        await ppp.fetch(
          `https://storage.api.cloud.yandex.net/storage/v1/buckets?folderId=${psinaFolderId}`,
          {
            headers: {
              Authorization: `Bearer ${iamToken}`
            }
          }
        ),
        ppp.t('$servicePppAspirantWorkerPage.bucketListFailed')
      );

      const bucketList = await rBucketList.json();
      let artifactsBucket = bucketList?.buckets?.find((b) =>
        /^ppp-artifacts-/.test(b.name)
      );

      if (!artifactsBucket) {
        // Create new bucket.
        const rNewBucket = await maybeFetchError(
          await ppp.fetch(
            'https://storage.api.cloud.yandex.net/storage/v1/buckets',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${iamToken}`
              },
              body: JSON.stringify({
                name: `ppp-artifacts-${uuidv4()}`,
                folderId: psinaFolderId,
                defaultStorageClass: 'STANDARD',
                // 1 GB
                maxSize: 1024 ** 3,
                anonymousAccessFlags: {
                  read: true,
                  list: false,
                  configRead: false
                }
              })
            }
          ),
          ppp.t('$servicePppAspirantWorkerPage.bucketCreationFailed')
        );

        artifactsBucket = (await rNewBucket.json()).response;
      }

      const key = `${this.document._id}.zip`;
      const host = `${artifactsBucket.name}.storage.yandexcloud.net`;
      const xAmzDate =
        new Date()
          .toISOString()
          .replaceAll('-', '')
          .replaceAll(':', '')
          .split('.')[0] + 'Z';
      const date = xAmzDate.split('T')[0];
      const signingKey = await generateYCAWSSigningKey({
        ycStaticKeySecret,
        date
      });
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        await zipBlob.arrayBuffer()
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPayload = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const canonicalRequest = `PUT\n/${encodeURIComponent(
        key
      )}\n\nhost:${host}\nx-amz-content-sha256:${hashedPayload}\nx-amz-date:${xAmzDate}\n\nhost;x-amz-content-sha256;x-amz-date\n${hashedPayload}`;
      const scope = `${date}/ru-central1/s3/aws4_request`;
      const stringToSign = `AWS4-HMAC-SHA256\n${xAmzDate}\n${scope}\n${await sha256(
        canonicalRequest
      )}`;
      const signature = await HMAC(signingKey, stringToSign, { format: 'hex' });
      const Authorization = `AWS4-HMAC-SHA256 Credential=${ycStaticKeyID}/${date}/ru-central1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`;

      await maybeFetchError(
        await ppp.fetch(`https://${host}/${key}`, {
          method: 'PUT',
          headers: {
            Authorization,
            'x-amz-date': xAmzDate,
            'x-amz-content-sha256': hashedPayload
          },
          body: zipBlob
        }),
        ppp.t('$servicePppAspirantWorkerPage.uploadToStorageFailed')
      );

      const artifactUrl = `https://${host}/${key}`;
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

      const args = (this.document.args || '')
        .replaceAll('$PPP_WORKER_ID', this.document._id)
        .replaceAll(
          '$PPP_WORKER_PATH',
          `\${NOMAD_TASK_DIR}/nginx/workers/${this.document._id}/${this.document._id}.mjs`
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
            args
          })
        }),
        ppp.t('$servicePppAspirantWorkerPage.scheduleFailed')
      );

      this.document.state = SERVICE_STATE.ACTIVE;

      await this.#generateLinks();

      if (this.shouldShowLogs) {
        return this.startLogStreaming();
      }
    } else {
      invalidate(ppp.app.toast, {
        errorMessage: ppp.t('$servicePppAspirantWorkerPage.noServiceArchive'),
        raiseException: true
      });
    }
  }

  async submit() {
    if (this.serviceTypeSelector.value === 'url') {
      return {
        $set: {
          name: this.name.value.trim(),
          description: this.description.value,
          workerPredefinedTemplate: this.urlWorkerPredefinedTemplate.value,
          url: new URL(this.serviceUrl.value).toString(),
          useVersioning: false,
          version: 1,
          state: SERVICE_STATE.ACTIVE,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.PPP_ASPIRANT_WORKER,
          createdAt: new Date()
        }
      };
    } else {
      return [
        {
          $set: {
            name: this.name.value.trim(),
            description: this.description.value,
            aspirantServiceId: this.aspirantServiceId.value,
            ycApiId: this.ycApiId.value,
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

    const code = await contentsResponse.text();

    try {
      const { meta } = parsePPPScript(code);

      Object.assign(data, JSON.parse(meta.meta[0] ?? '{}') ?? {});
    } catch (e) {
      // Bad or empty metadata
      void 0;
    }

    await maybeFetchError(
      contentsResponse,
      ppp.t('$servicePppAspirantWorkerPage.couldNotLoadTemplateFile')
    );
    this.sourceCode.updateCode(code);

    this.document.fileList = structuredClone(data.fileList ?? []);
    this.enableHttp.checked = !!data.enableHttp;
    this.command.value = data.command;
    this.args.value = data.args;
    this.versioningUrl.value = data.url;
    this.useVersioning.checked = true;

    this.document.name = this.name.value;
    this.document.description = this.description.value;
    this.document.aspirantServiceId = this.aspirantServiceId.value;
    this.document.ycApiId = this.ycApiId.value;
    this.document.sourceCode = this.sourceCode.value;
    this.document.environmentCode = this.environmentCode.value;
    this.document.environmentCodeSecret = this.environmentCodeSecret.value;
    this.document.enableHttp = !!data.enableHttp;
    this.document.command = data.command;
    this.document.args = data.args;
    this.document.workerPredefinedTemplate =
      this.workerPredefinedTemplate.value;
    this.document.versioningUrl = data.url;
    this.document.useVersioning = true;

    Observable.notify(this, 'document');
  }

  async stop() {
    const {
      ycServiceAccountID,
      ycPublicKeyID,
      ycPrivateKey,
      ycStaticKeyID,
      ycStaticKeySecret
    } = this.ycApiId.datum();
    const { psinaFolderId, iamToken } = await getYCPsinaFolder({
      jose,
      ycServiceAccountID,
      ycPublicKeyID,
      ycPrivateKey
    });

    const rBucketList = await maybeFetchError(
      await ppp.fetch(
        `https://storage.api.cloud.yandex.net/storage/v1/buckets?folderId=${psinaFolderId}`,
        {
          headers: {
            Authorization: `Bearer ${iamToken}`
          }
        }
      ),
      ppp.t('$servicePppAspirantWorkerPage.bucketListFailed')
    );

    const bucketList = await rBucketList.json();
    const artifactsBucket = bucketList?.buckets?.find((b) =>
      /^ppp-artifacts-/.test(b.name)
    );

    if (artifactsBucket) {
      const host = `${artifactsBucket.name}.storage.yandexcloud.net`;
      const key = `${this.document._id}.zip`;
      const xAmzDate =
        new Date()
          .toISOString()
          .replaceAll('-', '')
          .replaceAll(':', '')
          .split('.')[0] + 'Z';
      const date = xAmzDate.split('T')[0];
      const signingKey = await generateYCAWSSigningKey({
        ycStaticKeySecret,
        date
      });
      const canonicalRequest = `DELETE\n/${key}\n\nhost:${host}\nx-amz-date:${xAmzDate}\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
      const scope = `${date}/ru-central1/s3/aws4_request`;
      const stringToSign = `AWS4-HMAC-SHA256\n${xAmzDate}\n${scope}\n${await sha256(
        canonicalRequest
      )}`;
      const signature = await HMAC(signingKey, stringToSign, {
        format: 'hex'
      });
      const Authorization = `AWS4-HMAC-SHA256 Credential=${ycStaticKeyID}/${date}/ru-central1/s3/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`;

      await maybeFetchError(
        await ppp.fetch(`https://${host}/${key}`, {
          method: 'DELETE',
          headers: {
            Authorization,
            'X-Amz-Date': xAmzDate
          }
        }),
        ppp.t('$servicePppAspirantWorkerPage.deleteFromStorageFailed')
      );
    }

    const aspirantUrl = await this.#checkAspirantConnection();

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
      ppp.t('$servicePppAspirantWorkerPage.stopFailed')
    );
  }

  async restart() {
    if (this.document.state === SERVICE_STATE.STOPPED) {
      return this.submitDocument();
    }

    const aspirantUrl = await this.#checkAspirantConnection();

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
      ppp.t('$servicePppAspirantWorkerPage.restartFailed')
    );
  }

  async cleanup() {
    if (this.serviceTypeSelector.value === 'aspirant') {
      return this.stop();
    }
  }
}

applyMixins(ServicePppAspirantWorkerPage, PageWithService);

export default ServicePppAspirantWorkerPage.compose({
  template: servicePppAspirantWorkerPageTemplate,
  styles: servicePppAspirantWorkerPageStyles
}).define();
