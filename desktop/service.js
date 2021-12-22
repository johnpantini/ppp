/** @decorator */

import { ServicePage } from '../base/service.js';
import { html, requireComponent } from '../lib/template.js';
import { css } from '../lib/element/styles/css.js';
import { when } from '../lib/element/templating/when.js';
import { ref } from '../lib/element/templating/ref.js';
import { repeat } from '../lib/element/templating/repeat.js';
import {
  basePageStyles,
  circleSvg,
  loadingIndicator
} from '../design/leafygreen/styles/page.js';
import { SUPPORTED_SERVICES } from '../lib/const.js';
import { DOM } from '../lib/element/dom.js';

import { settings } from '../design/leafygreen/icons/settings.js';
import { caretDown } from '../design/leafygreen/icons/caret-down.js';
import { trash } from '../design/leafygreen/icons/trash.js';

await Promise.all([
  requireComponent('ppp-select'),
  requireComponent('ppp-tab', `../design/${globalThis.ppp.theme}/tabs/tabs.js`),
  requireComponent(
    'ppp-tab-panel',
    `../design/${globalThis.ppp.theme}/tabs/tabs.js`
  )
]);

DOM.queueUpdate(() => requireComponent('ppp-tabs'));

const packagesServicesTemplate = html`
  <div class="card-container">
    <${'ppp-generic-card'}>
      <img slot="logo" draggable="false" alt="Netdata" src="static/netdata.svg"/>
      <span slot="title">Netdata</span>
      <span slot="description">Мониторинг серверов в реальном времени. <a
        target="_blank"
        href="https://github.com/netdata/netdata">Репозиторий</a>.</span>
      <${'ppp-button'}
        slot="action"
        @click="${(x) => (x.type = SUPPORTED_SERVICES.NETDATA)}"
      >
        Продолжить
      </ppp-button>
    </ppp-generic-card>
    <ppp-generic-card>
      <img slot="logo" draggable="false" alt="Certbot" src="static/certbot.svg"/>
      <span slot="title">Certbot</span>
      <span slot="description">Клиент для Let's Encrypt. HTTPS для домена. <a
        target="_blank"
        href="https://certbot.eff.org/">Сайт</a>.</span>
      <ppp-button
        slot="action"
        @click="${(x) => (x.type = SUPPORTED_SERVICES.CERTBOT)}"
      >
        Продолжить
      </ppp-button>
    </ppp-generic-card>
    <ppp-generic-card>
      <img slot="logo" height="60px" style="margin-left: -16px" draggable="false" alt="RocksDB" src="static/rocksdb.svg"/>
      <span slot="title">RocksDB</span>
      <span slot="description">Встраиваемая база данных. <a
        target="_blank"
        href="http://rocksdb.org/">Сайт</a>.</span>
      <ppp-button
        slot="action"
        @click="${(x) => (x.type = SUPPORTED_SERVICES.ROCKSDB)}"
      >
        Продолжить
      </ppp-button>
    </ppp-generic-card>
  </div>`;

const httpsServicesTemplate = html`
  <div class="card-container">
    <${'ppp-generic-card'}>
      <img slot="logo" draggable="false" alt="HTTPS/WebSocket" src="static/https.svg"/>
      <span slot="title">HTTPS/WebSocket-сервис</span>
      <span
        slot="description">Произвольный сервис с доступом по HTTPS/WebSocket.</span>
      <${'ppp-button'}
        slot="action"
        @click="${(x) => (x.type = SUPPORTED_SERVICES.HTTPS_WEBSOCKET)}"
      >
        Продолжить
      </ppp-button>
    </ppp-generic-card>
  </div>`;

const telegramServicesTemplate = html`
  <div class="card-container">
    <${'ppp-generic-card'}>
      <img slot="logo" draggable="false" alt="Периодическое обновление сообщения"
           src="static/query.svg"/>
      <span slot="title">Периодическое обновление сообщения</span>
      <span
        slot="description">Сервис редактирует сообщение в канале по таймеру.</span>
      <${'ppp-button'}
        slot="action"
        @click="${(x) => (x.type = SUPPORTED_SERVICES.TG_UPDATER)}"
      >
        Продолжить
      </ppp-button>
    </ppp-generic-card>
  </div>`;

