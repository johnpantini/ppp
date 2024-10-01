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

export const exampleCommFunctionCode = `/**
* Функция, возвращающая абсолютное значение комиссии за сделку.
*
* @param {object} trade - Экземпляр сделки.
* @param trade.instrument - Торговый инструмент.
* @param trade.quantity - Количество лотов инструмента.
* @param trade.price - Цена исполнения.
* @param {(buy|sell)} trade.side - Направление сделки.
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
          <h5>Начальный депозит</h5>
          <p class="description">
            Значения сбрасываются при перезагрузке трейдера.
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
          <h5>Источник книги заявок</h5>
          <p class="description">
            Трейдер будет использовать книгу заявок для исполнения виртуальных
            сделок.
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
          <h5>Словарь</h5>
          <p class="description">
            Словарь инструментов, который будет назначен трейдеру.
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
          <h5>Защита рыночных заявок, %</h5>
          <p class="description">
            Цена исполнения рыночной заявки не может быть хуже лучшей цены книги
            заявок, скорректированной на это значение.
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
          <h5>Комиссия за сделки</h5>
          <p class="description">Код расчёта комиссии на языке JavaScript.</p>
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
      TRADER_CAPS.CAPS_СONDITIONAL_ORDERS,
      TRADER_CAPS.CAPS_ACTIVE_ORDERS,
      TRADER_CAPS.CAPS_POSITIONS,
      TRADER_CAPS.CAPS_TIMELINE
    ];
  }

  async validate() {
    await super.validate();
    await validate(this.initialDepositUSD);
    await validate(this.initialDepositUSD, {
      hook: async (value) => +value >= 1 && +value <= 100000000,
      errorMessage: 'Введите значение в диапазоне от 1 до 100 000 000'
    });

    await validate(this.initialDepositRUB);
    await validate(this.initialDepositRUB, {
      hook: async (value) => +value >= 1 && +value <= 100000000,
      errorMessage: 'Введите значение в диапазоне от 1 до 100 000 000'
    });

    await validate(this.bookTraderId);
    // await validate(this.marketOrderCoeff);
    // await validate(this.marketOrderCoeff, {
    //   hook: async (value) => +value >= 0 && +value <= 100,
    //   errorMessage: 'Введите значение в диапазоне от 0 до 100'
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
          fullName: 'ПАО НК Роснефть',
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
        errorMessage: 'Исходный код не может быть использован.',
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
