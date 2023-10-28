import ppp from '../../ppp.js';
import { html, css, ref, Observable } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial,
  PageWithSSHTerminal
} from '../page.js';
import { SERVER_STATE, SERVER_TYPES } from '../../lib/const.js';
import { serverStateAppearance } from './servers.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { getAspirantWorkerBaseUrl } from './service-ppp-aspirant-worker.js';
import '../badge.js';
import '../button.js';
import '../radio-group.js';
import '../snippet.js';
import '../query-select.js';
import '../table.js';
import '../terminal.js';
import '../text-field.js';

export const serverPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: html`
          <ppp-badge
            slot="controls"
            appearance="${(x) =>
              serverStateAppearance(x.document.state ?? 'N/A')}"
          >
            ${(x) => ppp.t(`$const.serverState.${x.document.state ?? 'N/A'}`)}
          </ppp-badge>
        `
      })}
      <section>
        <div class="label-group">
          <h5>Название подключения</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Мой сервер"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Сервис-соединитель</h5>
          <p class="description">
            Будет использован для доступа к серверу по SSH.
          </p>
        </div>
        <div class="input-group">
        <ppp-query-select
            ${ref('connectorServiceId')}
            :context="${(x) => x}"
            value="${(x) => x.document.connectorServiceId}"
            :preloaded="${(x) => x.document.connectorService ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('services')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
                      },
                      { workerPredefinedTemplate: 'connectors' },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.connectorServiceId ?? ''%]`
                          }
                        ]
                      }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Адрес</h5>
          <p class="description">Укажите имя хоста или IP-адрес сервера.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="127.0.0.1"
            value="${(x) => x.document.hostname}"
            ${ref('hostname')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Порт</h5>
          <p class="description">Укажите SSH-порт сервера.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="22"
            value="${(x) => x.document.port ?? '22'}"
            ${ref('port')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Имя пользователя</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="root"
            value="${(x) => x.document.username ?? 'root'}"
            ${ref('username')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Тип авторизации</h5>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.authType ?? 'password'}"
            ${ref('authType')}
          >
            <ppp-radio value="password">По паролю</ppp-radio>
            <ppp-radio value="key">По приватному ключу</ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ или пароль</h5>
          <p class="description">Данные сохраняются в зашифрованном виде.</p>
        </div>
        <div class="input-group">
          <div
            style="display: ${(x) =>
              !x.authType.value || x.authType.value === SERVER_TYPES.PASSWORD
                ? 'initial'
                : 'none'}"
          >
            <ppp-text-field
              type="password"
              placeholder="Введите пароль"
              value="${(x) => x.document.password}"
              ${ref('password')}
            ></ppp-text-field>
          </div>
          <div
            style="display: ${(x) =>
              x.authType.value === SERVER_TYPES.KEY ? 'initial' : 'none'}"
          >
            <ppp-snippet
              style="height: 256px"
              placeholder="Введите ключ"
              :code="${(x) =>
                x.document.key ??
                `-----BEGIN RSA PRIVATE KEY-----

