import { Page, PageWithSSHTerminal, PageWithShiftLock } from './page.js';
import { validate } from './validate.js';
import { SERVER_STATE, SERVER_TYPES } from './const.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { requireComponent } from './template.js';
import { Observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class ServerPage extends Page {
  collection = 'servers';

  loadPrivateKey() {
    this.fileInput.click();
  }

  handleFileSelection({ event }) {
    const reader = new FileReader();

    reader.readAsText(event.target.files[0], 'UTF-8');

    reader.onload = (readerEvent) => {
      this.key.value = readerEvent.target.result.trim();
    };
  }

  async #deploy() {
    const repoUrl = `https://github.com/${ppp.keyVault.getKey(
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
      'sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-$(rpm -q --provides $(rpm -q --whatprovides "system-release(releasever)") | grep "system-release(releasever)" | cut -d " " -f 3).noarch.rpm ;',
      'sudo rm -f /etc/yum.repos.d/salt.repo ;',
      'sudo mkdir -p /etc/salt ;',
      'sudo dnf -y install epel-release ;',
      'sudo dnf -y install wget git python3-pip python3-devel libffi-devel tar openssl openssl-devel ;',
      'sudo dnf -y remove cmake ;',
      'sudo dnf -y group install "Development Tools" ;',
      'wget https://github.com/Kitware/CMake/releases/download/v3.25.1/cmake-3.25.1-linux-$(uname -m).tar.gz -O cmake-3.25.1-linux-$(uname -m).tar.gz ;',
      'tar xzf cmake-3.25.1-linux-$(uname -m).tar.gz ;',
      'sudo ln -fs ~/cmake-3.25.1-linux-$(uname -m)/bin/cmake /usr/bin/cmake ;',
      'wget https://github.com/libgit2/libgit2/archive/refs/tags/v1.5.0.tar.gz -O libgit2-1.5.0.tar.gz ;',
      'tar xzf libgit2-1.5.0.tar.gz ;',
      'cd libgit2-1.5.0/ ; cmake . ; make -j$(nproc); sudo make install ;',
      'sudo -H python3 -m pip install --upgrade pip setuptools wheel six ;',
      'sudo dnf -y reinstall python3-six ;',
      'sudo -H python3 -m pip install --upgrade --force-reinstall cffi==1.15.1 ;',
      'sudo -H python3 -m pip install --upgrade --force-reinstall pygit2 ;',
      'sudo ln -fs /usr/local/lib64/libgit2.so.1.5 /usr/lib64/libgit2.so.1.5 ; ',
      'sudo -H python3 -m pip install --upgrade --ignore-installed --force-reinstall salt ;',
      'sudo -H python3 -m pip install --upgrade --ignore-installed --force-reinstall jinja2==3.1.2 ;',
      'sudo rm -f /etc/salt/minion ;',
      `sudo sh -c "echo '${minionConfiguration}' >> /etc/salt/minion" ;`,
      'sudo ln -fs /usr/local/bin/salt-call /usr/bin/salt-call ;',
      'sudo salt-call --local state.sls epel ;',
      'sudo salt-call --local state.sls ping && '
    ].join(' ');

    const extraCommands = this.extraCommands.value.trim();

    if (extraCommands) commands = extraCommands + ' ; ' + commands;

    if (
      !(await this.executeSSHCommands({
        server: this.document,
        commands,
        commandsToDisplay: commands
      }))
    ) {
      throw new Error('Не удалось настроить сервер.');
    }
  }

  async validate() {
    await validate(this.name);
    await validate(this.hostname);
    await validate(this.port);
    await validate(this.username);

    if (this.authType.value === SERVER_TYPES.KEY) {
      await validate(this.key);
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]')
        });
    };
  }

  async find() {
    return {
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          hostname: this.hostname.value.trim(),
          port: Math.abs(this.port.value),
          username: this.username.value.trim(),
          authType: this.authType.value,
          password: this.password.value,
          key: this.key.value,
          version: 1,
          state: SERVER_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      this.#deploy,
      () => ({
        $set: {
          state: SERVER_STATE.OK,
          updatedAt: new Date()
        }
      })
    ];
  }

  async handleNewDomainClick() {
    await requireComponent('ppp-modal');
    await requireComponent('ppp-new-domain-modal-page');

    this.newDomainModal.visible = true;
  }

  async removeDomain(domain) {
    this.beginOperation('Удаление домена');6

    try {
      if (this.document.domains?.length) {
        await ppp.user.functions.updateOne(
          {
            collection: 'servers'
          },
          {
            _id: this.document._id
          },
          {
            $pull: {
              domains: {
                $in: [domain]
              }
            }
          }
        );

        this.document.domains.splice(this.document.domains.indexOf(domain), 1);
        Observable.notify(this, 'document');
        this.succeedOperation();
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

applyMixins(ServerPage, PageWithSSHTerminal, PageWithShiftLock);
