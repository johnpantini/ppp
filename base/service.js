/** @decorator */

import { BasePage } from '../lib/page/page.js';
import { attr } from '../lib/element/components/attributes.js';
import { observable } from '../lib/element/observation/observable.js';
import { validate, invalidate } from '../lib/validate.js';
import { requireComponent } from '../lib/template.js';
import { later } from '../lib/later.js';
import { assert } from '../lib/assert.js';
import { DOM } from '../lib/element/dom.js';
import { SUPPORTED_SERVICES } from '../lib/const.js';
import { uuidv4 } from '../lib/ppp-crypto.js';

export class ServicePage extends BasePage {
  @attr
  activeid;

  @attr
  type;

  @attr
  mode;

  @observable
  servers;

  @observable
  bots;

  @observable
  brokers;

  @observable
  domains;

  @observable
  httpsRoutes;

  @observable
  wsRoutes;

  @observable
  brokerProfiles;

  [SUPPORTED_SERVICES.ROCKSDB]() {
    return {
      simple: true,
      cmd: async () => {
        return [
          'sudo salt-call --local state.sls epel ;',
          'sudo dnf -y install snappy snappy-devel zlib zlib-devel bzip2 bzip2-devel lz4-devel libasan libzstd-devel ;',
          'wget https://github.com/facebook/rocksdb/archive/refs/tags/v6.27.3.tar.gz -O rocksdb.tar.gz ;',
          'tar xzf rocksdb.tar.gz ;',
          'cd rocksdb-6.27.3 ;',
          'sudo make -j$(nproc) shared_lib install-shared'
        ].join(' ');
      }
    };
  }

  [SUPPORTED_SERVICES.NETDATA]() {
    return {
      simple: true,
      cmd: async () => {
        // Strip development suffix off
        const origin = window.location.origin;
        let scriptUrl = new URL(
          'vendor/netdata/kickstart.sh',
          origin
        ).toString();

        if (origin.endsWith('github.io.dev'))
          scriptUrl = new URL(
            'ppp/vendor/netdata/kickstart.sh',
            origin.split('.dev')[0]
          ).toString();
        else if (origin.endsWith('github.io'))
          scriptUrl = new URL(
            'ppp/vendor/netdata/kickstart.sh',
            origin
          ).toString();

        return [
          'sudo salt-call --local state.sls epel ;',
          'sudo sh -c "echo 1 >/sys/kernel/mm/ksm/run" ;',
          'sudo sh -c "echo 1000 >/sys/kernel/mm/ksm/sleep_millisecs" ;',
          'sudo dnf -y install libuv libuv-devel libuuid libuuid-devel;',
          `bash <(curl -Ss ${scriptUrl}) --dont-wait`
        ].join(' ');
      }
    };
  }

