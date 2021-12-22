import { ServerPage } from '../../base/server.js';
import { html } from '../lib/template.js';
import { ref } from '../lib/element/templating/ref.js';
import { css } from '../lib/element/styles/css.js';
import { when } from '../lib/element/templating/when.js';
import { SUPPORTED_SERVER_TYPES } from '../lib/const.js';

import {
  basePageStyles,
  circleSvg,
  loadingIndicator
} from '../design/leafygreen/styles/page.js';

import { settings } from '../design/leafygreen/icons/settings.js';

const serverTypeSelectionTemplate = html`
  <div class="selector">
    <h1 class="selector-title">
      Выберите, каким образом следует подключаться к серверу:
    </h1>
    <div class="cards">
      <div class="card">
        <div class="card-logo">
          <svg xmlns="http://www.w3.org/2000/svg" height="54"
               viewBox="0 0 56 66" fill="none">
            <path
              d="M23.75 39.0578L23.5067 38.6211L23.25 38.764V39.0578H23.75ZM19.25 39.0578H19.75V38.764L19.4933 38.6211L19.25 39.0578ZM39.9836 21.5H3.01639V22.5H39.9836V21.5ZM42.5 24.0923C42.5 23.413 42.1773 22.7711 41.7299 22.3069C41.2836 21.8438 40.657 21.5 39.9836 21.5V22.5C40.3184 22.5 40.7 22.6793 41.0099 23.0008C41.3186 23.3212 41.5 23.7254 41.5 24.0923H42.5ZM42.5 51.641V24.0923H41.5V51.641H42.5ZM37.7992 56.5C40.445 56.5 42.5 54.3406 42.5 51.641H41.5C41.5 53.8235 39.8582 55.5 37.7992 55.5V56.5ZM5.20082 56.5H37.7992V55.5H5.20082V56.5ZM0.5 51.641C0.5 54.3406 2.55496 56.5 5.20082 56.5V55.5C3.14176 55.5 1.5 53.8235 1.5 51.641H0.5ZM0.5 24.0923V51.641H1.5V24.0923H0.5ZM3.01639 21.5C1.54677 21.5 0.5 22.6132 0.5 24.0923H1.5C1.5 23.1304 2.13356 22.5 3.01639 22.5V21.5ZM23.25 39.0578V41.8512H24.25V39.0578H23.25ZM25.5 35.2975C25.5 36.7147 24.7099 37.9507 23.5067 38.6211L23.9933 39.4946C25.4901 38.6608 26.5 37.1035 26.5 35.2975H25.5ZM21.5 31.5C23.7208 31.5 25.5 33.2315 25.5 35.2975H26.5C26.5 32.6363 24.2292 30.5 21.5 30.5V31.5ZM17.5 35.2975C17.5 33.2315 19.2792 31.5 21.5 31.5V30.5C18.7708 30.5 16.5 32.6363 16.5 35.2975H17.5ZM19.4933 38.6211C18.2901 37.9507 17.5 36.7147 17.5 35.2975H16.5C16.5 37.1035 17.5099 38.6608 19.0067 39.4946L19.4933 38.6211ZM19.75 41.8512V39.0578H18.75V41.8512H19.75ZM21.5 43.5C20.5167 43.5 19.75 42.7355 19.75 41.8512H18.75C18.75 43.3306 20.0083 44.5 21.5 44.5V43.5ZM23.25 41.8512C23.25 42.7355 22.4833 43.5 21.5 43.5V44.5C22.9917 44.5 24.25 43.3306 24.25 41.8512H23.25Z"
              fill="#001E2B"/>
            <path
              d="M9 21.8306V13.3629C9 6.58871 14.4247 1 21 1C27.5753 1 33 6.58871 33 13.3629V22"
              stroke="#001E2B" stroke-miterlimit="10"/>
            <path
              d="M15 51C15 49.9 15.9474 49 17.1053 49H52.8947C54.0526 49 55 49.9 55 51V63C55 64.1 54.0526 65 52.8947 65H17.1053C15.9474 65 15 64.1 15 63V51Z"
              fill="#00ED64"/>
            <path
              d="M21 55L23 57M23 57L25 59M23 57L25 55M23 57L21 59M29 55L31 57M31 57L33 59M31 57L33 55M31 57L29 59M37 55L39 57M39 57L41 59M39 57L41 55M39 57L37 59M45 55L47 57M47 57L49 59M47 57L49 55M47 57L45 59M15 51C15 49.9 15.9474 49 17.1053 49H52.8947C54.0526 49 55 49.9 55 51V63C55 64.1 54.0526 65 52.8947 65H17.1053C15.9474 65 15 64.1 15 63V51Z"
              stroke="#001E2B" stroke-miterlimit="10"/>
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

export const serverPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-banner'} class="inline margin-top" appearance="warning">
      На сервер будет установлена система управления конфигурациями <a
      target="_blank" href="https://repo.saltproject.io/">Salt</a>.
      Поддерживаются только операционные системы с пакетным менеджером RPM.
    </ppp-banner>
    <${'ppp-page-header'}>Новый сервер</ppp-page-header>
    ${when((x) => !x.type, serverTypeSelectionTemplate)}
    <form ${ref('form')} id="server" name="server" onsubmit="return false">
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
          (x) => x.type,
          html`
            <section>
              <div class="section-index-icon">${circleSvg(6)}</div>
              <div class="label-group">
                <h6>Команды перед настройкой</h6>
                <${'ppp-banner'} class="inline margin-top" appearance="warning">
                  Поддерживаются только операционные системы с пакетным
                  менеджером
                  RPM.
                </ppp-banner>
                <p>
                  Произвольные команды, которые можно использовать в отладочных
                  целях.
                </p>
                <${'ppp-text-area'}
                  monospace
                  placeholder="Введите команды (опционально)"
                  value=""
                  name="commands"
                  ${ref('commands')}
                ></ppp-text-area>
              </div>
            </section>
          `
        )}
        ${when(
          (x) => x.mode === 'terminal',
          html`
            <ppp-modal ${ref('modal')}>
              <span slot="title">Настройка нового сервера</span>
              <div slot="body">
                <div class="description">
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
export const serverPageStyles = (context, definition) =>
  css`
    ${basePageStyles}
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

export const serverPage = ServerPage.compose({
  baseName: 'server-page',
  template: serverPageTemplate,
  styles: serverPageStyles
});
