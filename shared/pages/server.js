/** @decorator */

import { PageWithTerminal } from '../page.js';
import { validate } from '../validate.js';
import { generateIV, bufferToString } from '../ppp-crypto.js';
import { SUPPORTED_SERVER_TYPES, SUPPORTED_SERVICES } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
import { requireComponent } from '../template.js';

export class ServerPage extends PageWithTerminal {
  @observable
  server;

  async connectedCallback() {
    super.connectedCallback();

    const serverId = this.app.params()?.server;

    if (serverId) {
      this.beginOperation();

      try {
        this.server = await this.app.ppp.user.functions.findOne(
          {
            collection: 'servers'
          },
          {
            _id: serverId
          }
        );

        if (!this.server) {
          this.failOperation(404);
          await this.notFound();
        } else {
          if (this.server.type === SUPPORTED_SERVER_TYPES.PASSWORD)
            this.server.password = await this.app.ppp.crypto.decrypt(
              this.server.iv,
              this.server.password
            );
          else if (this.server.type === SUPPORTED_SERVER_TYPES.KEY)
            this.server.privateKey = await this.app.ppp.crypto.decrypt(
              this.server.iv,
              this.server.privateKey
            );

          Observable.notify(this, 'server');
        }
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    } else if (
      Object.values(SUPPORTED_SERVER_TYPES).indexOf(this.app.params().type) ===
      -1
    ) {
      await this.notFound();
    }
  }

  handleFileSelection(c) {
    const reader = new FileReader();

    reader.readAsText(c.event.target.files[0], 'UTF-8');

    reader.onload = (readerEvent) => {
      this.privateKey.value = readerEvent.target.result.trim();
    };
  }

  loadPrivateKey() {
    this.fileInput.click();
  }

  async setupServer() {
    this.beginOperation();

    try {
      await validate(this.serverName);
      await validate(this.hostname);
      await validate(this.port);
      await validate(this.userName);

      const iv = generateIV();
      let serverType = this.app.params().type;

      if (this.server) serverType = this.server.type;

      if (serverType === SUPPORTED_SERVER_TYPES.PASSWORD) {
        await validate(this.password);
      }

      if (serverType === SUPPORTED_SERVER_TYPES.KEY) {
        await validate(this.privateKey);
      }

      let serverId = this.server?._id;

      if (!this.server) {
        const existingServer = await this.app.ppp.user.functions.findOne(
          {
            collection: 'servers'
          },
          {
            removed: { $not: { $eq: true } },
            name: this.serverName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingServer) {
          return this.failOperation({
            href: `?page=server&server=${existingServer._id}`,
            error: 'E11000'
          });
        } else {
          const insertPayload = {
            name: this.serverName.value.trim(),
            state: 'failed',
            type: serverType,
            hostname: this.hostname.value.trim(),
            port: this.port.value.trim(),
            username: this.userName.value.trim(),
            version: 1,
            iv: bufferToString(iv),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          if (serverType === SUPPORTED_SERVER_TYPES.PASSWORD) {
            insertPayload.password = await this.app.ppp.crypto.encrypt(
              iv,
              this.password.value.trim()
            );
          } else if (serverType === SUPPORTED_SERVER_TYPES.KEY) {
            insertPayload.privateKey = await this.app.ppp.crypto.encrypt(
              iv,
              this.privateKey.value.trim()
            );
          }

          const { insertedId } = await this.app.ppp.user.functions.insertOne(
            {
              collection: 'servers'
            },
            insertPayload
          );

          serverId = insertedId;
        }
      }

      this.busy = false;
      this.terminalModal.visible = true;

      this.progressOperation(0);

      const repoUrl = `https://github.com/${this.app.ppp.keyVault.getKey(
        'github-login'
      )}/ppp.git`;
      const minionConfiguration = `backend: requests
ext_pillar:
  - git:
    - main ${repoUrl}:
      - root: salt/pillar
file_client: local
fileserver_backend:
  - git
gitfs_base: main
gitfs_provider: pygit2
gitfs_remotes:
  - ${repoUrl}
gitfs_root: salt/states
gitfs_global_lock: False
git_pillar_global_lock: False
pillar_opts: true
`;

      let commands = [
        'sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm ;',
        'sudo rm -f /etc/yum.repos.d/salt.repo ;',
        'sudo mkdir -p /etc/salt ;',
        'sudo dnf -y install epel-release wget git python3 python3-devel libffi-devel tar openssl openssl-devel ;',
        'sudo dnf -y remove cmake ;',
        'sudo dnf -y group install "Development Tools" ;',
        'wget https://github.com/Kitware/CMake/releases/download/v3.21.3/cmake-3.21.3-linux-$(uname -m).tar.gz -O cmake-3.21.3-linux-$(uname -m).tar.gz ;',
        'tar xzf cmake-3.21.3-linux-$(uname -m).tar.gz ;',
        'sudo ln -fs ~/cmake-3.21.3-linux-$(uname -m)/bin/cmake /usr/bin/cmake ;',
        'wget https://github.com/libgit2/libgit2/archive/refs/tags/v1.3.0.tar.gz -O libgit2-1.3.0.tar.gz ;',
        'tar xzf libgit2-1.3.0.tar.gz ;',
        'cd libgit2-1.3.0/ ; cmake . ; make -j$(nproc); sudo make install ;',
        'sudo -H python3 -m pip install --upgrade pip setuptools wheel six ;',
        'sudo dnf -y reinstall python3-six ;',
        'sudo -H python3 -m pip install --upgrade --force-reinstall cffi ;',
        'sudo -H python3 -m pip install --upgrade --force-reinstall pygit2 ;',
        'sudo ln -fs /usr/local/lib64/libgit2.so.1.3 /usr/lib64/libgit2.so.1.3 ; ',
        'sudo -H python3 -m pip install --upgrade --ignore-installed --force-reinstall salt ;',
        'sudo rm -f /etc/salt/minion ;',
        `sudo sh -c "echo '${minionConfiguration}' >> /etc/salt/minion" ;`,
        'sudo ln -fs /usr/local/bin/salt-call /usr/bin/salt-call ;',
        'sudo salt-call --local state.sls ping && '
      ].join(' ');

      const extraCommands = this.extraCommands.value.trim();

      if (extraCommands) commands = extraCommands + ' ; ' + commands;

      const ok = await this.executeSSHCommand({
        serverId: {
          hostname: this.hostname.value.trim(),
          port: this.port.value.trim(),
          username: this.userName.value.trim(),
          password: this.password?.value.trim(),
          privateKey: this.privateKey?.value.trim()
        },
        commands,
        commandsToDisplay: commands
      });

      const updatePayload = {
        name: this.serverName.value.trim(),
        state: ok ? 'ok' : 'failed',
        version: 1,
        updatedAt: new Date(),
        hostname: this.hostname.value.trim(),
        port: this.port.value.trim(),
        username: this.userName.value.trim(),
        iv: bufferToString(iv)
      };

      if (serverType === SUPPORTED_SERVER_TYPES.PASSWORD) {
        updatePayload.password = await this.app.ppp.crypto.encrypt(
          iv,
          this.password.value.trim()
        );
      } else if (serverType === SUPPORTED_SERVER_TYPES.KEY) {
        updatePayload.privateKey = await this.app.ppp.crypto.encrypt(
          iv,
          this.privateKey.value.trim()
        );
      }

      await this.app.ppp.user.functions.updateOne(
        {
          collection: 'servers'
        },
        {
          _id: serverId
        },
        {
          $set: updatePayload
        }
      );

      if (ok) {
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

  async handleNewDomainClick() {
    await requireComponent('ppp-modal');

    this.newDomainModal.visible = true;
  }

  async addDomains() {
    this.beginOperation('Добавление доменов');

    try {
      await validate(this.certbotEmail);
      await validate(this.certbotDomains);

      const domains = this.certbotDomains.value
        .trim()
        .split(',')
        .map((d) => d.trim());

      const commands = [
        'sudo salt-call --local state.sls epel ;',
        'sudo firewall-cmd --permanent --add-port=80/tcp ;',
        'sudo firewall-cmd --permanent --add-port=443/tcp ;',
        'sudo firewall-cmd --reload ;',
        'sudo dnf -y install certbot ;',
        domains
          .map(
            (d) =>
              `sudo certbot certonly --standalone --non-interactive --agree-tos -m ${this.certbotEmail.value} -d ${d} `
          )
          .join('&& ') + ' &&',
        'sudo systemctl enable certbot-renew.timer &&',
        'sudo systemctl restart certbot-renew.timer && '
      ].join(' ');

      const ok = await this.executeSSHCommand({
        serverId: this.server,
        commands,
        commandsToDisplay: commands
      });

      if (ok) {
        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'servers'
          },
          {
            _id: this.server._id
          },
          {
            $addToSet: {
              domains: {
                $each: domains
              }
            }
          }
        );

        if (!this.server.domains) this.server.domains = [];

        domains.forEach((d) => {
          if (this.server.domains.indexOf(d) === -1)
            this.server.domains.push(d);
        });

        Observable.notify(this, 'server');
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

  async removeDomain(domain) {
    this.beginOperation('Удаление домена');

    try {
      if (this.server.domains?.length) {
        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'servers'
          },
          {
            _id: this.server._id
          },
          {
            $pull: {
              domains: {
                $in: [domain]
              }
            }
          }
        );

        this.server.domains.splice(this.server.domains.indexOf(domain), 1);
        Observable.notify(this, 'server');
        this.succeedOperation();
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
