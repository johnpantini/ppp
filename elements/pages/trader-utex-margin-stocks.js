import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
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
import '../checkbox.js';
import '../query-select.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const traderUtexMarginStocksTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${traderNameAndRuntimePartial()}
      <section>
        <div class="label-group">
          <h5>
            ${() => ppp.t('$traderUtexMarginStocksPage.brokerProfileTitle')}
          </h5>
          <p class="description">
            ${() =>
              ppp.t('$traderUtexMarginStocksPage.brokerProfileDescription')}
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
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.UTEX%]`
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
            ${() => ppp.t('$traderUtexMarginStocksPage.addBrokerProfile')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderUtexMarginStocksPage.commissionTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderUtexMarginStocksPage.commissionDescription')}
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
          <h5>
            ${() => ppp.t('$traderUtexMarginStocksPage.reconnectTimeoutTitle')}
          </h5>
          <p class="description">
            ${() =>
              ppp.t('$traderUtexMarginStocksPage.reconnectTimeoutDescription')}
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

export const traderUtexMarginStocksStyles = css`
  ${pageStyles}
`;

export class TraderUtexMarginStocksPage extends TraderCommonPage {
  collection = 'traders';

  getDefaultCaps() {
    return [
      TRADER_CAPS.CAPS_LEVEL1,
      TRADER_CAPS.CAPS_LIMIT_ORDERS,
      TRADER_CAPS.CAPS_MARKET_ORDERS,
      TRADER_CAPS.CAPS_CONDITIONAL_ORDERS,
      TRADER_CAPS.CAPS_ACTIVE_ORDERS,
      TRADER_CAPS.CAPS_POSITIONS,
      TRADER_CAPS.CAPS_TIMELINE,
      TRADER_CAPS.CAPS_CHARTS
    ];
  }

  async validate() {
    await super.validate();
    await validate(this.brokerId);
    await validate(this.commissionRate);

    if (this.commissionRate.value.trim()) {
      await validate(this.commissionRate, {
        hook: async (value) => +value > 0 + value <= 100,
        errorMessage: ppp.t('$page.valueInRange', { min: 0, max: 100 })
      });
    }

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: ppp.t('$page.valueInRange', { min: 100, max: 10000 })
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.UTEX_MARGIN_STOCKS%]`
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
    const sup = await super.submit();

    sup.$set = {
      ...sup.$set,
      brokerId: this.brokerId.value,
      commissionRate: Math.abs(
        parseFloat(this.commissionRate.value.replace(',', '.'))
      ),
      reconnectTimeout: this.reconnectTimeout.value
        ? Math.abs(this.reconnectTimeout.value)
        : void 0,
      version: 1,
      type: TRADERS.UTEX_MARGIN_STOCKS
    };

    return sup;
  }
}

export default TraderUtexMarginStocksPage.compose({
  template: traderUtexMarginStocksTemplate,
  styles: traderUtexMarginStocksStyles
}).define();
