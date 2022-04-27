/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { Observable, observable } from './element/observation/observable.js';
import { invalidate, validate } from './validate.js';
import { DOM } from './element/dom.js';
import { FetchError, maybeFetchError } from './fetch-error.js';
import { SUPPORTED_SERVER_TYPES } from './const.js';
import { html, requireComponent } from './template.js';
import { Tmpl } from './tmpl.js';

export class BasePage extends FoundationElement {
  @observable
  busy;

  @observable
  toastTitle;

  @observable
  toastText;

  // noinspection JSUnusedGlobalSymbols
  toastTitleChanged() {
    Observable.notify(this.app.toast, 'source');
  }

  // noinspection JSUnusedGlobalSymbols
  toastTextChanged() {
    Observable.notify(this.app.toast, 'source');
  }

  t(key, options) {
    return this.app.ppp.dict.t(key, options);
  }

  beginOperation(toastTitle = this.header.textContent.trim()) {
    this.busy = true;
    this.toastTitle = toastTitle;
    this.toastText = '';
    this.app.toast.visible = false;
    this.app.toast.source = this;
  }

  progressOperation(progress = 0, toastText = this.toastText) {
    this.app.toast.appearance = 'progress';
    this.toastText = toastText;
    DOM.queueUpdate(() => (this.app.toast.progress.value = progress));
    this.app.toast.dismissible = false;
    this.app.toast.visible = true;
  }

  failOperation(e) {
    console.dir(e);

    if (e.name === 'OperationError') {
      invalidate(this.app.toast, {
        errorMessage: 'Не удалось дешифровать данные. Проверьте мастер-пароль.',
        silent: true
      });
    } else if (e === 404) {
      invalidate(this.app.toast, {
        errorMessage: 'Запись с таким ID не существует.',
        silent: true
      });
    } else if (e?.name === 'ValidationError') {
      invalidate(this.app.toast, {
        errorMessage:
          e?.message ?? 'Форма заполнена некорректно или не полностью.',
        silent: true
      });
    } else if (/E11000/i.test(e?.error)) {
      invalidate(this.app.toast, {
        errorMessage: html`Запись с таким названием уже существует, перейдите по
          <a href="${e.href}">ссылке</a>
          для редактирования.`,
        silent: true
      });
    } else {
      invalidate(this.app.toast, {
        errorMessage: 'Операция не выполнена, подробности в консоли браузера.',
        silent: true
      });
    }
  }

  succeedOperation(toastText = 'Операция успешно выполнена.') {
    this.app.toast.appearance = 'success';
    this.app.toast.dismissible = true;
    this.toastText = toastText;
    this.app.toast.visible = true;
  }

  endOperation() {
    this.busy = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this.app.pageConnected = true;
  }

  async notFound() {
    await requireComponent(
      'ppp-not-found-page',
      `../${this.app.ppp.appType}/${this.app.ppp.theme}/pages/not-found.js`
    );

    this.style.display = 'none';
    this.app.pageNotFound = true;
  }

  async getMongoDBRealmAccessToken() {
    const { access_token: mongoDBRealmAccessToken } = await (
      await fetch(
        new URL(
          'fetch',
          this.app.ppp.keyVault.getKey('service-machine-url')
        ).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: 'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
            body: {
              username: this.app.ppp.keyVault.getKey('mongo-public-key'),
              apiKey: this.app.ppp.keyVault.getKey('mongo-private-key')
            }
          })
        }
      )
    ).json();

    return mongoDBRealmAccessToken;
  }
}

export class PageWithTerminal extends BasePage {
  terminalOutput = '';

  async executeSSHCommand({
    serverId,
    commands,
    commandsToDisplay,
    progress = 0,
    clearTerminal = true
  }) {
    this.busy = false;
    this.terminalModal.visible = true;
    this.progressOperation(progress);

    const terminal = this.terminalDom.terminal;

    if (clearTerminal) {
      terminal.clear();
      terminal.reset();
    }

    terminal.writeInfo('Устанавливается подключение к серверу...\r\n', true);

    let server;

    try {
      server = await this.getServer(serverId);
    } catch (e) {
      if (e.status === 404)
        terminal.writeError(`Сервер не найден (${e.status ?? 503})`);
      else
        terminal.writeError(
          `Операция завершилась с ошибкой ${e.status ?? 503}`
        );

      // noinspection ExceptionCaughtLocallyJS
      throw e;
    }

    if (!commandsToDisplay) commandsToDisplay = commands;

    terminal.writeInfo(commandsToDisplay);
    terminal.writeln('');

    commands += `echo '\x1b[32m\r\nppp-ssh-ok\r\n\x1b[0m'`;

    // Only for development
    if (location.origin.endsWith('.github.io.dev')) {
      commands = commands.replaceAll(
        'salt-call --local',
        'salt-call --local -c /srv/salt'
      );
    }

    server.cmd = commands;

    const rSSH = await fetch(
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
      await this.processChunkedResponse(rSSH);

      if (!rSSH.ok) {
        // noinspection ExceptionCaughtLocallyJS
        throw new FetchError(rSSH);
      }
    } catch (e) {
      terminal.writeError(`Операция завершилась с ошибкой ${e.status ?? 503}`);

      // noinspection ExceptionCaughtLocallyJS
      throw e;
    }

    return /ppp-ssh-ok/i.test(this.terminalOutput);
  }

