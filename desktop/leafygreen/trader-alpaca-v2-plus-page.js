import { TraderAlpacaV2PlusPage } from '../../shared/trader-alpaca-v2-plus-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const traderAlpacaV2PlusPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Трейдер - Alpaca API V2 - ${x.document.name} `
              : 'Трейдер - Alpaca API V2'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название трейдера</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
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
                          type: `[%#(await import('./const.js')).BROKERS.UTEX_AURORA%]`
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
                window.open('?page=broker-utex-aurora', '_blank').focus()}"
              appearance="primary"
            >
              Добавить профиль UTEX Aurora
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>URL для подключения к потоку рыночных данных</h5>
            <p>Ссылка для установки WebSocket-соединения.</p>
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
            <h5>Торговая площадка</h5>
            <p>Будет использована для поиска и фильтрации инструментов.</p>
          </div>
          <div class="input-group">
            <${'ppp-radio-group'}
              orientation="vertical"
              value="${(x) => x.document.exchange ?? 'SPBX'}"
              ${ref('exchange')}
            >
              <${'ppp-radio'} value="SPBX">СПБ Биржа</ppp-radio>
            </ppp-radio-group>
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
            <h5>Параметры рыночных данных</h5>
          </div>
          <div class="input-group">
            <${'ppp-checkbox'}
              ?checked="${(x) => x.document.useLots}"
              ${ref('useLots')}
            >
              Передавать объёмы акций в книге заявок в лотах
            </ppp-checkbox>
          </div>
        </section>
      </ppp-page>
    </form>
    </div>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default TraderAlpacaV2PlusPage.compose({
  baseName: 'trader-alpaca-v2-plus-page',
  template: traderAlpacaV2PlusPageTemplate,
  styles: pageStyles
});