const netdataBeforeTemplate = when(
  (x) => x.type === SUPPORTED_SERVICES.NETDATA,
  html`
    <h6 class="section-header">Важная информация</h6>
    <div class="section-subheader">
      <div class="section-description">
        По умолчанию Netdata работает на порту 19999, который закрыт сетевым
        экраном. Чтобы сервис стал доступным в публичной сети, необходимо
        открыть порт как внутри самой машины, так и снаружи через панель
        управления облачной платформы. Для машин в Oracle Cloud можно обратиться
        к инструкции по
        <a
          target="_blank"
          href="https://pantini.gitbook.io/pantini-co/recipes/open-port-oracle-cloud"
          >ссылке</a
        >. Для открытия порта изнутри машины используйте следующие команды:
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
);

const certbotBeforeTemplate = when(
  (x) => x.type === SUPPORTED_SERVICES.CERTBOT,
  html`
    <h6 class="section-header">Важная информация</h6>
    <div class="section-subheader">
      <div class="section-description">
        Для успешной установки сервиса откройте порты 80 и 443. Для машин в
        Oracle Cloud можно обратиться к инструкции по
        <a
          target="_blank"
          href="https://pantini.gitbook.io/pantini-co/recipes/open-port-oracle-cloud"
          >ссылке</a
        >. Также необходимо добавить IP-адрес сервера в A-запись DNS домена, для
        которого будет запрашиваться сертификат. Смотрите
        <a
          target="_blank"
          href="https://pantini.gitbook.io/pantini-co/recipes/setting-up-domain"
          >инструкцию</a
        >.
      </div>
    </div>
  `
);

const certbotAfterTemplate = when(
  (x) => x.type === SUPPORTED_SERVICES.CERTBOT,
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
      </div>
      <div class="input-group">
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
          Список доменов, для которых нужно получить сертификаты. Можно ввести
          несколько через запятую.
        </p>
      </div>
      <div class="input-group">
        <ppp-text-field
          placeholder="example.com, www.example.com"
          name="certbot-domains"
          ${ref('certbotDomains')}
        >
        </ppp-text-field>
      </div>
    </section>
  `
);

