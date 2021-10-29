import { NewServerPage } from '../../base/new-server/new-server-page.js';
import { html } from '../../lib/template.js';
import { ref } from '../../lib/element/templating/ref.js';
import { css } from '../../lib/element/styles/css.js';
import { when } from '../../lib/element/templating/when.js';

import {
  basePageStyles,
  circleSvg,
  loadingIndicator
} from '../../design/leafygreen/styles/page.js';

import { SUPPORTED_SERVER_TYPES } from '../../base/new-server/new-server-page.js';
import { settings } from '../../design/leafygreen/icons/settings.js';

const serverTypeSelectionTemplate = html`
  <div class="selector">
    <h1 class="selector-title">
      Выберите, каким образом следует подключаться к серверу:
    </h1>
    <div class="cards">
      <div class="card">
        <div class="card-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px"
               viewBox="0 0 32 32">
            <g stroke="none"
               stroke-width="1" fill="none" fill-rule="evenodd"
               stroke-linecap="round" stroke-linejoin="round">
              <g
                transform="translate(3.000000, 0.666667)" stroke-width="1.25">
                <path
                  d="M0.00485667374,4.40562745 L0.00485667374,14.7069216 C0.00485667374,21.3721782 4.10969798,27.3491131 10.330549,29.7421569 L11.7389608,30.2833333 C12.6768778,30.6440948 13.7152791,30.6440948 14.6531961,30.2833333 L16.0616078,29.7421569 C22.2824589,27.3491131 26.3873002,21.3721782 26.3873002,14.7069216 L26.3873002,4.40562745 C26.3925514,3.61380851 25.9328789,2.89252517 25.212902,2.56292157 C21.4244473,0.909342237 17.3295084,0.0744025561 13.1960784,0.112745098 C9.06264844,0.0744025561 4.9677096,0.909342237 1.1792549,2.56292157 C0.459277983,2.89252517 -0.00039451049,3.61380851 0.00485667374,4.40562745 Z"
                  stroke="#13AA52"/>
                <rect stroke="#116149" x="7.10784314"
                      y="12.2892157" width="12.1764706" height="10.1470588"
                      rx="1.5"/>
                <path
                  d="M13.1960784,6.20098039 L13.1960784,6.20098039 C10.9544521,6.20098039 9.1372549,8.01817758 9.1372549,10.2598039 L9.1372549,12.2892157 L17.254902,12.2892157 L17.254902,10.2598039 C17.254902,8.01817758 15.4377048,6.20098039 13.1960784,6.20098039 Z"
                  stroke="#116149"/>
                <path
                  d="M13.1960784,16.8946275 C13.4762817,16.8946275 13.7034314,17.1217771 13.7034314,17.4019804 C13.7034314,17.6821837 13.4762817,17.9093333 13.1960784,17.9093333 C12.9158751,17.9093333 12.6887255,17.6821837 12.6887255,17.4019804 C12.6887255,17.1217771 12.9158751,16.8946275 13.1960784,16.8946275"
                  stroke="#13AA52"/>
              </g>
            </g>
          </svg>
        </div>
        <div class="card-title">Пароль</div>
        <div class="card-description">
          Для входа понадобится ввести имя пользователя и пароль
        </div>
        <div class="card-action">
          <${'ppp-button'}
            @click="${(x) => (x.type = SUPPORTED_SERVER_TYPES.PASSWORD)}"
            slot="action"
          >
            Продолжить с паролем
          </ppp-button>
        </div>
      </div>
      <div class="card">
        <div class="card-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px"
               viewBox="0 0 64 64">
            <defs>
              <style>.c-1, .c-2 {
                fill: none;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-width: 2px;
              }

              .c-1 {
                stroke: #6e60f9;
              }

              .c-2 {
                stroke: #13aa52;
              }</style>
            </defs>
            <circle class="c-1" cx="23.41" cy="13.15" r="9.88"/>
            <path class="c-1" d="M2.5,48.35A20.91,20.91,0,0,1,38.19,33.56"/>
            <ellipse class="c-2" cx="40.13" cy="50.54" rx="9.75" ry="12.02"
                     transform="translate(-22.63 65.58) rotate(-65.03)"/>
            <line class="c-2" x1="52.23" y1="24.47" x2="61.5" y2="28.78"/>
            <line class="c-2" x1="44.31" y1="41.46" x2="53.88" y2="20.91"/>
            <line class="c-2" x1="56.04" y1="34.53" x2="49.06" y2="31.27"/>
          </svg>
        </div>
        <div class="card-title">Приватный ключ</div>
        <div class="card-description">
          Для входа понадобится приватный ключ в формате RSA или PPK
        </div>
        <div class="card-action">
          <${'ppp-button'}
            @click="${(x) => (x.type = SUPPORTED_SERVER_TYPES.KEY)}"
            slot="action"
          >
            Продолжить с ключом
          </ppp-button>
        </div>
      </div>
    </div>
  </div>
`;

