/** @decorator */

import { BasePage } from '../../lib/page/page.js';
import { validate, invalidate } from '../../lib/validate.js';
import { attr } from '../../lib/element/components/attributes.js';
import { generateIV, bufferToString } from '../../lib/ppp-crypto.js';
import { DOM } from '../../lib/element/dom.js';
import { requireComponent } from '../../lib/template.js';
import { later } from '../../lib/later.js';
import { assert } from '../../lib/assert.js';

await i18nImport(['validation']);

export const SUPPORTED_SERVER_TYPES = {
  PASSWORD: 'password',
  KEY: 'key'
};

export class NewServerPage extends BasePage {
  @attr
  type;

  @attr
  mode;

  #outputText = '';

  async #readChunk(reader, decoder) {
    const result = await reader.read();
    const chunk = decoder.decode(result.value || new Uint8Array(), {
      stream: !result.done
    });

    if (chunk.length) {
      const string = chunk.toString();

      this.#outputText += string;

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
      return this.#readChunk(reader, decoder);
    }
  }

  async #processChunkedResponse(response) {
    return this.#readChunk(response.body.getReader(), new TextDecoder());
  }

  async createServer() {
    try {
      this.#outputText = '';
      this.busy = true;
      this.app.toast.visible = false;
      this.app.toast.source = this;
      this.toastTitle = i18n.t('$pages.newServer.toast.title');
      this.toastText = '';

      await validate(this.serverName);
      await validate(this.host);
      await validate(this.port);
      await validate(this.userName);

      switch (this.type) {
        case SUPPORTED_SERVER_TYPES.PASSWORD:
          await validate(this.password);

          break;
        case SUPPORTED_SERVER_TYPES.KEY:
          await validate(this.key);

          break;
      }

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
      terminal.writeln('\x1b[33;1mПодготовка к настройке сервера...\x1b[0m');
      terminal.writeln('');

      this.app.toast.appearance = 'progress';
      DOM.queueUpdate(() => (this.app.toast.progress.value = 0));
      this.app.toast.dismissible = false;
      this.app.toast.visible = true;

      const repoUrl = `https://github.com/${this.app.ppp.keyVault.getKey(
        'github-login'
      )}/ppp.git`;

      // TODO - add apt-get support
      const cmd = [
        'sudo rm -f /etc/yum.repos.d/salt.repo ;',
        'sudo dnf -y install git python3-devel libffi-devel tar openssl openssl-devel ;',
        'sudo dnf -y remove cmake ;',
        'sudo dnf -y group install "Development Tools" ;',
        'wget https://github.com/Kitware/CMake/releases/download/v3.21.3/cmake-3.21.3-linux-$(uname -m).tar.gz -O cmake-3.21.3-linux-$(uname -m).tar.gz ;',
        'tar xzf cmake-3.21.3-linux-$(uname -m).tar.gz ;',
        'sudo ln -fs ~/cmake-3.21.3-linux-$(uname -m)/bin/cmake /usr/bin/cmake ;',
        'wget https://github.com/libgit2/libgit2/archive/refs/tags/v1.3.0.tar.gz -O libgit2-1.3.0.tar.gz ;',
        'tar xzf libgit2-1.3.0.tar.gz ;',
        'cd libgit2-1.3.0/ ; cmake . ; make -j$(nproc); sudo make install ;',
        'sudo -H python3 -m pip install --upgrade pip setuptools wheel ;',
        'sudo -H python3 -m pip install --upgrade --force-reinstall cffi ;',
        'sudo -H python3 -m pip install --upgrade --force-reinstall pygit2 ;',
        'sudo ln -fs /usr/local/lib64/libgit2.so.1.3 /usr/lib64/libgit2.so.1.3 ; ',
        'curl -L https://bootstrap.saltproject.io | sudo sh -s --',
        '-D -x python3 -X -j',
        JSON.stringify(
          JSON.stringify({
            backend: 'requests',
            file_client: 'local',
            pillar_opts: true,
            gitfs_remotes: [repoUrl],
            ext_pillar: [
              {
                git: [
                  {
                    [`main ${repoUrl}`]: [{ root: 'salt/pillar' }]
                  }
                ]
              }
            ],
            gitfs_provider: 'pygit2',
            gitfs_root: 'salt/states',
            gitfs_base: 'main',
            fileserver_backend: ['git']
          })
        ) + ' ;',
        'sudo -H python3 -m pip install --upgrade --ignore-installed --force-reinstall salt ;',
        'sudo ln -fs /usr/local/bin/salt-call /usr/bin/salt-call ;',
        'sudo systemctl stop salt-minion && sudo systemctl disable salt-minion ;',
        'sudo salt-call --local state.sls ping'
      ].join(' ');

      terminal.writeln(`\x1b[33m${cmd}\x1b[0m\r\n`);

      let body;

      switch (this.type) {
        case SUPPORTED_SERVER_TYPES.PASSWORD:
          body = JSON.stringify({
            host: this.host.value.trim(),
            port: this.port.value.trim(),
            cmd,
            username: this.userName.value.trim(),
            password: this.password.value.trim()
          });

          break;

        case SUPPORTED_SERVER_TYPES.KEY: {
          body = JSON.stringify({
            host: this.host.value.trim(),
            port: this.port.value.trim(),
            cmd,
            username: this.userName.value.trim(),
            privateKey: this.key.value.trim()
          });
        }
      }

      const r1 = await fetch(
        new URL(
          'ssh',
          this.app.ppp.keyVault.getKey('service-machine-url')
        ).toString(),
        {
          method: 'POST',
          body
        }
      );

      try {
        await this.#processChunkedResponse(r1);
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

      if (/Succeeded: 1/i.test(this.#outputText)) {
        const iv = generateIV();
        let payload;

        switch (this.type) {
          case SUPPORTED_SERVER_TYPES.PASSWORD:
            const encryptedPassword = await this.app.ppp.crypto.encrypt(
              iv,
              this.password.value.trim()
            );

            payload = {
              _id: this.serverName.value.trim(),
              type: this.type,
              host: this.host.value.trim(),
              port: this.port.value.trim(),
              iv: bufferToString(iv),
              username: this.userName.value.trim(),
              password: encryptedPassword,
              created_at: new Date()
            };

            break;
          case SUPPORTED_SERVER_TYPES.KEY:
            const encryptedKey = await this.app.ppp.crypto.encrypt(
              iv,
              this.key.value.trim()
            );

            payload = {
              _id: this.serverName.value.trim(),
              type: this.type,
              host: this.host.value.trim(),
              port: this.port.value.trim(),
              iv: bufferToString(iv),
              username: this.userName.value.trim(),
              key: encryptedKey,
              created_at: new Date()
            };

            break;
        }

        await this.app.ppp.user.functions.insertOne(
          {
            collection: 'servers'
          },
          payload
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
    } catch (e) {
      this.busy = false;
      console.error(e);

      this.modal.dismissible = true;
      this.modal.visibleChanged = (oldValue, newValue) =>
        !newValue && (this.mode = void 0);

      if (/E11000/i.test(e.error)) {
        invalidate(this.app.toast, {
          errorMessage: 'Сервер с таким названием уже существует'
        });
      } else {
        invalidate(this.app.toast, {
          errorMessage: i18n.t('operationFailed')
        });
      }
    }
  }

  typeChanged(oldValue, newValue) {
    this.app.navigate(
      this.app.url({
        page: this.app.params().page,
        type: newValue || void 0
      })
    );
  }

  #onPopState() {
    this.type = this.app.params()?.type;
  }

  connectedCallback() {
    super.connectedCallback();
    this._onPopState = this.#onPopState.bind(this);

    window.addEventListener('popstate', this._onPopState, {
      passive: true
    });

    const type = this.app.params()?.type;

    if (Object.values(SUPPORTED_SERVER_TYPES).indexOf(type) === -1)
      return this.app.navigate(this.app.url({ page: this.app.params().page }));

    this.type = type;
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('popstate', this._onPopState, {
      passive: true
    });

    this.type = void 0;
  }
}
