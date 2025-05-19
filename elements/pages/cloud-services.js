/** @decorator */

import ppp from '../../ppp.js';
import { css, html, ref, observable } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { bufferToString, generateIV } from '../../lib/ppp-crypto.js';
import {
  cloud,
  database,
  importExport,
  numberedCircle,
  trash
} from '../../static/svg/sprite.js';
import { invalidate, maybeFetchError, validate } from '../../lib/ppp-errors.js';
import { shouldUseAlternativeMongo } from '../../lib/realm.js';
import '../pages/import-keys-modal.js';
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
        <ppp-badge slot="controls" appearance="yellow">
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
          <span slot="start">
            ${html.partial(shouldUseAlternativeMongo ? database : cloud)}
          </span>
        </ppp-button>
        <ppp-button
          ?disabled="${() => !ppp.keyVault.ok()}"
          slot="controls"
          @click="${(x) => x.restoreMongoDB(!shouldUseAlternativeMongo)}"
        >
          Восстановить базу из копии
          <span slot="start"
            >${html.partial(shouldUseAlternativeMongo ? database : cloud)}</span
          >
        </ppp-button>
        <ppp-button
          appearance="default"
          slot="controls"
          @click="${(x) => x.importKeysModal.removeAttribute('hidden')}"
        >
          Импортировать ключи
          <span slot="start">${html.partial(importExport)}</span>
        </ppp-button>
      </ppp-page-header>
      <ppp-modal ${ref('importKeysModal')} class="large" hidden dismissible>
        <span slot="title">Импорт ключей</span>
        <div slot="description">
          Чтобы импортировать ключи, приготовьте мастер-пароль и компактное
          представление из ранее настроенного приложения.
        </div>
        <ppp-import-keys-modal-page slot="body"></ppp-import-keys-modal-page>
      </ppp-modal>
      <section ?hidden="${() => !ppp.keyVault.ok()}">
        <div class="control-stack">
          <ppp-banner class="inline" appearance="warning">
            <span>
              Чтобы перенести ключи в другой браузер, используйте это компактное
              представление:
            </span>
          </ppp-banner>
          <ppp-copyable> ${(x) => x.cloudCredentialsString} </ppp-copyable>
        </div>
      </section>
      <section ?hidden="${() => ppp.keyVault.ok()}">
        <div class="control-stack">
          <ppp-banner class="inline" appearance="warning">
            Введите заново или
            <a
              class="link"
              @click="${(x) => x.importKeysModal.removeAttribute('hidden')}"
              href="javascript:void(0)"
              >импортируйте</a
            >
            ключи облачных сервисов, чтобы пользоваться приложением.
          </ppp-banner>
        </div>
      </section>
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
          <div class="spacing4"></div>
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
          <h6>Прокси-ресурс</h6>
          <p class="description">
            Используется для совершения запросов к внешним API и сервисам.
            Рекомендуется создать по
            <a
              class="link"
              rel="noopener"
              target="_blank"
              href="https://johnpantini.gitbook.io/learn-ppp/cloud-services/ppp-proxy"
              >инструкции</a
            >
            на платформе
            <a
              class="link"
              rel="noopener"
              target="_blank"
              href="https://deno.com/deploy"
              >Deno Deploy</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="https://example.deno.dev"
            value="${() => ppp.keyVault.getKey('global-proxy-url')}"
            @input="${(x) =>
              ppp.keyVault.setKey(
                'global-proxy-url',
                x.globalProxyUrl.value.trim()
              )}"
            ${ref('globalProxyUrl')}
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
              href="https://johnpantini.gitbook.io/learn-ppp/cloud-services/personal-github-token"
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
          <h6>Публичный ключ MongoDB App Services</h6>
          <p class="description">
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://johnpantini.gitbook.io/learn-ppp/cloud-services/mongodb-realm-keys"
            >
              MongoDB App Services
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
          <h6>Приватный ключ MongoDB App Services</h6>
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
          ?disabled="${() => !ppp.keyVault.ok()}"
          appearance="danger"
          @click="${(x) => x.clearKeys()}"
        >
          Очистить пароль и ключи
          <span slot="start"> ${html.partial(trash)} </span>
        </ppp-button>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Настроить облачные функции и триггеры
          <span slot="start"> ${html.partial(cloud)} </span>
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

export async function checkMongoDBCloudServicesCredentials({
  publicKey,
  privateKey
}) {
  return ppp.fetch(
    'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: publicKey,
        apiKey: privateKey
      })
    }
  );
}

