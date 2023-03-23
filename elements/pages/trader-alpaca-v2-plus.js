import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import {
  INSTRUMENT_DICTIONARY,
  TRADER_CAPS,
  TRADERS
} from '../../lib/const.js';
import '../button.js';
import '../checkbox.js';
import '../radio-group.js';
import '../query-select.js';
import '../text-field.js';

export const traderAlpacaV2PlusTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Трейдеры - Alpaca API V2 - ${x.document.name}`
            : 'Трейдеры - Alpaca API V2'}
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
            placeholder="Alpaca"
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
          <h5>URL для подключения к потоку рыночных данных</h5>
          <p class="description">Ссылка для установки WebSocket-соединения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="wss://example.com"
            value="${(x) => x.document.wsUrl}"
            ${ref('wsUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Словарь инструментов</h5>
          <p class="description">Будет использован для поиска в виджетах.</p>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) =>
              x.document.dictionary ??
              INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS}"
            ${ref('dictionary')}
          >
            <ppp-radio value="${() => INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS}"
              >UTEX Margin (акции)
            </ppp-radio>
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
          <h5>Параметры рыночных данных</h5>
        </div>
        <div class="input-group">
          <ppp-checkbox
            ?checked="${(x) => x.document.useLots}"
            ${ref('useLots')}
          >
            Передавать объёмы акций в книге заявок в лотах
          </ppp-checkbox>
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

export const traderAlpacaV2PlusStyles = css`
  ${pageStyles}
`;

export class TraderAlpacaV2PlusPage extends Page {
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

        return url.protocol === 'wss:' || url.protocol === 'ws:';
      },
      errorMessage: 'Недопустимый протокол URL'
    });

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: 'Введите значение в диапазоне от 100 до 10000'
      });
    }

    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(reject, 5000);
        const ws = new WebSocket(this.wsUrl.value);

        ws.onmessage = ({ data }) => {
          const payload = JSON.parse(data);

          if (Array.isArray(payload) && payload[0]?.msg === 'connected') {
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
              type: `[%#(await import('../../lib/const.js')).TRADERS.ALPACA_V2_PLUS%]`
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
      type: TRADERS.ALPACA_V2_PLUS,
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
        dictionary: this.dictionary.value,
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        useLots: this.useLots.checked,
        caps: [
          TRADER_CAPS.CAPS_ORDERBOOK,
          TRADER_CAPS.CAPS_TIME_AND_SALES,
          TRADER_CAPS.CAPS_MIC
        ],
        version: 1,
        type: TRADERS.ALPACA_V2_PLUS,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderAlpacaV2PlusPage.compose({
  name: 'ppp-trader-alpaca-v2-plus-page',
  template: traderAlpacaV2PlusTemplate,
  styles: traderAlpacaV2PlusStyles
}).define();
