import { TraderAlorOpenAPIV2Page } from '../../shared/trader-alor-openapi-v2-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const traderAlorOpenAPIV2PageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          <div class="control-stack">
            ${(x) =>
              x.document.name
                ? `Трейдер - Alor OpenAPI V2 - ${x.document.name} `
                : 'Трейдер - Alor OpenAPI V2'}
            <${'ppp-badge'} appearance="blue">
              REST/WebSocket
            </ppp-badge>
          </div>
        </span>
        <section>
          <div class="label-group">
            <h5>Название трейдера</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Alor"
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
                          type: `[%#(await import('./const.js')).BROKERS.ALOR_OPENAPI_V2%]`
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
                window.open('?page=broker-alor-openapi-v2', '_blank').focus()}"
              appearance="primary"
            >
              Добавить профиль Alor OpenAPI V2
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Идентификатор клиентского портфеля</h5>
            <p>Портфель Алор для требуемой торговой секции.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="D70000"
              value="${(x) => x.document.portfolio}"
              ${ref('portfolio')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Торговая площадка</h5>
          </div>
          <div class="input-group">
            <${'ppp-radio-group'}
              orientation="vertical"
              value="${(x) => x.document.exchange ?? 'SPBX'}"
              ${ref('exchange')}
            >
              <${'ppp-radio'} value="SPBX">СПБ Биржа</ppp-radio>
              <ppp-radio value="MOEX">Московская биржа</ppp-radio>
            </ppp-radio-group>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Комиссия плоского тарифа</h5>
            <p>Укажите в % комиссию вашего тарифа, если он отличается от
              стандартных, предлагаемых брокером.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              optional
              placeholder="0,025"
              value="${(x) => x.document.flatCommissionRate}"
              ${ref('flatCommissionRate')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Тайм-аут восстановления соединения</h5>
            <p>Время, по истечении которого будет предпринята очередная попытка
              восстановить прерванное подключение к серверам брокера. Задаётся
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
            <h5>Использовать WebSocket вместо REST</h5>
            <p>Использовать WebSocket там, где это возможно, вместо
              периодического опроса конечных точек REST API. В настоящее время
              эту настройку нельзя изменить.</p>
          </div>
          <div class="input-group">
            <${'ppp-checkbox'}
              disabled
              name="use-websocket"
              ?checked="${() => true}"
              ${ref('useWebsocket')}
            >
              WebSocket вместо REST
            </ppp-checkbox>
          </div>
        </section>
      </ppp-page>
    </form>
    </div>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default TraderAlorOpenAPIV2Page.compose({
  baseName: 'trader-alor-openapi-v2-page',
  template: traderAlorOpenAPIV2PageTemplate,
  styles: pageStyles
});