-----END RSA PRIVATE KEY-----`}"
              ${ref('key')}
            ></ppp-snippet>
            <div class="spacing2"></div>
            <ppp-button
              @click="${(x) => x.loadPrivateKey()}"
              appearance="primary"
            >
              Загрузить из файла
            </ppp-button>
            <input
              @change="${(x, c) => x.handleFileSelection(c)}"
              type="file"
              style="display: none;"
              ${ref('fileInput')}
            />
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Команды, выполняемые до основной настройки</h5>
          <div class="spacing2"></div>
          <p class="description">
            Произвольные команды, которые можно использовать в отладочных целях.
            Не сохраняются в базе данных.
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            style="height: 184px"
            :code="${() => 'uname -a'}"
            ${ref('extraCommands')}
          ></ppp-snippet>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Список доменов</h5>
          <p class="description">
            Домены, привязанные к серверу.
          </p>
          <div class="spacing2"></div>
          <ppp-button
            ?disabled="${(x) => !x.document._id}"
            @click="${async (x) => {
              const page = await ppp.app.mountPage('new-domain-modal', {
                title: 'Добавить домены',
                size: 'large'
              });

              page.parent = x;
            }}"
            appearance="primary"
          >
            Добавить домены
          </ppp-button>
        </div>
        <div class="input-group">
          <ppp-table
            :columns="${() => [
              {
                label: 'Домен'
              },
              {
                label: 'Действия'
              }
            ]}"
            :rows="${(x) =>
              (x.document.domains || []).map((datum) => {
                return {
                  datum,
                  cells: [
                    html`<a
                      class="link"
                      target="_blank"
                      rel="noopener"
                      href="https://${datum}"
                    >
                      ${datum}
                    </a>`,
                    html` <ppp-button
                      class="xsmall"
                      @click="${() => x.removeDomain(datum)}"
                    >
                      Удалить
                    </ppp-button>`
                  ]
                };
              })}"
          >
          </ppp-table>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const serverPageStyles = css`
  ${pageStyles}
`;

export class ServerPage extends Page {
  collection = 'servers';

  async removeDomain(domain) {
    if (
      await ppp.app.confirm(
        'Удаление домена',
        `Будет удалён домен «${domain}». Подтвердите действие.`
      )
    ) {
      this.beginOperation();

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

          this.document.domains.splice(
            this.document.domains.indexOf(domain),
            1
          );
          Observable.notify(this, 'document');
          this.showSuccessNotification();
        }
      } catch (e) {
        this.failOperation(e, 'Удаление домена');
      } finally {
        this.endOperation();
      }
    }
  }

  loadPrivateKey() {
    this.fileInput.click();
  }

  handleFileSelection({ event }) {
    const reader = new FileReader();

    reader.readAsText(event.target.files[0], 'UTF-8');

    reader.onload = (readerEvent) => {
      this.key.updateCode(readerEvent.target.result.trim());
    };
  }

  async validate() {
    await validate(this.name);
    await validate(this.connectorServiceId);
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
        .collection('[%#this.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]')
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'connectorServiceId',
              foreignField: '_id',
              as: 'connectorService'
            }
          },
          {
            $unwind: {
              path: '$connectorService',
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
    };
  }

  async find() {
    return {
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async #deploy() {
    let commands = [
      'sudo rm -f /etc/yum.repos.d/tailscale.repo ;',
      'sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-$(rpm -q --provides $(rpm -q --whatprovides "system-release(releasever)") | grep "system-release(releasever)" | cut -d " " -f 3).noarch.rpm ;',
      'sudo dnf -y install dnf-plugins-core ;',
      `sudo dnf -y config-manager --set-enabled powertools 2> /dev/null || echo 'OK' ;`,
      `sudo dnf -y config-manager --set-enabled PowerTools 2> /dev/null || echo 'OK' ;`,
      'sudo dnf -y install epel-release ;',
      'sudo dnf -y install wget git tar openssl openssl-devel ;',
      'sudo dnf -y group install "Development Tools" && '
    ].join(' ');

    const extraCommands = this.extraCommands.value.trim();

    if (extraCommands) commands = extraCommands + ' ; ' + commands;

    const connector = this.connectorServiceId.datum();
    const connectorUrl = await getAspirantWorkerBaseUrl(connector);

    if (
      !(await this.executeSSHCommands({
        server: this.document,
        connectorUrl,
        commands,
        commandsToDisplay: commands
      }))
    ) {
      invalidate(this.host, {
        errorMessage: 'Не удалось настроить сервер.',
        raiseException: true
      });
    }
  }

  async submit() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          connectorServiceId: this.connectorServiceId.value,
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
}

applyMixins(ServerPage, PageWithSSHTerminal);

export default ServerPage.compose({
  template: serverPageTemplate,
  styles: serverPageStyles
}).define();
