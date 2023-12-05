import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
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
import { validate } from '../../lib/ppp-errors.js';
import { Tmpl } from '../../lib/tmpl.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../snippet.js';
import '../terminal.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

const exampleSymbolsCodeAll = `/**
 * Пустой массив - отслеживаются все тикеры.
 *
 */
return [];`;

const exampleFormatterCode = `/**
 * Функция форматирования сообщения о торговой паузе.
 *
 * @param {string} halt_date - Дата начала торговой паузы (MM/DD/YYYY).
 * @param {string} halt_time - Время торговой паузы (Eastern Time).
 * @param {string} symbol - Тикер инструмента.
 * @param {string} name - Название инструмента.
 * @param {string} market - Площадка листинга инструмента.
 * @param {string} reason_code - Код торговой паузы.
 * @param {string} pause_threshold_price - Индикативная пороговая цена торговой паузы.
 * @param {string} resumption_date - Дата окончания торговой паузы (MM/DD/YYYY).
 * @param {string} resumption_quote_time - Время открытия книги заявок (Eastern Time).
 * @param {string} resumption_trade_time - Время открытия торгов (Eastern Time).
 */
const mappings = {
  T1: 'Halt - News Pending. Ожидаются новости.',
  T2: 'Halt - News Released. Эмитент начинает процесс распространения новостей в соответствии с требованиями о добросовестном раскрытии информации (SEC Regulation FD).',
  T5: 'Single Stock Trading Pause in Effect. Цена инструмента изменилась более чем на 10% (включительно) в течение 5 минут.',
  T6: 'Halt - Extraordinary Market Activity. Необычная рыночная активность. Срабатывает, если NASDAQ обнаруживает проблемы (которые могут привести к изменению цены) с котированием, с репортингом в ленту сделок, или проблемы соединения.',
  T8: 'Halt - Exchange-Traded-Fund (ETF). Срабатывает в ETF, если обнаружены проблемы в базовых активах.',
  T12: 'Halt - Additional Information Requested by NASDAQ. Срабатывает, если NASDAQ ожидает дополнительную информацию (эмитенту направляются вопросы, на которые тот должен дать ответ).',
  H4: 'Halt - Non-compliance. Несоответствие требованиям листинга NASDAQ.',
  H9: 'Halt - Not Current. Компания не опубликовала актуальный отчёт в регулирующие органы (SEC).',
  H10: 'Halt - SEC Trading Suspension. SEC приостановила торги на неопределенное время.',
  H11: 'Halt - Regulatory Concern. Торги приостановлены в другом рыночном центре по требованию регулирующих органов. Длительность приостановки может исчисляться днями или неделями.',
  O1: 'Operations Halt, Contact Market Operations. Проблемы с маркет-мейкингом (проблемы с выставлением котировок и обработкой заявок участников торгов).',
  IPO1: 'HIPO Issue not yet Trading. Проблемы на торгах инструментов, выходящих на IPO (в первый день торгов). Торги IPO начинаются позже начала основной сессии на несколько часов.',
  M1: 'Corporate Action. Корпоративное событие.',
  M2: 'Quotation Not Available. Нет котировок по инструменту.',
  LUDP: 'Volatility Trading Pause. Торговая пауза в связи с волатильностью.',
  LUDS: 'Volatility Trading Pause - Straddle Condition. Пауза, связанная с выходом котировки bid или ask за установленные пределы.',
  MWC1: 'Market Wide Circuit Breaker Halt. Остановка торгов из-за срабатывания глобальной стоп-защиты рынка.',
  MWC2: 'Market Wide Circuit Breaker Halt. Остановка торгов из-за срабатывания глобальной стоп-защиты рынка.',
  MWC3: 'Market Wide Circuit Breaker Halt. Остановка торгов из-за срабатывания глобальной стоп-защиты рынка.',
  MWC0: 'Market Wide Circuit Breaker Halt. Остановка торгов из-за срабатывания глобальной стоп-защиты рынка.',
  T3: 'News and Resumption Times. Эмитент закончил процесс распространения новостей, вскоре ожидаются торги.',
  T7: 'Single Stock Trading Pause/Quotation-Only Period. См. код T5.',
  R4: 'Qualifications Issues Reviewed/Resolved; Quotations/Trading to Resume. См. код H4.',
  R9: 'Filing Requirements Satisfied/Resolved; Quotations/Trading To Resume. См. код H9.',
  C3: 'Issuer News Not Forthcoming; Quotations/Trading To Resume. Публикация новостей отменена. См. коды T2 и T3.',
  C4: 'Qualifications Halt Ended; Maintenance Requirements Met. См. коды H4 и R4.',
  C9: 'Qualifications Halt Concluded; Filings Met; Quotes/Trades To Resume. См. коды H9 и R9.',
  C11: 'Trade Halt Concluded By Other Regulatory Auth.; Quotes/Trades Resume. См. код H11.',
  R1: 'New Issue Available. См. код T1.',
  R2: 'Issue Available. См. код T2.',
  IPOQ: 'IPO security released for quotation. Для инструментов в день IPO - начало котирования. Только NASDAQ.',
  IPOE: 'IPO security - positioning window extension. Расширение периода подачи заявок в перекрёстной сессии NASDAQ для инструментов в день IPO.',
  MWCQ: 'Market Wide Circuit Breaker Resumption. Снятие глобальной стоп-защиты рынка.',
  M: 'Volatility Trading Pause. Торговая пауза в связи с волатильностью.',
  D: 'Security deletion from NASDAQ / CQS. Инструмент удалён с торгов (делистинг).'
};
const formatDateTime = (dateString) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const firstOfMarch = new Date(currentYear, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch = firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(currentYear, 2, secondSundayInMarch);
  const firstOfNovember = new Date(currentYear, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember = firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(currentYear, 10, firstSundayInNovember);
  const isDST = currentDate.getTime() <= end.getTime() && currentDate.getTime() >= start.getTime();
  const [date, timeZ] = new Date(\`\${dateString} GMT-\${isDST ? '7' : '8'}\`)
    .toISOString()
    .split(/T/);
  const [y, m, d] = date.split(/-/);
  const [time] = timeZ.split(/\\./);

  return \`\${d}.\${m}.\${y} \${time} MSK\`;
};

let message = \`‼️⏸ Приостановка торгов (\${market})
\${'\$'}\${symbol}
<b>\${name}</b>
🕒 \${formatDateTime(\`\${halt_date} \${halt_time}\`)}

\`;

const description = mappings[reason_code];

if (description) message += \`<b>Код \${reason_code}</b>: \${description}\\n\`;
else message += \`<b>Ожидание кода</b>\\n\`;

if (resumption_quote_time)
  message += \`\\nОткрытие книги заявок: \${formatDateTime(
    \`\${resumption_date} \${resumption_quote_time}\`
  )}\`;

if (resumption_trade_time)
  message += \`\\nВозобновление торгов: \${formatDateTime(
    \`\${resumption_date} \${resumption_trade_time}\`
  )}\`;

message +=
  '\\n\\n<a href="https://www.nasdaqtrader.com/trader.aspx?id=TradeHalts">К списку торговых пауз</a>';

return message;`;

export const serviceNyseNsdqHaltsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: servicePageHeaderExtraControls
      })}
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
          <p class="description">Опциональная интеграция, позволяющая принимать
            сообщения от парсера в канал ppp платформы Pusher.</p>
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
          <h5>Интервал опроса</h5>
          <p class="description">
            Периодичность проверки новых сообщений о торговых паузах от биржи.
            Задаётся в секундах.
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
        <div class="label-group">
          <h5>Тикеры для отслеживания</h5>
          <p class="description">
            Тело функции на языке PLV8, которая возвращает массив тикеров для
            отслеживания. Можно воспользоваться готовыми шаблонами:
          </p>
          <ppp-select
            value="${(x) => x.document.symbolsTemplate ?? 'all'}"
            @change="${(x) => {
              x.symbolsCode.updateCode(
                x.symbolsTemplate.value === 'all' ? exampleSymbolsCodeAll : ''
              );
            }}"
            ${ref('symbolsTemplate')}
          >
            <ppp-option value="all">
              Отслеживать все тикеры
            </ppp-option>
          </ppp-select>
        </div>
        <div class="input-group">
          <ppp-snippet
            revertable
            :code="${(x) => x.document.symbolsCode ?? exampleSymbolsCodeAll}"
            @revert="${(x) => {
              x.symbolsCode.updateCode(
                x.symbolsTemplate.value === 'all' ? exampleSymbolsCodeAll : ''
              );
            }}"
            ${ref('symbolsCode')}
          ></ppp-snippet>
          <div class="spacing2">
            <ppp-button
              ?disabled="${(x) => !x.isSteady()}"
              @click="${(x) => x.callSymbolsFunction()}"
              appearance="primary"
            >
              Выполнить функцию
            </ppp-button>
          </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Бот</h5>
          <p class="description">
            Будет использован для публикации сообщений о торговых паузах. Должен
            обладать соответствующими правами в канале/группе.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('botId')}
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
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Канал или группа</h5>
          <p class="description">
            Идентификатор канала или группы, куда будут отправляться уведомления
            о торговых паузах.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="Канал или группа"
            value="${(x) => x.document.channel}"
            ${ref('channel')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Форматирование уведомлений</h5>
          <p class="description">
            Логика форматирования итогового сообщения в Telegram на языке PLV8.
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            revertable
            :code="${(x) => x.document.formatterCode ?? exampleFormatterCode}"
            ${ref('formatterCode')}
            @revert="${(x) => {
              x.formatterCode.updateCode(exampleFormatterCode);
            }}"
          ></ppp-snippet>
          <div class="spacing2"></div>
          <ppp-button
            ?disabled="${(x) => !x.isSteady()}"
            @click="${(x) => x.sendTestNyseNsdqHaltMessage()}"
            appearance="primary"
          >
            Отправить тестовое сообщение
          </ppp-button>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: 'Сохранить в PPP и обновить в Supabase',
        extraControls: servicePageFooterExtraControls
      })}
    </form>
  </template>