  async getServer(serverObjectOrId) {
    if (typeof serverObjectOrId === 'object') return serverObjectOrId;

    if (!serverObjectOrId)
      await maybeFetchError({
        ok: false,
        status: 404,
        text: async () => 'Сервер не найден.'
      });

    const server = await this.app.ppp.user.functions.findOne(
      {
        collection: 'servers'
      },
      {
        _id: serverObjectOrId,
        removed: { $not: { $eq: true } }
      }
    );

    await maybeFetchError({
      ok: server !== null,
      status: server !== null ? 200 : 404,
      text: async () => 'Сервер не найден.'
    });

    let result;

    switch (server.type) {
      case SUPPORTED_SERVER_TYPES.PASSWORD:
        result = {
          hostname: server.hostname,
          port: server.port,
          username: server.username,
          password: await this.app.ppp.crypto.decrypt(
            server.iv,
            server.password
          ),
          state: server.state
        };

        break;

      case SUPPORTED_SERVER_TYPES.KEY: {
        result = {
          hostname: server.hostname,
          port: server.port,
          username: server.username,
          privateKey: await this.app.ppp.crypto.decrypt(
            server.iv,
            server.privateKey
          ),
          state: server.state
        };
      }
    }

    return result;
  }

  async readChunk(reader, decoder) {
    const result = await reader.read();
    const chunk = decoder.decode(result.value || new Uint8Array(), {
      stream: !result.done
    });

    if (chunk.length) {
      const string = chunk.toString();

      this.terminalOutput += string;

      // Error message
      if (string.startsWith('{"e"'))
        try {
          this.terminalDom.terminal.write(
            '\x1b[31m' + JSON.parse(string).e.message + '\x1b[0m\r\n'
          );
        } catch (e) {
          this.terminalDom.terminal.write(string);
        }
      else this.terminalDom.terminal.write(string);
    }

    if (!result.done) {
      return this.readChunk(reader, decoder);
    }
  }

  async processChunkedResponse(response) {
    this.terminalOutput = '';

    return this.readChunk(response.body.getReader(), new TextDecoder());
  }
}

export class PageWithTable extends BasePage {
  @observable
  columns;

  @observable
  rows;

  @observable
  table;