async function createWakeUpTrigger({ mongoDBRealmAccessToken, functionList }) {
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

    const rUpdateFunc = await ppp.fetch(
      `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${func._id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        },
        body: JSON.stringify({
          name: 'pppRealmWakeUp',
          source,
          run_as_system: true
        })
      }
    );

    await maybeFetchError(
      rUpdateFunc,
      'Не удалось обновить функцию триггера pppRealmWakeUp.'
    );
  } else {
    const rCreateFunc = await ppp.fetch(
      `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        },
        body: JSON.stringify({
          name: 'pppRealmWakeUp',
          source,
          run_as_system: true
        })
      }
    );

    await maybeFetchError(
      rCreateFunc,
      'Не удалось создать функцию триггера pppRealmWakeUp.'
    );

    const jCreateFunc = await rCreateFunc.json();

    realmWakeUpFuncId = jCreateFunc._id;
  }

  const rNewTrigger = await ppp.fetch(
    `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/triggers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mongoDBRealmAccessToken}`
      },
      body: JSON.stringify({
        name: 'pppRealmWakeUpTrigger',
        type: 'SCHEDULED',
        disabled: false,
        config: {
          schedule: '0 */12 * * *',
          skip_catchup_events: true
        },
        function_name: 'pppRealmWakeUp',
        function_id: realmWakeUpFuncId
      })
    }
  );

  // Conflict is OK
  if (rNewTrigger.status !== 409)
    await maybeFetchError(
      rNewTrigger,
      'Не удалось создать триггер pppRealmWakeUpTrigger.'
    );
}

export class CloudServicesPage extends Page {
  @observable
  cloudCredentialsString;

  async connectedCallback() {
    await super.connectedCallback();

    if (!ppp.keyVault.ok()) {
      this.cloudCredentialsString = 'Нужно ввести все ключи и мастер-пароль.';
    } else {
      this.cloudCredentialsString = 'Генерация компактного представления...';

      try {
        this.cloudCredentialsString = btoa(
          JSON.stringify(await this.generateCloudCredentialsString())
        );
      } catch (e) {
        this.cloudCredentialsString =
          'Ошибка генерации компактного представления.';
      }
    }
  }

  async generateCloudCredentialsString() {
    const iv = generateIV();
    const data = await ppp.crypto.encrypt(
      iv,
      JSON.stringify({
        'global-proxy-url': ppp.keyVault.getKey('global-proxy-url'),
        'github-login': ppp.keyVault.getKey('github-login'),
        'github-token': ppp.keyVault.getKey('github-token'),
        'mongo-api-key': ppp.keyVault.getKey('mongo-api-key'),
        'mongo-app-client-id': ppp.keyVault.getKey('mongo-app-client-id'),
        'mongo-app-id': ppp.keyVault.getKey('mongo-app-id'),
        'mongo-group-id': ppp.keyVault.getKey('mongo-group-id'),
        'mongo-private-key': ppp.keyVault.getKey('mongo-private-key'),
        'mongo-public-key': ppp.keyVault.getKey('mongo-public-key'),
        'use-alternative-mongo': ppp.keyVault.getKey('use-alternative-mongo'),
        'mongo-proxy-url': ppp.keyVault.getKey('mongo-proxy-url'),
        'mongo-connection-uri': ppp.keyVault.getKey('mongo-connection-uri'),
        tag: TAG
      })
    );

    return {
      iv: bufferToString(iv),
      data
    };
  }

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
        size: 'medium'
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

  async #createServerlessFunctions({ mongoDBRealmAccessToken }) {
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

    const rFunctionList = await ppp.fetch(
      `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
      {
        headers: {
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        }
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
        const rRemoveFunc = await ppp.fetch(
          `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${f._id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            }
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
        const rSource = await fetch(
          new URL(f.path, window.location.origin + window.location.pathname)
        );

        source = await rSource.text();
      } else if (typeof f.source === 'function') {
        source = await f.source();
      }

