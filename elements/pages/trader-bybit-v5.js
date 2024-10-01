import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { TRADER_CAPS, TRADERS } from '../../lib/const.js';
import { traderNameAndRuntimePartial, TraderCommonPage } from './trader.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../radio-group.js';
import '../text-field.js';

export const traderBybitV5Template = html`
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
          <p class="description">Брокерский профиль Bybit.</p>
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
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.BYBIT%]`
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
              ppp.app.mountPage('broker-bybit', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить профиль Bybit
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Продукт</h5>
          <p class="description">
            Выберите продукт, в рамках которого будете торговать.
          </p>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.productLine ?? 'linear'}"
            @change="${(x) => {
              if (
                x.productLine.value === 'spot' &&
                x.orderbookDepth.value === '500'
              ) {
                x.orderbookDepth.value = '50';
              }
            }}"
            ${ref('productLine')}
          >
            <ppp-radio value="linear">Деривативы</ppp-radio>
            <ppp-radio value="spot">Спот</ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Глубина книги заявок</h5>
          <p class="description">
            Чем меньше глубина, тем быстрее будет обновляться книга заявок.
          </p>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.orderbookDepth ?? '50'}"
            ${ref('orderbookDepth')}
          >
            <ppp-radio value="1">1</ppp-radio>
            <ppp-radio value="50">50</ppp-radio>
            <ppp-radio value="200">200</ppp-radio>
            ${when(
              (x) => x.productLine.value === 'linear',
              html`<ppp-radio value="500">500</ppp-radio>`
            )}
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Тайм-аут восстановления соединения</h5>
          <p class="description">
            Время, по истечении которого будет предпринята очередная попытка
            восстановить прерванное подключение к серверу. Задаётся в
            миллисекундах, по умолчанию 1000 мс.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            type="number"
            placeholder="1000"
            value="${(x) => x.document.reconnectTimeout}"
            ${ref('reconnectTimeout')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const traderBybitV5Styles = css`
  ${pageStyles}
`;

export class TraderBybitV5Page extends TraderCommonPage {
  collection = 'traders';

  getDefaultCaps() {
    return [
      TRADER_CAPS.CAPS_LEVEL1,
      TRADER_CAPS.CAPS_LIMIT_ORDERS,
      TRADER_CAPS.CAPS_MARKET_ORDERS,
      TRADER_CAPS.CAPS_СONDITIONAL_ORDERS,
      TRADER_CAPS.CAPS_ACTIVE_ORDERS,
      TRADER_CAPS.CAPS_ORDERBOOK,
      TRADER_CAPS.CAPS_TIME_AND_SALES,
      TRADER_CAPS.CAPS_POSITIONS,
      TRADER_CAPS.CAPS_TIMELINE,
      TRADER_CAPS.CAPS_CHARTS
    ];
  }

  async validate() {
    await super.validate();
    await validate(this.brokerId);

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: 'Введите значение в диапазоне от 100 до 10000'
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.BYBIT_V5%]`
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
      type: TRADERS.BYBIT_V5,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const sup = await super.submit();

    sup.$set = {
      ...sup.$set,
      brokerId: this.brokerId.value,
      productLine: this.productLine.value,
      orderbookDepth: this.orderbookDepth.value,
      reconnectTimeout: this.reconnectTimeout.value
        ? Math.abs(this.reconnectTimeout.value)
        : void 0,
      version: 1,
      type: TRADERS.BYBIT_V5
    };

    return sup;
  }
}

export default TraderBybitV5Page.compose({
  name: 'ppp-trader-bybit-v5-page',
  template: traderBybitV5Template,
  styles: traderBybitV5Styles
}).define();