  constructor() {
    super();

    this.rows = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    this.beginOperation();

    try {
      this.rows = await this.data();
    } catch (e) {
      this.rows = [];

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async simpleRemove(collection, _id) {
    this.beginOperation('Удаление записи');

    try {
      // {matchedCount: 1, modifiedCount: 1}
      const result = await this.app.ppp.user.functions.updateOne(
        {
          collection
        },
        {
          _id
        },
        {
          $set: { removed: true }
        }
      );

      if (result.matchedCount === 1) {
        this.table.rows.splice(
          this.table.rows.findIndex((r) => r.datum._id === _id),
          1
        );

        Observable.notify(this.table, 'rows');

        this.succeedOperation();
      } else {
        this.failOperation(result);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export class ServicePage extends PageWithTerminal {
  @observable
  service;

  async checkPresence() {
    const serviceId = this.app.params()?.service;

    if (serviceId) {
      this.service = await this.app.ppp.user.functions.findOne(
        {
          collection: 'services'
        },
        {
          _id: serviceId,
          type: this.type
        }
      );

      if (!this.service) {
        this.failOperation(404);

        await this.notFound();

        return null;
      }

      return this.service;
    }
  }
}

export class ServiceWithSecretsPage extends ServicePage {
  @observable
  secrets;

  async addSecret() {
    const value = '';

    if (!this.secrets) this.secrets = [value];
    else this.secrets.push(value);
  }

  async getEncryptedSecrets(iv) {
    const encryptedSecrets = [];

    for (const domSecret of this.domSecrets) {
      await validate(domSecret);

      encryptedSecrets.push(
        await this.app.ppp.crypto.encrypt(iv, domSecret.value.trim())
      );
    }

    return encryptedSecrets;
  }
}

export class SystemdServicePage extends ServiceWithSecretsPage {
  @observable
  servers;
}

export class SystemdTimerPage extends PageWithTerminal {
  @observable
  service;

  @observable
  servers;

  async restart() {
    this.beginOperation('Перезапуск сервиса');

    try {
      const commands = [
        `sudo systemctl restart ppp@${this.service._id}.timer &&`
      ].join(' ');

      const ok = await this.executeSSHCommand({
        serverId: this.service.serverId,
        commands,
        commandsToDisplay: commands
      });

      if (ok) {
        this.service.state = 'active';
        Observable.notify(this, 'service');

        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'services'
          },
          {
            _id: this.service._id
          },
          {
            $set: {
              state: 'active',
              updatedAt: new Date()
            }
          }
        );

        this.succeedOperation();
      } else {
        this.failOperation(520);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }

  async stop() {
    this.beginOperation('Остановка сервиса');

    try {
      const commands = [
        `sudo systemctl stop ppp@${this.service._id}.timer &&`
      ].join(' ');

      const ok = await this.executeSSHCommand({
        serverId: this.service.serverId,
        commands,
        commandsToDisplay: commands
      });

      if (ok) {
        this.service.state = 'stopped';
        Observable.notify(this, 'service');

        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'services'
          },
          {
            _id: this.service._id
          },
          {
            $set: {
              state: 'stopped',
              updatedAt: new Date()
            }
          }
        );

        this.succeedOperation();
      } else {
        this.failOperation(520);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }

  async remove() {
    // TODO
  }
}

export class SystemdTimerWithSupabasePage extends SystemdTimerPage {
  @observable
  apis;

  getSQLUrl(file) {
    const origin = window.location.origin;
    let scriptUrl = new URL(`sql/${file}`, origin).toString();

    if (origin.endsWith('github.io'))
      scriptUrl = new URL(`ppp/sql/${file}`, origin).toString();

    return scriptUrl;
  }

  getConnectionString(api) {
    const { hostname } = new URL(api.url);

    return `postgres://${api.user}:${encodeURIComponent(
      api.password
    )}@db.${hostname}:${api.port}/${api.db}`;
  }

  async remove(sqlFile) {
    this.beginOperation('Удаление сервиса');

    try {
      const commands = [
        `sudo systemctl disable ppp@${this.service._id}.service ;`,
        `sudo systemctl disable ppp@${this.service._id}.timer ;`,
        `sudo systemctl stop ppp@${this.service._id}.timer ;`,
        `sudo rm -f /etc/systemd/system/ppp@${this.service._id}.service ;`,
        `sudo rm -f /etc/systemd/system/ppp@${this.service._id}.timer ;`,
        'sudo systemctl daemon-reload && sudo systemctl reset-failed && '
      ].join(' ');

      let server;

      try {
        server = await this.getServer(this.service.serverId);
      } catch (e) {
        const terminal = this.terminalDom.terminal;

        if (e.status === 404)
          terminal.writeError(`Сервер не найден (${e.status ?? 503})`);
        else
          terminal.writeError(
            `Операция завершилась с ошибкой ${e.status ?? 503}`
          );

        server = null;
      }

      let ok;

      try {
        ok = await this.executeSSHCommand({
          serverId: server,
          commands,
          commandsToDisplay: commands
        });
      } catch (e) {
        // The server is screwed up, it is ok to remove it
        ok = true;
        server = null;
      }

      if (ok || server === null || server.state === 'failed') {
        const api = Object.assign(
          {},
          this.apis.find((a) => a._id === this.service.apiId)
        );

        api.password = await this.app.ppp.crypto.decrypt(api.iv, api.password);

        const queryRequest = await fetch(this.getSQLUrl(sqlFile));

        const rRemovalSQL = await fetch(
          new URL(
            'pg',
            this.app.ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: await new Tmpl().render(this, await queryRequest.text(), {
                serviceId: this.service._id
              }),
              connectionString: this.getConnectionString(api)
            })
          }
        );

        await maybeFetchError(rRemovalSQL);

        this.service.removed = true;
        this.service.state = 'stopped';
        Observable.notify(this, 'service');

        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'services'
          },
          {
            _id: this.service._id
          },
          {
            $set: {
              state: 'stopped',
              removed: true,
              updatedAt: new Date()
            }
          }
        );

        this.succeedOperation();
      } else {
        this.failOperation(520);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }
}
