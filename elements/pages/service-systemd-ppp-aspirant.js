import ppp from '../../ppp.js';
import { html, css, ref, repeat } from '../../vendor/fast-element.min.js';
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
  PageWithService,
  PageWithSSHTerminal
} from '../page.js';
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import {
  servicePageFooterExtraControls,
  servicePageHeaderExtraControls
} from './service.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import ServiceCloudPppAspirant from './service-cloud-ppp-aspirant.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../terminal.js';
import '../text-field.js';

export const serviceSystemdPppAspirantTemplate = html`
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
            placeholder="Aspirant"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Хранилище Redis</h5>
          <p class="description">Персистентность для сервиса.</p>
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
            Добавить API Redis
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Сервер</h5>
          <p class="description">
            Сервер, на котором будет запущен Aspirant. Нельзя изменить после
            создания сервиса.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('serverId')}
            ?disabled="${(x) => x.document._id}"
            @change="${(x, c) => {
              // Reset domain on server change
              x.scratch.set('server', x.serverId.datum());

              if (x.serverId.value !== x.document.serverId) {
                x.domain.value = void 0;
                x.tailnetDomain.value = '';
                x.document.serverId = x.serverId.value;
              }
            }}"
            value="${(x) => x.document.serverId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.server ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('servers')
                  .find({
                    $or: [
                      { removed: { $ne: true } },
                      { _id: `[%#this.document.serverId ?? ''%]` }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            ?disabled="${(x) => x.document._id}"
            @click="${() =>
              ppp.app.mountPage('server', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить сервер
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Домен глобальной сети</h5>
          <p class="description">
            Опциональный домен, чтобы сгенерировать сертификаты.
          </p>
        </div>
        <div class="input-group">
          <ppp-select
            deselectable
            ?disabled="${(x) =>
              !x.serverId.value || !x.scratch.get('server')?.domains}"
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.domain ?? ''}"
            ${ref('domain')}
          >
            ${repeat(
              (x) => x.scratch.get('server')?.domains ?? [],
              html` <ppp-option value="${(x) => x}">${(x) => x}</ppp-option> `
            )}
          </ppp-select>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Домен Tailnet</h5>
          <p class="description">Домен сервера в сети Tailscale.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="domain.ts.net"
            value="${(x) => x.document.tailnetDomain}"
            ${ref('tailnetDomain')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Прокси-ресурс для загрузки RPM-пакетов</h5>
          <p class="description">Требуется для обхода блокировок.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="https://example.com"
            value="${(x) => x.document.rpmProxy}"
            ${ref('rpmProxy')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: 'Сохранить в PPP и развернуть на сервере',
        extraControls: html`
          <ppp-button
            class="clear-data"
            ?hidden="${(x) => !x.document._id}"
            ?disabled="${(x) => !x.isSteady() || x.document.removed}"
            appearance="danger"
            @click="${(x) => x.clearRedisData()}"
          >
            Очистить хранилище Redis
          </ppp-button>
          ${servicePageFooterExtraControls}
        `
      })}
    </form>
  </template>
`;

export const serviceSystemdPppAspirantStyles = css`
  ${pageStyles}
  .clear-data {
    margin-right: auto;
  }