const serverTypePasswordTemplate = html`
  <section>
    <div class="section-index-icon">${circleSvg(5)}</div>
    <div class="label-group">
      <h6>Пароль</h6>
      <${'ppp-banner'} class="inline margin-top" appearance="warning">
        Пароль будет сохранён в зашифрованном виде (по алгоритму
        AES-GCM).
      </ppp-banner>
      <ppp-text-field
        placeholder="Введите пароль"
        value=""
        type="password"
        name="password"
        ${ref('password')}
      ></ppp-text-field>
    </div>
  </section>
`;

const serverTypeKeyTemplate = html`
  <section>
    <div class="section-index-icon">${circleSvg(5)}</div>
    <div class="label-group">
      <h6>Приватный ключ</h6>
      <${'ppp-banner'} class="inline margin-top" appearance="warning">
        Ключ будет сохранён в зашифрованном виде (по алгоритму
        AES-GCM).
      </ppp-banner>
      <${'ppp-text-area'}
        monospace
        placeholder="Введите ключ"
        value=""
        name="key"
        ${ref('key')}
      ></ppp-text-area>
    </div>
  </section>
`;

export const newServerPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-banner'} class="inline margin-top" appearance="warning">
      На сервер будет установлена система управления конфигурациями <a
      target="_blank" href="https://repo.saltproject.io/">Salt</a>.
    </ppp-banner>
    <${'ppp-page-header'}>Новый сервер</ppp-page-header>
    ${when((x) => !x.type, serverTypeSelectionTemplate)}
    <form ${ref(
      'form'
    )} id="new-server" name="new-server" onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        ${when(
          (x) => x.type,
          html`
            <section>
              <div class="section-index-icon">${circleSvg(1)}</div>
              <div class="label-group">
                <h6>Название сервера</h6>
                <p>
                  Произвольное имя, чтобы ссылаться на этот сервер, когда
                  потребуется.
                </p>
                <${'ppp-text-field'}
                  placeholder="Введите название"
                  value=""
                  name="serverName"
                  ${ref('serverName')}
                ></ppp-text-field>
              </div>
            </section>
            <section>
              <div class="section-index-icon">${circleSvg(2)}</div>
              <div class="label-group">
                <h6>Адрес</h6>
                <p>
                  Укажите IP-адрес сервера.
                </p>
                <ppp-text-field
                  placeholder="192.168.0.1"
                  value=""
                  name="host"
                  ${ref('host')}
                ></ppp-text-field>
              </div>
            </section>
            <section>
              <div class="section-index-icon">${circleSvg(3)}</div>
              <div class="label-group">
                <h6>Порт</h6>
                <p>
                  Укажите SSH-порт сервера.
                </p>
                <ppp-text-field
                  placeholder="22"
                  value="22"
                  name="port"
                  ${ref('port')}
                ></ppp-text-field>
              </div>
            </section>
            <section>
              <div class="section-index-icon">${circleSvg(4)}</div>
              <div class="label-group">
                <h6>Имя пользователя</h6>
                <ppp-text-field
                  placeholder="root"
                  value=""
                  name="userName"
                  ${ref('userName')}
                ></ppp-text-field>
              </div>
            </section>
          `
        )}
        ${when(
          (x) => x.type === SUPPORTED_SERVER_TYPES.PASSWORD,
          serverTypePasswordTemplate
        )}
        ${when(
          (x) => x.type === SUPPORTED_SERVER_TYPES.KEY,
          serverTypeKeyTemplate
        )}
        ${when(
          (x) => x.mode === 'terminal',
          html`
            <ppp-modal ${ref('modal')}>
              <span slot="title">Настройка нового сервера</span>
              <div slot="body">
                <div class="inner">
                  <ppp-terminal ${ref('terminalDom')}></ppp-terminal>
                </div>
              </div>
            </ppp-modal>
          `
        )}
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      ${when(
        (x) => x.type,
        html`
          <section class="last">
            <div class="footer-actions">
              <${'ppp-button'}
                ?disabled="${(x) => x.busy || x.mode === 'terminal'}"
                type="submit"
                @click="${(x) => x.createServer()}"
                appearance="primary"
              >
                ${when(
                  (x) => x.busy || x.mode === 'terminal',
                  settings({
                    slot: 'end',
                    cls: 'spinner-icon'
                  })
                )}
                ${i18n.t('save')}
              </ppp-button>
            </div>
          </section>`
      )}
    </form>
  </template>
`;

// TODO - refactor later if needed
export const newServerPageStyles = (context, definition) =>
  css`
    ${basePageStyles}
    section ppp-text-field,
    section ppp-banner {
      max-width: 600px;
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

    ppp-page-header {
      padding-top: 15px;
    }

    section ppp-text-field,
    section ppp-banner {
      max-width: 600px;
    }

    section ppp-text-area {
      max-width: 600px;
    }

    .inner {
      padding: 10px 8px 10px 20px;
      border-radius: 7px;
      background-color: rgb(33, 49, 60);
      border: 1px solid rgb(231, 238, 236);
    }
  `;

export const newServerPage = NewServerPage.compose({
  baseName: 'new-server-page',
  template: newServerPageTemplate,
  styles: newServerPageStyles
});
