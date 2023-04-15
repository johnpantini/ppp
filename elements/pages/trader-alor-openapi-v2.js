import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, maybeFetchError } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { EXCHANGE, TRADER_CAPS, TRADERS } from '../../lib/const.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import '../button.js';
import '../radio-group.js';
import '../query-select.js';
import '../text-field.js';

export const traderAlorOpenApiV2Template = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Трейдеры - Alor Open API V2 - ${x.document.name}`
            : 'Трейдеры - Alor Open API V2'}
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
            placeholder="Alor"
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
                        type: `[%#(await import('../../lib/const.js')).BROKERS.ALOR%]`
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
              ppp.app.mountPage('broker-alor', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить профиль Alor
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Идентификатор клиентского портфеля</h5>
          <p class="description">
            Портфель Алор для требуемой торговой секции.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="D70000"
            value="${(x) => x.document.portfolio}"
            ${ref('portfolio')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Тип клиентского портфеля</h5>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.portfolioType ?? 'stock'}"
            ${ref('portfolioType')}
          >
            <ppp-radio value="stock">Фондовый рынок</ppp-radio>
            <ppp-radio value="futures">Срочный рынок</ppp-radio>
            <ppp-radio value="currency"
              >Валютный рынок и рынок драг. металлов
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Торговая площадка</h5>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.exchange ?? EXCHANGE.SPBX}"
            ${ref('exchange')}
          >
            <ppp-radio value="${() => EXCHANGE.SPBX}">СПБ Биржа</ppp-radio>
            <ppp-radio value="${() => EXCHANGE.MOEX}"
              >Московская биржа
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Комиссия плоского тарифа</h5>
          <p class="description">
            Укажите в % комиссию вашего тарифа, если он отличается от
            стандартных, предлагаемых брокером.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            placeholder="0,025"
            value="${(x) => x.document.flatCommissionRate}"
            ${ref('flatCommissionRate')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Тайм-аут восстановления соединения</h5>
          <p class="description">
            Время, по истечении которого будет предпринята очередная попытка
            восстановить прерванное подключение к серверам брокера. Задаётся в
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

export const traderAlorOpenApiV2Styles = css`
  ${pageStyles}
`;

export class TraderAlorOpenApiV2Page extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.portfolio);

    if (this.flatCommissionRate.value.trim()) {
      await validate(this.flatCommissionRate, {
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

    const broker = this.brokerId.datum();
    const jwtRequest = await fetch(
      `https://oauth.alor.ru/refresh?token=${broker.refreshToken}`,
      {
        method: 'POST'
      }
    );

    await maybeFetchError(jwtRequest, 'Неверный токен Alor.');

    const { AccessToken } = await jwtRequest.json();
    const summaryRequest = await fetch(
      `https://api.alor.ru/md/v2/Clients/${
        this.exchange.value
      }/${this.portfolio.value.trim()}/summary`,
      {
        headers: {
          'X-ALOR-REQID': uuidv4(),
          Authorization: `Bearer ${AccessToken}`
        }
      }
    );

    await maybeFetchError(
      summaryRequest,
      'Не удаётся получить информацию о портфеле.'
    );
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
              type: `[%#(await import('../../lib/const.js')).TRADERS.ALOR_OPENAPI_V2%]`
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
      type: TRADERS.ALOR_OPENAPI_V2,
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
        portfolio: this.portfolio.value.trim(),
        portfolioType: this.portfolioType.value,
        exchange: this.exchange.value,
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        flatCommissionRate: this.flatCommissionRate.value
          ? Math.abs(
              parseFloat(this.flatCommissionRate.value.replace(',', '.'))
            )
          : void 0,
        version: 1,
        caps: [
          TRADER_CAPS.CAPS_LIMIT_ORDERS,
          TRADER_CAPS.CAPS_MARKET_ORDERS,
          TRADER_CAPS.CAPS_STOP_ORDERS,
          TRADER_CAPS.CAPS_ACTIVE_ORDERS,
          TRADER_CAPS.CAPS_ORDERBOOK,
          TRADER_CAPS.CAPS_TIME_AND_SALES,
          TRADER_CAPS.CAPS_POSITIONS,
          TRADER_CAPS.CAPS_TIMELINE,
          TRADER_CAPS.CAPS_LEVEL1,
          TRADER_CAPS.CAPS_CHARTS
        ],
        type: TRADERS.ALOR_OPENAPI_V2,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderAlorOpenApiV2Page.compose({
  name: 'ppp-trader-alor-openapi-v2-page',
  template: traderAlorOpenApiV2Template,
  styles: traderAlorOpenApiV2Styles
}).define();
