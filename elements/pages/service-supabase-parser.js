import ppp from '../../ppp.js';
import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  documentPageFooterPartial,
  documentPageHeaderPartial,
  Page,
  pageStyles,
  PageWithService,
  PageWithSupabaseService
} from '../page.js';
import {
  servicePageFooterExtraControls,
  servicePageHeaderExtraControls
} from './service.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import { Tmpl } from '../../lib/tmpl.js';
import { parsePPPScript } from '../../lib/ppp-script.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import {
  paletteGrayDark2,
  paletteGrayLight2,
  themeConditional
} from '../../design/design-tokens.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../copyable.js';
import '../query-select.js';
import '../select.js';
import '../snippet.js';
import '../terminal.js';
import '../text-field.js';

export const predefinedParserData = {
  default: {
    url: '/lib/supabase-parser/default-parser.js',
    tableSchema: `title text primary key,
description text not null,
pub_date text not null,
link text not null`,
    constsCode: `return [];`,
    parsingCode: await (
      await fetch(`${ppp.rootUrl}/lib/supabase-parser/default-parser.js`)
    ).text(),
    insertTriggerCode: `/**
 * @constant {string} TABLE_NAME - Имя таблицы состояния.
 */
void 0;`,
    deleteTriggerCode: `/**
 * @constant {string} TABLE_NAME - Имя таблицы состояния.
 */
void 0;`,
    formatterCode: `/**
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

\${encodeURIComponent(record.description)}\`;`
  },
  thefly: {
    url: '/lib/supabase-parser/thefly.js',
    tableSchema: `title text primary key,
tickers text,
topic text,
date text not null,
priority bool not null,
link text`,
    constsCode: `const symbols = [%#JSON.stringify((await(await fetch(
  'https://api.alor.ru/md/v2/Securities?exchange=SPBX&limit=5000&offset=0',
  {
    cache: 'reload'
  }
  )).json()).filter((i) => ['TCS', 'MNK', 'CHK'].indexOf(i.symbol) == -1).map(i => i.symbol))%];

symbols.push('$ECON');
symbols.push('SPY');

return symbols;`,
    insertTriggerCode: `/**
 * @constant {string} TABLE_NAME - Имя таблицы состояния.
 */
void 0;`,
    deleteTriggerCode: `/**
 * @constant {string} TABLE_NAME - Имя таблицы состояния.
 */
void 0;`,
    formatterCode: `const formatDateTime = (pubDate) => {
  const [date, timeZ] = new Date(Date.parse(pubDate || new Date()))
    .toISOString()
    .split(/T/)
  const [y, m, d] = date.split(/-/)
  const [time] = timeZ.split(/\\./)

  return \`\${d}.\${m}.\${y} \${time} MSK\`
}

const formatTitle = (record) => {
  let icon = '🐝'

  switch (record.topic) {
    case 'events':
      icon = '📅'

      break
    case 'recomm':
      icon = '👍'

      break
    case 'recDowngrade':
      icon = '⬇️'

      break
    case 'recUpgrade':
      icon = '⬆️'

      break
    case 'periodicals':
      icon = '📰'

      break
    case 'options':
      icon = '🅾️'

      break
    case 'general_news':
      icon = '🌎'

      break
    case 'hot_stocks':
      icon = '🔥'

      break
    case 'earnings':
      icon = '💰'

      break
    case 'syndic':
      break
    case 'technical_analysis':
      icon = '💹'

      break
  }

  if (record.priority) icon = '‼️' + icon

  if (record.tickers.trim())
    return (
      icon +
      ' ' +
      record.tickers
        .split(',')
        .map((ticker) => {
          if (ticker.startsWith('$')) return ticker

          return '$' + ticker
        })
        .join(' ')
    )

  return icon + ' The Fly'
}

const options = {
  disable_web_page_preview: true
}

if (record.tickers.trim()) {
  options.reply_markup = JSON.stringify({
    inline_keyboard: [
      record.tickers
        .split(',')
        .filter((ticker) => {
          return ticker !== '$ECON' && consts.indexOf(ticker) > -1
        })
        .slice(0, 5)
        .map((t) => {
          if (t === 'SPB') t = 'SPB@US'

          return {
            text: t,
            callback_data: JSON.stringify({
              e: 'ticker',
              t
            })
          }
        })
    ]
  })
}

return {
  text: \`\${formatTitle(record)}
⏰ \${formatDateTime(record.date)}
<b><a href="\${encodeURIComponent(record.link)}">\${encodeURIComponent(
      record.title
    )}</a></b>\`,
  options
}`
  }
};

