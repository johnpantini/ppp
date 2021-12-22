/** @decorator */

import { FoundationElement } from '../foundation-element/foundation-element.js';
import { Observable, observable } from '../element/observation/observable.js';
import { assert } from '../assert.js';
import { SUPPORTED_SERVER_TYPES } from '../const.js';

export class BasePage extends FoundationElement {
  @observable
  busy;

  @observable
  toastTitle;

  @observable
  toastText;

  outputText = '';

  toastTitleChanged() {
    Observable.notify(this.app.toast, 'source');
  }

  toastTextChanged() {
    Observable.notify(this.app.toast, 'source');
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

    let result;

    switch (server.type) {
      case SUPPORTED_SERVER_TYPES.PASSWORD:
        result = {
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
        result = {
          host: server.host,
          port: server.port,
          username: server.username,
          privateKey: await this.app.ppp.crypto.decrypt(server.iv, server.key)
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

      this.outputText += string;

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
    return this.readChunk(response.body.getReader(), new TextDecoder());
  }

  constructor() {
    super();

    Array.isArray(this.constructor.i18n) &&
      void i18nImport(this.constructor.i18n);
  }

  connectedCallback() {
    super.connectedCallback();

    this.app.pageConnected = true;
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

    this.busy = true;
    this.app.toast.source = this;
    this.toastTitle = 'Загрузка таблицы';

    try {
      this.rows = await this.data();
    } catch (e) {
      console.error(e);

      this.rows = [];

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.status || 503
      });
      this.app.toast.visible = true;
    } finally {
      this.busy = false;
    }
  }

  async removeDocument({ collection }, filter = {}) {
    this.busy = true;
    this.app.toast.source = this;
    this.toastTitle = 'Удаление';

    try {
      const deletion = await this.app.ppp.user.functions.deleteOne(
        {
          collection
        },
        filter
      );

      if (deletion.deletedCount > 0) {
        this.table.rows.splice(
          this.table.rows.findIndex((r) => r.datum._id === filter._id),
          1
        );

        Observable.notify(this.table, 'rows');

        this.app.toast.appearance = 'success';
        this.toastText = i18n.t('operationDone');
      } else {
        console.log(deletion);

        this.app.toast.appearance = 'warning';
        this.toastText = i18n.t('operationFailed');
      }

      this.app.toast.dismissible = true;
      this.app.toast.visible = true;
      this.busy = false;
    } catch (e) {
      console.dir(e);

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.statusCode || 503
      });
      this.app.toast.visible = true;
    } finally {
      this.busy = false;
    }
  }
}
