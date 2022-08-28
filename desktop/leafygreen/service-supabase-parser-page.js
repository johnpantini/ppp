import { ServiceSupabaseParserPage } from '../../shared/service-supabase-parser-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import { serviceControlsTemplate } from './service-page.js';
import ppp from '../../ppp.js';

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
const url = '[%#ctx.document.url || 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664'%]';
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
 * @var consts - Статические данные, сформированные на этапе сохранения сервиса.
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
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Сервис - Парсер с персистентностью - ${x.document.name}`
              : 'Сервис - Парсер с персистентностью'}
        </span>
        ${when((x) => x.document._id, serviceControlsTemplate)}
        ${when(
          (x) => x.document.frameUrl,
          html` <iframe
            src="${(x) => x.document.frameUrl}"
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
            <${'ppp-text-field'}
              placeholder="Название"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Профиль API Supabase</h5>
          </div>
          <div class="input-group">
            <${'ppp-collection-select'}
              ${ref('supabaseApiId')}
              value="${(x) => x.document.supabaseApiId}"
              :context="${(x) => x}"
              :preloaded="${(x) => x.document.supabaseApi ?? ''}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('apis')
                    .find({
                      $and: [
                        {
                          type: `[%#(await import('./const.js')).APIS.SUPABASE%]`
                        },
                        {
                          $or: [
                            { removed: { $ne: true } },
                            { _id: `[%#this.document.supabaseApiId ?? ''%]` }
                          ]
                        }
                      ]
                    })
                    .sort({ updatedAt: -1 });
                };
              }}"
              :transform="${() => ppp.decryptDocumentsTransformation()}"
            ></ppp-collection-select>
            <${'ppp-button'}
              class="margin-top"
              @click="${() =>
                window.open('?page=api-supabase', '_blank').focus()}"
              appearance="primary"
            >
              Добавить API Supabase
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
              value="${(x) => x.document.url}"
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
              value="${(x) => x.document.frameUrl}"
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
              value="${(x) => x.document.interval ?? '5'}"
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
              value="${(x) => x.document.depth ?? '50'}"
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
              ?disabled="${(x) => x.document.tableSchema}"
              :code="${(x) => x.document.tableSchema ?? exampleTableSchema}"
              ${ref('tableSchema')}
            ></ppp-codeflask>
            <${'ppp-button'}
              ?disabled="${(x) => x.document.tableSchema}"
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
              :code="${(x) => x.document.constsCode ?? exampleConstsCode}"
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
              ?disabled="${(x) => x.page.loading}"
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
              :code="${(x) => x.document.parsingCode ?? exampleParsingCode}"
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
              ?disabled="${(x) => x.page.loading}"
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
                    x.document.insertTriggerCode ?? exampleInsertTriggerCode}"
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
                    x.document.deleteTriggerCode ?? exampleDeleteTriggerCode}"
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
              ?checked="${(x) => x.document.telegramEnabled}"
              @change="${(x) =>
                x.scratchSet('telegramEnabled', x.telegramEnabled.checked)}"
              class="margin-top"
              ${ref('telegramEnabled')}
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
                <ppp-collection-select
                  ${ref('botId')}
                  ?disabled="${(x) => !x.scratch.telegramEnabled}"
                  value="${(x) => x.document.botId}"
                  :context="${(x) => x}"
                  :preloaded="${(x) => x.document.bot ?? ''}"
                  :query="${() => {
                    return (context) => {
                      return context.services
                        .get('mongodb-atlas')
                        .db('ppp')
                        .collection('bots')
                        .find({
                          $or: [
                            { removed: { $ne: true } },
                            { _id: `[%#this.document.botId ?? ''%]` }
                          ]
                        })
                        .sort({ updatedAt: -1 });
                    };
                  }}"
                  :transform="${() => ppp.decryptDocumentsTransformation()}"
                ></ppp-collection-select>
                <ppp-button
                  ?disabled="${(x) => !x.scratch.telegramEnabled}"
                  class="margin-top"
                  @click="${() =>
                    window.open('?page=telegram-bot', '_blank').focus()}"
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
                  ?disabled="${(x) => !x.scratch.telegramEnabled}"
                  type="number"
                  placeholder="Канал или группа"
                  value="${(x) => x.document.channel}"
                  ${ref('channel')}
                ></ppp-text-field>
                <ppp-button
                  class="margin-top"
                  ?disabled="${(x) =>
                    !x.scratch.telegramEnabled || x.page.loading}"
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
                  ?disabled="${(x) => !x.scratch.telegramEnabled}"
                  :code="${(x) =>
                    x.document.formatterCode ?? exampleFormatterCode}"
                  ${ref('formatterCode')}
                ></ppp-codeflask>
                <ppp-button
                  ?disabled="${(x) =>
                    !x.scratch.telegramEnabled || x.page.loading}"
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
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ServiceSupabaseParserPage.compose({
  template: serviceSupabaseParserPageTemplate,
  styles: pageStyles
});
