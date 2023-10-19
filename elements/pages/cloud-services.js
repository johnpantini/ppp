import ppp from '../../ppp.js';
import { css, html, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { bufferToString, generateIV } from '../../lib/ppp-crypto.js';
import {
  cloud,
  database,
  importExport,
  numberedCircle
} from '../../static/svg/sprite.js';
import { invalidate, maybeFetchError, validate } from '../../lib/ppp-errors.js';
import { shouldUseAlternativeMongo } from '../../lib/realm.js';
import '../pages/import-cloud-keys-modal.js';
import { TAG } from '../../lib/tag.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../copyable.js';
import '../modal.js';
import '../text-field.js';

export const cloudServicesPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Облачные сервисы
        <ppp-badge
          slot="controls"
          appearance="yellow"
        >
          ${
            shouldUseAlternativeMongo
              ? 'Альтернативная MongoDB'
              : 'Облачная MongoDB'
          }
        </ppp-badge>
        <ppp-button
          ?disabled="${() => !ppp.keyVault.ok()}"
          appearance="primary"
          slot="controls"
          @click="${(x) => x.backupMongoDB(!shouldUseAlternativeMongo)}"
        >
          Создать резервную копию базы
          <span slot="start">${html.partial(
            shouldUseAlternativeMongo ? database : cloud
          )}</span>
        </ppp-button>
        <ppp-button
          ?disabled="${() => !ppp.keyVault.ok()}"
          slot="controls"
          @click="${(x) => x.restoreMongoDB(!shouldUseAlternativeMongo)}"
        >
          Восстановить базу из копии
          <span slot="start">${html.partial(
            shouldUseAlternativeMongo ? database : cloud
          )}</span>
        </ppp-button>
        <ppp-button
          appearance="default"
          slot="controls"
          @click="${(x) => x.importCloudKeysModal.removeAttribute('hidden')}"
        >
          Импортировать ключи из облака
          <span slot="start">${html.partial(importExport)}</span>
        </ppp-button>
      </ppp-page-header>
      <ppp-modal
        ${ref('importCloudKeysModal')}
        class="large"
        hidden
        dismissible
      >
        <span slot="title">Импорт ключей</span>
        <div slot="description">
          Чтобы импортировать ключи, приготовьте мастер-пароль и компактное
          представление из ранее настроенного приложения.
        </div>
        <ppp-import-cloud-keys-modal-page
          slot="body"
        ></ppp-import-cloud-keys-modal-page>
      </ppp-modal>
      ${when(
        () => ppp.keyVault.ok(),
        html`
          <section>
            <div class="control-stack">
              <ppp-banner class="inline" appearance="warning">
                ${when(
                  ppp.keyVault.getKey('mongo-location-url'),
                  html`
                    <span>
                      Чтобы перенести ключи в другой браузер, используйте это
                      компактное представление:
                    </span>
                  `
                )}
                ${when(
                  !ppp.keyVault.getKey('mongo-location-url'),
                  html`
                    <span>
                      Чтобы получить компактное представление, необходимо
                      соединиться с облачной базой данных MongoDB Realm хотя бы
                      1 раз.
                    </span>
                  `
                )}
              </ppp-banner>
              <ppp-copyable>
                ${(x) => x.generateCloudCredentialsString()}
              </ppp-copyable>
            </div>
          </section>
        `
      )}
      ${when(
        () => !ppp.keyVault.ok(),
        html`
          <section>
            <div class="control-stack">
              <ppp-banner class="inline" appearance="warning">
                Сохраните заново или
                <a
                  class="link"
                  @click="${(x) =>
                    x.importCloudKeysModal.removeAttribute('hidden')}"
                  href="javascript:void(0)"
                  >импортируйте</a
                >
                ключи облачных сервисов, чтобы пользоваться приложением.
              </ppp-banner>
            </div>
          </section>
        `
      )}
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(1))}</div>
        <div class="label-group">
          <h6>Мастер-пароль</h6>
          <p class="description">
            Требуется для шифрования/дешифрования конфиденциальных данных:
            токенов, ключей, других паролей.
          </p>
          <div class="spacing2"></div>
          <ppp-banner class="inline" appearance="warning">
            Мастер-пароль следует задать только при первой настройке приложения!
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Введите пароль"
            value="${() => ppp.keyVault.getKey('master-password')}"
            @input="${(x) =>
              ppp.keyVault.setKey(
                'master-password',
                x.masterPassword.value.trim()
              )}"
            ${ref('masterPassword')}
          ></ppp-text-field>
          <div class="spacing4">
            <ppp-text-field
              type="password"
              placeholder="Введите мастер-пароль ещё раз"
              ${ref('masterPasswordConfirmation')}
            >
              <span slot="label">Подтверждение пароля</span>
            </ppp-text-field>
          </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(2))}</div>
        <div class="label-group">
          <h6>Сервисная машина</h6>
          <p class="description">
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://pantini.gitbook.io/pantini-co/ppp/service-machine"
            >
              Сервисная машина
            </a>
            требуется для настройки компонентов приложения.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="https://example.com"
            value="${() => ppp.keyVault.getKey('service-machine-url')}"
            @input="${(x) =>
              ppp.keyVault.setKey(
                'service-machine-url',
                x.serviceMachineUrl.value.trim()
              )}"
            ${ref('serviceMachineUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(3))}</div>
        <div class="label-group">
          <h6>Персональный токен GitHub</h6>
          <p class="description">
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://pantini.gitbook.io/pantini-co/ppp/github"
            >
              Токен
            </a>
            необходим для получения обновлений.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Токен"
            value="${() => ppp.keyVault.getKey('github-token')}"
            @input="${(x) =>
              ppp.keyVault.setKey('github-token', x.gitHubToken.value.trim())}"
            ${ref('gitHubToken')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(4))}</div>
        <div class="label-group">
          <h6>Публичный ключ MongoDB Realm</h6>
          <p class="description">
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://pantini.gitbook.io/pantini-co/ppp/mongodb"
            >
              MongoDB Realm
            </a>
            обеспечивает приложение базой данных (хранилищем) и облачными
            функциями.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Публичный ключ"
            value="${() => ppp.keyVault.getKey('mongo-public-key')}"
            @input="${(x) =>
              ppp.keyVault.setKey(
                'mongo-public-key',
                x.mongoPublicKey.value.trim()
              )}"
            ${ref('mongoPublicKey')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(5))}</div>
        <div class="label-group">
          <h6>Приватный ключ MongoDB Realm</h6>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Приватный ключ"
            value="${() => ppp.keyVault.getKey('mongo-private-key')}"
            @input="${(x) =>
              ppp.keyVault.setKey(
                'mongo-private-key',
                x.mongoPrivateKey.value.trim()
              )}"
            ${ref('mongoPrivateKey')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(6))}</div>
        <div class="label-group">
          <h6>Подключение к базе данных MongoDB</h6>
          <p class="description">
            Подключение к альтернативной базе данных MongoDB.
          </p>
          <div class="spacing2"></div>
          <ppp-checkbox
            @change="${(x) =>
              ppp.keyVault.setKey(
                'use-alternative-mongo',
                x.useAlternativeMongo.checked ? '1' : '0'
              )}"
            ?checked="${() =>
              ppp.keyVault.getKey('use-alternative-mongo') === '1'}"
            ${ref('useAlternativeMongo')}
          >
            Использовать это подключение вместо облачной базы MongoDB Atlas
          </ppp-checkbox>
        </div>
        <div class="input-group">
          <ppp-text-field
            ?disabled="${(x) => !x.useAlternativeMongo.checked}"
            type="password"
            placeholder="mongodb://0.0.0.0:27017"
            value="${() => ppp.keyVault.getKey('mongo-connection-uri')}"
            @input="${(x) =>
              ppp.keyVault.setKey(
                'mongo-connection-uri',
                x.mongoConnectionUri.value.trim()
              )}"
            ${ref('mongoConnectionUri')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(7))}</div>
        <div class="label-group">
          <h6>Сервер доступа к MongoDB</h6>
          <p class="description">
            Требуется, если используется альтернативная база данных MongoDB.
            Готовую реализацию можно загрузить
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://pantini.gitbook.io/pantini-co/ppp/mongodb-proxy"
            >здесь</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            ?disabled="${(x) => !x.useAlternativeMongo.checked}"
            type="url"
            placeholder="http://0.0.0.0:14444"
            value="${() => ppp.keyVault.getKey('mongo-proxy-url')}"
            @input="${(x) =>
              ppp.keyVault.setKey(
                'mongo-proxy-url',
                x.mongoProxyUrl.value.trim()
              )}"
            ${ref('mongoProxyUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить пароль и ключи в облаке
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const cloudServicesPageStyles = css`
  ${pageStyles}
`;

export async function checkGitHubToken({ token }) {
  return fetch('https://api.github.com/user', {
    cache: 'no-cache',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`
    }
  });
}

export async function checkMongoDBRealmCredentials({
  serviceMachineUrl,
  publicKey,
  privateKey
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
      body: {
        username: publicKey,
        apiKey: privateKey
      }
    })
  });
}

async function getCloudCredentialsFuncSource() {
  const iv = generateIV();
  const cipherText = await ppp.crypto.encrypt(
    iv,
    JSON.stringify({
      'github-login': ppp.keyVault.getKey('github-login'),
      'github-token': ppp.keyVault.getKey('github-token'),
      'mongo-api-key': ppp.keyVault.getKey('mongo-api-key'),
      'mongo-app-client-id': ppp.keyVault.getKey('mongo-app-client-id'),
      'mongo-app-id': ppp.keyVault.getKey('mongo-app-id'),
      'mongo-group-id': ppp.keyVault.getKey('mongo-group-id'),
      'mongo-private-key': ppp.keyVault.getKey('mongo-private-key'),
      'mongo-public-key': ppp.keyVault.getKey('mongo-public-key'),
      'service-machine-url': ppp.keyVault.getKey('service-machine-url'),
      'use-alternative-mongo': ppp.keyVault.getKey('use-alternative-mongo'),
      'mongo-proxy-url': ppp.keyVault.getKey('mongo-proxy-url'),
      'mongo-connection-uri': ppp.keyVault.getKey('mongo-connection-uri'),
      tag: TAG
    })
  );

  return `exports = function () {
      return {
        iv: '${bufferToString(iv)}', data: '${cipherText}'
      };
    };`;
}

async function createTriggers({
  serviceMachineUrl,
  mongoDBRealmAccessToken,
  functionList
}) {
  const groupId = ppp.keyVault.getKey('mongo-group-id');
  const appId = ppp.keyVault.getKey('mongo-app-id');

  let realmWakeUpFuncId;

  const source = `exports = function () {
    const db = context.services.get('mongodb-atlas').db('ppp');

    db.collection('app').updateOne({ _id: '@settings' }, { $set: { lastWakeUpTime: new Date() } }, { upsert: true });
  };`;

  const func = functionList?.find((f) => f.name === 'pppRealmWakeUp');

  if (func) {
    realmWakeUpFuncId = func._id;

    const rUpdateFunc = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'PUT',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${func._id}`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          },
          body: JSON.stringify({
            name: 'pppRealmWakeUp',
            source,
            run_as_system: true
          })
        })
      }
    );

    await maybeFetchError(rUpdateFunc, 'Не удалось обновить функцию триггера.');
  } else {
    const rCreateFunc = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'POST',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          },
          body: JSON.stringify({
            name: 'pppRealmWakeUp',
            source,
            run_as_system: true
          })
        })
      }
    );

    await maybeFetchError(rCreateFunc, 'Не удалось создать функцию триггера.');

    const jCreateFunc = await rCreateFunc.json();

    realmWakeUpFuncId = jCreateFunc._id;
  }

  const rNewTrigger = await fetch(
    new URL('fetch', serviceMachineUrl).toString(),
    {
      cache: 'no-cache',
      method: 'POST',
      body: JSON.stringify({
        method: 'POST',
        url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/triggers`,
        body: {
          name: 'pppRealmWakeUpTrigger',
          type: 'SCHEDULED',
          disabled: false,
          config: {
            schedule: '0 */12 * * *',
            skip_catchup_events: true
          },
          function_name: 'pppRealmWakeUp',
          function_id: realmWakeUpFuncId
        },
        headers: {
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        }
      })
    }
  );

  // Conflict is OK
  if (rNewTrigger.status !== 409)
    await maybeFetchError(rNewTrigger, 'Не удалось создать триггер.');
}

async function createCloudCredentialsEndpoint({
  serviceMachineUrl,
  mongoDBRealmAccessToken,
  functionList
}) {
  const groupId = ppp.keyVault.getKey('mongo-group-id');
  const appId = ppp.keyVault.getKey('mongo-app-id');

  let cloudCredentialsFuncId;

  const func = functionList?.find((f) => f.name === 'cloudCredentials');

  if (func) {
    cloudCredentialsFuncId = func._id;

    const rUpdateFunc = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'PUT',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${func._id}`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          },
          body: JSON.stringify({
            name: 'cloudCredentials',
            source: await getCloudCredentialsFuncSource(),
            run_as_system: true
          })
        })
      }
    );

    await maybeFetchError(
      rUpdateFunc,
      'Не удалось обновить функцию конечной точки компактного представления ключей.'
    );
  } else {
    const rCreateFunc = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'POST',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          },
          body: JSON.stringify({
            name: 'cloudCredentials',
            source: await getCloudCredentialsFuncSource(),
            run_as_system: true
          })
        })
      }
    );

    await maybeFetchError(
      rCreateFunc,
      'Не удалось создать функцию конечной точки компактного представления ключей.'
    );

    const jCreateFunc = await rCreateFunc.json();

    cloudCredentialsFuncId = jCreateFunc._id;
  }

  const rNewEndpoint = await fetch(
    new URL('fetch', serviceMachineUrl).toString(),
    {
      cache: 'no-cache',
      method: 'POST',
      body: JSON.stringify({
        method: 'POST',
        url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints`,
        body: {
          route: '/cloud_credentials',
          function_name: 'cloudCredentials',
          function_id: cloudCredentialsFuncId,
          http_method: 'GET',
          validation_method: 'NO_VALIDATION',
          secret_id: '',
          secret_name: '',
          create_user_on_auth: false,
          fetch_custom_user_data: false,
          respond_result: true,
          disabled: false
        },
        headers: {
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        }
      })
    }
  );

  // Conflict is OK
  if (rNewEndpoint.status !== 409) {
    await maybeFetchError(
      rNewEndpoint,
      'Не удалось создать конечную точку компактного представления ключей.'
    );
  }
}

export class CloudServicesPage extends Page {
  async backupMongoDB(isCloud) {
    this.beginOperation();

    try {
      const page = await ppp.app.mountPage('backup-mongodb-modal', {
        title: isCloud
          ? 'Сохранить облачную базу'
          : 'Сохранить альтернативную базу',
        size: 'large'
      });

      if (isCloud) {
        page.setAttribute('cloud', '');
      }
    } catch (e) {
      this.failOperation(e, 'Создание резервной копии');
    } finally {
      this.endOperation();
    }
  }

  async restoreMongoDB(isCloud) {
    this.beginOperation();

    try {
      const page = await ppp.app.mountPage('restore-mongodb-modal', {
        title: isCloud
          ? 'Восстановить облачную базу'
          : 'Восстановить альтернативную базу',
        size: 'mediuum'
      });

      if (isCloud) {
        page.setAttribute('cloud', '');
      }
    } catch (e) {
      this.failOperation(e, 'Восстановление резервной копии');
    } finally {
      this.endOperation();
    }
  }

  generateCloudCredentialsString() {
    if (!ppp.keyVault.getKey('mongo-location-url'))
      return 'Соединитесь с облачной базой MongoDB Realm';

    return btoa(
      JSON.stringify({
        s: ppp.keyVault.getKey('service-machine-url'),
        u:
          ppp.keyVault
            .getKey('mongo-location-url')
            .replace('aws.stitch.mongodb', 'aws.data.mongodb-api') +
          `/app/${ppp.keyVault.getKey(
            'mongo-app-client-id'
          )}/endpoint/cloud_credentials`
      })
    );
  }

  async #createServerlessFunctions({
    serviceMachineUrl,
    mongoDBRealmAccessToken
  }) {
    const groupId = ppp.keyVault.getKey('mongo-group-id');
    const appId = ppp.keyVault.getKey('mongo-app-id');
    const funcs = [
      { name: 'eval', path: 'lib/functions/mongodb/eval.js' },
      { name: 'aggregate', path: 'lib/functions/mongodb/aggregate.js' },
      { name: 'bulkWrite', path: 'lib/functions/mongodb/bulk-write.js' },
      { name: 'count', path: 'lib/functions/mongodb/count.js' },
      { name: 'deleteMany', path: 'lib/functions/mongodb/delete-many.js' },
      { name: 'deleteOne', path: 'lib/functions/mongodb/delete-one.js' },
      { name: 'distinct', path: 'lib/functions/mongodb/distinct.js' },
      { name: 'find', path: 'lib/functions/mongodb/find.js' },
      { name: 'findOne', path: 'lib/functions/mongodb/find-one.js' },
      {
        name: 'findOneAndDelete',
        path: 'lib/functions/mongodb/find-one-and-delete.js'
      },
      {
        name: 'findOneAndReplace',
        path: 'lib/functions/mongodb/find-one-and-replace.js'
      },
      {
        name: 'findOneAndUpdate',
        path: 'lib/functions/mongodb/find-one-and-update.js'
      },
      { name: 'insertMany', path: 'lib/functions/mongodb/insert-many.js' },
      { name: 'insertOne', path: 'lib/functions/mongodb/insert-one.js' },
      { name: 'updateMany', path: 'lib/functions/mongodb/update-many.js' },
      { name: 'updateOne', path: 'lib/functions/mongodb/update-one.js' }
    ];

    const rFunctionList = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'GET',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        })
      }
    );

    await maybeFetchError(
      rFunctionList,
      'Не удалось получить список облачных функций.'
    );
    this.progressOperation(30);

    const functionList = await rFunctionList.json();

    for (const f of functionList) {
      if (funcs.find((fun) => fun.name === f.name)) {
        const rRemoveFunc = await fetch(
          new URL('fetch', serviceMachineUrl).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              method: 'DELETE',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${f._id}`,
              headers: {
                Authorization: `Bearer ${mongoDBRealmAccessToken}`
              }
            })
          }
        );

        await maybeFetchError(
          rRemoveFunc,
          `Не удалось удалить облачную функцию ${f.name}.`
        );

        ppp.app.toast.progress.value += Math.floor(30 / funcs.length);
      }
    }

    for (const f of funcs) {
      let source;

      if (f.path) {
        const sourceRequest = await fetch(
          new URL(f.path, window.location.origin + window.location.pathname)
        );

        source = await sourceRequest.text();
      } else if (typeof f.source === 'function') {
        source = await f.source();
      }

      const rCreateFunc = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'POST',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: JSON.stringify({
              name: f.name,
              source,
              run_as_system: true
            })
          })
        }
      );

      await maybeFetchError(
        rCreateFunc,
        `Не удалось создать облачную функцию ${f.name}.`
      );

      ppp.app.toast.progress.value += Math.floor(30 / funcs.length);
    }

    this.progressOperation(80, 'Настройка триггеров');

    await createTriggers({
      serviceMachineUrl,
      mongoDBRealmAccessToken,
      functionList
    });

    this.progressOperation(95, 'Сохранение ключей облачных сервисов');

    await createCloudCredentialsEndpoint({
      serviceMachineUrl,
      mongoDBRealmAccessToken,
      functionList
    });
  }

  async #setUpMongoDBRealmApp({ serviceMachineUrl, mongoDBRealmAccessToken }) {
    // 1. Get Group (Project) ID
    const rProjectId = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'GET',
          url: 'https://realm.mongodb.com/api/admin/v3.0/auth/profile',
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        })
      }
    );

    await maybeFetchError(
      rProjectId,
      'Не удалось получить ID проекта PPP в MongoDB Realm.'
    );
    this.progressOperation(5, 'Поиск проекта PPP в MongoDB Realm');

    const { roles } = await rProjectId.json();

    // TODO - will fail if a user has multiple projects
    const groupId = roles?.find((r) => r.role_name === 'GROUP_OWNER')?.group_id;

    if (groupId) {
      ppp.keyVault.setKey('mongo-group-id', groupId);
    } else {
      invalidate(ppp.app.toast, {
        errorMessage: 'Проект ppp не найден в MongoDB Realm.',
        raiseException: true
      });
    }

    // 2. Get App Client ID
    const rAppId = await fetch(new URL('fetch', serviceMachineUrl).toString(), {
      cache: 'no-cache',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'GET',
        url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps`,
        headers: {
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        }
      })
    });

    await maybeFetchError(
      rAppId,
      'Не удалось получить ID приложения PPP в MongoDB Realm.'
    );
    this.progressOperation(10);

    const apps = await rAppId.json();
    const pppApp = apps?.find((a) => a.name?.toLowerCase?.() === 'ppp');

    if (pppApp) {
      ppp.keyVault.setKey('mongo-app-client-id', pppApp.client_app_id);
      ppp.keyVault.setKey('mongo-app-id', pppApp._id);
    } else {
      invalidate(ppp.app.toast, {
        errorMessage: 'Приложение PPP не найдено в MongoDB Realm.',
        raiseException: true
      });
    }

    // 3. Create & enable API Key provider
    const rAuthProviders = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'GET',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        })
      }
    );

    await maybeFetchError(
      rAuthProviders,
      'Не удалось получить список провайдеров авторизации MongoDB Realm.'
    );
    this.progressOperation(
      15,
      'Создание API-ключа пользователя в MongoDB Realm'
    );

    const providers = await rAuthProviders.json();
    const apiKeyProvider = providers.find((p) => (p.type = 'api-key'));

    if (apiKeyProvider && apiKeyProvider.disabled) {
      const rEnableAPIKeyProvider = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'PUT',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers/${apiKeyProvider._id}/enable`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            }
          })
        }
      );

      await maybeFetchError(
        rEnableAPIKeyProvider,
        'Не удалось активировать провайдера API-ключей MongoDB Realm.'
      );
    }

    if (!apiKeyProvider) {
      const rCreateAPIKeyProvider = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'POST',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: JSON.stringify({
              name: 'api-key',
              type: 'api-key',
              disabled: false
            })
          })
        }
      );

      await maybeFetchError(
        rCreateAPIKeyProvider,
        'Не удалось подключить провайдера API-ключей MongoDB Realm.'
      );
    }

    // 4. Create an API Key
    const rCreateAPIKey = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'POST',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/api_keys`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          },
          body: JSON.stringify({
            name: `ppp-${Date.now()}`
          })
        })
      }
    );

    await maybeFetchError(
      rCreateAPIKey,
      'Не удалось создать API-ключ пользователя MongoDB Realm.'
    );
    this.progressOperation(25, 'Запись облачных функций');
    ppp.keyVault.setKey('mongo-api-key', (await rCreateAPIKey.json()).key);

    // 5. Create serverless functions
    await this.#createServerlessFunctions({
      serviceMachineUrl,
      mongoDBRealmAccessToken
    });
  }

  async submitDocument() {
    this.beginOperation();

    try {
      await validate(this.masterPassword);
      await validate(this.masterPasswordConfirmation);
      await validate(this.masterPasswordConfirmation, {
        hook: async (value) => value === this.masterPassword.value,
        errorMessage: 'Пароли не совпадают'
      });

      await validate(this.serviceMachineUrl);
      await validate(this.gitHubToken);
      await validate(this.mongoPublicKey);
      await validate(this.mongoPrivateKey);

      if (this.useAlternativeMongo.checked) {
        await validate(this.mongoConnectionUri);
        await validate(this.mongoProxyUrl);
      }

      localStorage.removeItem('ppp-mongo-location-url');
      sessionStorage.removeItem('realmLogin');
      ppp.keyVault.setKey('tag', TAG);
      ppp.keyVault.setKey('master-password', this.masterPassword.value.trim());
      await caches.delete('offline');

      let serviceMachineUrl;

      // Check service machine URL
      try {
        if (!this.serviceMachineUrl.value.trim().startsWith('https://'))
          this.serviceMachineUrl.value =
            'https://' + this.serviceMachineUrl.value.trim();

        serviceMachineUrl = new URL(
          'ping',
          this.serviceMachineUrl.value.trim()
        );

        const rs = await fetch(serviceMachineUrl.toString());
        const rst = await rs.text();

        if (rst !== 'pong') {
          invalidate(this.serviceMachineUrl, {
            errorMessage: 'Неверный URL',
            raiseException: true
          });
        }
      } catch (e) {
        invalidate(this.serviceMachineUrl, {
          errorMessage: 'Неверный или неполный URL',
          raiseException: true
        });
      }

      ppp.keyVault.setKey('service-machine-url', serviceMachineUrl.origin);

      // 1. Check GitHub token, store repo owner
      const rGitHub = await checkGitHubToken({
        token: this.gitHubToken.value.trim()
      });

      if (!rGitHub.ok) {
        invalidate(this.gitHubToken, {
          errorMessage: 'Неверный или истёкший токен',
          raiseException: true
        });
      }

      ppp.keyVault.setKey('github-login', (await rGitHub.json()).login);
      ppp.keyVault.setKey('github-token', this.gitHubToken.value.trim());

      // 2. Check MongoDB Realm admin credentials, get the access_token
      const rMongoDBRealmCredentials = await checkMongoDBRealmCredentials({
        serviceMachineUrl: serviceMachineUrl.origin,
        publicKey: this.mongoPublicKey.value.trim(),
        privateKey: this.mongoPrivateKey.value.trim()
      });

      if (!rMongoDBRealmCredentials.ok) {
        invalidate(this.mongoPrivateKey, {
          errorMessage: 'Неверная пара ключей MongoDB Realm',
          raiseException: true
        });
      }

      ppp.keyVault.setKey('mongo-public-key', this.mongoPublicKey.value.trim());
      ppp.keyVault.setKey(
        'mongo-private-key',
        this.mongoPrivateKey.value.trim()
      );
      ppp.keyVault.setKey(
        'use-alternative-mongo',
        this.useAlternativeMongo.checked ? '1' : '0'
      );
      ppp.keyVault.setKey(
        'mongo-connection-uri',
        this.mongoConnectionUri.value.trim()
      );
      ppp.keyVault.setKey('mongo-proxy-url', this.mongoProxyUrl.value.trim());

      const { access_token: mongoDBRealmAccessToken } =
        await rMongoDBRealmCredentials.json();

      this.progressOperation(0, 'Настройка приложения MongoDB Realm');

      // 3. Create a MongoDB realm API key, set up cloud functions
      await this.#setUpMongoDBRealmApp({
        serviceMachineUrl: serviceMachineUrl.origin,
        mongoDBRealmAccessToken
      });

      this.showSuccessNotification(
        'Операция успешно выполнена. Обновите страницу, чтобы пользоваться приложением'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export default CloudServicesPage.compose({
  template: cloudServicesPageTemplate,
  styles: cloudServicesPageStyles
}).define();
