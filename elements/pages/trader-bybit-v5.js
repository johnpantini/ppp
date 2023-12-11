import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { TRADER_CAPS, TRADERS } from '../../lib/const.js';
import { traderNameAndRuntimePartial } from './trader.js';
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
          <h5>Базовый URL для подключения к потоку рыночных данных</h5>
          <p class="description">Ссылка для установки WebSocket-соединения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="wss://data-stream.binance.com"
            value="${(x) =>
              x.document.wsUrl ?? 'wss://data-stream.binance.com'}"
            ${ref('wsUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Режим ленты сделок</h5>
          <p class="description">
            В режиме агрегирования сделки суммируются по количеству и попадают в
            ленту как одна, если они принадлежат одной заявке тейкера.
          </p>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => (x.document.showAggTrades ?? true ? 'agg' : 'raw')}"
            ${ref('showAggTrades')}
          >
            <ppp-radio value="agg">Агрегированные сделки</ppp-radio>
            <ppp-radio value="raw">Все сделки</ppp-radio>
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
      <section>
        <div class="label-group">
          <h5>Интервал обновления книги заявок</h5>
        </div>
        <div class="input-group">
          <ppp-select
            placeholder="Выберите значение"
            value="${(x) => x.document.orderbookUpdateInterval ?? '100ms'}"
            ${ref('orderbookUpdateInterval')}
          >
            <ppp-option value="100ms">100 мс</ppp-option>
            <ppp-option value="1000ms">1000 мс</ppp-option>
          </ppp-select>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const traderBybitV5Styles = css`
  ${pageStyles}
`;

export class TraderBybitV5Page extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);

    if (this.runtime.value === 'aspirant-worker') {
      await validate(this.runtimeServiceId);
    }

    await validate(this.brokerId);
    await validate(this.wsUrl);

    try {
      new URL(this.wsUrl.value);
    } catch (e) {
      invalidate(this.wsUrl, {
        errorMessage: 'Неверный или неполный URL',
        raiseException: true
      });
    }

    await validate(this.wsUrl, {
      hook: async (value) => {
        const url = new URL(value);

        return url.protocol === 'wss:';
      },
      errorMessage: 'Недопустимый протокол URL'
    });

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: 'Введите значение в диапазоне от 100 до 10000'
      });
    }

    await validate(this.orderbookUpdateInterval);

    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(reject, 5000);
        const ws = new WebSocket(new URL('ws/btcusdt@trade', this.wsUrl.value));

        ws.onmessage = ({ data }) => {
          const payload = JSON.parse(data);

          if (payload.e === 'trade' && payload.s === 'BTCUSDT') {
            ws.close();
            clearTimeout(timer);
            resolve();
          } else {
            ws.close();
            clearTimeout(timer);
            reject();
          }
        };
        ws.onerror = () => {
          clearTimeout(timer);
          reject();
        };
      });
    } catch (e) {
      invalidate(this.wsUrl, {
        errorMessage: 'Не удалось соединиться',
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
          },
          {
            $lookup: {
              from: 'services',
              localField: 'runtimeServiceId',
              foreignField: '_id',
              as: 'runtimeService'
            }
          },
          {
            $unwind: {
              path: '$runtimeService',
              preserveNullAndEmptyArrays: true
            }
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
    const $set = {
      name: this.name.value.trim(),
      runtime: this.runtime.value,
      brokerId: this.brokerId.value,
      wsUrl: this.wsUrl.value.trim(),
      showAggTrades: this.showAggTrades.value === 'agg',
      reconnectTimeout: this.reconnectTimeout.value
        ? Math.abs(this.reconnectTimeout.value)
        : void 0,
      orderbookUpdateInterval: this.orderbookUpdateInterval.value,
      caps: [
        TRADER_CAPS.CAPS_LEVEL1,
        TRADER_CAPS.CAPS_LIMIT_ORDERS,
        TRADER_CAPS.CAPS_MARKET_ORDERS,
        TRADER_CAPS.CAPS_ACTIVE_ORDERS,
        TRADER_CAPS.CAPS_ORDERBOOK,
        TRADER_CAPS.CAPS_TIME_AND_SALES,
        TRADER_CAPS.CAPS_POSITIONS,
        TRADER_CAPS.CAPS_TIMELINE,
        TRADER_CAPS.CAPS_CHARTS
      ],
      version: 1,
      type: TRADERS.BYBIT_V5,
      updatedAt: new Date()
    };

    if (this.runtime.value === 'aspirant-worker') {
      $set.runtimeServiceId = this.runtimeServiceId.value;
    }

    return {
      $set,
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderBybitV5Page.compose({
  name: 'ppp-trader-bybit-v5-page',
  template: traderBybitV5Template,
  styles: traderBybitV5Styles
}).define();
