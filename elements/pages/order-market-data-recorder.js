import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial,
  documentPageNameSectionPartial
} from '../page.js';
import { APIS, ORDERS } from '../../lib/const.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../text-field.js';

export const orderMarketDataRecorderTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${documentPageNameSectionPartial({})}
      <section>
        <div class="label-group">
          <h5>Спецификация</h5>
          <p class="description">
            Узнайте, каким образом используются трейдеры для этой условной
            заявки. Трейдеры задаются в виджете заявки.
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            readonly
            style="height: 128px"
            :code="${(x) =>
              `Трейдер #1 - источник книги заявок.\nТрейдер #2 - источник сделок.\nТрейдер #3 - источник торговых статусов.`}"
          ></ppp-snippet>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>API Yandex Cloud</h5>
          <p class="description">
            API, который будет использован для выгрузки записей в облачное
            хранилище.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('ycApiId')}
            value="${(x) => x.document.ycApiId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.ycApi ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('apis')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.YC%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.ycApiId ?? ''%]`
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
              ppp.app.mountPage(`api-${APIS.YC}`, {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить API Yandex Cloud
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Флаги</h5>
          <p class="description">Параметры работы заявки.</p>
        </div>
        <div class="input-group">
          <div class="control-stack">
            <ppp-checkbox
              ${ref('autoStartFlag')}
              ?checked="${(x) => x.document.autoStart ?? true}"
            >
              Запускать запись сразу после выставления заявки
            </ppp-checkbox>
          </div>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const orderMarketDataRecorderStyles = css`
  ${pageStyles}
`;

export class OrderMarketDataRecorderPage extends Page {
  collection = 'orders';

  async validate() {
    await validate(this.name);
    await validate(this.ycApiId);
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).ORDERS.MARKET_DATA_RECORDER%]`
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'ycApiId',
              foreignField: '_id',
              as: 'ycApi'
            }
          },
          {
            $unwind: '$ycApi'
          }
        ]);
    };
  }

  async find() {
    return {
      type: ORDERS.MARKET_DATA_RECORDER,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        ycApiId: this.ycApiId.value,
        autoStart: !!this.autoStartFlag.checked,
        version: 1,
        sideAgnostic: true,
        type: ORDERS.MARKET_DATA_RECORDER,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default OrderMarketDataRecorderPage.compose({
  template: orderMarketDataRecorderTemplate,
  styles: orderMarketDataRecorderStyles
}).define();