const tgUpdaterAfterTemplate = when(
  (x) => x.type === SUPPORTED_SERVICES.TG_UPDATER,
  html`
    <section>
      <div class="section-index-icon">${circleSvg(3)}</div>
      <div class="label-group">
        <h6>Название сервиса</h6>
        <p>
          Произвольное имя, чтобы ссылаться на этот сервис, когда
          потребуется.
        </p>
      </div>
      <div class="input-group">
        <${'ppp-text-field'}
          placeholder="Введите имя"
          name="serviceName"
          ${ref('serviceName')}
        ></ppp-text-field>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(4)}</div>
      <div class="label-group">
        <h6>Бот Telegram</h6>
        <p>
          Выберите профиль бота, который будет обновлять ообщение.
        </p>
      </div>
      <div class="input-group">
        <ppp-select
          ?disabled="${(x) => !x.bots}"
          placeholder="Нет созданных профилей"
          name="bot"
          ${ref('bot')}
        >
          ${repeat(
            (x) => x?.bots,
            html`
              <ppp-option value="${(x) => x.uuid}">${(x) => x._id}</ppp-option>
            `
          )}
          ${when(
            (x) => x.bots !== null,
            caretDown({
              slot: 'indicator'
            })
          )}
          ${when(
            (x) => x.bots === null,
            settings({
              slot: 'indicator',
              cls: 'spinner-icon'
            })
          )}
        </ppp-select>
        <${'ppp-button'}
          class="margin-top"
          @click="${(x) => (x.app.page = 'telegram-bot')}"
          appearance="primary"
        >
          Добавить бота
        </ppp-button>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(5)}</div>
      <div class="label-group">
        <h6>Канал/группа</h6>
        <p>
          Укажите идентификатор канала/группы, в котором находится целевое
          сообщение.
        </p>
        <${'ppp-banner'} class="inline margin-top" appearance="warning">
          Бот должен обладать правами публикации сообщений в канале/группе.
        </ppp-banner>
        <ppp-text-field
          type="number"
          placeholder="id группы/канала"
          name="channel"
          ${ref('channel')}
        >
        </ppp-text-field>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(6)}</div>
      <div class="label-group">
        <h6>Сообщение</h6>
        <${'ppp-banner'} class="inline margin-top" appearance="warning">
          Сообщение должно быть отправлено ботом. Воспользуйтесь кнопкой под
          полем ввода, чтобы отправить новое тестовое сообщение и получить его
          id.
        </ppp-banner>
        <p>
          Укажите идентификатор целевого сообщения для обновлений.
        </p>
      </div>
      <div class="input-group">
        <ppp-text-field
          type="number"
          placeholder="id сообщения"
          name="message"
          ${ref('message')}
        >
        </ppp-text-field>
        <${'ppp-button'}
          class="margin-top"
          ?disabled="${(x) => x.busy}"
          @click="${(x) => x.sendTestTelegramMessage()}"
          appearance="primary"
        >
          ${when(
            (x) => x.busy || x.mode === 'terminal',
            settings({
              slot: 'end',
              cls: 'spinner-icon'
            })
          )}
          Отправить тестовое сообщение
        </ppp-button>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(7)}</div>
      <div class="label-group">
        <h6>Метод запроса и источник данных</h6>
        <p>
          Укажите метод и полный адрес для выполнения запроса.
        </p>
      </div>
      <div class="input-group">
        <ppp-select
          placeholder="Метод запроса"
          name="method"
          ${ref('method')}
        >
          <ppp-option value="get">GET</ppp-option>
          <ppp-option value="post">POST</ppp-option>
          <ppp-option value="put">PUT</ppp-option>
          <ppp-option value="delete">DELETE</ppp-option>
          ${caretDown({
            slot: 'indicator'
          })}
        </ppp-select>
        <ppp-text-field
          type="text"
          placeholder="URL"
          name="endpoint"
          ${ref('endpoint')}
        >
        </ppp-text-field>
        <${'ppp-button'}
          disabled
          class="margin-top"
          @click="${(x) => x.chooseURLFromHTTPSServices()}"
          appearance="primary"
        >
          Выбрать из HTTPS-сервисов
        </ppp-button>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(8)}</div>
      <div class="label-group">
        <h6>Интервал обновления</h6>
        <p>
          Укажите периодичность запуска сервиса.
        </p>
      </div>
      <div class="input-group">
        <${'ppp-banner'} class="inline margin-top" appearance="warning">
          Если не указывать единицу измерения, интервал будет рассчитан в
          секундах.
        </ppp-banner>
        <ppp-text-field
          placeholder="6s"
          name="interval"
          ${ref('interval')}
        >
        </ppp-text-field>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(9)}</div>
      <div class="label-group full">
        <h6>Логика форматирования</h6>
        <p>
          Код, отвечающий за форматирование публикуемого сообщения.
        </p>
        <${'ppp-codeflask'}
          :code="${() => ``}"
          name="code"
          ${ref('code')}
        ></ppp-codeflask>
      </div>
    </section>
  `
);

