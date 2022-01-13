import { CloudServicesPage } from '../../../shared/pages/cloud-services.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { pageStyles, circleSvg, loadingIndicator } from '../page.js';
import { settings } from '../icons/settings.js';

export const cloudServicesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Облачные сервисы</ppp-page-header>
    <form ${ref(
      'form'
    )} id="cloud-services" name="cloud-services" onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        <${'ppp-banner'} class="inline margin-top" appearance="warning">
          Токен Auth0
          требуется только на этапе настройки облачных сервисов, он не
          сохраняется на сервере.
        </ppp-banner>
        <section>
          <div class="section-index-icon">
            ${circleSvg(1)}
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
              name="service-machine-url"
              value="${(x) =>
                x.app.ppp?.keyVault.getKey('service-machine-url')}"
              ${ref('serviceMachineUrl')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(2)}
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
              name="github-token"
              value="${(x) => x.app.ppp?.keyVault.getKey('github-token')}"
              ${ref('gitHubToken')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(3)}
          </div>
          <div class="label-group">
            <h6>Токен Auth0</h6>
            <p>Сервис Auth0 служит для авторизации пользователей приложения PPP
              по
              логину и паролю, а также хранения ключей других облачных сервисов.
              <a
                target="_blank"
                href="https://pantini.gitbook.io/pantini-co/ppp/auth0">Посмотреть
                инструкцию</a>.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Токен Auth0"
              name="auth0-token"
              value="${(x) => x.app.ppp?.keyVault.getKey('auth0-token')}"
              ${ref('auth0Token')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(4)}
          </div>
          <div class="label-group">
            <h6>Email Auth0</h6>
            <p>Укажите Email пользователя, которого вы создали ранее в сервисе
              Auth0 по <a
                target="_blank"
                href="https://pantini.gitbook.io/pantini-co/ppp/auth0">инструкции</a>.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Email пользователя Auth0"
              name="auth0-email"
              value="${(x) => x.app.ppp?.keyVault.getKey('auth0-email')}"
              ${ref('auth0Email')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(5)}
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
              name="mongo-public-key"
              value="${(x) => x.app.ppp?.keyVault.getKey('mongo-public-key')}"
              ${ref('mongoPublicKey')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(6)}
          </div>
          <div class="label-group">
            <h6>Приватный ключ MongoDB Realm</h6>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Приватный ключ"
              name="mongo-private-key"
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
            ${when(
              (x) => x.busy,
              settings({
                slot: 'end',
                cls: 'spinner-icon'
              })
            )}
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
