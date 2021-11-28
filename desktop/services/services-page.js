/** @decorator */

import { ServicesPage } from '../../base/services/services-page.js';
import { html, requireComponent } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { when } from '../../lib/element/templating/when.js';
import { ref } from '../../lib/element/templating/ref.js';
import { repeat } from '../../lib/element/templating/repeat.js';
import {
  basePageStyles,
  circleSvg,
  loadingIndicator
} from '../../design/leafygreen/styles/page.js';
import { SUPPORTED_SERVICES } from '../../lib/const.js';

import { settings } from '../../design/leafygreen/icons/settings.js';
import { caretDown } from '../../design/leafygreen/icons/caret-down.js';

await requireComponent('ppp-select');

const administrationServicesTemplate = html`
  <div class="card-container">
    <${'ppp-generic-card'}>
      <img slot="logo" alt="Netdata" src="../../static/netdata.svg"/>
      <span slot="title">Netdata</span>
      <span slot="description">Мониторинг серверов в реальном времени. <a
        target="_blank"
        href="https://github.com/netdata/netdata">Репозиторий</a>.</span>
      <${'ppp-button'}
        slot="action"
        @click="${(x) => (x.service = SUPPORTED_SERVICES.NETDATA)}"
      >
        Продолжить
      </ppp-button>
    </ppp-generic-card>
    <${'ppp-generic-card'}>
      <img slot="logo" alt="Certbot" src="../../static/certbot.svg"/>
      <span slot="title">Certbot</span>
      <span slot="description">Клиент для Let's Encrypt. HTTPS для домена. <a
        target="_blank"
        href="https://certbot.eff.org/">Сайт</a>.</span>
      <ppp-button
        slot="action"
        @click="${(x) => (x.service = SUPPORTED_SERVICES.CERTBOT)}"
      >
        Продолжить
      </ppp-button>
    </ppp-generic-card>
  </div>`;

