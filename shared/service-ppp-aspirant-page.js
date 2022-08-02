import { Page, PageWithDocument } from './page.js';
import { invalidate, validate } from './validate.js';
import { SERVICE_STATE, SERVICES } from './const.js';
import { maybeFetchError } from './fetch-error.js';
import { applyMixins } from './utilities/apply-mixins.js';
import ppp from '../ppp.js';

export class ServicePppAspirantPage extends Page {
  collection = 'services';

  async validate() {
    await validate(this.name);
    await validate(this.tailscaleKey);
    await validate(this.tailscaleKey, {
      hook: async (value) => value?.startsWith('tskey'),
      errorMessage: 'Ключ должен начинаться с tskey'
    });
    await validate(this.deploymentApiId);
    await validate(this.redisApiId);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import('./const.js')).SERVICES.PPP_ASPIRANT%]`
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
      type: SERVICES.PPP_ASPIRANT,
      name: this.name.value.trim()
    };
  }

  async #deploy() {
    const serviceMachineUrl = ppp.keyVault.getKey('service-machine-url');

    const rProjectList = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
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
      (p) => p.name === 'ppp'
    );

    if (!project) {
      invalidate(ppp.app.toast, {
        errorMessage: 'Проект ppp не найден в Northflank.',
        raiseException: true
      });
    }

    const rServiceList = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          url: `https://api.northflank.com/v1/projects/${project.id}/services`,
          headers: {
            Authorization: `Bearer ${this.deploymentApiId.datum().token}`
          }
        })
      }
    );

    await maybeFetchError(
      rServiceList,
      'Не удалось получить список сервисов проекта ppp.'
    );

    const service = (await rServiceList.json()).data.services.find(
      (s) => s.name === 'ppp-aspirant'
    );

    this.projectId = project.id;

    if (!service) {
      const redisApi = this.redisApiId.datum();

      await maybeFetchError(
        await fetch(new URL('fetch', serviceMachineUrl).toString(), {
          cache: 'no-cache',
          method: 'POST',
          body: JSON.stringify({
            method: 'POST',
            url: `https://api.northflank.com/v1/projects/${project.id}/services/combined`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.deploymentApiId.datum().token}`
            },
            body: JSON.stringify({
              name: 'ppp-aspirant',
              description: 'PPP Aspirant Service',
              billing: {
                deploymentPlan: 'nf-compute-20'
              },
              deployment: {
                instances: 1
              },
              ports: [
                {
                  name: 'http',
                  public: true,
                  internalPort: 32456,
                  protocol: 'HTTP'
                },
                {
                  name: 'inspect',
                  internalPort: 9229,
                  protocol: 'TCP'
                }
              ],
              vcsData: {
                projectUrl: `https://github.com/${ppp.keyVault.getKey(
                  'github-login'
                )}/ppp`,
                projectType: 'github',
                accountLogin: ppp.keyVault.getKey('github-login'),
                projectBranch: 'johnpantini'
              },
              buildSettings: {
                dockerfile: {
                  buildEngine: 'kaniko',
                  useCache: false,
                  dockerFilePath: '/salt/states/ppp/lib/aspirant/Dockerfile',
                  dockerWorkDir: '/salt/states/ppp/lib'
                }
              },
              runtimeEnvironment: {
                NODE_TLS_REJECT_UNAUTHORIZED: '0',
                ASPIRANT_ID: this.document._id,
                SERVICE_MACHINE_URL: serviceMachineUrl,
                REDIS_HOST: redisApi.host,
                REDIS_PORT: redisApi.port.toString(),
                REDIS_TLS: !!redisApi.tls ? '1' : '',
                REDIS_USERNAME: redisApi.username?.toString(),
                REDIS_PASSWORD: redisApi.password?.toString(),
                REDIS_DATABASE: redisApi.database.toString(),
                TAILSCALE_AUTH_KEY: this.document.tailscaleKey
              }
            })
          })
        }),
        'Не удалось создать сервис PPP Aspirant, подробности в консоли браузера.'
      );
    }
  }

  async update() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          tailscaleKey: this.tailscaleKey.value,
          deploymentApiId: this.deploymentApiId.value,
          redisApiId: this.redisApiId.value,
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.PPP_ASPIRANT,
          createdAt: new Date()
        }
      },
      this.#deploy,
      {
        $set: {
          state: SERVICE_STATE.ACTIVE,
          updatedAt: new Date()
        }
      }
    ];
  }
}

applyMixins(ServicePppAspirantPage, PageWithDocument);
