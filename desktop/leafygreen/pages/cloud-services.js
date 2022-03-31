import { CloudServicesPage } from '../../../shared/pages/cloud-services.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { pageStyles, circleSvg, loadingIndicator } from '../page.js';

export const cloudServicesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>Облачные сервисы</ppp-page-header>
    <form ${ref('form')} onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        <section>
          <div class="section-index-icon">
            ${circleSvg(1)}
          </div>
          <div class="label-group">
            <h6>Мастер-пароль</h6>
            <p>Требуется для шифрования/дешифрования конфиденциальных данных:
              токенов, ключей, других паролей.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Введите пароль"
              value="${(x) => x.app.ppp?.keyVault.getKey('master-password')}"
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
              placeholder="https://yourapp.herokuapp.com"
              value="${(x) =>
                x.app.ppp?.keyVault.getKey('service-machine-url')}"
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
              placeholder="Токен"
              value="${(x) => x.app.ppp?.keyVault.getKey('github-token')}"
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
              value="${(x) => x.app.ppp?.keyVault.getKey('mongo-public-key')}"
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
              placeholder="Приватный ключ"
              value="${(x) => x.app.ppp?.keyVault.getKey('mongo-private-key')}"
              ${ref('mongoPrivateKey')}
            ></ppp-text-field>
          </div>
        </section>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy}"
            type="submit"
            @click="${(x) => x.saveCloudCredentials()}"
            appearance="primary"
          >
            Сохранить
          </ppp-button>
        </div>
      </section>
    </form>
  </template>
`;

export const cloudServicesPageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const cloudServicesPage = CloudServicesPage.compose({
  baseName: 'cloud-services-page',
  template: cloudServicesPageTemplate,
  styles: cloudServicesPageStyles
});
