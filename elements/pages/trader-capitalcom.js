import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { invalidate, validate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { getAspirantWorkerBaseUrl } from './service-ppp-aspirant-worker.js';
import { TRADER_CAPS, TRADERS } from '../../lib/const.js';
import { traderNameAndRuntimePartial } from './trader.js';
import '../badge.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../text-field.js';

export const traderCapitalcomTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${traderNameAndRuntimePartial()}
      </section>
      <section>
        <div class="label-group">
          <h5>Профиль брокера</h5>
          <p class="description">Брокерский профиль Capital.com.</p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('brokerId')}
            value="${(x) => x.document.brokerId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.broker ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('brokers')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.CAPITALCOM%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.brokerId ?? ''%]` }
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
              ppp.app.mountPage('broker-capitalcom', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить профиль Capital.com
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Определение последней цены</h5>
          <p class="description">
            Вышестоящий источник предоставляет цены bid/ask CFD-контрактов. Выберите, каким образом рассчитывать цену последней сделки.
          </p>
        </div>
        <div class="input-group">
        <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.lastPriceMode ?? 'mid'}"
            ${ref('lastPriceMode')}
          >
            <ppp-radio value="bid">Bid</ppp-radio>
            <ppp-radio value="ask">Ask</ppp-radio>
            <ppp-radio value="mid">Mid</ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Сервис-соединитель</h5>
          <p class="description">
            Будет использован для совершения HTTP-запросов к Capital.com.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('connectorServiceId')}
            :context="${(x) => x}"
            value="${(x) => x.document.connectorServiceId}"
            :preloaded="${(x) => x.document.connectorService ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('services')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
                      },
                      { workerPredefinedTemplate: 'connectors' },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.connectorServiceId ?? ''%]`
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
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const traderCapitalcomStyles = css`
  ${pageStyles}
`;

export class TraderCapitalcomPage extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);

    if (this.runtime.value === 'aspirant-worker') {
      await validate(this.runtimeServiceId);
    }

    await validate(this.brokerId);
    await validate(this.connectorServiceId);

    const connector = this.connectorServiceId.datum();

    this.connectorUrl = await getAspirantWorkerBaseUrl(connector);
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.CAPITALCOM%]`
            }
          },
          {
            $lookup: {
              from: 'brokers',
              localField: 'brokerId',
              foreignField: '_id',
              as: 'broker'
            }
          },
          {
            $unwind: '$broker'
          },
          {
            $lookup: {
              from: 'services',
              localField: 'runtimeServiceId',
              foreignField: '_id',
              as: 'runtimeService'
            }
          },
          {
            $unwind: {
              path: '$runtimeService',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'connectorServiceId',
              foreignField: '_id',
              as: 'connectorService'
            }
          },
          {
            $unwind: {
              path: '$connectorService',
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: TRADERS.CAPITALCOM,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const $set = {
      name: this.name.value.trim(),
      runtime: this.runtime.value,
      brokerId: this.brokerId.value,
      lastPriceMode: this.lastPriceMode.value,
      caps: [TRADER_CAPS.CAPS_LEVEL1],
      connectorServiceId: this.connectorServiceId.value,
      connectorUrl: this.connectorUrl,
      version: 1,
      type: TRADERS.CAPITALCOM,
      updatedAt: new Date()
    };

    if (this.runtime.value === 'aspirant-worker') {
      $set.runtimeServiceId = this.runtimeServiceId.value;
    }

    return {
      $set,
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderCapitalcomPage.compose({
  template: traderCapitalcomTemplate,
  styles: traderCapitalcomStyles
}).define();
