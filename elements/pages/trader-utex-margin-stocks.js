import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { TRADER_CAPS, TRADERS } from '../../lib/const.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../text-field.js';

export const traderUtexMarginStocksTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Трейдеры - UTEX Margin (акции) - ${x.document.name}`
            : 'Трейдеры - UTEX Margin (акции)'}
      </ppp-page-header>
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
            placeholder="UTEX Margin Stocks"
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
                        type: `[%#(await import('../../lib/const.js')).BROKERS.UTEX%]`
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
              ppp.app.mountPage('broker-utex', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить профиль UTEX
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Комиссия UTEX</h5>
          <p class="description">
            Укажите в % комиссию вашего торгового счёта UTEX.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="0,04"
            value="${(x) => x.document.commissionRate}"
            ${ref('commissionRate')}
          ></ppp-text-field>
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
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить изменения
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const traderUtexMarginStocksStyles = css`
  ${pageStyles}
`;

export class TraderUtexMarginStocksPage extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.commissionRate);

    if (this.commissionRate.value.trim()) {
      await validate(this.commissionRate, {
        hook: async (value) => +value > 0 + value <= 100,
        errorMessage: 'Введите значение в диапазоне от 0 до 100'
      });
    }

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
              type: `[%#(await import('../../lib/const.js')).TRADERS.UTEX_MARGIN_STOCKS%]`
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
      type: TRADERS.UTEX_MARGIN_STOCKS,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        brokerId: this.brokerId.value,
        commissionRate: Math.abs(
          parseFloat(this.commissionRate.value.replace(',', '.'))
        ),
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        caps: [
          TRADER_CAPS.CAPS_LIMIT_ORDERS,
          TRADER_CAPS.CAPS_MARKET_ORDERS,
          TRADER_CAPS.CAPS_ACTIVE_ORDERS,
          TRADER_CAPS.CAPS_POSITIONS,
          TRADER_CAPS.CAPS_TIMELINE
        ],
        version: 1,
        type: TRADERS.UTEX_MARGIN_STOCKS,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderUtexMarginStocksPage.compose({
  template: traderUtexMarginStocksTemplate,
  styles: traderUtexMarginStocksStyles
}).define();
