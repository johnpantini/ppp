import { ServerSelectorPage } from '../../../shared/pages/server-selector.js';
import { SUPPORTED_SERVER_TYPES } from '../../../shared/const.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles } from '../page.js';

export const serverSelectorPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-banner'} class="inline margin-top" appearance="warning">
      На сервер будет установлена система управления конфигурациями <a
      target="_blank" href="https://repo.saltproject.io/">Salt</a>.
      Поддерживаются только RHEL-совместимые операционные системы.
    </ppp-banner>
    <${'ppp-page-header'}>Серверы</ppp-page-header>
    <div class="selector">
      <h1 class="selector-title">
        Выберите, каким образом следует подключаться к серверу:
      </h1>
      <div class="cards">
        <div class="card">
          <div class="card-logo">
            <img slot="logo" draggable="false" alt="Password"
                 style="height: 52px"
                 src="static/password.svg"/>
          </div>
          <div class="card-title">Пароль</div>
          <div class="card-description">
            Для подключения к серверу понадобится ввести имя пользователя и
            пароль
          </div>
          <div class="card-action">
            <${'ppp-button'}
              @click="${(x) =>
                x.app.navigate({
                  page: 'server',
                  type: SUPPORTED_SERVER_TYPES.PASSWORD
                })}"
              slot="action"
            >
              Продолжить с паролем
            </ppp-button>
          </div>
        </div>
        <div class="card">
          <div class="card-logo">
            <img slot="logo" draggable="false" alt="Private Key"
                 style="height: 52px"
                 src="static/private-key.svg"/>
          </div>
          <div class="card-title">Приватный ключ</div>
          <div class="card-description">
            Для подключения понадобится имя пользователя и приватный ключ в
            формате RSA или PPK
          </div>
          <div class="card-action">
            <${'ppp-button'}
              @click="${(x) =>
                x.app.navigate({
                  page: 'server',
                  type: SUPPORTED_SERVER_TYPES.KEY
                })}"
              slot="action"
            >
              Продолжить с ключом
            </ppp-button>
          </div>
        </div>
      </div>
    </div>
  </template>
`;

export const serverSelectorPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    ppp-page-header {
      padding-top: 15px;
    }

    .selector {
      box-sizing: border-box;
      word-wrap: break-word;
      align-items: center;
      display: flex;
      flex-flow: column;
      justify-content: center;
      min-height: 260px;
      padding: 40px 0 0;
    }

    .selector-title {
      display: flex;
      font-size: 32px;
      font-weight: 300;
      padding: 32px 0 16px;
      max-width: 600px;
      text-align: center;
    }

    .cards {
      display: flex;
      flex-direction: row;
      margin-bottom: 70px;
      margin-top: 20px;
    }

    .card {
      align-items: center;
      display: flex;
      flex-direction: column;
      margin: 0 20px;
      min-height: 220px;
      padding: 5px 30px;
      position: relative;
      width: 300px;
      border-radius: 7px;
      transition: border 300ms ease-in-out 0s, box-shadow 300ms ease-in-out 0s;
      border: 1px solid rgb(231, 238, 236);
      box-shadow: rgba(6, 22, 33, 0.3) 0 4px 10px -4px;
      background-color: white;
      color: rgb(33, 49, 60);
    }

    .card-logo {
      height: 50px;
      margin-top: 20px;
    }

    .card-title {
      color: #3d4f58;
      margin: 10px 0;
      text-align: center;
    }

    .card-description {
      color: #89979b;
      font-size: 14px;
      margin: 5px 0 25px;
      text-align: center;
    }

    .card-action {
      margin-bottom: 25px;
    }

    .description {
      padding: 10px 16px 10px 20px;
      border-radius: 7px;
      background-color: rgb(33, 49, 60);
      border: 1px solid rgb(231, 238, 236);
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const serverSelectorPage = ServerSelectorPage.compose({
  baseName: 'server-selector-page',
  template: serverSelectorPageTemplate,
  styles: serverSelectorPageStyles
});
