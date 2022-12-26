import { Page, PageWithService } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { invalidate, validate } from './validate.js';
import { SERVICE_STATE, SERVICES } from './const.js';
import { maybeFetchError } from './fetch-error.js';
import { uuidv4 } from './ppp-crypto.js';
import ppp from '../ppp.js';

export class ServiceCloudPppAspirantPage extends Page {
  collection = 'services';

  async validate() {
    await validate(this.name);

    if (this.tailscaleKey.value.trim())
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
              type: `[%#(await import('./const.js')).SERVICES.CLOUD_PPP_ASPIRANT%]`
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
      'Не удалось получить список сервисов проекта PPP.'
    );

    const service = (await rServiceList.json()).data.services.find(
      (s) => s.name === 'ppp-aspirant'
    );

    this.projectID = project.id;

    const redisApi = this.redisApiId.datum();
    const runtimeEnvironment = {
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
      ASPIRANT_ID: this.document._id,
      SERVICE_MACHINE_URL: serviceMachineUrl,
      REDIS_HOST: redisApi.host,
      REDIS_PORT: redisApi.port.toString(),
      REDIS_TLS: !!redisApi.tls ? '1' : '',
      REDIS_USERNAME: redisApi.username?.toString() ?? 'default',
      REDIS_PASSWORD: redisApi.password?.toString(),
      REDIS_DATABASE: redisApi.database.toString(),
      TAILSCALE_AUTH_KEY: this.document.tailscaleKey ?? ''
    };

    if (!service) {
      const [portName] = uuidv4().split('-');
      const rNewService = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
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
                  name: 'p' + portName.substring(1),
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
                projectBranch: this.deploymentSource.value
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
        rNewService,
        'Не удалось создать сервис PPP Aspirant, подробности в консоли браузера.'
      );

      this.serviceID = (await rNewService.json()).data.id;
    } else {
      this.serviceID = service.id;

      const rGetCurrentEnvironment = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          body: JSON.stringify({
            method: 'GET',
            url: `https://api.northflank.com/v1/projects/${project.id}/services/${this.serviceID}/runtime-environment`,
            headers: {
              Authorization: `Bearer ${this.deploymentApiId.datum().token}`
            }
          })
        }
      );

      await maybeFetchError(
        rGetCurrentEnvironment,
        'Не удалось прочитать переменные окружения сервиса.'
      );

      if (
        JSON.stringify(
          (await rGetCurrentEnvironment.json()).data.runtimeEnvironment
        ) !== JSON.stringify(runtimeEnvironment)
      ) {
        await maybeFetchError(
          await fetch(new URL('fetch', serviceMachineUrl).toString(), {
            cache: 'no-cache',
            method: 'POST',
            body: JSON.stringify({
              method: 'POST',
              url: `https://api.northflank.com/v1/projects/${project.id}/services/${this.serviceID}/runtime-environment`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.deploymentApiId.datum().token}`
              },
              body: JSON.stringify({
                runtimeEnvironment
              })
            })
          }),
          'Не удалось обновить переменные окружения сервиса.'
        );
      }
    }
  }

  async update() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          tailscaleKey: this.tailscaleKey.value.trim(),
          deploymentApiId: this.deploymentApiId.value,
          redisApiId: this.redisApiId.value,
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.CLOUD_PPP_ASPIRANT,
          createdAt: new Date()
        }
      },
      this.#deploy,
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
    if (this.document.state === SERVICE_STATE.STOPPED) {
      return maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
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
        ),
        'Не удалось перезапустить сервис.'
      );
    } else {
      return maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
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
        'Не удалось перезапустить сервис.'
      );
    }
  }

  async stop() {
    return maybeFetchError(async () => {
      const request = await fetch(
        new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
        {
          cache: 'no-cache',
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
    }, 'Не удалось остановить сервис.');
  }

  async cleanup() {
    return maybeFetchError(
      await fetch(
        new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
        {
          cache: 'no-cache',
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
      'Не удалось удалить сервис. Удалите его вручную в панели управления Northflank.'
    );
  }
}

applyMixins(ServiceCloudPppAspirantPage, PageWithService);