export const servicesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Сервисы</ppp-page-header>
    ${when(
      (x) => !x.service,
      html`
        <${'ppp-tabs'} ${ref('tabs')} activeid="administration">
          <ppp-tab id="administration">Администрирование</ppp-tab>
          <ppp-tab id="scan" disabled>Сканеры</ppp-tab>
          <ppp-tab id="bots" disabled>Боты</ppp-tab>
          <ppp-tab-panel id="administration-panel"></ppp-tab-panel>
          <ppp-tab-panel id="scan-panel"></ppp-tab-panel>
          <ppp-tab-panel id="bots-panel"></ppp-tab-panel>
        </ppp-tabs>
      `
    )}
    <form ${ref('form')} id="services" name="services" onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        ${when(
          (x) => x.service === SUPPORTED_SERVICES.NETDATA,
          html`
            <h6 class="section-header">Важная информация</h6>
            <div class="section-subheader">
              <div class="section-description">
                По умолчанию Netdata работает на порту 19999, который закрыт
                сетевым экраном. Чтобы сервис стал доступным в публичной сети,
                необходимо открыть порт как внутри самой машины, так и снаружи
                через панель управления облачной платформы. Для машин в Oracle
                Cloud можно обратиться к инструкции по
                <a
                  target="_blank"
                  href="https://pantini.gitbook.io/pantini-co/recipes/open-port-oracle-cloud"
                  >ссылке</a
                >. Для открытия порта изнутри машины используйте следующие
                команды:
              </div>
              <div class="snippet-holder">
                <div class="snippet-inner">
                  <pre
                    tabindex="-1"
                  ><code><table class="code-table"><tbody><tr><td>sudo firewall-cmd --permanent --add-port=19999/tcp</td></tr><tr><td>sudo firewall-cmd --reload</td></tr></tbody></table></code></pre>
                </div>
              </div>
            </div>
          `
        )}
        ${when(
          (x) => x.service === SUPPORTED_SERVICES.CERTBOT,
          html`
            <h6 class="section-header">Важная информация</h6>
            <div class="section-subheader">
              <div class="section-description">
                Для успешной установки сервиса откройте порты 80 и 443. Для
                машин в Oracle Cloud можно обратиться к инструкции по
                <a
                  target="_blank"
                  href="https://pantini.gitbook.io/pantini-co/recipes/open-port-oracle-cloud"
                  >ссылке</a
                >. Также необходимо добавить IP-адрес сервера в A-запись DNS
                домена, для которого будет запрашиваться сертификат. Смотрите
                <a
                  target="_blank"
                  href="https://pantini.gitbook.io/pantini-co/recipes/setting-up-domain"
                  >инструкцию</a
                >.
              </div>
            </div>
          `
        )}
        ${when(
          (x) => x.service,
          html`
            <section>
              <div class="section-index-icon">${circleSvg(1)}</div>
              <div class="label-group">
                <h6>Сервер</h6>
                <p>
                  Выберите из списка машину, на которую будет устанавливаться
                  сервис.
                </p>
                <ppp-select
                  ?disabled="${(x) => x.fetching || !x.servers}"
                  placeholder="Нет доступных машин"
                  name="server"
                  ${ref('server')}
                >
                  ${repeat(
                    (x) => x?.servers,
                    html`
                      <ppp-option value="${(x) => x.uuid}"
                        >${(x) => x._id}
                      </ppp-option>
                    `
                  )}
                  ${when(
                    (x) => !x.fetching,
                    caretDown({
                      slot: 'indicator'
                    })
                  )}
                  ${when(
                    (x) => x.fetching,
                    settings({
                      slot: 'indicator',
                      cls: 'spinner-icon'
                    })
                  )}
                </ppp-select>
              </div>
            </section>
            <section>
              <div class="section-index-icon">${circleSvg(2)}</div>
              <div class="label-group">
                <h6>Команды перед настройкой</h6>
                <${'ppp-banner'} class="inline margin-top" appearance="warning">
                  Поддерживаются только операционные системы с пакетным
                  менеджером
                  RPM.
                </ppp-banner>
                <p>
                  Произвольные команды, которые можно использовать в отладочных
                  целях. Будут выполнены до настройки сервиса.
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
          (x) => x.service === SUPPORTED_SERVICES.CERTBOT,
          html`
            <section>
              <div class="section-index-icon">${circleSvg(3)}</div>
              <div class="label-group">
                <h6>Email</h6>
                <p>
                  Адрес, на который будет зарегистрирована учётная запись, чтобы
                  получать служебные уведомления (например, при скором истечении
                  сертификата).
                </p>
                <ppp-text-field
                  placeholder="Email"
                  name="email"
                  value="${(x) => x.app.ppp?.keyVault.getKey('auth0-email')}"
                  ${ref('email')}
                >
                </ppp-text-field>
              </div>
            </section>
            <section>
              <div class="section-index-icon">${circleSvg(4)}</div>
              <div class="label-group">
                <h6>Домены</h6>
                <p>
                  Список доменов, для которых нужно получить сертификаты. Можно
                  ввести несколько через запятую.
                </p>
                <ppp-text-field
                  placeholder="example.com, www.example.com"
                  name="domains"
                  ${ref('domains')}
                >
                </ppp-text-field>
              </div>
            </section>
          `
        )}
        ${when(
          (x) => !x.service && x.activeid === 'administration',
          administrationServicesTemplate
        )}
        ${when(
          (x) => x.mode === 'terminal',
          html`
            <ppp-modal ${ref('modal')}>
              <span slot="title">Настройка сервиса</span>
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
        (x) => x.service,
        html`
          <section class="last">
            <div class="footer-actions">
              <${'ppp-button'}
                ?disabled="${(x) => x.busy || x.mode === 'terminal'}"
                type="submit"
                @click="${(x) => x.setupService()}"
                appearance="primary"
              >
                ${when(
                  (x) => x.busy || x.mode === 'terminal',
                  settings({
                    slot: 'end',
                    cls: 'spinner-icon'
                  })
                )}
                Установить сервис
              </ppp-button>
            </div>
          </section>`
      )}
    </form>
  </template>
`;

export const servicesPageStyles = (context, definition) =>
  css`
    ${basePageStyles}
    .card-container {
      margin: 15px 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, 450px);
      grid-gap: 10px 30px;
    }

    .snippet-holder {
      margin-top: 6px;
    }

    section ppp-text-field,
    section ppp-banner,
    section ppp-text-area {
      max-width: 600px;
    }

    section ppp-select {
      width: 100%;
      max-width: 600px;
    }

    .description {
      padding: 10px 16px 10px 20px;
      border-radius: 7px;
      background-color: rgb(33, 49, 60);
      border: 1px solid rgb(231, 238, 236);
    }
  `;

export const servicesPage = ServicesPage.compose({
  baseName: 'services-page',
  template: servicesPageTemplate,
  styles: servicesPageStyles
});
