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
import { SUPPORTED_SERVER_TYPES } from '../new-server/new-server-page.js';

await i18nImport(['validation']);

export const SUPPORTED_SERVICES = {
  NETDATA: 'netdata'
};

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

  #outputText = '';

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

  async fetchServers() {
    try {
      this.fetching = true;

      this.app.toast.source = this;
      this.toastTitle = 'Загрузка списка серверов';

      this.servers = await this.app.ppp.user.functions.find({
        collection: 'servers'
      });

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

  async getServer(uuid) {
    const server = await this.app.ppp.user.functions.findOne(
      {
        collection: 'servers'
      },
      {
        uuid
      }
    );

    assert({
      predicate: server !== null,
      status: 404
    });

    let body;

    switch (server.type) {
      case SUPPORTED_SERVER_TYPES.PASSWORD:
        body = {
          host: server.host,
          port: server.port,
          username: server.username,
          password: await this.app.ppp.crypto.decrypt(
            server.iv,
            server.password
          )
        };

        break;

      case SUPPORTED_SERVER_TYPES.KEY: {
        body = {
          host: server.host,
          port: server.port,
          username: server.username,
          privateKey: await this.app.ppp.crypto.decrypt(server.iv, server.key)
        };
      }
    }

    return body;
  }

  async setupNetdataService(uuid) {
    const terminal = this.terminalDom.terminal;
    // Strip development suffix off
    const origin = window.location.origin;
    let scriptUrl = new URL('vendor/netdata/kickstart.sh', origin).toString();

    if (origin.endsWith('github.io.dev'))
      scriptUrl = new URL(
        'ppp/vendor/netdata/kickstart.sh',
        origin.split('.dev')[0]
      ).toString();

    let cmd = [
      'sudo sh -c "echo 1 >/sys/kernel/mm/ksm/run" ;',
      'sudo sh -c "echo 1000 >/sys/kernel/mm/ksm/sleep_millisecs" ;',
      'sudo dnf -y install dnf-plugins-core ;',
      'sudo dnf -y config-manager --set-enabled powertools ;',
      'sudo dnf -y config-manager --set-enabled PowerTools ;',
      'sudo dnf -y config-manager --set-enabled ol8_codeready_builder ;',
      'sudo dnf -y install epel-release ;',
      'sudo dnf -y install libuv libuv-devel libuuid libuuid-devel;',
      `bash <(curl -Ss ${scriptUrl}) --dont-wait`
    ].join(' ');

    const commands = this.commands.value.trim();

    if (commands) cmd = commands + ' ; ' + cmd;

    terminal.writeln(`\x1b[33m${cmd}\x1b[0m\r\n`);

    cmd += ` && echo '\x1b[32mppp-success\x1b[0m'`;

    let serverBody;

    try {
      serverBody = await this.getServer(uuid);
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

    serverBody.cmd = cmd;

    const r1 = await fetch(
      new URL(
        'ssh',
        this.app.ppp.keyVault.getKey('service-machine-url')
      ).toString(),
      {
        method: 'POST',
        body: JSON.stringify(serverBody)
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
          uuid
        },
        { $addToSet: { services: 'netdata' } }
      );

      this.app.toast.appearance = 'success';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationDone');
      this.app.toast.visible = true;
    } else {
      invalidate(this.app.toast, {
        errorMessage: i18n.t('operationFailed')
      });
    }
  }

  async setupService() {
    try {
      this.#outputText = '';
      this.busy = true;
      this.app.toast.visible = false;
      this.app.toast.source = this;
      this.toastTitle = 'Настройка сервиса';
      this.toastText = '';

      await validate(this.server);

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

      switch (this.service) {
        case SUPPORTED_SERVICES.NETDATA:
          await this.setupNetdataService(this.server.value);

          break;
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

  #onPopState() {
    this.service = this.app.params()?.service;
  }
}
