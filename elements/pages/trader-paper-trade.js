import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { ValidationError, invalidate, validate } from '../../lib/ppp-errors.js';
import {
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { TRADER_CAPS, TRADERS } from '../../lib/const.js';
import { traderNameAndRuntimePartial, TraderCommonPage } from './trader.js';
import { dictionarySelectorTemplate } from './instruments-manage.js';
import { Tmpl } from '../../lib/tmpl.js';
import { formatNumber } from '../../lib/intl.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const exampleCommFunctionCode = `/**
* Function that returns the absolute value of the trade commission.
*
* @param {object} trade - Trade instance.
* @param trade.instrument - Trading instrument.
* @param trade.quantity - Quantity in lots of the instrument.
* @param trade.price - Execution price.
* @param {(buy|sell)} trade.side - Trade side.
*/

// 0,05 %
return trade.price * trade.quantity * trade.instrument.lot * 0.05 / 100;
`;

export const traderPaperTradeTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${traderNameAndRuntimePartial()}
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderPaperTradePage.initialDepositTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderPaperTradePage.initialDepositDescription')}
          </p>
        </div>
        <div class="input-group">
          <div class="control-line flex-start">
            <ppp-text-field
              placeholder="1000"
              type="number"
              min="1"
              step="1"
              value="${(x) => x.document.initialDepositUSD}"
              ${ref('initialDepositUSD')}
            >
              <span slot="label">USD</span>
            </ppp-text-field>
            <ppp-text-field
              placeholder="1000"
              type="number"
              min="1"
              step="1"
              value="${(x) => x.document.initialDepositRUB}"
              ${ref('initialDepositRUB')}
            >
              <span slot="label">RUB</span>
            </ppp-text-field>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderPaperTradePage.bookSourceTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderPaperTradePage.bookSourceDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('bookTraderId')}
            value="${(x) => x.document.bookTraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.bookTrader ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('traders')
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_ORDERBOOK%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.bookTraderId ?? ''%]` }
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
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderPaperTradePage.dictionaryTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderPaperTradePage.dictionaryDescription')}
          </p>
        </div>
        <div class="input-group">
          ${(x) =>
            dictionarySelectorTemplate({
              silent: true,
              value: x.document.dictionary
            })}
        </div>
      </section>
      <section hidden>
        <div class="label-group">
          <h5>
            ${() => ppp.t('$traderPaperTradePage.marketOrderProtectionTitle')}
          </h5>
          <p class="description">
            ${() =>
              ppp.t('$traderPaperTradePage.marketOrderProtectionDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            disabled
            placeholder="${() => formatNumber(0.3)}"
            type="number"
            min="0"
            step="0.01"
            value="${(x) => x.document.marketOrderCoeff ?? formatNumber(0.3)}"
            ${ref('marketOrderCoeff')}
          >
          </ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderPaperTradePage.commissionTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderPaperTradePage.commissionDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            style="height: 200px;"
            revertable
            @revert="${(x) => {
              x.commFunctionCode.updateCode(exampleCommFunctionCode);
            }}"
            :code="${(x) =>
              x.document.commFunctionCode ?? exampleCommFunctionCode}"
            ${ref('commFunctionCode')}
          ></ppp-snippet>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const traderPaperTradeStyles = css`
  ${pageStyles}
`;

export class TraderPaperTradePage extends TraderCommonPage {
  collection = 'traders';

  getDefaultCaps() {
    return [
      TRADER_CAPS.CAPS_LIMIT_ORDERS,
      TRADER_CAPS.CAPS_MARKET_ORDERS,
      TRADER_CAPS.CAPS_CONDITIONAL_ORDERS,
      TRADER_CAPS.CAPS_ACTIVE_ORDERS,
      TRADER_CAPS.CAPS_POSITIONS,
      TRADER_CAPS.CAPS_TIMELINE,
      TRADER_CAPS.CAPS_PAPER
    ];
  }

  async validate() {
    await super.validate();
    await validate(this.initialDepositUSD);
    await validate(this.initialDepositUSD, {
      hook: async (value) => +value >= 1 && +value <= 100000000,
      errorMessage: ppp.t('$page.valueInRange', {
        min: 1,
        max: '100 000 000'
      })
    });

    await validate(this.initialDepositRUB);
    await validate(this.initialDepositRUB, {
      hook: async (value) => +value >= 1 && +value <= 100000000,
      errorMessage: ppp.t('$page.valueInRange', {
        min: 1,
        max: '100 000 000'
      })
    });

    await validate(this.bookTraderId);
    // await validate(this.marketOrderCoeff);
    // await validate(this.marketOrderCoeff, {
    //   hook: async (value) => +value >= 0 && +value <= 100,
    //   errorMessage: 'Enter a value between 0 and 100'
    // });

    try {
      const commission = new Function(
        'trade',
        await new Tmpl().render(this, this.commFunctionCode.value, {})
      )({
        instrument: {
          symbol: 'ROSN',
          exchange: 'MOEX',
          broker: 'alor',
          fullName: 'Rosneft Oil Company',
          minPriceIncrement: 0.05,
          type: 'stock',
          currency: 'RUB',
          forQualInvestorFlag: false,
          classCode: 'TQBR',
          lot: 1,
          isin: 'RU000A0J2Q06'
        },
        operationId: '9707755758',
        accruedInterest: 0,
        parentId: '43918678167',
        symbol: 'ROSN',
        // Non-standard field.
        side: 'buy',
        type: 15,
        exchange: 'MOEX',
        quantity: 1,
        price: 567.35,
        createdAt: '2024-02-27T19:44:39.6018010Z'
      });

      if (isNaN(commission) || typeof commission !== 'number') {
        throw new ValidationError();
      }
    } catch (e) {
      console.dir(e);

      invalidate(this.commFunctionCode, {
        errorMessage: ppp.t('$traderPaperTradePage.sourceCodeInvalid'),
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.PAPER_TRADE%]`
            }
          },
          {
            $lookup: {
              from: 'traders',
              localField: 'bookTraderId',
              foreignField: '_id',
              as: 'bookTrader'
            }
          },
          {
            $unwind: '$bookTrader'
          }
        ]);
    };
  }

  async find() {
    return {
      type: TRADERS.PAPER_TRADE,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const sup = await super.submit();

    sup.$set = {
      ...sup.$set,
      initialDepositUSD: parseInt(this.initialDepositUSD.value),
      initialDepositRUB: parseInt(this.initialDepositRUB.value),
      dictionary: this.dictionary.value,
      bookTraderId: this.bookTraderId.value,
      // marketOrderCoeff: stringToFloat(this.marketOrderCoeff.value),
      commFunctionCode: this.commFunctionCode.value,
      version: 1,
      type: TRADERS.PAPER_TRADE
    };

    return sup;
  }
}

export default TraderPaperTradePage.compose({
  template: traderPaperTradeTemplate,
  styles: traderPaperTradeStyles
}).define();
