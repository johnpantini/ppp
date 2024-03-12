import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, validateDistanceElement } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial,
  documentPageNameSectionPartial
} from '../page.js';
import { ORDERS, TRADER_DATUM } from '../../lib/const.js';
import {
  distanceToString,
  parseDistance,
  stringToFloat
} from '../../lib/intl.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
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
          <h5>Спецификация</h5>
          <p class="description">
            Узнайте, каким образом используются трейдеры для этой условной
            заявки. Трейдеры задаются в виджете заявки.
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            readonly
            style="height: 128px"
            :code="${(x) =>
              `Трейдер #1 - источник данных L1.\nТрейдер #2 - источник данных L1.\nТрейдер #3 - источник данных L1.\nТрейдер #4 - источник данных L1.`}"
          ></ppp-snippet>
        </div>
      </section>
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
            отслеживаться цена последней сделки. MidPoint срабатывает, если и
            цена bid, и цена ask положительны одновременно.
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
            <ppp-checkbox
              ${ref('midpointWatchFlag')}
              ?checked="${(x) =>
                x.document.watchPrices?.includes(TRADER_DATUM.MIDPOINT)}"
            >
              Цена MidPoint
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
      <section>
        <div class="label-group">
          <h5>Защитное время</h5>
          <p class="description">
            Время, в течение которого должно сохраняться условие срабатывания
            заявки. Задаётся в секундах в диапазоне от 1 до 3600.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
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
                type="number"
                min="0"
                placeholder="00"
                value="${(x) => x.document.timeFrom}"
                ${ref('timeFromHours')}
              >
                <span slot="label">От (ч.)</span>
              </ppp-text-field>
              <ppp-text-field
                disabled
                type="number"
                min="0"
                placeholder="00"
                value="${(x) => x.document.timeFrom}"
                ${ref('timeFromMinutes')}
              >
                <span slot="label">От (мин.)</span>
              </ppp-text-field>
            </div>
            <div class="row">
              <ppp-text-field
                disabled
                type="number"
                placeholder="23"
                value="${(x) => x.document.timeTo}"
                ${ref('timeToHours')}
              >
                <span slot="label">До (ч.)</span>
              </ppp-text-field>
              <ppp-text-field
                disabled
                type="number"
                placeholder="59"
                value="${(x) => x.document.timeTo}"
                ${ref('timeToMinutes')}
              >
                <span slot="label">До (мин.)</span>
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

  .settings-grid ppp-text-field {
    width: 64px;
  }
`;

export class OrderStopLossTakeProfitPage extends Page {
  collection = 'orders';

  async validate() {
    await validate(this.name);
    await validateDistanceElement(this.limitPriceDistance);
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

    if (this.midpointWatchFlag.checked) {
      watchPrices.push(TRADER_DATUM.MIDPOINT);
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

    const timeDelay = stringToFloat(this.timeDelay.value);

    if (!timeDelay || isNaN(timeDelay)) {
      $set.timeDelay = void 0;
    } else {
      $set.timeDelay = Math.trunc(Math.abs(timeDelay));
    }

    if ($set.timeDelay < 1) {
      $set.timeDelay = void 0;
    }

    if ($set.timeDelay > 3600) {
      $set.timeDelay = 3600;
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
