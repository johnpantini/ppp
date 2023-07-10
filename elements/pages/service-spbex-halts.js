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
import { applyMixins } from '../../vendor/fast-utilities.js';
import { APIS,  SERVICES } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../snippet.js';
import '../terminal.js';
import '../text-field.js';

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

export const serviceSpbexHaltsPageTemplate = html`
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
          <h5>Базовый URL</h5>
          <p class="description">
            Ссылка на базовый ресурс биржи. Это может быть адрес прокси-сервера.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="https://spbexchange.ru"
            value="${(x) => x.document.proxyURL}"
            ${ref('proxyURL')}
          ></ppp-text-field>
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
            ?disabled="${(x) => true || !x.isSteady()}"
            @click="${(x) => x.sendTestSpbexHaltMessage()}"
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

export const serviceSpbexHaltsPageStyles = css`
  ${pageStyles}
  ppp-snippet {
    height: 300px;
  }
`;

// TODO - implement this class
export class ServiceSpbexHaltsPage extends Page {
  collection = 'services';

  async #deploy() {}

  async validate() {}

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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.SPBEX_HALTS%]`
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
      type: SERVICES.SPBEX_HALTS,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return false;
  }
}

applyMixins(ServiceSpbexHaltsPage, PageWithService, PageWithSupabaseService);

// noinspection JSUnusedGlobalSymbols
export default ServiceSpbexHaltsPage.compose({
  template: serviceSpbexHaltsPageTemplate,
  styles: serviceSpbexHaltsPageStyles
}).define();
