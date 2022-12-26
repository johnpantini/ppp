import { Page, PageWithSSHTerminal, PageWithService } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { validate } from './validate.js';
import { SERVICE_STATE, SERVICES } from './const.js';
import ppp from '../ppp.js';

export class ServiceSystemdPppAspirantPage extends Page {
  collection = 'services';

  constructor(props) {
    super(props);

    this.onDocumentReady = this.onDocumentReady.bind(this);
  }

  async onDocumentReady() {
    try {
      if (this.document.state === SERVICE_STATE.ACTIVE) {
        await this.executeSSHCommandsSilently({
          server: this.document.server,
          commands:
            'sudo salt-call --local network.ip_addrs cidr="100.0.0.0/8" --out json &&'
        });

        const [ip] = JSON.parse(this.terminalOutput.split('}')[0] + '}').local;

        if (ip) {
          const inspectorUrlEndpoint = `http://${ip}:${this.document.port}/inspector_url`;

          await this.executeSSHCommandsSilently({
            server: this.document.server,
            commands: `sudo salt-call --local http.query ${inspectorUrlEndpoint} --out json &&`
          });

          const rawInspectorUrl =
            this.terminalOutput.match(/"(ws:[\s\S]+)"/i)[1];

          if (rawInspectorUrl) {
            const inspectorUrl = new URL(rawInspectorUrl);

            this.scratchSet(
              'inspectorUrl',
              `devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=${ip}:${inspectorUrl.port}${inspectorUrl.pathname}`
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async connectedCallback() {
    super.connectedCallback();

    this.addEventListener('ready', this.onDocumentReady);
  }

  disconnectedCallback() {
    this.removeEventListener('ready', this.onDocumentReady);

    super.disconnectedCallback();
  }

  async validate() {
    await validate(this.name);
    await validate(this.serverId);
    await validate(this.port);
    await validate(this.port, {
      hook: async (value) => +value >= 1024 && +value <= 65535,
      errorMessage: 'Введите значение в диапазоне от 1024 до 65535'
    });
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
              type: `[%#(await import('./const.js')).SERVICES.SYSTEMD_PPP_ASPIRANT%]`
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

  async #deploy() {
    const serviceMachineUrl = ppp.keyVault.getKey('service-machine-url');
    const server = this.serverId.datum();
    const redisApi = this.redisApiId.datum();
    const port = this.document.port.toString() ?? '32456';
    const pillar = {
      serviceName: `ppp-aspirant@${this.document._id}`,
      serviceType: 'simple',
      workingDirectory: '/opt/ppp/lib/aspirant',
      execStart:
        '/bin/node --no-warnings --inspect=0.0.0.0:0 /opt/ppp/lib/aspirant/main.mjs',
      environment: {
        PORT: port,
        NODE_TLS_REJECT_UNAUTHORIZED: '0',
        ASPIRANT_ID: this.document._id,
        SERVICE_MACHINE_URL: serviceMachineUrl,
        REDIS_HOST: redisApi.host,
        REDIS_PORT: redisApi.port.toString(),
        REDIS_TLS: !!redisApi.tls ? '1' : '',
        REDIS_USERNAME: redisApi.username?.toString() ?? 'default',
        REDIS_PASSWORD: redisApi.password?.toString(),
        REDIS_DATABASE: redisApi.database.toString()
      }
    };

    if (this.document.domain) {
      pillar.domain = this.document.domain;
    }

    const commands = [
      'sudo salt-call --local state.sls ppp ;',
      `sudo firewall-cmd --permanent --zone=trusted --add-source=100.0.0.0/8;`,
      `sudo firewall-cmd --reload ;`,
      `sudo salt-call --local state.sls systemd.service pillar='${JSON.stringify(
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
      throw new Error('Не удалось настроить сервис.');
    }
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
          serverId: this.serverId.value,
          port: Math.abs(this.port.value),
          domain: this.domain.value,
          redisApiId: this.redisApiId.value,
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.SYSTEMD_PPP_ASPIRANT,
          createdAt: new Date()
        }
      },
      this.#deploy,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }

  async restart() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: `sudo systemctl restart ppp-aspirant@${this.document._id} &&`
      }))
    ) {
      throw new Error('Не удалось остановить сервис.');
    }
  }

  async stop() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: `sudo systemctl stop ppp-aspirant@${this.document._id} &&`
      }))
    ) {
      throw new Error('Не удалось остановить сервис.');
    }
  }

  async cleanup() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: [
          `sudo systemctl disable ppp-aspirant@${this.document._id} ;`,
          `sudo systemctl stop ppp-aspirant@${this.document._id} ;`,
          `sudo rm -f /etc/systemd/system/ppp-aspirant@${this.document._id}.service ;`,
          `sudo firewall-cmd --permanent --zone=trusted --remove-source=100.0.0.0/8;`,
          `sudo systemctl reset-failed ;`,
          `sudo systemctl daemon-reload &&`
        ].join(' ')
      }))
    ) {
      throw new Error(
        'Не удалось удалить сервис. Удалите его вручную в панели управления MongoDB Realm.'
      );
    }
  }
}

applyMixins(
  ServiceSystemdPppAspirantPage,
  PageWithSSHTerminal,
  PageWithService
);
