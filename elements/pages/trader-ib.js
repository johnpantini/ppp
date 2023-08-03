import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { TRADER_CAPS, TRADERS } from '../../lib/const.js';
import { later } from '../../lib/ppp-decorators.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';

export const traderIbV3Template = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название трейдера</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="IB"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Профиль брокера</h5>
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
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.IB%]`
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
              ppp.app.mountPage('broker-ib', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить профиль IB
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Торговый счёт IB</h5>
          <p class="description">Можно найти в TWS в заголовке программы.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="U1234567"
            value="${(x) => x.document.account}"
            ${ref('account')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const traderIbV3Styles = css`
  ${pageStyles}
`;

export class TraderIbPage extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.account);

    const { ibGatewayUrl, twsHost, twsPort } = this.brokerId.datum();

    let gatewayUrl = ibGatewayUrl;

    if (!gatewayUrl.endsWith('/')) {
      gatewayUrl = `${gatewayUrl}/`;
    }

    const connectionRequest = await fetch(`${gatewayUrl}call`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'connect',
        body: {
          host: twsHost,
          port: twsPort
        }
      })
    });

    await maybeFetchError(connectionRequest, 'Нет связи со шлюзом.');
    await later(3000);

    const summaryRequest = await fetch(`${gatewayUrl}call`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'summary'
      })
    });

    await maybeFetchError(
      summaryRequest,
      'Шлюз не выполнил запрос информации о портфеле.'
    );

    const { result } = await summaryRequest.json();

    if (typeof result.summary[this.account.value.trim()] === 'undefined') {
      invalidate(ppp.app.toast, {
        errorMessage: 'Торговый счёт не найден.',
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.IB%]`
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
          }
        ]);
    };
  }

  async find() {
    return {
      type: TRADERS.IB,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    if (ppp.traders.has(this.document._id)) {
      ppp.traders.delete(this.document._id);
    }

    return {
      $set: {
        name: this.name.value.trim(),
        brokerId: this.brokerId.value,
        account: this.account.value.trim(),
        caps: [
          TRADER_CAPS.CAPS_LIMIT_ORDERS,
          TRADER_CAPS.CAPS_MARKET_ORDERS,
          TRADER_CAPS.CAPS_ACTIVE_ORDERS,
          TRADER_CAPS.CAPS_STOP_ORDERS,
          TRADER_CAPS.CAPS_POSITIONS,
          TRADER_CAPS.CAPS_TIMELINE,
          TRADER_CAPS.CAPS_ORDER_DESTINATION,
          TRADER_CAPS.CAPS_ORDER_TIF
        ],
        version: 1,
        type: TRADERS.IB,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderIbPage.compose({
  template: traderIbV3Template,
  styles: traderIbV3Styles
}).define();
