import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import {
  validate,
  invalidate,
  maybeFetchError,
  ValidationError
} from '../../lib/ppp-errors.js';
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
await ppp.i18n(import.meta.url);

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
          <h5>${() => ppp.t('$page.serviceName')}</h5>
          <p class="description">
            ${() => ppp.t('$page.arbitraryProfileName')}
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
          <h5>${() => ppp.t('$serviceCloudPppAspirantPage.redisStorage')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceCloudPppAspirantPage.redisStorageDescription')}
          </p>
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
            ${() => ppp.t('$serviceCloudPppAspirantPage.addRedisApi')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>
            ${() => ppp.t('$serviceCloudPppAspirantPage.cloudProviderApiProfile')}
          </h5>
          <p class="description">
            ${() =>
              ppp.t('$serviceCloudPppAspirantPage.cloudProviderApiDescription')}
          </p>
          <div class="spacing2"></div>
          <ppp-banner class="inline" appearance="warning">
            ${() => ppp.t('$serviceCloudPppAspirantPage.northflankBanner')}
          </ppp-banner>
          <div class="spacing1"></div>
          <ppp-banner class="inline" appearance="warning">
            ${() =>
              ppp.t(
                '$serviceCloudPppAspirantPage.renderBannerBeforeSuffix'
              )}<i
              >${() =>
                ppp.t(
                  '$serviceCloudPppAspirantPage.renderBannerSuffixWord'
                )}</i
            >${() =>
              ppp.t('$serviceCloudPppAspirantPage.renderBannerAfterSuffix')}
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
              ${() => ppp.t('$serviceCloudPppAspirantPage.addNorthflankApi')}
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
              ${() => ppp.t('$serviceCloudPppAspirantPage.addRenderApi')}
            </ppp-button>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceCloudPppAspirantPage.slugHeader')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceCloudPppAspirantPage.slugDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            ?disabled="${(x) => x.document._id && !x.document.removed}"
            placeholder="${() =>
              ppp.t('$serviceCloudPppAspirantPage.slugPlaceholder')}"
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
            ${() => ppp.t('$serviceCloudPppAspirantPage.generateSlug')}
          </ppp-button>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: ppp.t('$serviceCloudPppAspirantPage.saveAndDeployToCloud'),
        extraControls: html`${servicePageFooterExtraControls}`
      })}
    </form>
  </template>
`;

export const serviceCloudPppAspirantStyles = css`
  ${pageStyles}
  .extra-controls {
    margin-right: auto;
  }