  [SUPPORTED_SERVICES.CERTBOT]() {
    return {
      simple: true,
      pre: async () => {
        await validate(this.email);
        await validate(this.certbotDomains);
      },
      cmd: async () => {
        const domains = this.certbotDomains.value
          .trim()
          .split(',')
          .map((d) => d.trim());

        return [
          'sudo salt-call --local state.sls epel ;',
          'sudo firewall-cmd --permanent --add-port=80/tcp ;',
          'sudo firewall-cmd --permanent --add-port=443/tcp ;',
          'sudo firewall-cmd --reload ;',
          'sudo dnf -y install certbot ;',
          domains
            .map(
              (d) =>
                `sudo certbot certonly --standalone --non-interactive --agree-tos -m ${this.email.value} -d ${d} `
            )
            .join('&& ') + ' &&',
          'sudo systemctl enable certbot-renew.timer &&',
          'sudo systemctl restart certbot-renew.timer'
        ].join(' ');
      },
      post: async () => {
        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'servers'
          },
          {
            uuid: this.server.value
          },
          {
            $addToSet: {
              domains: {
                $each: this.certbotDomains.value
                  .trim()
                  .split(',')
                  .map((d) => d.trim())
              }
            }
          }
        );
      }
    };
  }

  [SUPPORTED_SERVICES.HTTPS_WEBSOCKET]() {
    return {
      pre: async () => {
        await validate(this.serviceName);
        await validate(this.domain);
        await validate(this.port);
        await validate(this.code);
      },
      cmd: async () => {
        // TODO
        return;

        const { Base62Str } = await import('../lib/base62.js');
        const _id =
          'PPP-' +
          Base62Str.createInstance().encodeStr(this.serviceName.value.trim());

        const environment = [`const ID = '${_id}';`];

        environment.push(`const PORT = ${Math.abs(+this.port.value)};`);
        environment.push(`const KEY_FILE_NAME = './privkey.pem';`);
        environment.push(`const CERT_FILE_NAME = './fullchain.pem';`);
        environment.push('export { ID, PORT, KEY_FILE_NAME, CERT_FILE_NAME };');

        return [
          // 'sudo salt-call --local state.sls epel ;',
          // 'sudo salt-call --local state.sls node ;',
          'sudo salt-call --local state.sls ppp ;',
          `sudo mkdir -p /opt/ppp/lib/services/${_id} ;`,
          `sudo rm -f /opt/ppp/lib/services/${_id}/main.mjs ;`,
          `sudo rm -f /opt/ppp/lib/services/${_id}/environment.mjs ;`,
          `sudo sh -c "echo ${btoa(
            environment.join('\n')
          )} | base64 --decode >> /opt/ppp/lib/services/${_id}/environment.mjs" ;`,
          `sudo sh -c "echo ${btoa(
            this.code.value
          )} | base64 --decode >> /opt/ppp/lib/services/${_id}/main.mjs" ;`,
          `sudo salt-call --local state.sls systemd pillar='{"service_name": "ppp@${_id}.service", "service_type": "https-websocket", "service_domain": "${this.domain.value}"}'`
        ].join(' ');
      },
      post: async () => {
        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'services'
          },
          {
            _id: this.serviceName.value.trim()
          },
          {
            $set: {
              server_uuid: this.server.value,
              type: this.type,
              domain: this.domain.value.trim(),
              port: Math.abs(+this.port.value),
              ws_routes: [],
              http_routes: [],
              brokers: [],
              code: this.code.value,
              updated_at: new Date()
            },
            $setOnInsert: {
              uuid: uuidv4(),
              created_at: new Date()
            }
          },
          {
            upsert: true
          }
        );
      }
    };
  }

  [SUPPORTED_SERVICES.TG_UPDATER]() {
    return {
      pre: async () => {
        await validate(this.serviceName);
        await validate(this.bot);
        await validate(this.channel);
        await validate(this.message);
        await validate(this.endpoint);
        await validate(this.interval);
        await validate(this.code);
      }
    };
  }

  #onPopState() {
    const params = this.app.params();

    this.service = params?.service;
    this.type = params?.type;
  }

  connectedCallback() {
    super.connectedCallback();

    const type = this.app.params()?.type;

    if (type && Object.values(SUPPORTED_SERVICES).indexOf(type) === -1)
      this.app.navigate(this.app.url({ page: this.app.params().page }));

    this.type = type;

    this.tabs.activeidChanged = (oldValue, newValue) => {
      this.activeid = newValue;
    };

    this._onPopState = this.#onPopState.bind(this);

    window.addEventListener('popstate', this._onPopState, {
      passive: true
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('popstate', this._onPopState, {
      passive: true
    });

    this.type = void 0;
  }

  chooseURLFromHTTPSServices() {
    // TODO
  }

  typeChanged(oldValue, newValue) {
    const params = this.app.params();

    this.app.navigate(
      this.app.url({
        ...params,
        type: newValue || void 0
      })
    );

    if (Object.values(SUPPORTED_SERVICES).indexOf(this.type) > -1)
      void this.fetchServers();

    if ([SUPPORTED_SERVICES.TG_UPDATER].indexOf(this.type) > -1)
      void this.fetchBots();
  }

  async fetchServers() {
    try {
      this.servers = null;
      this.domains = null;

      this.app.toast.source = this;
      this.toastTitle = 'Загрузка списка серверов';

      this.servers = await this.app.ppp.user.functions.find({
        collection: 'servers'
      });

      if (!this.servers.length) {
        this.servers = void 0;
      } else this.domains = this.servers[0].domains;

      if (!this.domains?.length) {
        this.domains = void 0;
      }
    } catch (e) {
      console.error(e);

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.status || 503
      });
      this.app.toast.visible = true;
    }
  }

  async fetchBots() {
    try {
      this.bots = null;

      this.app.toast.source = this;
      this.toastTitle = 'Загрузка списка профилей ботов';

      this.bots = await this.app.ppp.user.functions.find({
        collection: 'bots'
      });

      if (!this.bots.length) this.bots = void 0;
    } catch (e) {
      console.error(e);

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.status || 503
      });
      this.app.toast.visible = true;
    }
  }

  async fetchBrokers() {
    try {
      this.brokers = null;

      this.app.toast.source = this;
      this.toastTitle = 'Загрузка списка профилей брокеров';

      this.brokers = await this.app.ppp.user.functions.find({
        collection: 'brokers'
      });

      if (!this.brokers.length) this.brokers = void 0;
    } catch (e) {
      console.error(e);

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.status || 503
      });
      this.app.toast.visible = true;
    }
  }

  async addBrokerProfile() {
    !this.brokers && (await this.fetchBrokers());

    const value = this.brokers?.[0];

    if (!this.brokerProfiles) this.brokerProfiles = [{ value }];
    else this.brokerProfiles.push({ value });
  }

  async addWSRoute() {
    const value = uuidv4();

    if (!this.wsRoutes) this.wsRoutes = [{ value }];
    else this.wsRoutes.push({ value });
  }

  async addHTTPSRoute() {
    const value = uuidv4();

    if (!this.httpsRoutes) this.httpsRoutes = [{ value }];
    else this.httpsRoutes.push({ value });
  }

  async chooseOpenPort() {
    // TODO
  }

  async sendTestTelegramMessage() {
    try {
      this.busy = true;
      this.app.toast.visible = false;
      this.app.toast.source = this;
      this.toastTitle = 'Отправка сообщения';
      this.toastText = '';

      await validate(this.bot);
      await validate(this.channel);

      const bot = await this.app.ppp.user.functions.findOne(
        {
          collection: 'bots'
        },
        {
          uuid: this.bot.value
        }
      );

      assert({
        predicate: bot !== null,
        status: 404
      });

      bot.token = await this.app.ppp.crypto.decrypt(bot.iv, bot.token);

      const { TelegramBot } = await import('../../lib/telegram.js');
      const proxy = new TelegramBot(bot);

      const response = await proxy.sendMessage(
        this.channel.value,
        `[PPP] Тестовое сообщение от бота <b>${bot._id}</b>`,
        { parse_mode: 'html' }
      );

      assert(response);

      const json = await response.json();

      this.message.value = json.result.message_id.toString();

      this.app.toast.appearance = 'success';
      this.app.toast.dismissible = true;
      this.toastText = 'Сообщение отправлено';
      this.app.toast.visible = true;
    } catch (e) {
      console.error(e);

      invalidate(this.app.toast, {
        errorMessage: i18n.t('operationFailedWithStatus', {
          status: e.status || 503
        })
      });
    } finally {
      this.busy = false;
    }
  }

  async setupService() {
    try {
      this.outputText = '';
      this.busy = true;
      this.app.toast.visible = false;
      this.app.toast.source = this;
      this.toastTitle = 'Настройка сервиса';
      this.toastText = '';

      await validate(this.server);
      await this[this.type]().pre?.();

      this.mode = 'terminal';

      await Promise.all([
        requireComponent('ppp-modal'),
        requireComponent('ppp-terminal')
      ]);

      await later(250);

      this.busy = false;
      this.modal.visible = true;

      const terminal = this.terminalDom.terminal;

      terminal.clear();
      terminal.reset();
      terminal.writeln('\x1b[33;1mПодготовка к настройке сервиса...\x1b[0m');
      terminal.writeln('');

      this.app.toast.appearance = 'progress';
      DOM.queueUpdate(() => (this.app.toast.progress.value = 0));
      this.app.toast.dismissible = false;
      this.app.toast.visible = true;

      let server;

      try {
        server = await this.getServer(this.server.value);
      } catch (e) {
        if (e.status === 404)
          terminal.writeln(
            `\r\n\x1b[31;1mСервер не найден (${e.status || 503})\x1b[0m\r\n`
          );
        else
          terminal.writeln(
            `\r\n\x1b[31;1mОперация завершилась с ошибкой ${
              e.status || 503
            }\x1b[0m\r\n`
          );

        // noinspection ExceptionCaughtLocallyJS
        throw e;
      }

      let cmd = await this[this.type]().cmd?.();

      try {
        assert({
          predicate: !!cmd,
          status: 400
        });
      } catch (e) {
        terminal.writeln(`\r\n\x1b[31;1mКоманды не заданы\x1b[0m\r\n`);

        // noinspection ExceptionCaughtLocallyJS
        throw e;
      }

      const commands = this.commands.value.trim();

      if (commands) cmd = commands + ' ; ' + cmd;

      // Hide potentially sensitive data
      terminal.writeln(
        `\x1b[33m${cmd.replaceAll(
          /echo [a-zA-z0-9+\/=]+ \| base64/gi,
          'echo <hidden base64 content> | base64'
        )}\x1b[0m\r\n`
      );

      cmd += ` && echo '\x1b[32mppp-success\x1b[0m'`;

      // Only for development
      if (location.origin.endsWith('.github.io.dev')) {
        cmd = cmd.replaceAll(
          'salt-call --local',
          'salt-call --local -c /srv/salt'
        );
      }

      server.cmd = cmd;

      const r1 = await fetch(
        new URL(
          'ssh',
          this.app.ppp.keyVault.getKey('service-machine-url')
        ).toString(),
        {
          method: 'POST',
          body: JSON.stringify(server)
        }
      );

      try {
        await this.processChunkedResponse(r1);
        assert(r1);
      } catch (e) {
        terminal.writeln(
          `\r\n\x1b[31;1mОперация завершилась с ошибкой ${
            e.status || 503
          }\x1b[0m\r\n`
        );

        // noinspection ExceptionCaughtLocallyJS
        throw e;
      }

      this.modal.dismissible = true;
      this.modal.visibleChanged = (oldValue, newValue) =>
        !newValue && (this.mode = void 0);

      if (/ppp-success/i.test(this.outputText)) {
        if (this[this.type]().simple)
          await this.app.ppp.user.functions.updateOne(
            {
              collection: 'servers'
            },
            {
              uuid: this.server.value
            },
            { $addToSet: { services: this.type } }
          );

        await this[this.type]().post?.();

        this.app.toast.appearance = 'success';
        this.app.toast.dismissible = true;
        this.toastText = i18n.t('operationDone');
        this.app.toast.visible = true;
      } else {
        invalidate(this.app.toast, {
          errorMessage: i18n.t('operationFailed')
        });
      }
    } catch (e) {
      console.error(e);

      if (this.modal) {
        this.modal.dismissible = true;
        this.modal.visibleChanged = (oldValue, newValue) =>
          !newValue && (this.mode = void 0);
      }

      invalidate(this.app.toast, {
        errorMessage: i18n.t('operationFailed')
      });
    } finally {
      this.busy = false;
    }
  }
}
