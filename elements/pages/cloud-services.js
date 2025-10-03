/** @decorator */

import ppp from '../../ppp.js';
import { css, html, ref, observable } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { bufferToString, generateIV } from '../../lib/ppp-crypto.js';
import {
  cloud,
  importExport,
  numberedCircle,
  trash
} from '../../static/svg/sprite.js';
import { invalidate, maybeFetchError, validate } from '../../lib/ppp-errors.js';
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
          ${`Версия ${localStorage.getItem('ppp-version') ?? '1.0.0'}`}
        </ppp-badge>
        <ppp-button
          ?disabled="${() => !ppp.keyVault.ok()}"
          appearance="primary"
          slot="controls"
          @click="${(x) => x.backupMongoDB()}"
        >
          Создать резервную копию базы
        </ppp-button>
        <ppp-button
          ?disabled="${() => !ppp.keyVault.ok()}"
          slot="controls"
          @click="${(x) => x.restoreMongoDB()}"
        >
          Восстановить базу из копии
          <span slot="start">
            ${html.partial(cloud)}
          </span>
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
            Сохраните ещё раз или
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
            ${ref('gitHubToken')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(4))}</div>
        <div class="label-group">
          <h6>Подключение к базе данных MongoDB</h6>
          <p class="description">
            Ссылка на кластер MongoDB.
          </p>      
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="mongodb://0.0.0.0:27017"
            value="${() => ppp.keyVault.getKey('mongo-connection-uri')}"
            ${ref('mongoConnectionUri')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(5))}</div>
        <div class="label-group">
          <h6>Шлюз доступа к MongoDB</h6>
          <p class="description">
            Ссылка на шлюз для подключения к кластеру MongoDB
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="http://0.0.0.0:14444"
            value="${() => ppp.keyVault.getKey('mongo-proxy-url')}"            
            ${ref('mongoProxyUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <footer>
        <ppp-button
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
          Сохранить ключи
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

  async backupMongoDB() {
    this.beginOperation();

    try {
      await ppp.app.mountPage('backup-mongodb-modal', {
        title: 'Сохранить базу данных',
        size: 'large'
      });
    } catch (e) {
      this.failOperation(e, 'Создание резервной копии');
    } finally {
      this.endOperation();
    }
  }

  async restoreMongoDB() {
    this.beginOperation();

    try {
      await ppp.app.mountPage('restore-mongodb-modal', {
        title: 'Восстановить базу данных',
        size: 'medium'
      });
    } catch (e) {
      this.failOperation(e, 'Восстановление резервной копии');
    } finally {
      this.endOperation();
    }
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
      await validate(this.mongoConnectionUri);
      await validate(this.mongoProxyUrl);
      ppp.keyVault.setKey('tag', TAG);
      ppp.keyVault.setKey('master-password', this.masterPassword.value.trim());
      await caches.delete('offline');

      let globalProxyUrl;

      // Check the global proxy URL.
      try {
        globalProxyUrl = new URL(this.globalProxyUrl.value);

        this.progressOperation(25, 'Проверка прокси-ресурса...');

        await maybeFetchError(
          await fetch(new URL('user', globalProxyUrl.origin).toString(), {
            method: 'GET',
            cache: 'no-cache',
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `token ${this.gitHubToken.value.trim()}`,
              'X-Host': 'api.github.com',
              'X-Allowed-Headers': 'accept,authorization'
            }
          })
        );
      } catch (e) {
        invalidate(this.globalProxyUrl, {
          errorMessage:
            'Этот ресурс не может быть использован в качестве прокси',
          raiseException: true
        });
      }

      ppp.keyVault.setKey('global-proxy-url', globalProxyUrl.origin);

      this.progressOperation(50, 'Проверка токена GitHub...');

      // Check GitHub token, store repo owner.
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
      ppp.keyVault.setKey(
        'mongo-connection-uri',
        this.mongoConnectionUri.value.trim()
      );
      ppp.keyVault.setKey('mongo-proxy-url', this.mongoProxyUrl.value.trim());

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
