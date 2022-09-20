import { ServiceSpbexHaltsPage } from '../../shared/service-spbex-halts-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import { serviceControlsTemplate } from './service-page.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

const exampleProxyHeaders = `{
  'User-Agent': '[%#navigator.userAgent%]',
  Cookie: ''
}`;

const exampleInstrumentsCode = `/**
 * Возвращает список инструментов с подробными данными.
 *
 * @returns {Object[]} instruments - Инструменты.
 * @returns {string} instruments[].isin - ISIN инструмента.
 * @returns {string} instruments[].ticker - Тикер инструмента.
 * @returns {string} instruments[].name - Название инструмента.
 * @returns {string} instruments[].currency - Валюта инструмента.
 */
const instruments = [%#JSON.stringify(await (await fetch(ppp.rootUrl +
  '/instruments/spbex-stocks.json')).json())%];

instruments.push({symbol: 'SPBE', isin: 'RU000AOJQ9P9',
  fullName: 'СПБ Биржа', currency: 'USD'});

return instruments.map((i) => {
  return {
    isin: i.isin,
    ticker: i.symbol,
    name: i.fullName.replace("'", "''"),
    currency: i.currency
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
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Сервис - Торговые паузы SPBEX - ${x.document.name}`
              : 'Сервис - Торговые паузы SPBEX'}
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
            <h5>Прокси-ресурс</h5>
            <p>Конечная точка, возвращающая содержимое URL, который будет
              передаваться в теле запроса.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="https://example.com"
              value="${(x) => x.document.proxyURL}"
              ${ref('proxyURL')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Заголовки запроса</h5>
            <p>Заголовки, которые будут передаваться с запросами к
              прокси-ресурсу.</p>
          </div>
          <div class="input-group">
            <${'ppp-codeflask'}
              :code="${(x) => x.document.proxyHeaders ?? exampleProxyHeaders}"
              ${ref('proxyHeaders')}
            ></ppp-codeflask>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) => x.proxyHeaders.updateCode(exampleProxyHeaders)}"
              appearance="primary"
            >
              Восстановить значение по умолчанию
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
              placeholder="50"
              value="${(x) => x.document.depth ?? '50'}"
              ${ref('depth')}
            ></ppp-text-field>
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
                x.document.instrumentsCode ?? exampleInstrumentsCode}"
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
              ?disabled="${(x) => x.page.loading}"
              @click="${(x) => x.callInstrumentsFunction()}"
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
              @click="${(x) => x.sendTestSpbexHaltMessage()}"
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
export default ServiceSpbexHaltsPage.compose({
  template: serviceSpbexHaltsPageTemplate,
  styles: pageStyles
});