export const serviceSupabaseParserPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: servicePageHeaderExtraControls
      })}
      ${when(
        (x) => x.document.frameUrl,
        html` <iframe
          src="${(x) => x.document.frameUrl}"
          width="100%"
          height="667"
        ></iframe>`
      )}
      <section>
        <div class="label-group">
          <h5>Название сервиса</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Введите название"
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
          <ppp-query-select
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
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.SUPABASE%]`
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
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            @click="${() =>
              ppp.app.mountPage(`api-${APIS.SUPABASE}`, {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить API Supabase
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Интеграция с Pusher</h5>
          <p class="description">
            Опциональная интеграция, позволяющая принимать сообщения от парсера
            в канал ppp платформы Pusher.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('pusherApiId')}
            deselectable
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.pusherApiId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.pusherApi ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('apis')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.PUSHER%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.pusherApiId ?? ''%]`
                          }
                        ]
                      }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            @click="${() =>
              ppp.app.mountPage(`api-${APIS.PUSHER}`, {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить API Pusher
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ресурс</h5>
          <p class="description">
            Произвольная ссылка, которая будет передана в код настройки через
            ключ url. Для автоматического заполнения используйте шаблоны:
          </p>
          <div>
            <ppp-select
              placeholder="Выберите шаблон"
              ${ref('urlTemplateSelect')}
            >
              <ppp-option value="thefly">Новости TheFly</ppp-option>
            </ppp-select>
            ${when(
              (x) => x.urlTemplateSelect.value === 'thefly',
              html`
                <ppp-query-select
                  ${ref('cloudflareWorkerSelector')}
                  :context="${(x) => x}"
                  :placeholder="${() => 'Нажмите, чтобы выбрать сервис'}"
                  :query="${() => {
                    return (context) => {
                      return context.services
                        .get('mongodb-atlas')
                        .db('ppp')
                        .collection('services')
                        .find({
                          $and: [
                            { removed: { $ne: true } },
                            { sourceCode: { $regex: 'thefly\\.com' } },
                            {
                              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.CLOUDFLARE_WORKER%]`
                            }
                          ]
                        })
                        .sort({ updatedAt: -1 });
                    };
                  }}"
                  :transform="${() => ppp.decryptDocumentsTransformation()}"
                ></ppp-query-select>
              `
            )}
            <div class="spacing2"></div>
            <ppp-button
              ?disabled="${(x) => !x.urlTemplateSelect.value}"
              appearance="primary"
              @click="${(x) =>
                x.generateUrlByTemplate(x.urlTemplateSelect.value)}"
            >
              Вставить ссылку по шаблону
            </ppp-button>
          </div>
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
          <p class="description">
            Произвольная ссылка, которая будет вставлена в iframe на странице
            сервиса.
          </p>
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
          <p class="description">
            Периодичность парсинга. Задаётся в секундах.
          </p>
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
          <p class="description">
            Максимальное количество записей для хранения в базе данных.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="10000"
            value="${(x) => x.document.depth ?? '10000'}"
            ${ref('depth')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="implementation-area">
          <div class="label-group full" style="min-width: 600px">
            <h5>Функция парсинга</h5>
            <p class="description">
              Тело функции на языке PLV8, возвращающей массив элементов на
              каждой итерации парсинга.
            </p>
            <ppp-snippet
              style="height: 1378px"
              :code="${(x) =>
                x.document.parsingCode ??
                predefinedParserData.default.parsingCode}"
              ${ref('parsingCode')}
            ></ppp-snippet>
            <div class="spacing2"></div>
            <ppp-button
              ?disabled="${(x) => !x.isSteady()}"
              @click="${(x) => x.callParsingFunction()}"
              appearance="primary"
            >
              Выполнить функцию
            </ppp-button>
          </div>
          <div class="control-stack">
            <div class="label-group full">
              <h5>Версионирование</h5>
              <p class="description">
                Включите настройку, чтобы отслеживать версию сервиса и
                предлагать обновления.
              </p>
              <ppp-checkbox
                ?checked="${(x) => x.document.useVersioning ?? false}"
                @change="${(x) => {
                  if (!x.useVersioning.checked)
                    x.versioningUrl.appearance = 'default';
                }}"
                ${ref('useVersioning')}
              >
                Отслеживать версию сервиса по этому файлу:
              </ppp-checkbox>
              <ppp-text-field
                ?disabled="${(x) => !x.useVersioning.checked}"
                placeholder="Введите ссылку"
                value="${(x) => x.document.versioningUrl ?? ''}"
                ${ref('versioningUrl')}
              ></ppp-text-field>
            </div>
            <div class="label-group full">
              <h5>Шаблоны готовых сервисов</h5>
              <p class="description">
                Воспользуйтесь шаблонами готовых сервисов для их быстрой
                настройки.
              </p>
              <ppp-select
                value="${(x) =>
                  x.document.parserPredefinedTemplate ?? 'default'}"
                ${ref('parserPredefinedTemplate')}
              >
                <ppp-option value="default"> По умолчанию</ppp-option>
                <ppp-option value="thefly"
                  >Новости TheFly (СПБ Биржа)
                </ppp-option>
              </ppp-select>
              <div class="spacing2"></div>
              <ppp-button
                @click="${(x) => x.fillOutParserFormsWithTemplate()}"
                appearance="primary"
              >
                Заполнить формы по этому шаблону
              </ppp-button>
            </div>
            <div class="label-group full">
              <h5>Поля таблицы состояния</h5>
              <p class="description">
                Поля таблицы для хранения обработанных записей. Будут размещены
                внутри выражения CREATE TABLE. Их можно задать только на этапе
                создания или после удаления сервиса.
              </p>
              <ppp-snippet
                style="height: 150px"
                ?disabled="${(x) =>
                  x.document.tableSchema && !x.document.removed}"
                :code="${(x) =>
                  x.document.tableSchema ??
                  predefinedParserData.default.tableSchema}"
                ${ref('tableSchema')}
              ></ppp-snippet>
            </div>
            <div class="label-group full">
              <h5>Статические данные</h5>
              <p class="description">
                Тело функции на языке PLV8, возвращающей словари и прочие
                неизменяемые данные, настраиваемые единоразово во время
                сохранения сервиса.
              </p>
              <ppp-snippet
                style="height: 256px"
                :code="${(x) =>
                  x.document.constsCode ??
                  predefinedParserData.default.constsCode}"
                ${ref('constsCode')}
              ></ppp-snippet>
              <div class="spacing2"></div>
              <ppp-button
                ?disabled="${(x) => !x.isSteady()}"
                @click="${(x) => x.callConstsFunction()}"
                appearance="primary"
              >
                Выполнить функцию
              </ppp-button>
            </div>
            <div class="label-group full">
              <h5>Добавление записи</h5>
              <p class="description">
                Произвольный код на языке PLV8, который будет исполнен при
                добавлении записи в таблицу состояния.
              </p>
              <ppp-snippet
                style="height: 150px"
                :code="${(x) =>
                  x.document.insertTriggerCode ??
                  predefinedParserData.default.insertTriggerCode}"
                ${ref('insertTriggerCode')}
              ></ppp-snippet>
            </div>
            <div class="label-group full">
              <h5>Удаление записи</h5>
              <p class="description">
                Произвольный код на языке PLV8, который будет исполнен при
                удалении записи из таблицы состояния.
              </p>
              <ppp-snippet
                style="height: 150px"
                :code="${(x) =>
                  x.document.deleteTriggerCode ??
                  predefinedParserData.default.deleteTriggerCode}"
                ${ref('deleteTriggerCode')}
              ></ppp-snippet>
            </div>
            <div class="label-group full">
              <ppp-checkbox
                ?checked="${(x) => x.document.telegramEnabled ?? false}"
                ${ref('telegramEnabled')}
              >
                Также отправлять уведомления в Telegram
              </ppp-checkbox>
              <div class="spacing2"></div>
              <h5>Бот</h5>
              <p class="description">
                Будет использован для публикации сообщений при парсинге новых
                записей. Должен обладать соответствующими правами в
                канале/группе.
              </p>
              <ppp-query-select
                ${ref('botId')}
                ?disabled="${(x) => !x.telegramEnabled.checked}"
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
              ></ppp-query-select>
              <div class="spacing2"></div>
              <ppp-button
                ?disabled="${(x) => !x.telegramEnabled.checked}"
                @click="${() =>
                  ppp.app.mountPage(`bot`, {
                    size: 'xlarge',
                    adoptHeader: true
                  })}"
                appearance="primary"
              >
                Добавить бота
              </ppp-button>
            </div>
            <div class="label-group full">
              <h5>Канал или группа</h5>
              <p class="description">
                Идентификатор канала или группы, куда будут отправляться
                уведомления о торговых паузах.
              </p>
              <ppp-text-field
                ?disabled="${(x) => !x.telegramEnabled.checked}"
                type="number"
                placeholder="Канал или группа"
                value="${(x) => x.document.channel}"
                ${ref('channel')}
              ></ppp-text-field>
            </div>
            <div class="label-group full">
              <h5>Форматирование уведомлений</h5>
              <p class="description">
                Логика форматирования итогового сообщения в Telegram на языке
                PLV8. Тестовое сообщение использует первый элемент данных,
                полученный от функции парсинга.
              </p>
              <ppp-snippet
                style="height: 256px"
                ?disabled="${(x) => !x.telegramEnabled.checked}"
                :code="${(x) =>
                  x.document.formatterCode ??
                  predefinedParserData.default.formatterCode}"
                ${ref('formatterCode')}
              ></ppp-snippet>
              <div class="spacing2"></div>
              <ppp-button
                ?disabled="${(x) =>
                  !x.telegramEnabled.checked || !x.isSteady()}"
                @click="${(x) => x.sendTestMessage()}"
                appearance="primary"
              >
                Отправить тестовое сообщение
              </ppp-button>
            </div>
          </div>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: 'Сохранить в PPP и обновить в Supabase',
        extraControls: servicePageFooterExtraControls
      })}
    </form>
  </template>
`;

