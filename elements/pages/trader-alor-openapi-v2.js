import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { EXCHANGE, TRADER_CAPS, TRADERS } from '../../lib/const.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import { traderNameAndRuntimePartial, TraderCommonPage } from './trader.js';
import '../badge.js';
import '../button.js';
import '../radio-group.js';
import '../query-select.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const traderAlorOpenApiV2Template = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${traderNameAndRuntimePartial()}
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderAlorOpenapiV2Page.brokerProfileTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderAlorOpenapiV2Page.brokerProfileDescription')}
          </p>
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
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.ALOR%]`
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
            ${() => ppp.t('$traderAlorOpenapiV2Page.addBrokerProfile')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderAlorOpenapiV2Page.portfolioIdTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderAlorOpenapiV2Page.portfolioIdDescription')}
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
          <h5>${() => ppp.t('$traderAlorOpenapiV2Page.portfolioTypeTitle')}</h5>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.portfolioType ?? 'stock'}"
            ${ref('portfolioType')}
          >
            <ppp-radio value="stock">
              ${() => ppp.t('$traderAlorOpenapiV2Page.portfolioTypeStock')}
            </ppp-radio>
            <ppp-radio value="futures">
              ${() => ppp.t('$traderAlorOpenapiV2Page.portfolioTypeFutures')}
            </ppp-radio>
            <ppp-radio value="currency">
              ${() => ppp.t('$traderAlorOpenapiV2Page.portfolioTypeCurrency')}
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderAlorOpenapiV2Page.exchangeTitle')}</h5>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.exchange ?? EXCHANGE.SPBX}"
            ${ref('exchange')}
          >
            <ppp-radio value="${() => EXCHANGE.SPBX}">
              ${() => ppp.t(`$const.exchange.${EXCHANGE.SPBX}`)}
            </ppp-radio>
            <ppp-radio value="${() => EXCHANGE.MOEX}">
              ${() => ppp.t(`$const.exchange.${EXCHANGE.MOEX}`)}
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderAlorOpenapiV2Page.orderbookDepthTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderAlorOpenapiV2Page.orderbookDepthDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            placeholder="20"
            value="${(x) => x.document.orderbookDepth}"
            ${ref('orderbookDepth')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderAlorOpenapiV2Page.flatCommissionTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderAlorOpenapiV2Page.flatCommissionDescription')}
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
          <h5>
            ${() => ppp.t('$traderAlorOpenapiV2Page.reconnectTimeoutTitle')}
          </h5>
          <p class="description">
            ${() =>
              ppp.t('$traderAlorOpenapiV2Page.reconnectTimeoutDescription')}
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

export const traderAlorOpenApiV2Styles = css`
  ${pageStyles}
`;

export class TraderAlorOpenApiV2Page extends TraderCommonPage {
  collection = 'traders';

  getDefaultCaps() {
    return [
      TRADER_CAPS.CAPS_LIMIT_ORDERS,
      TRADER_CAPS.CAPS_MARKET_ORDERS,
      TRADER_CAPS.CAPS_CONDITIONAL_ORDERS,
      TRADER_CAPS.CAPS_ACTIVE_ORDERS,
      TRADER_CAPS.CAPS_ORDERBOOK,
      TRADER_CAPS.CAPS_TIME_AND_SALES,
      TRADER_CAPS.CAPS_POSITIONS,
      TRADER_CAPS.CAPS_TIMELINE,
      TRADER_CAPS.CAPS_LEVEL1,
      TRADER_CAPS.CAPS_CHARTS
    ];
  }

  async validate() {
    await super.validate();
    await validate(this.brokerId);
    await validate(this.portfolio);

    if (this.orderbookDepth.value.trim()) {
      await validate(this.orderbookDepth, {
        hook: async (value) => +value > 0 && +value <= 50,
        errorMessage: ppp.t('$page.valueInRange', { min: 1, max: 50 })
      });
    }

    if (this.flatCommissionRate.value.trim()) {
      await validate(this.flatCommissionRate, {
        hook: async (value) => +value >= 0 && +value <= 100,
        errorMessage: ppp.t('$page.valueInRange', { min: 0, max: 100 })
      });
    }

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: ppp.t('$page.valueInRange', { min: 100, max: 10000 })
      });
    }

    const broker = this.brokerId.datum();
    const jwtResponse = await fetch(
      `https://oauth.alor.ru/refresh?token=${broker.refreshToken}`,
      {
        method: 'POST'
      }
    );

    await maybeFetchError(
      jwtResponse,
      ppp.t('$traderAlorOpenapiV2Page.invalidAlorToken')
    );

    const { AccessToken } = await jwtResponse.json();
    const summaryResponse = await fetch(
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
      summaryResponse,
      ppp.t('$traderAlorOpenapiV2Page.portfolioSummaryFailed')
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.ALOR_OPENAPI_V2%]`
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
    const sup = await super.submit();

    sup.$set = {
      ...sup.$set,
      brokerId: this.brokerId.value,
      portfolio: this.portfolio.value.trim(),
      portfolioType: this.portfolioType.value,
      exchange: this.exchange.value,
      reconnectTimeout: this.reconnectTimeout.value
        ? Math.abs(this.reconnectTimeout.value)
        : void 0,
      orderbookDepth: this.orderbookDepth.value
        ? Math.abs(parseInt(this.orderbookDepth.value))
        : void 0,
      flatCommissionRate: this.flatCommissionRate.value
        ? Math.abs(parseFloat(this.flatCommissionRate.value.replace(',', '.')))
        : void 0,
      version: 1,
      type: TRADERS.ALOR_OPENAPI_V2
    };

    return sup;
  }
}

export default TraderAlorOpenApiV2Page.compose({
  name: 'ppp-trader-alor-openapi-v2-page',
  template: traderAlorOpenApiV2Template,
  styles: traderAlorOpenApiV2Styles
}).define();
