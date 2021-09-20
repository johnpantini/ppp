/** @decorator */

import { FoundationElement } from '../../lib/foundation-element/foundation-element.js';
import { observable } from '../../lib/element/observation/observable.js';
import { ref } from '../../lib/element/templating/ref.js';
import { html } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { when } from '../../lib/element/templating/when.js';
import { validate } from '../../lib/validate.js';
import {
  basePageStyles,
  circleSvg,
  loadingIndicator
} from '../../design/leafygreen/styles/page.js';

import { settings } from '../../design/leafygreen/icons/settings.js';

export class CloudServicesPage extends FoundationElement {
  @observable
  busy;

  async saveCloudCredentials({ event }) {
    try {
      this.busy = true;

      await validate(this.gitHubToken);
      await validate(this.auth0Token);
      await validate(this.mongoPublicKey);
      await validate(this.mongoPrivateKey);
    } finally {
      this.busy = false;
    }
  }
}

export const cloudServicesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Облачные сервисы</ppp-page-header>
    <form ${ref(
      'form'
    )} id="cloud-services" name="cloud-services" onsubmit="return false">
      <div class="loading-wrapper" style="${(x) =>
        x.busy ? 'opacity:.5' : 'opacity:1'}">
        <section>
          <div class="section-index-icon">
            ${circleSvg(1)}
          </div>
          <div class="label-group">
            <h6>Персональный токен GitHub</h6>
            <p>Потребуется для автоматического обновления приложения PPP. <a
              target="_blank"
              href="https://pantini.gitbook.io/pantini-co/ppp/github">Посмотреть
              инструкцию</a>.</p>
            <${'ppp-text-field'}
              placeholder="Токен"
              name="github-token"
              ${ref('gitHubToken')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(2)}
          </div>
          <div class="label-group">
            <h6>Токен администрирования Auth0</h6>
            <p>Сервис Auth0 служит для авторизации пользователей приложения PPP
              по
              логину и паролю, а также хранения ключей других облачных сервисов.
              <a
                target="_blank"
                href="https://pantini.gitbook.io/pantini-co/ppp/auth0">Посмотреть
                инструкцию</a>.</p>
            <ppp-text-field
              placeholder="Токен Auth0"
              name="auth0-token"
              ${ref('auth0Token')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(3)}
          </div>
          <div class="label-group">
            <h6>Публичный ключ MongoDB Realm</h6>
            <p>MongoDB Realm обеспечивает приложение PPP хранилищем настроек и
              платформой бессерверных функций. <a target="_blank"
                                                  href="https://pantini.gitbook.io/pantini-co/ppp/mongodb">Посмотреть
                инструкцию</a>.</p>
            <ppp-text-field
              placeholder="Публичный ключ"
              name="mongo-public-key"
              ${ref('mongoPublicKey')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">
            ${circleSvg(4)}
          </div>
          <div class="label-group">
            <h6>Приватный ключ MongoDB Realm</h6>
            <ppp-text-field
              placeholder="Приватный ключ"
              name="mongo-private-key"
              ${ref('mongoPrivateKey')}
            ></ppp-text-field>
          </div>
        </section>
        ${when((x) => !!x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => !!x.busy}"
            type="submit"
            @click="${(x, c) => x.saveCloudCredentials(c)}"
            appearance="primary"
          >
            ${when(
              (x) => !!x.busy,
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
    ${basePageStyles}
    section ppp-text-field {
      max-width: 600px;
    }
  `;

export const cloudServicesPage = CloudServicesPage.compose({
  baseName: 'cloud-services-page',
  template: cloudServicesPageTemplate,
  styles: cloudServicesPageStyles
});
