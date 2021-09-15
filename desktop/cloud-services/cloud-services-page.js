/** @decorator */

import { FoundationElement } from '../../lib/foundation-element/foundation-element.js';
import { observable } from '../../lib/element/observation/observable.js';
import { html } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { basePageStyles } from '../../design/leafygreen/styles/page.js';

export class CloudServicesPage extends FoundationElement {
  @observable
  page;
}

const circleSvg = (index) => `
  <svg height="24" width="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill="#3D4F58" stroke="#3D4F58"></circle>
    <text x="50%" y="50%" text-anchor="middle" fill="white" dy=".3em"
        font-size="smaller" font-weight="bold">${index.toString()}
    </text>
  </svg>`;

export const cloudServicesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Облачные сервисы</ppp-page-header>
    <section>
      <div class="section-index-icon">
        ${circleSvg(1)}
      </div>
      <div class="label-group">
        <h6>Персональный токен GitHub</h6>
        <p>Потребуется для автоматического обновления приложения PPP. <a target="_blank" href="https://pantini.gitbook.io/pantini-co/ppp/github">Посмотреть инструкцию</a>.</p>
        <${'ppp-text-field'} placeholder="Токен">
        </ppp-text-field>
      </div>
    </section>
    <section>
      <div class="section-index-icon">
        ${circleSvg(2)}
      </div>
      <div class="label-group">
        <h6>Домен Auth0</h6>
        <p>Сервис Auth0 служит для авторизации пользователей приложения PPP по логину и паролю, а также хранения ключей других облачных сервисов. <a target="_blank" href="https://pantini.gitbook.io/pantini-co/ppp/auth0">Посмотреть инструкцию</a>.</p>
        <ppp-text-field placeholder="Домен"></ppp-text-field>
      </div>
    </section>
    <section>
      <div class="section-index-icon">
        ${circleSvg(3)}
      </div>
      <div class="label-group">
        <h6>Идентификатор клиента Auth0</h6>
        <ppp-text-field placeholder="Идентификатор клиента"></ppp-text-field>
      </div>
    </section>
    <section>
      <div class="section-index-icon">
        ${circleSvg(4)}
      </div>
      <div class="label-group">
        <h6>Публичный ключ MongoDB Realm</h6>
        <p>MongoDB Realm обеспечивает приложение PPP хранилищем настроек и платформой бессерверных функций. <a target="_blank" href="https://pantini.gitbook.io/pantini-co/ppp/mongodb">Посмотреть инструкцию</a>.</p>
        <ppp-text-field placeholder="Публичный ключ"></ppp-text-field>
      </div>
    </section>
    <section>
      <div class="section-index-icon">
        ${circleSvg(5)}
      </div>
      <div class="label-group">
        <h6>Приватный ключ MongoDB Realm</h6>
        <ppp-text-field placeholder="Приватный ключ"></ppp-text-field>
      </div>
    </section>
    <section class="last">
      <div class="footer-actions">
        <${'ppp-button'} appearance="primary">Сохранить</ppp-button>
      </div>
    </section>
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
