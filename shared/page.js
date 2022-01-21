/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { Observable, observable } from './element/observation/observable.js';
import { invalidate } from './validate.js';
import { DOM } from './element/dom.js';
import { maybeFetchError } from './fetch-error.js';
import { SUPPORTED_SERVER_TYPES } from './const.js';
import { assert } from './assert.js';
import { requireComponent } from './template.js';

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
        errorMessage: 'Запись с таким названием уже существует.',
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

      assert(rSSH);
    } catch (e) {
      terminal.writeError(`Операция завершилась с ошибкой ${e.status ?? 503}`);

      // noinspection ExceptionCaughtLocallyJS
      throw e;
    }

    return /ppp-ssh-ok/i.test(this.terminalOutput);
  }

  async getServer(serverObjectOrId) {
    if (typeof serverObjectOrId === 'object')
      return serverObjectOrId;

    const server = await this.app.ppp.user.functions.findOne(
      {
        collection: 'servers'
      },
      {
        _id: serverObjectOrId
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
          )
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
          )
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
