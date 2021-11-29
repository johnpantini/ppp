/** @decorator */

import { BasePage } from '../../lib/page/page.js';
import { attr } from '../../lib/element/components/attributes.js';
import {
  Observable,
  observable
} from '../../lib/element/observation/observable.js';
import { validate, invalidate } from '../../lib/validate.js';
import { requireComponent } from '../../lib/template.js';
import { later } from '../../lib/later.js';
import { assert } from '../../lib/assert.js';
import { DOM } from '../../lib/element/dom.js';
import { SUPPORTED_SERVICES } from '../../lib/const.js';

await i18nImport(['validation']);

export class ServicesPage extends BasePage {
  @attr
  activeid;

  @attr
  service;

  @attr
  mode;

  @observable
  fetching;

  @observable
  servers;

  #pageChangedHandler;

  [SUPPORTED_SERVICES.NETDATA]() {
    return {
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
      pre: async () => {
        await validate(this.email);
        await validate(this.domains);
      },
      cmd: async () => {
        const domains = this.domains.value
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
                $each: this.domains.value
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

  #onPopState() {
    this.service = this.app.params()?.service;
  }

  constructor(props) {
    super(props);

    const that = this;

    this.#pageChangedHandler = {
      handleChange(source, propertyName) {
        if (source[propertyName] === 'services' && that.service) {
          that.service = void 0;
          that.mode = void 0;
        }
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    const service = this.app.params()?.service;

    if (service && Object.values(SUPPORTED_SERVICES).indexOf(service) === -1)
      this.app.navigate(this.app.url({ page: this.app.params().page }));

    this.service = service;

    Observable.getNotifier(this.app).subscribe(
      this.#pageChangedHandler,
      'page'
    );

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

    Observable.getNotifier(this.app).unsubscribe(
      this.#pageChangedHandler,
      'page'
    );

    window.removeEventListener('popstate', this._onPopState, {
      passive: true
    });

    this.service = void 0;
    this.servers = void 0;
  }

  serviceChanged(oldValue, newValue) {
    const params = this.app.params();

    this.app.navigate(
      this.app.url({
        ...params,
        service: newValue || void 0
      })
    );

    if (Object.values(SUPPORTED_SERVICES).indexOf(this.service) > -1)
      void this.fetchServers();
  }

  async fetchServers() {
    try {
      this.fetching = true;

      this.app.toast.source = this;
      this.toastTitle = 'Загрузка списка серверов';

      this.servers = await this.app.ppp.user.functions.find({
        collection: 'servers'
      });

      if (!this.servers.length) this.servers = void 0;

      this.fetching = false;
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

  async setupService() {
    try {
      this.outputText = '';
      this.busy = true;
      this.app.toast.visible = false;
      this.app.toast.source = this;
      this.toastTitle = 'Настройка сервиса';
      this.toastText = '';

      await validate(this.server);
      await this[this.service]().pre?.();

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

      let cmd = await this[this.service]().cmd?.();

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

      terminal.writeln(`\x1b[33m${cmd}\x1b[0m\r\n`);

      cmd += ` && echo '\x1b[32mppp-success\x1b[0m'`;

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
        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'servers'
          },
          {
            uuid: this.server.value
          },
          { $addToSet: { services: this.service } }
        );

        await this[this.service]().post?.();

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
