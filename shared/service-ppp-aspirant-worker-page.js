import { Page, PageWithService, PageWithSSHTerminal } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { validate, invalidate } from './validate.js';
import { SERVICE_STATE, SERVICES } from './const.js';
import { maybeFetchError } from './fetch-error.js';
import ppp from '../ppp.js';
import { Tmpl } from './tmpl.js';

export class ServicePppAspirantWorkerPage extends Page {
  collection = 'services';

  async validate() {
    await validate(this.name);
    await validate(this.aspirantServiceId);
    await validate(this.environmentCode);

    try {
      new Function(
        `return ${await new Tmpl().render(
          this.page.view,
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

    await validate(this.sourceCode);
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
              type: `[%#(await import('./const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
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

  async update() {
    const state =
      this.document.state === SERVICE_STATE.ACTIVE
        ? SERVICE_STATE.ACTIVE
        : SERVICE_STATE.STOPPED;

    return [
      {
        $set: {
          name: this.name.value.trim(),
          aspirantServiceId: this.aspirantServiceId.value,
          environmentCode: this.environmentCode.value,
          sourceCode: this.sourceCode.value,
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.PPP_ASPIRANT_WORKER,
          createdAt: new Date()
        }
      },
      state === SERVICE_STATE.ACTIVE && this.#recreate,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }

  async getAspirantUrl() {
    let url;

    if (!this.document.aspirantService)
      this.document.aspirantService = this.aspirantServiceId.datum();

    const aspirantService = this.document.aspirantService;

    if (aspirantService.type === SERVICES.DEPLOYED_PPP_ASPIRANT) {
      url = aspirantService.url;
    } else if (aspirantService.type === SERVICES.CLOUD_PPP_ASPIRANT) {
      // Northflank
      const aspirantApi = await ppp.user.functions.findOne(
        {
          collection: 'apis'
        },
        {
          _id: aspirantService.deploymentApiId
        }
      );

      if (aspirantApi?.token) {
        const { token } = await ppp.decrypt(aspirantApi);

        const serviceRequest = await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            body: JSON.stringify({
              method: 'GET',
              url: `https://api.northflank.com/v1/projects/${aspirantService.projectID}/services/${aspirantService.serviceID}`,
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        );

        const json = await serviceRequest.json();
        const port = json.data?.ports?.find((p) => p.internalPort === 32456);

        if (port) {
          url = `https://${port.dns}`;
        } else {
          invalidate(this.aspirantServiceId, {
            errorMessage:
              'Проблема с получением ссылки PPP Aspirant - порт не найден',
            raiseException: true
          });
        }
      } else
        invalidate(this.aspirantServiceId, {
          errorMessage: 'Проблема с сервисом PPP Aspirant',
          raiseException: true
        });
    } else if (aspirantService.type === SERVICES.SYSTEMD_PPP_ASPIRANT) {
      await this.executeSSHCommandsSilently({
        server: this.document.server,
        commands: 'hostname --all-ip-addresses | grep -oP 100.[0-9.]+ &&'
      });

      const [ip] = this.terminalOutput.split(/\r?\n/);

      url = `http://${ip}:${aspirantService.port}`;
    }

    return url;
  }

  async #aspirantRequest(url, { method, headers, body }) {
    const aspirantUrl = await this.getAspirantUrl();
    const aspirantService = this.document.aspirantService;

    let requestUrl;
    let requestOptions;

    if (aspirantService.type === SERVICES.DEPLOYED_PPP_ASPIRANT) {
      requestUrl = new URL(url, aspirantUrl).toString();
      requestOptions = {
        cache: 'no-cache',
        method,
        headers,
        body
      };
    } else if (aspirantService.type === SERVICES.CLOUD_PPP_ASPIRANT) {
      requestUrl = new URL(
        'fetch',
        ppp.keyVault.getKey('service-machine-url')
      ).toString();
      requestOptions = {
        cache: 'no-cache',
        method: 'POST',
        body: JSON.stringify({
          method,
          url: new URL(url, aspirantUrl).toString(),
          headers,
          body
        })
      };
    } else if (aspirantService.type === SERVICES.SYSTEMD_PPP_ASPIRANT) {
      requestUrl = new URL(url, aspirantUrl).toString();

      const parsedBody = JSON.parse(body);
      const commands =
        method === 'DELETE'
          ? `curl -X DELETE -d '{"_id": "${parsedBody._id}"}' -H "Accept: application/json" ${requestUrl} && `
          : `sudo salt-call --local http.query ${requestUrl} method=${method} data='${JSON.stringify(
              body
            ).replaceAll(/'/gi, `'\\''`)}' && `;

      if (
        !(await this.executeSSHCommandsSilently({
          server: this.document.server,
          commands
        }))
      ) {
        throw new Error('Не удалось выполнить действие.');
      }

      return;
    }

    await maybeFetchError(
      await fetch(requestUrl, requestOptions),
      'Операция не выполнена, подробности в консоли браузера.'
    );
  }

  async #recreate() {
    await this.#aspirantRequest('workers', {
      method: 'DELETE',
      body: JSON.stringify({
        _id: this.document._id
      })
    });

    await this.#aspirantRequest('workers', {
      method: 'POST',
      body: JSON.stringify({
        _id: this.document._id,
        env: new Function(
          `return ${await new Tmpl().render(
            this.page.view,
            this.document.environmentCode
          )}`
        )(),
        source: encodeURIComponent(
          await new Tmpl().render(this.page.view, this.document.sourceCode)
        )
      })
    });
  }

  async restart() {
    return this.#recreate();
  }

  async stop() {
    await this.#aspirantRequest('workers', {
      method: 'DELETE',
      body: JSON.stringify({
        _id: this.document._id
      })
    });
  }
}

applyMixins(ServicePppAspirantWorkerPage, PageWithSSHTerminal, PageWithService);
