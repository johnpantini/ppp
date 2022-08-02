import { CloudServicesPage } from '../../shared/cloud-services-page.js';
import { ref } from '../../shared/element/templating/ref.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles, circleSvg } from './page.js';
import ppp from '../../ppp.js';

export const cloudServicesPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          Облачные сервисы
        </span>
        <span slot="submit-control-text">Сохранить пароль и ключи</span>
        ${when(
          () => ppp?.keyVault.ok(),
          html`
            <${'ppp-banner'} class="inline margin-top" appearance="info">
              Облачные сервисы в порядке. Скопируйте компактное представление
              ниже для переноса ключей в другие браузеры:
            </ppp-banner>
            <${'ppp-copyable'}>
              ${(x) => x.generateCloudCredentialsString()}
            </ppp-copyable>
          `
        )}
        ${when(
          () => !ppp?.keyVault.ok(),
          html`
            <ppp-modal
              ${ref('importCloudKeysModal')}
              dismissible
            >
              <span slot="title">Импортировать ключи</span>
              <div slot="body">
                <div class="description">
                  Чтобы импортировать ключи, подготовьте мастер-пароль и
                  компактное представление, полученное в настроенной ранее
                  версии приложения PPP.
                </div>
                <ppp-import-cloud-keys-modal-page
                  :parent="${(x) => x}"
                ></ppp-import-cloud-keys-modal-page>
              </div>
            </ppp-modal>
            <${'ppp-banner'} class="inline margin-top" appearance="warning">
              Необходимо заново сохранить настройки облачных сервисов. Также
              можно <a @click="${(x) => x.handleImportCloudKeysClick()}"
                       href="javascript:void(0)">импортировать ключи</a>.
            </ppp-banner>
          `
        )}
        <section>
          <div class="section-index-icon">
            ${circleSvg(1)}
          </div>
          <div class="label-group">
            <h6>Мастер-пароль</h6>
            <p>Требуется для шифрования/дешифрования конфиденциальных данных:
              токенов, ключей, других паролей.</p>
            <${'ppp-banner'} class="inline margin-top" appearance="info">
              Придумайте пароль при первой настройке приложения PPP.
            </ppp-banner>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Введите пароль"
              value="${() => ppp?.keyVault.getKey('master-password')}"
              ${ref('masterPassword')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(2)}
          </div>
          <div class="label-group">
            <h6>Сервисная машина</h6>
            <p>Сервисная машина требуется для настройки компонентов PPP.
              <a
                target="_blank"
                href="https://pantini.gitbook.io/pantini-co/ppp/service-machine">Посмотреть
                инструкцию</a>.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="https://example.com"
              value="${() => ppp?.keyVault.getKey('service-machine-url')}"
              ${ref('serviceMachineUrl')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(3)}
          </div>
          <div class="label-group">
            <h6>Персональный токен GitHub</h6>
            <p>Потребуется для автоматического обновления приложения PPP. <a
              target="_blank"
              href="https://pantini.gitbook.io/pantini-co/ppp/github">Посмотреть
              инструкцию</a>.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              type="password"
              placeholder="Токен"
              value="${() => ppp?.keyVault.getKey('github-token')}"
              ${ref('gitHubToken')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(4)}
          </div>
          <div class="label-group">
            <h6>Публичный ключ MongoDB Realm</h6>
            <p>MongoDB Realm обеспечивает приложение PPP хранилищем настроек и
              платформой бессерверных функций. <a target="_blank"
                                                  href="https://pantini.gitbook.io/pantini-co/ppp/mongodb">Посмотреть
                инструкцию</a>.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Публичный ключ"
              value="${() => ppp?.keyVault.getKey('mongo-public-key')}"
              ${ref('mongoPublicKey')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(5)}
          </div>
          <div class="label-group">
            <h6>Приватный ключ MongoDB Realm</h6>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Приватный ключ"
              value="${() => ppp?.keyVault.getKey('mongo-private-key')}"
              ${ref('mongoPrivateKey')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default CloudServicesPage.compose({
  template: cloudServicesPageTemplate,
  styles: pageStyles
});
