/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  ref,
  when,
  observable
} from '../../vendor/fast-element.min.js';
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
import { SERVICE_STATE, SERVICES } from '../../lib/const.js';
import { servicePageHeaderExtraControls } from './service.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import '../badge.js';
import '../button.js';
import '../checkbox.js';
import '../copyable.js';
import '../query-select.js';
import '../text-field.js';

export const serviceDeployedPppAspirantTemplate = html`
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
            placeholder="Введите название"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>URL сервиса</h5>
          <p class="description">Ссылка на работающий сервис Aspirant.</p>
          ${when(
            (x) => x.document._id,
            html`
              <p class="description">
                Для запуска локального Aspirant в Docker выберите профиль API
                Redis ниже, чтобы сформировать команду.
              </p>
              <ppp-query-select
                ${ref('redisApiId')}
                @change="${(x) => x.generateDockerCommand()}"
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
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.REDIS%]`
                          },
                          { removed: { $ne: true } }
                        ]
                      })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
              <div class="spacing2"></div>
              <ppp-copyable
                >${(x) => x.dockerCmd ?? 'Выберите профиль Redis'}
              </ppp-copyable>
            `
          )}
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="https://example.com"
            value="${(x) => x.document.url}"
            ${ref('url')}
          ></ppp-text-field>
          <div class="spacing2"></div>
          <ppp-checkbox ${ref('doNotCheckUrl')}>
            Не проверять адрес запросами
          </ppp-checkbox>
        </div>
      </section>
      ${documentPageFooterPartial({ text: 'Проверить и сохранить в PPP' })}
    </form>
  </template>
`;

export const serviceDeployedPppAspirantStyles = css`
  ${pageStyles}
`;

export class ServiceDeployedPppAspirantPage extends Page {
  @observable
  dockerCmd;

  collection = 'services';

  generateDockerCommand() {
    const datum = this.redisApiId.datum();

    if (datum?._id) {
      let command = [
        `docker run`,
        `--env=ASPIRANT_ID=${this.document._id}`,
        `--env=GLOBAL_PROXY_URL=${ppp.keyVault.getKey('global-proxy-url')}`,
        `--env=REDIS_HOST=${datum.host}`,
        `--env=REDIS_PORT=${datum.port}`,
        `--env=REDIS_TLS=${datum.tls ? 'true' : ''}`,
        `--env=REDIS_DATABASE=${datum.database}`,
        `--env=REDIS_USERNAME=${datum.username}`,
        `--env=REDIS_PASSWORD=${datum.password}`,
        `--workdir=/ppp/lib`,
        `-p ${new URL(this.document.url).port}:80`,
        '-d',
        'johnpantini/aspirant'
      ];

      this.dockerCmd = command.join(' ');
    }
  }

  async validate() {
    await validate(this.name);
    await validate(this.url);

    if (!this.doNotCheckUrl.checked) {
      const url = this.url.value.endsWith('/')
        ? this.url.value.slice(0, -1)
        : this.url.value;

      // URL validation
      try {
        await maybeFetchError(await fetch(`${url}/nginx/health`));
        await maybeFetchError(await fetch(`${url}/nomad/health`));

        const envResponse = await fetch(`${url}/nginx/env`);

        await maybeFetchError(envResponse);

        const environment = await envResponse.json();

        if (
          ![
            'ASPIRANT_ID',
            'GLOBAL_PROXY_URL',
            'REDIS_HOST',
            'REDIS_PORT'
          ].every((key) => typeof environment[key] !== 'undefined')
        ) {
          // noinspection ExceptionCaughtLocallyJS
          throw new ValidationError();
        }
      } catch (e) {
        invalidate(this.url, {
          errorMessage: 'Указанный URL не может быть использован',
          raiseException: true
        });
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.DEPLOYED_PPP_ASPIRANT%]`
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.DEPLOYED_PPP_ASPIRANT,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        url: this.url.value.trim(),
        version: 1,
        state: SERVICE_STATE.ACTIVE,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: SERVICES.DEPLOYED_PPP_ASPIRANT,
        createdAt: new Date()
      }
    };
  }
}

applyMixins(ServiceDeployedPppAspirantPage, PageWithService);

export default ServiceDeployedPppAspirantPage.compose({
  template: serviceDeployedPppAspirantTemplate,
  styles: serviceDeployedPppAspirantStyles
}).define();
