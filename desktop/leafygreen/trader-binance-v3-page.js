import { TraderBinanceV3Page } from '../../shared/trader-binance-v3-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const traderBinanceV3PageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Трейдер - Binance API V3 - ${x.document.name} `
              : 'Трейдер - Binance API V3'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название трейдера</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
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
            <${'ppp-collection-select'}
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
                          type: `[%#(await import('./const.js')).BROKERS.BINANCE%]`
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
            ></ppp-collection-select>
            <${'ppp-button'}
              class="margin-top"
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
            <p>Ссылка для установки WebSocket-соединения.</p>
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
            <p>Время, по истечении которого будет предпринята очередная попытка
              восстановить прерванное подключение к серверу. Задаётся
              в миллисекундах, по умолчанию 1000 мс.</p>
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
            <${'ppp-select'}
              value="${(x) => x.document.orderbookUpdateInterval ?? '100ms'}"
              ${ref('orderbookUpdateInterval')}
            >
              <ppp-option value="100ms">100 мс</ppp-option>
              <ppp-option value="1000ms">1000 мс</ppp-option>
            </ppp-select>
          </div>
        </section>
      </ppp-page>
    </form>
    </div>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default TraderBinanceV3Page.compose({
  baseName: 'trader-binance-v3-page',
  template: traderBinanceV3PageTemplate,
  styles: pageStyles
});
