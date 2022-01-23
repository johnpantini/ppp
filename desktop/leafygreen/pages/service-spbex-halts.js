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

const exampleInstrumentsCode = `/**
 * Возвращает список инструментов с подробными данными.
 *
 * @returns {Object[]} instruments - Инструменты.
 * @returns {string} instruments[].isin - ISIN инструмента.
 * @returns {string} instruments[].ticker - Тикер инструмента.
 * @returns {string} instruments[].name - Название инструмента.
 * @returns {string} instruments[].currency - Валюта инструмента.
 */
const instruments =
  JSON.parse(
    plv8.execute(
      \`select content from http_get('https://api.tinkoff.ru/trading/stocks/list?sortType=ByName&orderType=Asc&country=All')\`
    )[0].content
  ).payload.values || [];

return instruments.map((i) => {
  return {
    isin: i.symbol.isin,
    ticker: i.symbol.ticker,
    name: i.symbol.showName.replace("'", "''"),
    currency: i.symbol.currency
  };
});`;

const exampleFormatterCode = `/**
 * Функция форматирования сообщения о торговой паузе.
 *
 * @param {string} isin - ISIN инструмента.
 * @param {string} ticker - Тикер инструмента.
 * @param {string} name - Название инструмента.
 * @param {string} currency - Валюта инструмента.
 * @param {string} date - Дата и время сообщения от биржи.
 * @param {string} url - Ссылка на сообщение на сайте биржи.
 * @param {string} start - Время начала торговой паузы, MSK.
 * @param {string} finish - Время окончания торговой паузы, MSK.
 */
return \`‼️⏸ Приостановка торгов (SPBEX)
\${'$'}\${ticker || isin}
<b>\${name}, \${isin}</b>
🕒 \${start} - \${finish}

<a href="\${encodeURIComponent(url)}">Сообщение о приостановке торгов</a>
\`;`;

export const serviceSpbexHaltsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      Сервисы - торговые паузы SPBEX
    </ppp-page-header>
    <form ${ref('form')} novalidate onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        ${when(
          (x) => x.service,
          html`
            <div class="section-content horizontal-overflow">
              <div class="service-details">
                <div class="service-details-controls">
                  <div class="service-details-control service-details-label">
                    ${(x) => x.service.name}
                  </div>
                  <div
                    class="service-details-control"
                    style="justify-content: left"
                  >
                    <${'ppp-button'}
                      ?disabled="${(x) =>
                        x.busy ||
                        x.service?.removed ||
                        x.service?.state === 'failed'}"
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
                      ${(x) => x.t(`$const.serviceState.${x.service.state}`)}
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
                      ${(x) => formatDate(x.service.createdAt)}
                    </div>
                    <span style="grid-column-start: 4;grid-row-start: 1;">
                    Последнее изменение
                    </span>
                    <div style="grid-column-start: 4;grid-row-start: 2;">
                      ${(x) =>
                        formatDate(x.service.updatedAt ?? x.service.createdAt)}
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
              placeholder="Название"
              value="${(x) => x.service?.name}"
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
              value="${(x) => x.service?.apiId}"
              placeholder="Нет доступных профилей"
              ${ref('api')}
            >
              ${repeat(
                (x) => x?.apis,
                html`
                  <ppp-option
                    ?removed="${(x) => x.removed}"
                    value="${(x) => x._id}"
                  >
                    ${(x) => x.name}
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
              value="${(x) => x.service?.serverId}"
              ${ref('server')}
            >
              ${repeat(
                (x) => x?.servers,
                html`
                  <ppp-option
                    ?removed="${(x) => x.removed}"
                    value="${(x) => x._id}"
                  >
                    ${(x) => x.name}
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
              value="${(x) => x.service?.botId}"
              ${ref('bot')}
            >
              ${repeat(
                (x) => x?.bots,
                html`
                  <ppp-option
                    ?removed="${(x) => x.removed}"
                    value="${(x) => x._id}"
                  >
                    ${(x) => x.name}
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
            <h5>Словарь инструментов</h5>
            <p>Функция на языке PLV8, возвращающая список инструментов биржи с
              подробными данными. По умолчанию в качестве
              источника данных используется каталог Тинькофф Инвестиций.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) =>
                x.service?.instrumentsCode ?? exampleInstrumentsCode}"
              ${ref('instrumentsCode')}
            ></ppp-codeflask>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) =>
                x.instrumentsCode.updateCode(exampleInstrumentsCode)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
            </ppp-button>
            <ppp-button
              class="margin-top"
              ?disabled="${(x) => x.busy}"
              @click="${(x) => x.callInstrumentsFunction()}"
              appearance="primary"
            >
              Выполнить функцию
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Форматирование</h5>
            <p>Логика форматирования итогового сообщения на языке PLV8.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) => x.service?.formatterCode ?? exampleFormatterCode}"
              ${ref('formatterCode')}
            ></ppp-codeflask>
            <ppp-button
              class="margin-top"
              @click="${(x) =>
                x.formatterCode.updateCode(exampleFormatterCode)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
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
            <ppp-button
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
