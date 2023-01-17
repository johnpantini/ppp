import { Page, PageWithService, PageWithSSHTerminal } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { validate, invalidate } from './validate.js';
import { SERVICE_STATE, SERVICES, VERSIONING_STATUS } from './const.js';
import { maybeFetchError } from './fetch-error.js';
import { Tmpl } from './tmpl.js';
import { parsePPPScript } from './ppp-script.js';
import { predefinedWorkerData } from './predefined-worker-data.js';
import ppp from '../ppp.js';

export class ServicePppAspirantWorkerPage extends Page {
  collection = 'services';

  async validate() {
    await validate(this.name);
    await validate(this.aspirantServiceId);
    await validate(this.environmentCode);
    await validate(this.environmentCodeSecret);

    if (this.useVersioning.checked) {
      await validate(this.versioningUrl);

      // URL validation
      this.getWorkerTemplateFullUrl(this.versioningUrl.value);
    }

    await validate(this.sourceCode);

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

    try {
      new Function(
        `return ${await new Tmpl().render(
          this.page.view,
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

  async readyChanged(oldValue, newValue) {
    if (newValue) {
      await this.checkVersion();
    }
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

    let version = 1;
    const parsed = parsePPPScript(this.sourceCode.value);

    if (parsed) {
      [version] = parsed?.meta?.version;
      version = Math.abs(+version) || 1;
    }

    if (this.useVersioning.checked) {
      if (typeof version !== 'number') {
        invalidate(this.sourceCode, {
          errorMessage: 'Не удалось прочитать версию',
          raiseException: true
        });
      }
    }

    if (typeof version !== 'number') {
      version = 1;
    }

    return [
      {
        $set: {
          name: this.name.value.trim(),
          aspirantServiceId: this.aspirantServiceId.value,
          sourceCode: this.sourceCode.value,
          environmentCode: this.environmentCode.value,
          environmentCodeSecret: this.environmentCodeSecret.value,
          version,
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
      state === SERVICE_STATE.ACTIVE && this.#recreate,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }

  async afterUpdate() {
    await this.checkVersion();
  }

  getVersioningStatus() {
    return this.document.useVersioning
      ? this.document.version < this.actualVersion
        ? VERSIONING_STATUS.OLD
        : VERSIONING_STATUS.OK
      : VERSIONING_STATUS.OFF;
  }

  async updateService() {
    if (this.document.useVersioning && this.document.versioningUrl) {
      this.beginOperation();

      try {
        const fcRequest = await fetch(
          this.getWorkerTemplateFullUrl(this.document.versioningUrl).toString(),
          {
            cache: 'no-cache'
          }
        );

        await maybeFetchError(
          fcRequest,
          'Не удалось загрузить файл с обновлением.'
        );

        this.sourceCode.updateCode(await fcRequest.text());
        await this.saveDocument();

        this.succeedOperation('Сервис успешно обновлён.');
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
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
      // Fresh entity
      if (!this.document.server) {
        this.document.server = await ppp.user.functions.findOne(
          {
            collection: 'servers'
          },
          {
            _id: aspirantService.serverId
          }
        );
      }

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
          `return Object.assign({}, ${await new Tmpl().render(
            this.page.view,
            this.document.environmentCode
          )}, ${await new Tmpl().render(
            this.page.view,
            this.document.environmentCodeSecret
          )});`
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

  getWorkerTemplateFullUrl(relativeOrAbsoluteUrl) {
    try {
      let url;

      if (relativeOrAbsoluteUrl.startsWith('/')) {
        const rootUrl = window.location.origin;

        if (rootUrl.endsWith('.github.io'))
          url = new URL('/ppp' + relativeOrAbsoluteUrl, rootUrl);
        else url = new URL(relativeOrAbsoluteUrl, rootUrl);
      } else {
        url = new URL(relativeOrAbsoluteUrl);
      }

      return url;
    } catch (e) {
      invalidate(this.versioningUrl, {
        errorMessage: 'Неверный URL',
        raiseException: true
      });
    }
  }

  async checkVersion() {
    if (this.document.useVersioning) {
      const versioningUrl = this.document.versioningUrl.trim();

      if (versioningUrl) {
        const fcRequest = await fetch(
          this.getWorkerTemplateFullUrl(versioningUrl).toString(),
          {
            cache: 'no-cache'
          }
        );

        await maybeFetchError(
          fcRequest,
          'Не удалось отследить версию сервиса.'
        );

        const parsed = parsePPPScript(await fcRequest.text());

        if (!parsed || !Array.isArray(parsed.meta?.version)) {
          invalidate(this.versioningUrl, {
            errorMessage: 'Не удалось прочитать версию',
            raiseException: true
          });
        }

        const [version] = parsed.meta?.version;

        this.actualVersion = Math.abs(parseInt(version) || 1);

        if (typeof this.actualVersion !== 'number') this.actualVersion = 1;
      } else {
        this.actualVersion = 1;
      }
    } else {
      this.actualVersion = 1;
    }
  }

  async fillOutFormWithTemplate() {
    this.beginOperation();

    try {
      const data = predefinedWorkerData[this.workerPredefinedTemplate.value];
      const fcRequest = await fetch(
        this.getWorkerTemplateFullUrl(data.url).toString(),
        {
          cache: 'no-cache'
        }
      );

      await maybeFetchError(fcRequest, 'Не удалось загрузить файл с шаблоном.');

      this.sourceCode.updateCode(await fcRequest.text());
      this.environmentCode.updateCode(data.env);
      this.environmentCodeSecret.updateCode(data.envSecret);

      this.versioningUrl.value = data.url;

      this.succeedOperation(
        `Шаблон «${this.workerPredefinedTemplate.displayValue.trim()}» успешно загружен.`
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

applyMixins(ServicePppAspirantWorkerPage, PageWithSSHTerminal, PageWithService);
