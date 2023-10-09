import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial,
  documentPageNameSectionPartial
} from '../page.js';
import { ORDERS, TRADER_DATUM } from '../../lib/const.js';
import { distanceToString, parseDistance } from '../../lib/intl.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../text-field.js';

export const orderStopLossTakeProfitTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${documentPageNameSectionPartial({
        placeholder: 'Stop Loss/Take Profit'
      })}
      <section>
        <div class="label-group">
          <h5>Тип заявки</h5>
          <p class="description">
            Заявка Stop Loss служит для ограничения убытков, Take Profit -
            фиксации прибыли.
          </p>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.orderType ?? 'stop-loss'}"
            ${ref('orderType')}
          >
            <ppp-radio value="stop-loss">Stop Loss</ppp-radio>
            <ppp-radio value="take-profit">Take Profit</ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Цены для отслеживания</h5>
          <p class="description">
            Возможно выбрать сразу несколько цен. При отсутствии выбора будет
            отслеживаться цена последней сделки.
          </p>
        </div>
        <div class="input-group">
          <div class="control-stack">
            <ppp-checkbox
              ${ref('lastPriceWatchFlag')}
              ?checked="${(x) =>
                x.document.watchPrices?.includes(TRADER_DATUM.LAST_PRICE) ??
                true}"
            >
              Цена последней сделки
            </ppp-checkbox>
            <ppp-checkbox
              ${ref('extendedLastPriceWatchFlag')}
              ?checked="${(x) =>
                x.document.watchPrices?.includes(
                  TRADER_DATUM.EXTENDED_LAST_PRICE
                )}"
            >
              Цена последней сделки (вне основной сессии)
            </ppp-checkbox>
            <ppp-checkbox
              ${ref('bestBidWatchFlag')}
              ?checked="${(x) =>
                x.document.watchPrices?.includes(TRADER_DATUM.BEST_BID)}"
            >
              Лучшая цена bid
            </ppp-checkbox>
            <ppp-checkbox
              ${ref('bestAskWatchFlag')}
              ?checked="${(x) =>
                x.document.watchPrices?.includes(TRADER_DATUM.BEST_ASK)}"
            >
              Лучшая цена ask
            </ppp-checkbox>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Дистанция между ценой активации и ценой исполнения</h5>
          <p class="description">
            Для заявок Stop Limit и Take Limit можно указать расстояние, которое
            будет использоваться при расчете лимитной цены исполнения
            относительно цены активации на этапе заполнения формы заявки в
            виджете.
          </p>
          <div class="spacing2"></div>
          <ppp-banner class="inline" appearance="warning">
            Здесь и далее ценовое расстояние можно задавать в процентах
            (добавьте знак % после числа) или шагах цены инструмента (добавьте
            знак +).
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Нет"
            value="${(x) => x.document.limitPriceDistance}"
            ${ref('limitPriceDistance')}
          ></ppp-text-field>
        </div>
      </section>
      ${when(
        (x) => x.orderType.value !== 'take-profit',
        html`
          <section>
            <div class="label-group">
              <h5>Дистанция Trailing Stop</h5>
              <p class="description">
                Расстояние, на котором цена активации заявки будет следовать за
                ценой инструмента (только в сторону безубытка). Если значение не
                указано, Trailing Stop применяться не будет.
              </p>
            </div>
            <div class="input-group">
              <ppp-text-field
                disabled
                placeholder="Нет"
                value="${(x) => x.document.trailingStopDistance}"
                ${ref('trailingStopDistance')}
              ></ppp-text-field>
            </div>
          </section>
        `
      )}
      ${when(
        (x) => x.orderType.value === 'take-profit',
        html`
          <section>
            <div class="label-group">
              <h5>Коррекция Take Profit</h5>
              <p class="description">
                При достижении цены активации заявки Take Profit может быть
                включен механизм, который отслеживает коррекцию цены инструмента
                от локальных максимумов. При изменении цены инструмента на
                величину, равную или большую указанной, Take Profit сработает и
                выставит биржевую заявку. Если значение не указано, механизм не
                будет применяться.
              </p>
            </div>
            <div class="input-group">
              <ppp-text-field
                disabled
                placeholder="Нет"
                value="${(x) => x.document.takeProfitCorrection}"
                ${ref('takeProfitCorrection')}
              ></ppp-text-field>
            </div>
          </section>
        `
      )}
      <section>
        <div class="label-group">
          <h5>Защитное время</h5>
          <p class="description">
            Время, в течение которого должно сохраняться условие срабатывания
            заявки. Задаётся в секундах.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            disabled
            placeholder="Нет"
            value="${(x) => x.document.timeDelay}"
            ${ref('timeDelay')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Рабочее время</h5>
          <p class="description">
            Временные интервалы, в течение которых допустимо срабатывание заявки
            (включительно). Время местное.
          </p>
        </div>
        <div class="input-group">
          <div class="settings-grid snap">
            <div class="row">
              <ppp-text-field
                disabled
                type="text"
                min="0"
                placeholder="00:00"
                value="${(x) => x.document.timeFrom}"
                ${ref('timeFrom')}
              >
                <span slot="label">От</span>
              </ppp-text-field>
              <ppp-text-field
                disabled
                type="text"
                placeholder="23:59"
                value="${(x) => x.document.timeTo}"
                ${ref('timeTo')}
              >
                <span slot="label">До</span>
              </ppp-text-field>
            </div>
          </div>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const orderStopLossTakeProfitStyles = css`
  ${pageStyles}
`;

export class OrderStopLossTakeProfitPage extends Page {
  collection = 'orders';

  async #validateDistanceField(field) {
    if (field.value) {
      await validate(field, {
        hook: async (value) =>
          typeof parseDistance(value).value !== 'undefined',
        errorMessage: 'Это значение недопустимо'
      });

      await validate(field, {
        hook: async (value) => parseDistance(value).value > 0,
        errorMessage: 'Значение должно быть положительным'
      });
    }
  }

  async validate() {
    await validate(this.name);
    await this.#validateDistanceField(this.limitPriceDistance);
    await this.#validateDistanceField(this.trailingStopDistance);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).ORDERS.STOP_LOSS_TAKE_PROFIT%]`
        });
    };
  }

  async find() {
    return {
      type: ORDERS.STOP_LOSS_TAKE_PROFIT,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const watchPrices = [];

    if (this.lastPriceWatchFlag.checked) {
      watchPrices.push(TRADER_DATUM.LAST_PRICE);
    }

    if (this.extendedLastPriceWatchFlag.checked) {
      watchPrices.push(TRADER_DATUM.EXTENDED_LAST_PRICE);
    }

    if (this.bestBidWatchFlag.checked) {
      watchPrices.push(TRADER_DATUM.BEST_BID);
    }

    if (this.bestAskWatchFlag.checked) {
      watchPrices.push(TRADER_DATUM.BEST_ASK);
    }

    if (!watchPrices.length) {
      watchPrices.push(TRADER_DATUM.LAST_PRICE);
    }

    const $set = {
      name: this.name.value.trim(),
      orderType: this.orderType.value,
      limitPriceDistance: distanceToString(
        parseDistance(this.limitPriceDistance.value)
      ),
      watchPrices,
      sideAgnostic: false,
      version: 1,
      type: ORDERS.STOP_LOSS_TAKE_PROFIT,
      updatedAt: new Date()
    };

    if ($set.orderType === 'stop-loss') {
      $set.trailingStopDistance = distanceToString(
        parseDistance(this.trailingStopDistance.value)
      );
    } else {
      $set.takeProfitCorrection = distanceToString(
        parseDistance(this.takeProfitCorrection.value)
      );
    }

    return {
      $set,
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default OrderStopLossTakeProfitPage.compose({
  template: orderStopLossTakeProfitTemplate,
  styles: orderStopLossTakeProfitStyles
}).define();