const httpsAfterTemplate = when(
  (x) => x.type === SUPPORTED_SERVICES.HTTPS_WEBSOCKET,
  html`
    <section>
      <div class="section-index-icon">${circleSvg(3)}</div>
      <div class="label-group">
        <h6>Название сервиса</h6>
        <p>
          Произвольное имя, чтобы ссылаться на этот сервис, когда
          потребуется.
        </p>
      </div>
      <div class="input-group">
        <${'ppp-text-field'}
          placeholder="Введите имя"
          name="serviceName"
          ${ref('serviceName')}
        ></ppp-text-field>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(4)}</div>
      <div class="label-group">
        <h6>Домен</h6>
        <p>
          Укажите домен, к которому будет привязан сервис.
        </p>
      </div>
      <div class="input-group">
        <ppp-select
          ?disabled="${(x) => !x.domains}"
          placeholder="Нет доступных доменов"
          name="domain"
          ${ref('domain')}
        >
          ${repeat(
            (x) => x?.domains,
            html` <ppp-option value="${(x) => x}">${(x) => x}</ppp-option> `
          )}
          ${when(
            (x) => x.domains !== null,
            caretDown({
              slot: 'indicator'
            })
          )}
          ${when(
            (x) => x.domains === null,
            settings({
              slot: 'indicator',
              cls: 'spinner-icon'
            })
          )}
        </ppp-select>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(5)}</div>
      <div class="label-group">
        <h6>Порт</h6>
        <${'ppp-banner'} class="inline margin-top" appearance="warning">
          Операция настройки сервиса не открывает порты в автоматическом режиме.
          При необходимости используйте дополнительные команды.
        </ppp-banner>
        <p>
          Укажите порт прослушивания.
        </p>
      </div>
      <div class="input-group">
        <ppp-text-field
          type="number"
          placeholder="Порт"
          name="port"
          ${ref('port')}
        >
        </ppp-text-field>
        <${'ppp-button'}
          class="margin-top"
          disabled
          @click="${(x) => x.chooseOpenPort()}"
          appearance="primary"
        >
          ${when(
            (x) => x.busy,
            settings({
              slot: 'end',
              cls: 'spinner-icon'
            })
          )}
          Выбрать незанятый
        </ppp-button>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(6)}</div>
      <div class="label-group">
        <h6>HTTPS-маршруты</h6>
        <${'ppp-banner'} class="inline margin-top" appearance="warning">
          Маршруты являются конфиденциальными данными.
        </ppp-banner>
        <p>
          Добавьте HTTPS-маршруты в переменные окружения сервиса.
        </p>
      </div>
      <div class="input-group">
        ${repeat(
          (x) => x.httpsRoutes,
          html`
            <div class="action-input">
              <ppp-text-field
                class="action-input-text"
                type="text"
                value="${(x) => x?.value}"
                placeholder="Маршрут"
              >
              </ppp-text-field>
              <${'ppp-button'}
                appearance="default"
                class="small action-input-button"
                @click="${(x, c) => c.parent.httpsRoutes.splice(c.index, 1)}"
              >
                ${trash({ size: 14 })}
              </ppp-button>
            </div>
          `,
          { positioning: true }
        )}
        <${'ppp-button'}
          class="margin-top"
          @click="${(x) => x.addHTTPSRoute()}"
          appearance="primary"
        >
          Добавить HTTPS-маршрут
        </ppp-button>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(7)}</div>
      <div class="label-group">
        <h6>WebSocket-маршруты</h6>
        <${'ppp-banner'} class="inline margin-top" appearance="warning">
          Маршруты являются конфиденциальными данными.
        </ppp-banner>
        <p>
          Добавьте WebSocket-маршруты.
        </p>
      </div>
      <div class="input-group">
        ${repeat(
          (x) => x.wsRoutes,
          html`
            <div class="action-input">
              <ppp-text-field
                class="action-input-text"
                type="text"
                value="${(x) => x?.value}"
                placeholder="Маршрут"
              >
              </ppp-text-field>
              <${'ppp-button'}
                appearance="default"
                class="small action-input-button"
                @click="${(x, c) => c.parent.wsRoutes.splice(c.index, 1)}"
              >
                ${trash({ size: 14 })}
              </ppp-button>
            </div>
          `,
          { positioning: true }
        )}
        <${'ppp-button'}
          class="margin-top"
          @click="${(x) => x.addWSRoute()}"
          appearance="primary"
        >
          Добавить WebSocket-маршрут
        </ppp-button>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(8)}</div>
      <div class="label-group">
        <h6>Брокерские профили</h6>
        <p>
          Укажите профили брокеров, учётные данные которых будут переданы в
          сервис.
        </p>
      </div>
      <div class="input-group">
        ${repeat(
          (x) => x.brokerProfiles,
          html`
            <div class="action-input">
              <ppp-select
                class="action-input-text"
                ?disabled="${(x, c) => !c.parent.brokers}"
                placeholder="Нет профилей брокеров"
              >
                ${repeat(
                  (x, c) => c.parent.brokers,
                  html`
                    <ppp-option value="${(x) => x.uuid}"
                      >${(x) => x._id}
                    </ppp-option>
                  `
                )}
                ${when(
                  (x, c) => c.parent.brokers !== null,
                  caretDown({
                    slot: 'indicator'
                  })
                )}
                ${when(
                  (x, c) => c.parent.brokers === null,
                  settings({
                    slot: 'indicator',
                    cls: 'spinner-icon'
                  })
                )}
              </ppp-select>
              <${'ppp-button'}
                appearance="default"
                class="small action-input-button"
                @click="${(x, c) => c.parent.brokerProfiles.splice(c.index, 1)}"
              >
                ${trash({ size: 14 })}
              </ppp-button>
            </div>
          `,
          { positioning: true }
        )}
        <${'ppp-button'}
          class="margin-top"
          @click="${(x) => x.addBrokerProfile()}"
          appearance="primary"
        >
          Добавить профиль
        </ppp-button>
      </div>
    </section>
    <section>
      <div class="section-index-icon">${circleSvg(9)}</div>
      <div class="label-group full">
        <h6>Реализация</h6>
        <p>
          Код, отвечающий за работу сервиса.
        </p>
        <${'ppp-codeflask'}
          :code="${() => ``}"
          name="code"
          ${ref('code')}
        ></ppp-codeflask>
      </div>
    </section>
  `
);

