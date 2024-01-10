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
import '../text-field.js';

export const traderFinamTradeApiTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${traderNameAndRuntimePartial()}
      <section>
        <div class="label-group">
          <h5>Профиль брокера</h5>
          <p class="description">Брокерский профиль Finam.</p>
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
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.FINAM%]`
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
              ppp.app.mountPage('broker-finam', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить профиль Finam
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Торговый код</h5>
          <p class="description">
            Трейдер может работать только с едиными счетами. Можно найти в
            личном кабинете, открыв счёт из списка - код отобразится в
            открывшихся подробностях.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Код торгового счёта"
            value="${(x) => x.document.account}"
            ${ref('account')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Сервис-соединитель</h5>
          <p class="description">
            Будет использован для совершения HTTP-запросов к Finam.
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

export const traderFinamTradeApiStyles = css`
  ${pageStyles}
`;

export async function checkFinamAccount({ connectorUrl, token, account }) {
  return fetch(`${connectorUrl}fetch`, {
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: `https://trade-api.finam.ru/public/api/v1/portfolio?ClientId=${account}`,
      headers: {
        'X-Api-Key': token
      }
    })
  });
}

export class TraderFinamTradeApiPage extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);

    if (this.runtime.value === 'aspirant-worker') {
      await validate(this.runtimeServiceId);
    }

    await validate(this.brokerId);
    await validate(this.account);
    await validate(this.connectorServiceId);

    const connector = this.connectorServiceId.datum();

    this.connectorUrl = await getAspirantWorkerBaseUrl(connector);

    if (
      !(
        await checkFinamAccount({
          connectorUrl: this.connectorUrl,
          account: this.account.value.trim(),
          token: this.brokerId.datum().token
        })
      ).ok
    ) {
      invalidate(this.account, {
        errorMessage: 'Неверный торговый код',
        raiseException: true
      });
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.FINAM_TRADE_API%]`
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
      type: TRADERS.FINAM_TRADE_API,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const $set = {
      name: this.name.value.trim(),
      runtime: this.runtime.value,
      brokerId: this.brokerId.value,
      account: this.account.value.trim(),
      caps: [
        TRADER_CAPS.CAPS_LIMIT_ORDERS,
        TRADER_CAPS.CAPS_MARKET_ORDERS,
        TRADER_CAPS.CAPS_ACTIVE_ORDERS,
        TRADER_CAPS.CAPS_POSITIONS,
        TRADER_CAPS.CAPS_TIMELINE,
        TRADER_CAPS.CAPS_CHARTS
      ],
      connectorServiceId: this.connectorServiceId.value,
      connectorUrl: this.connectorUrl,
      version: 1,
      type: TRADERS.FINAM_TRADE_API,
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

export default TraderFinamTradeApiPage.compose({
  template: traderFinamTradeApiTemplate,
  styles: traderFinamTradeApiStyles
}).define();