export const serviceSupabaseParserPageStyles = css`
  ${pageStyles}
  iframe {
    background: transparent;
    margin-top: 15px;
    border-radius: 4px;
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }
`;

export class ServiceSupabaseParserPage extends Page {
  collection = 'services';

  async connectedCallback() {
    await super.connectedCallback();

    return this.checkVersion();
  }

  async callConstsFunction() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.constsCode);
      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value
      });

      this.showSuccessNotification(
        'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async fillOutParserFormsWithTemplate() {
    this.beginOperation();

    try {
      const data = predefinedParserData[this.parserPredefinedTemplate.value];

      try {
        const contentsResponse = await fetch(
          ppp.getWorkerTemplateFullUrl(data.url).toString(),
          {
            cache: 'reload'
          }
        );

        await maybeFetchError(
          contentsResponse,
          'Не удалось загрузить файл с шаблоном.'
        );

        this.parsingCode.updateCode(await contentsResponse.text());

        if (!this.document._id || this.document.removed) {
          this.tableSchema.updateCode(data.tableSchema);
        }

        this.constsCode.updateCode(data.constsCode);
        this.insertTriggerCode.updateCode(data.insertTriggerCode);
        this.deleteTriggerCode.updateCode(data.deleteTriggerCode);
        this.formatterCode.updateCode(data.formatterCode);

        this.versioningUrl.value = data.url;
        this.useVersioning.checked = true;

        this.showSuccessNotification(
          `Шаблон «${this.parserPredefinedTemplate.displayValue.trim()}» успешно загружен.`
        );
      } catch (e) {
        invalidate(this.versioningUrl, {
          errorMessage: 'Неверный URL',
          raiseException: true
        });
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async callParsingFunction(returnResult) {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.parsingCode);
      await validate(this.constsCode);

      this.document.url = this.url.value.trim();
      this.document.frameUrl = this.frameUrl.value.trim();

      const consts = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      });

      const result = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: `const consts = ${JSON.stringify(consts)};
          ${this.parsingCode.value}
        `,
        returnResult,
        extraSQL: `
          ${await fetch(this.getSQLUrl('ppp-fetch.sql')).then((r) => r.text())}
          ${await fetch(this.getSQLUrl('ppp-xml-parse.sql')).then((r) =>
            r.text()
          )}
        `
      });

      if (!returnResult)
        this.showSuccessNotification(
          'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.'
        );

      return result;
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async sendTestMessage() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);

      const [firstRecord] = await this.callParsingFunction(true);

      if (!firstRecord) {
        console.log(firstRecord);

        invalidate(ppp.app.toast, {
          errorMessage:
            'Функция парсинга вернула результат, который не пригоден для форматирования.',
          raiseException: true
        });
      }

      // Once again
      this.beginOperation();

      const temporaryFormatterName = `ppp_${uuidv4().replaceAll('-', '_')}`;

      // Returns form data
      const temporaryFormatterBody = `function ${temporaryFormatterName}(record) {
        const closure = () => {${this.formatterCode.value}};
        const formatted = closure();

        if (typeof formatted === 'string')
          return \`chat_id=${this.channel.value}&text=\${formatted.replace(/'/g, '%27')}&parse_mode=html\`;
        else {
          const options = formatted.options || {};
          let formData = \`chat_id=${this.channel.value}&text=\${formatted.text.replace(/'/g, '%27')}\`;

          if (typeof options.parse_mode === 'undefined')
            formData += '&parse_mode=html';

          if (typeof options.entities !== 'undefined')
            formData += \`&entities=\${encodeURIComponent(options.entities)}\`;

          if (options.disable_web_page_preview === true)
            formData += '&disable_web_page_preview=true';

          if (options.disable_notification === true)
            formData += '&disable_notification=true';

          if (options.protect_content === true)
            formData += '&protect_content=true';

          if (typeof options.reply_markup !== 'undefined')
            formData += \`&reply_markup=\${encodeURIComponent(options.reply_markup)}\`;

          return formData;
        }
      }`;

      const consts = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      });

      const functionBody = `${temporaryFormatterBody}
        const record = ${JSON.stringify(firstRecord)};
        const consts = ${JSON.stringify(consts)};

        plv8.execute(\`select content from http_post('https://api.telegram.org/bot${
          this.botId.datum().token
        }/sendMessage',
        '\${${temporaryFormatterName}(record)}',
        'application/x-www-form-urlencoded')\`);`;

      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody
      });

      this.showSuccessNotification('Сообщение отправлено.');
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async generateUrlByTemplate(template) {
    switch (template) {
      case 'thefly':
        await validate(this.cloudflareWorkerSelector);

        const datum = this.cloudflareWorkerSelector.datum();
        const url = `https://ppp-${datum._id}.${datum.subdomain}.workers.dev/news.php`;

        this.document.url = url;
        this.url.value = url;

        break;
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.SUPABASE_PARSER%]`
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'supabaseApiId',
              foreignField: '_id',
              as: 'supabaseApi'
            }
          },
          {
            $unwind: '$supabaseApi'
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'pusherApiId',
              foreignField: '_id',
              as: 'pusherApi'
            }
          },
          {
            $unwind: {
              path: '$pusherApi',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'bots',
              localField: 'botId',
              foreignField: '_id',
              as: 'bot'
            }
          },
          {
            $unwind: {
              path: '$bot',
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.SUPABASE_PARSER,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async #deploySupabaseParser() {
    this.document.supabaseApi = this.supabaseApiId.datum();
    this.document.pusherApi = this.pusherApiId.datum();
    this.document.bot = this.botId.datum();

    const [sendTelegramMessage, pppXmlParse, pppFetch, deployParser] =
      await Promise.all([
        fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) =>
          r.text()
        ),
        fetch(this.getSQLUrl('ppp-xml-parse.sql')).then((r) => r.text()),
        fetch(this.getSQLUrl('ppp-fetch.sql')).then((r) => r.text()),
        fetch(this.getSQLUrl(`${SERVICES.SUPABASE_PARSER}/deploy.sql`)).then(
          (r) => r.text()
        )
      ]);

    this.document.consts = JSON.stringify(
      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      })
    );

    const query = `${sendTelegramMessage}
      ${pppXmlParse}
      ${pppFetch}
      ${await new Tmpl().render(this, deployParser, {})}`;

    await this.executeSQL({
      api: this.document.supabaseApi,
      query: await new Tmpl().render(this, query, {})
    });
  }

  async validate() {
    await validate(this.name);
    await validate(this.supabaseApiId);
    await validate(this.interval);
    await validate(this.interval, {
      hook: async (value) => +value > 0 && +value <= 1000,
      errorMessage: 'Введите значение в диапазоне от 1 до 1000'
    });
    await validate(this.depth);
    await validate(this.depth, {
      hook: async (value) => +value >= 30 && +value <= 1000000,
      errorMessage: 'Введите значение в диапазоне от 30 до 1000000'
    });

    if (this.useVersioning.checked) {
      await validate(this.versioningUrl);

      // URL validation
      try {
        ppp.getWorkerTemplateFullUrl(this.versioningUrl.value);
      } catch (e) {
        invalidate(this.versioningUrl, {
          errorMessage: 'Неверный URL',
          raiseException: true
        });
      }
    }

    await validate(this.parsingCode);
    await validate(this.tableSchema);
    await validate(this.constsCode);
    await validate(this.insertTriggerCode);
    await validate(this.deleteTriggerCode);

    if (this.telegramEnabled.checked) {
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);
    } else {
      this.botId.appearance = 'default';
      this.channel.appearance = 'default';
      this.formatterCode.appearance = 'default';
    }
  }

  async submit() {
    const state =
      this.document.state === SERVICE_STATE.ACTIVE
        ? SERVICE_STATE.ACTIVE
        : SERVICE_STATE.STOPPED;
    let version = 1;
    const parsed = parsePPPScript(this.parsingCode.value);

    if (parsed) {
      [version] = parsed?.meta?.version;
      version = Math.abs(+version) || 1;
    }

    if (this.useVersioning.checked) {
      if (!parsed || typeof version !== 'number') {
        invalidate(this.parsingCode, {
          errorMessage: 'Не удалось прочитать версию',
          raiseException: true
        });
      }
    }

    if (typeof version !== 'number') {
      version = 1;
    }

    return [
      {
        $set: {
          name: this.name.value.trim(),
          supabaseApiId: this.supabaseApiId.value,
          url: this.url.value.trim(),
          frameUrl: this.frameUrl.value.trim(),
          pusherApiId: this.pusherApiId.value,
          interval: Math.ceil(Math.abs(this.interval.value)),
          depth: Math.ceil(Math.abs(this.depth.value)),
          tableSchema: this.tableSchema.value,
          constsCode: this.constsCode.value,
          parsingCode: this.parsingCode.value,
          insertTriggerCode: this.insertTriggerCode.value,
          deleteTriggerCode: this.deleteTriggerCode.value,
          telegramEnabled: this.telegramEnabled.checked,
          botId: this.botId.value,
          channel: +this.channel.value,
          formatterCode: this.formatterCode.value,
          parserPredefinedTemplate: this.parserPredefinedTemplate.value,
          version,
          useVersioning: this.useVersioning.checked,
          versioningUrl: this.versioningUrl.value.trim(),
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.SUPABASE_PARSER,
          createdAt: new Date()
        }
      },
      this.#deploySupabaseParser,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }

  async update() {
    const data = predefinedParserData[this.parserPredefinedTemplate.value];
    const contentsResponse = await fetch(
      ppp.getWorkerTemplateFullUrl(data.url).toString(),
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(contentsResponse, 'Не удалось загрузить файл с шаблоном.');

    this.parsingCode.updateCode(await contentsResponse.text());
    this.constsCode.updateCode(data.constsCode);
    this.insertTriggerCode.updateCode(data.insertTriggerCode);
    this.deleteTriggerCode.updateCode(data.deleteTriggerCode);
    this.formatterCode.updateCode(data.formatterCode);
  }
}

applyMixins(
  ServiceSupabaseParserPage,
  PageWithService,
  PageWithSupabaseService
);

export default ServiceSupabaseParserPage.compose({
  template: serviceSupabaseParserPageTemplate,
  styles: serviceSupabaseParserPageStyles
}).define();
