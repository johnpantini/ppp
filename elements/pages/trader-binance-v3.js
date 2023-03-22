import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { TRADER_CAPS, TRADERS } from '../../lib/const.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';

export const traderBinanceV3Template = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Трейдеры - Binance V3 - ${x.document.name}`
            : 'Трейдеры - Binance V3'}
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
            placeholder="Binance"
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
                        type: `[%#(await import('../../lib/const.js')).BROKERS.BINANCE%]`
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
              window.open('?page=broker-binance', '_blank').focus()}"
            appearance="primary"
          >
            Добавить профиль Binance
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

export const traderBinanceV3Styles = css`
  ${pageStyles}
`;

export class TraderBinanceV3Page extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
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
              type: `[%#(await import('../../lib/const.js')).TRADERS.BINANCE_V3%]`
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
      type: TRADERS.BINANCE_V3,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        brokerId: this.brokerId.value,
        wsUrl: this.wsUrl.value.trim(),
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        orderbookUpdateInterval: this.orderbookUpdateInterval.value,
        caps: [TRADER_CAPS.CAPS_ORDERBOOK, TRADER_CAPS.CAPS_TIME_AND_SALES],
        version: 1,
        type: TRADERS.BINANCE_V3,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderBinanceV3Page.compose({
  name: 'ppp-trader-binance-v3-page',
  template: traderBinanceV3Template,
  styles: traderBinanceV3Styles
}).define();
