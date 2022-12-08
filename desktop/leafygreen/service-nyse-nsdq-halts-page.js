import { ServiceNyseNsdqHaltsPage } from '../../shared/service-nyse-nsdq-halts-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import { serviceControlsTemplate } from './service-page.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

const exampleSymbolsCode = `/**
 * Возвращает массив тикеров для отслеживания.
 *
 */
const instruments = [%#JSON.stringify(await (await fetch(ppp.rootUrl +
  '/instruments/spbex-stocks.json')).json())%];

const symbols = [];

for (const i of instruments) {
  if (i.currency === 'USD' && i.symbol !== 'TCS')
    symbols.push(i.symbol.replace('.', ' '));
}

symbols.push('CIAN');
symbols.push('OZON');
symbols.push('HHR');
symbols.push('GDEV');

return symbols;`;

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
  T5: 'Single Stock Trading Pause in Effect. Цена инструмента изменилась более, чем на 10% (включительно) в течение 5 минут.',
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
  M2: ' Quotation Not Available. Нет котировок по инструменту.',
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

export const serviceNyseNsdqHaltsPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Сервис - Торговые паузы NYSE/NASDAQ - ${x.document.name}`
              : 'Сервис - Торговые паузы NYSE/NASDAQ'}
        </span>
        ${when((x) => x.document._id, serviceControlsTemplate)}
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
            <h5>Интервал опроса</h5>
            <p>Периодичность проверки новых сообщений о торговых паузах от
              биржи. Задаётся в секундах.</p>
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
              placeholder="1000"
              value="${(x) => x.document.depth ?? '1000'}"
              ${ref('depth')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Тикеры для отслеживания</h5>
            <p>Функция на языке PLV8, возвращающая массив тикеров для
              отслеживания. Тикеры вне массива отслеживаться не будут. По
              умолчанию используется каталог инструментов Тинькофф
              Инвестиций.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) => x.document.symbolsCode ?? exampleSymbolsCode}"
              ${ref('symbolsCode')}
            ></ppp-codeflask>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) => x.symbolsCode.updateCode(exampleSymbolsCode)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
            </ppp-button>
            <ppp-button
              class="margin-top"
              ?disabled="${(x) => x.page.loading}"
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
            <p>Будет использован для публикации сообщений о торговых паузах.
              Должен обладать соответствующими правами в канале/группе.</p>
          </div>
          <div class="input-group">
            <ppp-collection-select
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
            ></ppp-collection-select>
            <ppp-button
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
              type="number"
              placeholder="Канал или группа"
              value="${(x) => x.document.channel}"
              ${ref('channel')}
            ></ppp-text-field>
            <ppp-button
              class="margin-top"
              ?disabled="${(x) => x.page.loading}"
              @click="${(x) => x.sendTestNyseNsdqHaltMessage()}"
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
              PLV8.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) => x.document.formatterCode ?? exampleFormatterCode}"
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
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ServiceNyseNsdqHaltsPage.compose({
  template: serviceNyseNsdqHaltsPageTemplate,
  styles: pageStyles
});