      const rCreateFunc = await ppp.fetch(
        `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          },
          body: JSON.stringify({
            name: f.name,
            source,
            run_as_system: true
          })
        }
      );

      await maybeFetchError(
        rCreateFunc,
        `Не удалось создать облачную функцию ${f.name}.`
      );

      ppp.app.toast.progress.value += Math.floor(30 / funcs.length);
    }

    this.progressOperation(95, 'Сохранение триггеров...');

    await createWakeUpTrigger({
      mongoDBRealmAccessToken,
      functionList
    });
  }

  async #setUpMongoDBCloudServicesApp({ mongoDBRealmAccessToken }) {
    // 1. Get Group (Project) ID.
    const rProjectId = await ppp.fetch(
      'https://realm.mongodb.com/api/admin/v3.0/auth/profile',
      {
        headers: {
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        }
      }
    );

    await maybeFetchError(
      rProjectId,
      'Не удалось получить ID проекта ppp в MongoDB App Services.'
    );
    this.progressOperation(5, 'Поиск проекта ppp в MongoDB App Services...');

    const { roles } = await rProjectId.json();

    // Will fail if a user has multiple projects.
    const groupId = roles?.find((r) => r.role_name === 'GROUP_OWNER')?.group_id;

    if (groupId) {
      ppp.keyVault.setKey('mongo-group-id', groupId);
    } else {
      invalidate(ppp.app.toast, {
        errorMessage: 'Проект ppp не найден в MongoDB App Services.',
        raiseException: true
      });
    }

    // 2. Get App Client ID.
    const rAppId = await ppp.fetch(
      `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps`,
      {
        headers: {
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        }
      }
    );

    await maybeFetchError(
      rAppId,
      'Не удалось получить ID приложения ppp в MongoDB App Services.'
    );
    this.progressOperation(10);

    const apps = await rAppId.json();
    const pppApp = apps?.find((a) => a.name?.toLowerCase() === 'ppp');

    if (pppApp) {
      ppp.keyVault.setKey('mongo-app-client-id', pppApp.client_app_id);
      ppp.keyVault.setKey('mongo-app-id', pppApp._id);
    } else {
      invalidate(ppp.app.toast, {
        errorMessage: 'Приложение ppp не найдено в MongoDB App Services.',
        raiseException: true
      });
    }

    // 3. Create & enable API Key provider.
    const rAuthProviders = await ppp.fetch(
      `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers`,
      {
        headers: {
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        }
      }
    );

    await maybeFetchError(
      rAuthProviders,
      'Не удалось получить список провайдеров авторизации MongoDB App Services.'
    );
    this.progressOperation(
      15,
      'Создание API-ключа пользователя в MongoDB App Services'
    );

    const providers = await rAuthProviders.json();
    const apiKeyProvider = providers.find((p) => (p.type = 'api-key'));

    if (apiKeyProvider?.disabled) {
      const rEnableAPIKeyProvider = await ppp.fetch(
        `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers/${apiKeyProvider._id}/enable`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        }
      );

      await maybeFetchError(
        rEnableAPIKeyProvider,
        'Не удалось активировать провайдера API-ключей MongoDB App Services.'
      );
    }

    if (!apiKeyProvider) {
      const rCreateAPIKeyProvider = await ppp.fetch(
        `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          },
          body: JSON.stringify({
            name: 'api-key',
            type: 'api-key',
            disabled: false
          })
        }
      );

      await maybeFetchError(
        rCreateAPIKeyProvider,
        'Не удалось подключить провайдера API-ключей MongoDB App Services.'
      );
    }

    // 4. Create API Key.
    const rCreateAPIKey = await ppp.fetch(
      `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/api_keys`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        },
        body: JSON.stringify({
          name: `ppp-${Date.now()}`
        })
      }
    );

    await maybeFetchError(
      rCreateAPIKey,
      'Не удалось создать API-ключ нового пользователя MongoDB App Services.'
    );
    this.progressOperation(25, 'Запись облачных функций...');
    ppp.keyVault.setKey('mongo-api-key', (await rCreateAPIKey.json()).key);

    // 5. Create serverless functions.
    await this.#createServerlessFunctions({
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

      await validate(this.globalProxyUrl);
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

      let globalProxyUrl;

      // Check global proxy URL.
      try {
        globalProxyUrl = new URL(this.globalProxyUrl.value);

        await maybeFetchError(
          await fetch(
            new URL(
              'api/admin/v3.0/auth/providers/mongodb-cloud/login',
              globalProxyUrl.origin
            ).toString(),
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Host': 'realm.mongodb.com'
              },
              body: JSON.stringify({
                username: this.mongoPublicKey.value.trim(),
                apiKey: this.mongoPrivateKey.value.trim()
              })
            }
          )
        );
      } catch (e) {
        invalidate(this.globalProxyUrl, {
          errorMessage:
            'Этот ресурс не может быть использован в качестве прокси',
          raiseException: true
        });
      }

      ppp.keyVault.setKey('global-proxy-url', globalProxyUrl.origin);

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

      // 2. Check MongoDB Realm admin credentials, get the access_token.
      const rMongoDBRealmCredentials =
        await checkMongoDBCloudServicesCredentials({
          publicKey: this.mongoPublicKey.value.trim(),
          privateKey: this.mongoPrivateKey.value.trim()
        });

      if (!rMongoDBRealmCredentials.ok) {
        invalidate(this.mongoPrivateKey, {
          errorMessage: 'Неверная пара ключей MongoDB App Services',
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

      this.progressOperation(0, 'Настройка приложения MongoDB App Services...');

      // 3. Create a MongoDB App Services API key, set up cloud functions.
      await this.#setUpMongoDBCloudServicesApp({
        mongoDBRealmAccessToken
      });

      this.showSuccessNotification(
        'Операция успешно выполнена. Обновите страницу, чтобы пользоваться приложением.'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async clearKeys() {
    if (
      await ppp.app.confirm(
        'Очистка пароля и ключей',
        'Мастер-пароль и все ключи облачных сервисов будут удалены из хранилища браузера. Подтвердите действие.'
      )
    ) {
      const version = localStorage.getItem('ppp-version');

      localStorage.clear();

      localStorage.setItem('ppp-version', version);
      window.location.reload();
    }
  }
}

export default CloudServicesPage.compose({
  template: cloudServicesPageTemplate,
  styles: cloudServicesPageStyles
}).define();
