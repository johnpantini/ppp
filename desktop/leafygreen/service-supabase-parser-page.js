import { ServiceSupabaseParserPage } from '../../../shared/pages/service-supabase-parser.js';
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

const exampleTableSchema = `title text primary key,
description text not null,
pub_date text not null,
link text not null`;
const exampleConstsCode = `return [];`;
const exampleParsingCode = `/**
 * Функция парсинга
 *
 * @param consts - Статические данные, сформированные на этапе сохранения сервиса.
 */
const url = '[%#payload.url || 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362'%]';
const fetch = plv8.find_function('ppp_fetch');
const rss = plv8.find_function('ppp_xml_parse')(fetch(url, {
  headers: {
    'User-Agent': '[%#navigator.userAgent%]'
  }
}).responseText);

return (rss.rss.channel.item || []).map(item => {
  return {
    title: item.title,
    description: item.description,
    pub_date: item.pubDate || item['dc:date'] || new Date().toISOString(),
    link: item.link
  };
}).sort((a, b) => Date.parse(a.pub_date) - Date.parse(b.pub_date));`;
const exampleInsertTriggerCode = `/**
 * @constant {string} TABLE_NAME - Имя таблицы состояния.
 */
void 0;`;
const exampleDeleteTriggerCode = `/**
 * @constant {string} TABLE_NAME - Имя таблицы состояния.
 */
void 0;`;
const exampleFormatterCode = `/**
 * Функция форматирования сообщения о новой записи в таблице состояния.
 *
 * @param {json} record - Запись, вставленная в таблицу состояния.
 */
const formatDateTime = (pubDate) => {
  const [date, timeZ] = new Date(Date.parse(pubDate || new Date()))
    .toISOString()
    .split(/T/);
  const [y, m, d] = date.split(/-/);
  const [time] = timeZ.split(/\\./);

  return \`\${d}.\${m}.\${y} \${time} UTC\`;
};

return \`⏰ \${formatDateTime(record.pub_date)}
<b><a href="\${encodeURIComponent(record.link)}">\${encodeURIComponent(record.title)}</a></b>

\${encodeURIComponent(record.description)}\`;`;

