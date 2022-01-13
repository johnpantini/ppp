import ppp from '../../../ppp.js';
import { ServiceSpbexHaltsPage } from '../../../shared/pages/service-spbex-halts.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { repeat } from '../../../shared/element/templating/repeat.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { stateAppearance } from './services.js';
import { formatDate } from '../../../shared/intl.js';
import { settings } from '../icons/settings.js';
import { caretDown } from '../icons/caret-down.js';

await ppp.i18n(import.meta.url);

const exampleCode = `create or replace function format_spbex_halt_message(isin text,
  ticker text, name text, currency text, date text, url text,
  start text, finish text)
returns text as
$$
  return \`‼️⏸ Приостановка торгов (SPBEX)
\${'$'}\${ticker || isin}
<b>\${name}, \${isin}</b>
🕒 \${start} - \${finish}

<a href="\${encodeURIComponent(url)}">Сообщение о приостановке торгов</a>
\`;
$$ language plv8;`;

export const serviceSpbexHaltsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      Сервисы - торговые паузы SPBEX
    </ppp-page-header>
    <form ${ref('form')} onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        ${when(
          (x) => x.service,
          html`
            <div class="section-content horizontal-overflow">
              <div class="service-details">
                <div class="service-details-controls">
                  <div class="service-details-control service-details-label">
                    ${(x) => x.service._id}
                  </div>
                  <div
                    class="service-details-control"
                    style="justify-content: left"
                  >
                    <${'ppp-button'}
                      ?disabled="${(x) => x.busy || x.service?.removed}"
                      @click="${(x) => x.restart()}">Перезапустить
                    </ppp-button>
                    <ppp-button
                      ?disabled="${(x) =>
                        x.busy ||
                        x.service?.removed ||
                        x.service?.state === 'stopped' ||
                        x.service?.state === 'failed'}"
                      @click="${(x) => x.stop()}">Остановить
                    </ppp-button>
                    <ppp-button
                      ?disabled="${(x) => x.busy || x.service?.removed}"
                      appearance="danger"
                      @click="${(x) => x.remove()}">Удалить
                    </ppp-button>
                  </div>
                  <div class="service-details-control">
                    <${'ppp-badge'}
                      appearance="${(x) => stateAppearance(x.service.state)}">
                      ${(x) => x.t(`$const.serverState.${x.service.state}`)}
                    </ppp-badge>
                    <ppp-badge
                      appearance="blue">
                      Последняя версия
                    </ppp-badge>
                  </div>
                </div>
                <div class="service-details-info">
                  <div class="service-details-info-container">
                    <span style="grid-column-start: 1;grid-row-start: 1;">
                      Версия
                    </span>
                    <div style="grid-column-start: 1;grid-row-start: 2;">
                      ${(x) => x.service.version}
                    </div>
                    <span style="grid-column-start: 2;grid-row-start: 1;">
                    Тип
                    </span>
                    <div style="grid-column-start: 2;grid-row-start: 2;">
                      ${(x) => x.t(`$const.service.${x.service.type}`)}
                    </div>
                    <span style="grid-column-start: 3;grid-row-start: 1;">
                    Создан
                    </span>
                    <div style="grid-column-start: 3;grid-row-start: 2;">
                      ${(x) => formatDate(x.service.created_at)}
                    </div>
                    <span style="grid-column-start: 4;grid-row-start: 1;">
                    Последнее изменение
                    </span>
                    <div style="grid-column-start: 4;grid-row-start: 2;">
                      ${(x) =>
                        formatDate(
                          x.service.updated_at ?? x.service.created_at
                        )}
                    </div>
                    <span style="grid-column-start: 5;grid-row-start: 1;">
                    Удалён
                    </span>
                    <div style="grid-column-start: 5;grid-row-start: 2;">
                      ${(x) => (x.service.removed ? 'Да' : 'Нет')}
                    </div>
                  </div>
                </div>
              </div>
            </div>`
        )}
        <section>
          <div class="label-group">
            <h5>Название сервиса</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              ?disabled="${(x) => x.service}"
              placeholder="Название"
              value="${(x) => x.service?._id}"
              ${ref('serviceName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Профиль API Supabase</h5>
          </div>
          <div class="input-group">
            <${'ppp-select'}
              ?disabled="${(x) => !x.apis}"
              value="${(x) => x.service?.api_uuid}"
              placeholder="Нет доступных профилей"
              ${ref('api')}
            >
              ${repeat(
                (x) => x?.apis,
                html`
                  <ppp-option value="${(x) => x.uuid}"
                    >${(x) => x._id}
                  </ppp-option>
                `
              )}
              ${when(
                (x) => x.apis !== null,
                caretDown({
                  slot: 'indicator'
                })
              )}
              ${when(
                (x) => x.apis === null,
                settings({
                  slot: 'indicator',
                  cls: 'spinner-icon'
                })
              )}
            </ppp-select>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) => (x.app.page = 'api-supabase')}"
              appearance="primary"
            >
              Подключить API
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Профиль сервера</h5>
          </div>
          <div class="input-group">
            <ppp-select
              ?disabled="${(x) => !x.servers}"
              placeholder="Нет доступных профилей"
              value="${(x) => x.service?.server_uuid}"
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
            <ppp-button
              disabled
              class="margin-top"
              @click="${(x) => (x.app.page = 'server')}"
              appearance="primary"
            >
              Добавить сервер
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Интервал опроса</h5>
            <p>Периодичность проверки новых сообщений о торговых паузах от
              биржи. Задаётся в секундах.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="number"
              placeholder="5"
              value="${(x) => x.service?.interval ?? '5'}"
              ${ref('interval')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Бот</h5>
            <p>Будет использован для публикации сообщений о торговых паузах.
              Должен обладать соответствующими правами в канале/группе.</p>
          </div>
          <div class="input-group">
            <ppp-select
              ?disabled="${(x) => !x.bots}"
              placeholder="Нет доступных профилей"
              value="${(x) => x.service?.bot_uuid}"
              ${ref('bot')}
            >
              ${repeat(
                (x) => x?.bots,
                html`
                  <ppp-option
                    ?removed="${(x) => x.removed}"
                    value="${(x) => x.uuid}"
                    >${(x) => x._id}
                  </ppp-option>
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
            <ppp-button
              class="margin-top"
              @click="${(x) => (x.app.page = 'telegram-bot')}"
              appearance="primary"
            >
              Добавить бота
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Форматирование</h5>
            <p>Логика форматирования сообщения на языке PLV8.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) => x.service?.code ?? exampleCode}"
              ${ref('codeArea')}
            ></ppp-codeflask>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) => x.codeArea.updateCode(exampleCode)}"
              appearance="primary"
            >
              Восстановить форматирование по умолчанию
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Канал или группа</h5>
            <p>Идентификатор канала или группы, куда будут отправляться
              уведомления о торговых паузах.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="number"
              placeholder="Канал или группа"
              value="${(x) => x.service?.channel}"
              ${ref('channel')}
            ></ppp-text-field>
            <${'ppp-button'}
              class="margin-top"
              ?disabled="${(x) => x.busy}"
              @click="${(x) => x.sendTestSpbexHaltMessage()}"
              appearance="primary"
            >
              Отправить тестовое сообщение
            </ppp-button>
          </div>
        </section>
        <${'ppp-modal'} ${ref('terminalModal')}>
          <span slot="title">Настройка сервиса</span>
          <div slot="body">
            <div class="description">
              <${'ppp-terminal'} ${ref('terminalDom')}></ppp-terminal>
            </div>
          </div>
        </ppp-modal>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy || x.service?.removed}"
            type="submit"
            @click="${(x) => x.install()}"
            appearance="primary"
          >
            ${(x) =>
              x.service ? 'Переустановить сервис' : 'Установить сервис'}
          </ppp-button>
        </div>
      </section>
    </form>
    </div>
  </template>
`;

export const serviceSpbexHaltsPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    section ppp-codeflask {
      width: 100%;
      height: 256px;
    }

    ppp-modal .description {
      padding: 10px 16px 10px 20px;
      border-radius: 7px;
      background-color: rgb(33, 49, 60);
      border: 1px solid rgb(231, 238, 236);
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const serviceSpbexHaltsPage = ServiceSpbexHaltsPage.compose({
  baseName: 'service-spbex-halts-page',
  template: serviceSpbexHaltsPageTemplate,
  styles: serviceSpbexHaltsPageStyles
});