`;

export class ServiceSystemdPppAspirantPage extends Page {
  collection = 'services';

  async validate() {
    await validate(this.name);
    await validate(this.redisApiId);
    await validate(this.serverId);
    await validate(this.tailnetDomain);
    await validate(this.rpmProxy);
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.SYSTEMD_PPP_ASPIRANT%]`
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
              from: 'servers',
              localField: 'serverId',
              foreignField: '_id',
              as: 'server'
            }
          },
          {
            $unwind: '$server'
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.SYSTEMD_PPP_ASPIRANT,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  #getEnvironment() {
    const redisApi = this.redisApiId.datum();

    return {
      ASPIRANT_ID: this.document._id,
      SERVICE_MACHINE_URL: ppp.keyVault.getKey('service-machine-url'),
      REDIS_HOST: redisApi.host,
      REDIS_PORT: redisApi.port.toString(),
      REDIS_TLS: !!redisApi.tls ? 'true' : '',
      REDIS_USERNAME: redisApi.username?.toString() ?? 'default',
      REDIS_PASSWORD: redisApi.password?.toString(),
      REDIS_DATABASE: redisApi.database.toString()
    };
  }

  async #deployOnServer() {
    const tailnetDomain = this.tailnetDomain.value.trim();
    const pillar = {
      serviceName: `aspirant@${this.document._id}`,
      environment: this.#getEnvironment()
    };

    if (this.document.domain) {
      pillar.domain = this.document.domain;
    }

    const sslReplacement = [];

    sslReplacement.push('listen 443 ssl;');
    sslReplacement.push('listen [::]:443 ssl;');
    sslReplacement.push(
      `ssl_certificate /usr/lib/nginx/certs/${tailnetDomain}/${tailnetDomain}.crt;`
    );
    sslReplacement.push(
      `ssl_certificate_key /usr/lib/nginx/certs/${tailnetDomain}/${tailnetDomain}.key;`
    );
    sslReplacement.push('ssl_session_timeout 1d;');
    sslReplacement.push('ssl_session_tickets off;');
    sslReplacement.push('ssl_protocols TLSv1.3;');
    sslReplacement.push('ssl_prefer_server_ciphers off;');
    sslReplacement.push('ssl_stapling on;');
    sslReplacement.push('ssl_stapling_verify on;');
    sslReplacement.push(`allow 100.0.0.0/8;`);
    sslReplacement.push('deny all;');

    const server = this.serverId.datum();
    const commands = [
      'sudo salt-call --local state.sls ppp ;',
      'sudo salt-call --local state.sls node ;',
      `sudo firewall-cmd --permanent --zone=trusted --add-source=100.0.0.0/8;`,
      `sudo firewall-cmd --permanent --add-service=http;`,
      `sudo firewall-cmd --permanent --add-service=https;`,
      `sudo firewall-cmd --reload ;`,
      `sudo salt-call --local state.sls consul pillar='${JSON.stringify({
        rpmProxy: this.rpmProxy.value.trim()
      })}' ;`,
      `sudo salt-call --local state.sls nomad pillar='${JSON.stringify({
        rpmProxy: this.rpmProxy.value.trim()
      })}' ;`,
      'sudo salt-call --local state.sls nginx ;',
      `sudo salt-call --local state.sls aspirant.nginx-ssl pillar='${JSON.stringify(
        {
          sslReplacement: sslReplacement.join(' '),
          tailnetDomain
        }
      )}' ;`,
      `sudo salt-call --local state.sls aspirant pillar='${JSON.stringify(
        pillar
      )}' &&`
    ].join(' ');

    if (
      !(await this.executeSSHCommands({
        server,
        commands,
        commandsToDisplay: commands.replace(
          /,"REDIS_PASSWORD":"[\s\S]+","/gi,
          ',"REDIS_PASSWORD":"<hidden content>","'
        )
      }))
    ) {
      throw new Error('Не удалось настроить сервис Aspirant.');
    }
  }

  async submit() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          redisApiId: this.redisApiId.value,
          serverId: this.serverId.value,
          domain: this.domain.value,
          tailnetDomain: this.tailnetDomain.value.trim(),
          rpmProxy: this.rpmProxy.value.trim(),
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.CLOUD_PPP_ASPIRANT,
          createdAt: new Date()
        }
      },
      this.#deployOnServer,
      () => ({
        $set: {
          state: SERVICE_STATE.ACTIVE,
          updatedAt: new Date()
        }
      })
    ];
  }

  async restart() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: `sudo systemctl restart aspirant@${this.document._id}.service &&`
      }))
    ) {
      throw new Error('Не удалось перезапустить сервис Aspirant.');
    }
  }

  async stop() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: `sudo systemctl stop aspirant@${this.document._id}.service &&`
      }))
    ) {
      throw new Error('Не удалось отсановить сервис Aspirant.');
    }
  }

  async cleanup() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: [
          `sudo systemctl stop aspirant@${this.document._id}.service ;`,
          `sudo systemctl disable aspirant@${this.document._id}.service ;`,
          `sudo rm -f /etc/systemd/system/aspirant@${this.document._id}.service`,
          `sudo systemctl daemon-reload ;`,
          `sudo systemctl reset-failed &&`
        ].join(' ')
      }))
    ) {
      throw new Error('Не удалось отсановить сервис Aspirant.');
    }
  }
}

// noinspection JSPotentiallyInvalidConstructorUsage
ServiceSystemdPppAspirantPage.prototype.clearRedisData =
  ServiceCloudPppAspirant.type.prototype.clearRedisData;

applyMixins(
  ServiceSystemdPppAspirantPage,
  PageWithService,
  PageWithSSHTerminal
);

export default ServiceSystemdPppAspirantPage.compose({
  template: serviceSystemdPppAspirantTemplate,
  styles: serviceSystemdPppAspirantStyles
}).define();