`;

export const serviceNyseNsdqHaltsPageStyles = css`
  ${pageStyles}
  ppp-snippet {
    height: 300px;
  }
`;

export class ServiceNyseNsdqHaltsPage extends Page {
  collection = 'services';

  async sendTestNyseNsdqHaltMessage() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);

      const temporaryFormatterName = `ppp_${uuidv4().replaceAll('-', '_')}`;

      // Returns form data
      const temporaryFormatterBody = `function ${temporaryFormatterName}(halt_date,
        halt_time, symbol, name, market, reason_code, pause_threshold_price,
        resumption_date, resumption_quote_time, resumption_trade_time) {
          const closure = () => {${this.formatterCode.value}};
          const formatted = closure();

          if (typeof formatted === 'string')
            return \`chat_id=${this.channel.value}&text=\${formatted}&parse_mode=html\`;
          else {
            const options = formatted.options || {};
            let formData = \`chat_id=${this.channel.value}&text=\${formatted.text}\`;

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

      const functionBody = `${temporaryFormatterBody}
         return plv8.execute(\`select content from http_post('https://api.telegram.org/bot${
           this.botId.datum().token
         }/sendMessage',
        '\${${temporaryFormatterName}('02/10/2022', '15:37:48', 'ASTR', 'Astra Space Inc Cl A Cmn Stk', 'NASDAQ', 'LUDP',
          '', '02/10/2022', '15:37:48', '15:42:48')}',
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

  async callSymbolsFunction(returnResult) {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.symbolsCode);

      const result = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.symbolsCode.value,
        returnResult
      });

      if (!returnResult)
        this.showSuccessNotification(
          'База данных успешно выполнила функцию. Смотрите результат в консоли браузера.'
        );

      return result;
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async #deploy() {
    this.document.supabaseApi = this.supabaseApiId.datum();
    this.document.pusherApi = this.pusherApiId.datum();
    this.document.bot = this.botId.datum();

    const [sendTelegramMessage, deployNyseNsdqHalts] = await Promise.all([
      fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) => r.text()),
      fetch(this.getSQLUrl(`${SERVICES.NYSE_NSDQ_HALTS}/deploy.sql`)).then(
        (r) => r.text()
      )
    ]);

    this.document.symbols = JSON.stringify(
      await this.callSymbolsFunction(true)
    );

    const query = `${sendTelegramMessage}
      ${await new Tmpl().render(this, deployNyseNsdqHalts, {})}`;

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
      hook: async (value) => +value >= 1000 && +value <= 10000,
      errorMessage: 'Введите значение в диапазоне от 1000 до 10000'
    });
    await validate(this.symbolsCode);
    await validate(this.botId);
    await validate(this.channel);
    await validate(this.formatterCode);
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.NYSE_NSDQ_HALTS%]`
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
            $unwind: '$supabaseApi'
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
            $unwind: '$bot'
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.NYSE_NSDQ_HALTS,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const state =
      this.document.state === SERVICE_STATE.ACTIVE
        ? SERVICE_STATE.ACTIVE
        : SERVICE_STATE.STOPPED;

    return [
      {
        $set: {
          name: this.name.value.trim(),
          supabaseApiId: this.supabaseApiId.value,
          pusherApiId: this.pusherApiId.value,
          interval: Math.ceil(Math.abs(this.interval.value)),
          depth: Math.ceil(Math.abs(this.depth.value)),
          symbolsCode: this.symbolsCode.value,
          symbolsTemplate: this.symbolsTemplate.value,
          botId: this.botId.value,
          channel: +this.channel.value,
          formatterCode: this.formatterCode.value,
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.NYSE_NSDQ_HALTS,
          createdAt: new Date()
        }
      },
      this.#deploy,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }
}

applyMixins(ServiceNyseNsdqHaltsPage, PageWithService, PageWithSupabaseService);

// noinspection JSUnusedGlobalSymbols
export default ServiceNyseNsdqHaltsPage.compose({
  template: serviceNyseNsdqHaltsPageTemplate,
  styles: serviceNyseNsdqHaltsPageStyles
}).define();