export const serviceSupabaseParserPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      ${(x) =>
        x.service
          ? `Сервис - Парсер с персистентностью - ${x.service?.name}`
          : 'Сервис - Парсер с персистентностью'}
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
        ${when(
          (x) => x.service?.frameUrl,
          html` <iframe
            src="${(x) => x.service.frameUrl}"
            width="100%"
            height="667"
            style="background: transparent; border: 1px solid rgb(136, 147, 151);"
          ></iframe>`
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
              @click="${(x) =>
                x.app.navigate({
                  page: 'api-supabase'
                })}"
              appearance="primary"
            >
              Создать новый профиль API Supabase
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Ресурс</h5>
            <p>Произвольная ссылка, которая будет передана в код настройки через
              ключ url.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              optional
              type="url"
              placeholder="https://example.com"
              value="${(x) => x.service?.url}"
              ${ref('url')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Фрейм</h5>
            <p>Произвольная ссылка, которая будет вставлена в тег iframe на
              странице сервиса.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              optional
              type="url"
              placeholder="https://example.com"
              value="${(x) => x.service?.frameUrl}"
              ${ref('frameUrl')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Интервал опроса</h5>
            <p>Периодичность парсинга. Задаётся в секундах.</p>
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
            <h5>Глубина хранения</h5>
            <p>Максимальное количество записей для хранения в базе данных.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="number"
              placeholder="50"
              value="${(x) => x.service?.depth ?? '50'}"
              ${ref('depth')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Поля таблицы состояния</h5>
            <p>Поля таблицы для хранения обработанных записей. Будут размещены
              внутри выражения CREATE TABLE. Их нельзя изменить после создания
              сервиса.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              ?disabled="${(x) => x.service?.tableSchema}"
              :code="${(x) => x.service?.tableSchema ?? exampleTableSchema}"
              ${ref('tableSchema')}
            ></ppp-codeflask>
            <${'ppp-button'}
              ?disabled="${(x) => x.service?.tableSchema}"
              class="margin-top"
              @click="${(x) => x.tableSchema.updateCode(exampleTableSchema)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Статические данные</h5>
            <p>Тело функции на языке PLV8, возвращающей словари и прочие
              неизменяемые данные, настраиваемые единоразово во время
              сохранения сервиса.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) => x.service?.constsCode ?? exampleConstsCode}"
              ${ref('constsCode')}
            ></ppp-codeflask>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) => x.constsCode.updateCode(exampleConstsCode)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
            </ppp-button>
            <ppp-button
              class="margin-top"
              ?disabled="${(x) => x.busy}"
              @click="${(x) => x.callConstsFunction()}"
              appearance="primary"
            >
              Выполнить функцию
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Функция парсинга</h5>
            <p>Тело функции на языке PLV8, возвращающей массив элементов на
              каждой итерации парсинга.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) => x.service?.parsingCode ?? exampleParsingCode}"
              ${ref('parsingCode')}
            ></ppp-codeflask>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) => x.parsingCode.updateCode(exampleParsingCode)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
            </ppp-button>
            <ppp-button
              class="margin-top"
              ?disabled="${(x) => x.busy}"
              @click="${(x) => x.callParsingFunction()}"
              appearance="primary"
            >
              Выполнить функцию
            </ppp-button>
          </div>
        </section>
        <div class="folding">
          <div class="folding-header" @click="${(x, c) =>
            c.event.target.parentNode.classList.toggle('folding-open')}"
          >
            <div class="folding-header-toggle">
              <img slot="logo" draggable="false" alt="Toggle"
                   src="static/fa/angle-down.svg"/>
            </div>
            <div class="folding-header-text">Триггеры</div>
          </div>
          <div class="folding-content">
            <section>
              <div class="label-group">
                <h5>Добавление записи</h5>
                <p>Произвольный код на языке PLV8, который будет исполнен при
                  добавлении записи в таблицу состояния.</p>
              </div>
              <div class="input-group">
                <${'ppp-codeflask'}
                  :code="${(x) =>
                    x.service?.insertTriggerCode ?? exampleInsertTriggerCode}"
                  ${ref('insertTriggerCode')}
                ></ppp-codeflask>
                <ppp-button
                  class="margin-top"
                  @click="${(x) =>
                    x.insertTriggerCode.updateCode(exampleInsertTriggerCode)}"
                  appearance="primary"
                >
                  Восстановить значение по умолчанию
                </ppp-button>
              </div>
            </section>
            <section>
              <div class="label-group">
                <h5>Удаление записи</h5>
                <p>Произвольный код на языке PLV8, который будет исполнен при
                  удалении записи из таблицы состояния.</p>
              </div>
              <div class="input-group">
                <${'ppp-codeflask'}
                  :code="${(x) =>
                    x.service?.deleteTriggerCode ?? exampleDeleteTriggerCode}"
                  ${ref('deleteTriggerCode')}
                ></ppp-codeflask>
                <ppp-button
                  class="margin-top"
                  @click="${(x) =>
                    x.deleteTriggerCode.updateCode(exampleDeleteTriggerCode)}"
                  appearance="primary"
                >
                  Восстановить значение по умолчанию
                </ppp-button>
              </div>
            </section>
          </div>
        </div>
        <div class="folding">
          <div class="folding-header" @click="${(x, c) =>
            c.event.target.parentNode.classList.toggle('folding-open')}"
          >
            <div class="folding-header-toggle">
              <img slot="logo" draggable="false" alt="Toggle"
                   src="static/fa/angle-down.svg"/>
            </div>
            <div class="folding-header-text">Уведомления в Telegram</div>
          </div>
          <div class="folding-content">
            <${'ppp-checkbox'}
              ?checked="${(x) => x.telegramEnabled}"
              @change="${(x) =>
                (x.telegramEnabled = x.telegramEnabledFlag.checked)}"
              class="margin-top"
              ${ref('telegramEnabledFlag')}
            >
              Также отправлять уведомления в Telegram
            </ppp-checkbox>
            <section>
              <div class="label-group">
                <h5>Бот</h5>
                <p>Будет использован для публикации сообщений при парсинге новых
                  записей.
                  Должен обладать соответствующими правами в канале/группе.</p>
              </div>
              <div class="input-group">
                <ppp-select
                  ?disabled="${(x) => !x.bots || !x.telegramEnabled}"
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
                  ?disabled="${(x) => !x.telegramEnabled}"
                  class="margin-top"
                  @click="${(x) =>
                    x.app.navigate({
                      page: 'telegram-bot'
                    })}"
                  appearance="primary"
                >
                  Добавить бота
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
                  ?disabled="${(x) => !x.telegramEnabled}"
                  type="number"
                  placeholder="Канал или группа"
                  value="${(x) => x.service?.channel}"
                  ${ref('channel')}
                ></ppp-text-field>
                <ppp-button
                  class="margin-top"
                  ?disabled="${(x) => x.busy || !x.telegramEnabled}"
                  @click="${(x) => x.sendTestMessage()}"
                  appearance="primary"
                >
                  Отправить тестовое сообщение
                </ppp-button>
              </div>
            </section>
            <section>
              <div class="label-group">
                <h5>Форматирование уведомлений</h5>
                <p>Логика форматирования итогового сообщения в Telegram на языке
                  PLV8. Тестовое сообщение использует первый элемент данных,
                  полученный от функции парсинга.</p>
              </div>
              <div class="input-group">
                <${'ppp-codeflask'}
                  ?disabled="${(x) => !x.telegramEnabled}"
                  :code="${(x) =>
                    x.service?.formatterCode ?? exampleFormatterCode}"
                  ${ref('formatterCode')}
                ></ppp-codeflask>
                <ppp-button
                  ?disabled="${(x) => !x.telegramEnabled}"
                  class="margin-top"
                  @click="${(x) =>
                    x.formatterCode.updateCode(exampleFormatterCode)}"
                  appearance="primary"
                >
                  Восстановить значение по умолчанию
                </ppp-button>
              </div>
            </section>
          </div>
        </div>
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

export const serviceSupabaseParserPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    section ppp-codeflask {
      width: 100%;
      height: 256px;
    }

    iframe {
      margin-top: 15px;
      border-radius: 7px;
    }

    .folding-content ppp-checkbox {
      margin-left: 10px;
    }

    ppp-modal .description {
      padding: 10px 16px 10px 20px;
      border-radius: 7px;
      background-color: rgb(33, 49, 60);
      border: 1px solid rgb(231, 238, 236);
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const serviceSupabaseParserPage = ServiceSupabaseParserPage.compose({
  baseName: 'service-supabase-parser-page',
  template: serviceSupabaseParserPageTemplate,
  styles: serviceSupabaseParserPageStyles
});