`;

export class ServiceCloudPppAspirantPage extends Page {
  collection = 'services';

  async validate() {
    await validate(this.name);
    await validate(this.redisApiId);
    await validate(this.deploymentApiId);
    await validate(this.slug);
    await validate(this.slug, {
      hook: async (value) => value.trim().length === 11,
      errorMessage: ppp.t('$serviceCloudPppAspirantPage.slugLengthError')
    });
    await validate(this.slug, {
      hook: async (value) => /^[a-z0-9]+$/i.test(value),
      errorMessage: ppp.t('$serviceCloudPppAspirantPage.slugCharsError')
    });

    if (this.deploymentApiId.datum().type === APIS.RENDER) {
      let r;

      await maybeFetchError(
        (r = await ppp.fetch('https://api.render.com/v1/services', {
          headers: {
            Authorization: `Bearer ${this.deploymentApiId.datum().token}`
          }
        })),
        ppp.t('$serviceCloudPppAspirantPage.cannotFetchRenderServices')
      );

      const services = await r.json();
      const serviceName = `aspirant-${this.slug.value.trim()}`;

      let s;

      if (!(s = services.find((s) => s.service?.slug === serviceName))) {
        throw new ValidationError({
          message: ppp.t(
            '$serviceCloudPppAspirantPage.serviceNotFoundInRender',
            { serviceName }
          )
        });
      }

      this.projectID = s.service.id;
      this.serviceID = s.service.id;
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

  #getEnvironment() {
    const redisApi = this.redisApiId.datum();

    return {
      ASPIRANT_ID: this.document._id,
      PORT: '80',
      GLOBAL_PROXY_URL: ppp.keyVault.getKey('global-proxy-url'),
      REDIS_HOST: redisApi.host,
      REDIS_PORT: redisApi.port.toString(),
      REDIS_TLS: redisApi.tls ? 'true' : '',
      REDIS_USERNAME: redisApi.username?.toString() ?? 'default',
      REDIS_PASSWORD: redisApi.password?.toString(),
      REDIS_DATABASE: redisApi.database.toString()
    };
  }

  async #deployOnNorthflank() {
    const rProjectList = await ppp.fetch(
      'https://api.northflank.com/v1/projects',
      {
        headers: {
          Authorization: `Bearer ${this.deploymentApiId.datum().token}`
        }
      }
    );

    await maybeFetchError(
      rProjectList,
      ppp.t('$serviceCloudPppAspirantPage.cannotFetchNorthflankProjects')
    );

    const project = (await rProjectList.json()).data.projects.find(
      (p) => p.name.toLowerCase() === 'ppp'
    );

    if (!project) {
      invalidate(ppp.app.toast, {
        errorMessage: ppp.t(
          '$serviceCloudPppAspirantPage.pppProjectNotFoundInNorthflank'
        ),
        raiseException: true
      });
    }

    this.projectID = project.id;

    const rPutService = await ppp.fetch(
      `https://api.northflank.com/v1/projects/${project.id}/services/combined`,
      {
        method: 'PUT',
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
              dockerFilePath: '/lib/aspirant/Dockerfile',
              dockerWorkDir: '/'
            }
          },
          buildConfiguration: {
            pathIgnoreRules: ['*', '!/lib/aspirant', '!/lib/aspirant/*']
          },
          runtimeEnvironment: this.#getEnvironment()
        })
      }
    );

    await maybeFetchError(
      rPutService,
      ppp.t('$serviceCloudPppAspirantPage.cannotCreateAspirantService')
    );

    this.serviceID = (await rPutService.json()).data.id;
  }

  async #deployOnRender() {
    const environment = this.#getEnvironment();
    const envVars = [];

    for (const key in environment) {
      envVars.push({
        key,
        value: environment[key]
      });
    }

    const rUpdateVars = await ppp.fetch(
      `https://api.render.com/v1/services/${this.serviceID}/env-vars`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.deploymentApiId.datum().token}`
        },
        body: JSON.stringify(envVars)
      }
    );

    await maybeFetchError(
      rUpdateVars,
      ppp.t('$serviceCloudPppAspirantPage.cannotUpdateRenderEnvVars')
    );

    const rPatchService = await ppp.fetch(
      `https://api.render.com/v1/services/${this.serviceID}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.deploymentApiId.datum().token}`
        },
        body: JSON.stringify({
          autoDeploy: 'no',
          serviceDetails: {
            env: 'docker',
            envSpecificDetails: {
              dockerContext: '/',
              dockerfilePath: '/lib/aspirant/Dockerfile'
            }
          }
        })
      }
    );

    await maybeFetchError(
      rPatchService,
      ppp.t('$serviceCloudPppAspirantPage.cannotUpdateRenderService')
    );

    const rDeployService = await ppp.fetch(
      `https://api.render.com/v1/services/${this.serviceID}/deploys`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.deploymentApiId.datum().token}`
        },
        body: JSON.stringify({
          clearCache: 'clear'
        })
      }
    );

    await maybeFetchError(
      rDeployService,
      ppp.t('$serviceCloudPppAspirantPage.cannotDeployRenderService')
    );

    // Add Render ping trigger code here.
  }

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
      await ppp.fetch(
        `https://api.northflank.com/v1/projects/${this.document.projectID}/services/${this.document.serviceID}/resume`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.document.deploymentApi.token}`
          }
        }
      );

      return maybeFetchError(
        await ppp.fetch(
          `https://api.northflank.com/v1/projects/${this.document.projectID}/services/${this.document.serviceID}/restart`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.document.deploymentApi.token}`
            }
          }
        ),
        ppp.t('$serviceCloudPppAspirantPage.cannotRestartNorthflankService')
      );
    } else {
      await ppp.fetch(
        `https://api.render.com/v1/services/${this.document.serviceID}/resume`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.document.deploymentApi.token}`
          }
        }
      );

      return maybeFetchError(
        await ppp.fetch(
          `https://api.render.com/v1/services/${this.document.serviceID}/restart`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.document.deploymentApi.token}`
            }
          }
        ),
        ppp.t('$serviceCloudPppAspirantPage.cannotRestartRenderService')
      );
    }
  }

  async stop() {
    if (this.deploymentApiId.datum().type === APIS.NORTHFLANK) {
      return maybeFetchError(async () => {
        const response = await ppp.fetch(
          `https://api.northflank.com/v1/projects/${this.document.projectID}/services/${this.document.serviceID}/pause`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.document.deploymentApi.token}`
            }
          }
        );

        return {
          response,
          ok: response.ok || response.status === 409
        };
      }, ppp.t('$serviceCloudPppAspirantPage.cannotStopNorthflankService'));
    } else {
      return maybeFetchError(
        await ppp.fetch(
          `https://api.render.com/v1/services/${this.document.serviceID}/suspend`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.document.deploymentApi.token}`
            }
          }
        ),
        ppp.t('$serviceCloudPppAspirantPage.cannotStopRenderService')
      );
    }
  }

  async cleanup() {
    if (this.deploymentApiId.datum().type === APIS.NORTHFLANK) {
      return maybeFetchError(
        await ppp.fetch(
          `https://api.northflank.com/v1/projects/${this.document.projectID}/services/${this.document.serviceID}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${this.document.deploymentApi.token}`
            }
          }
        ),
        ppp.t('$serviceCloudPppAspirantPage.cannotRemoveNorthflankService')
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
      // Add Render trigger removal code here.

      return maybeFetchError(
        await ppp.fetch(
          `https://api.render.com/v1/services/${this.document.serviceID}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${this.document.deploymentApi.token}`
            }
          }
        ),
        ppp.t('$serviceCloudPppAspirantPage.cannotRemoveRenderService')
      ).catch(async (error) => {
        await this.updateDocumentFragment({
          $set: {
            state: SERVICE_STATE.STOPPED,
            updatedAt: new Date()
          }
        });

        throw error;
      });
    }
  }
}

applyMixins(ServiceCloudPppAspirantPage, PageWithService);

export default ServiceCloudPppAspirantPage.compose({
  template: serviceCloudPppAspirantTemplate,
  styles: serviceCloudPppAspirantStyles
}).define();
