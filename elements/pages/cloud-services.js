import ppp from '../../ppp.js';
import { css, html, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { numberedCircle } from '../../static/svg/sprite.js';
import '../banner.js';
import '../checkbox.js';
import '../copyable.js';
import '../modal.js';
import '../text-field.js';
import '../pages/import-cloud-keys-modal.js';

export const cloudServicesPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>Облачные сервисы</ppp-page-header>
      ${when(
        () => ppp.keyVault.ok(),
        html`
          <div class="spacing2"></div>
          <ppp-banner class="inline" appearance="success">
            Облачные сервисы в порядке. Скопируйте компактное представление ниже
            для переноса ключей в другие браузеры:
          </ppp-banner>
          <div class="spacing2"></div>
          <ppp-copyable>
            ${(x) => x.generateCloudCredentialsString()}
          </ppp-copyable>
        `
      )}
      ${when(
        () => !ppp.keyVault.ok(),
        html`
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
          <div class="spacing2"></div>
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
          <ppp-banner class="inline" appearance="info">
            Придумайте пароль при первой настройке приложения.
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Введите пароль"
            value="${() => ppp.keyVault.getKey('master-password')}"
            ${ref('masterPassword')}
          ></ppp-text-field>
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

export class CloudServicesPage extends Page {
  generateCloudCredentialsString() {
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
}

export default CloudServicesPage.compose({
  template: cloudServicesPageTemplate,
  styles: cloudServicesPageStyles
}).define();