export const servicePageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Сервисы</ppp-page-header>
    ${when(
      (x) => !x.type,
      html`
        <ppp-tabs ${ref('tabs')} activeid="packages">
          <ppp-tab id="packages">Пакеты приложений</ppp-tab>
          <ppp-tab id="https">HTTPS/WebSocket</ppp-tab>
          <ppp-tab id="telegram">Telegram</ppp-tab>
          <ppp-tab-panel id="packages-panel"></ppp-tab-panel>
          <ppp-tab-panel id="https-panel"></ppp-tab-panel>
          <ppp-tab-panel id="telegram-panel"></ppp-tab-panel>
        </ppp-tabs>
      `
    )}
    <form ${ref('form')} id="services" name="services" onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        ${netdataBeforeTemplate}
        ${certbotBeforeTemplate}
        ${when(
          (x) => x.type,
          html`
            <section>
              <div class="section-index-icon">${circleSvg(1)}</div>
              <div class="label-group">
                <h6>Сервер</h6>
                <p>
                  Выберите из списка машину, на которую будет устанавливаться
                  сервис.
                </p>
              </div>
              <div class="input-group">
                <ppp-select
                  @change="${(x) =>
                    (x.domains = x.servers?.find(
                      (s) => s.uuid === x.server.value
                    )?.domains)}"
                  ?disabled="${(x) => !x.servers}"
                  placeholder="Нет доступных серверов"
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
                    (x) => x.servers !== null,
                    caretDown({
                      slot: 'indicator'
                    })
                  )}
                  ${when(
                    (x) => x.servers === null,
                    settings({
                      slot: 'indicator',
                      cls: 'spinner-icon'
                    })
                  )}
                </ppp-select>
                <${'ppp-button'}
                  class="margin-top"
                  @click="${(x) => (x.app.page = 'server')}"
                  appearance="primary"
                >
                  Добавить сервер
                </ppp-button>
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
              </div>
              <div class="input-group">
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
        ${certbotAfterTemplate}
        ${httpsAfterTemplate}
        ${tgUpdaterAfterTemplate}
        ${when(
          (x) => !x.type && x.activeid === 'packages',
          packagesServicesTemplate
        )}
        ${when((x) => !x.type && x.activeid === 'https', httpsServicesTemplate)}
        ${when(
          (x) => !x.type && x.activeid === 'telegram',
          telegramServicesTemplate
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
        (x) => x.type,
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

export const servicePageStyles = (context, definition) =>
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

    section ppp-select {
      width: 100%;
    }

    section ppp-codeflask {
      width: 100%;
      height: 512px;
    }

    .description {
      padding: 10px 16px 10px 20px;
      border-radius: 7px;
      background-color: rgb(33, 49, 60);
      border: 1px solid rgb(231, 238, 236);
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const servicePage = ServicePage.compose({
  baseName: 'service-page',
  template: servicePageTemplate,
  styles: servicePageStyles
});
