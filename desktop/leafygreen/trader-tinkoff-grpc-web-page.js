import { TraderTinkoffGrpcWebPage } from '../../shared/trader-tinkoff-grpc-web-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const traderTinkoffGrpcWebPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          <div class="control-stack">
            ${(x) =>
              x.document.name
                ? `Трейдер - Tinkoff Invest API - ${x.document.name} `
                : 'Трейдер - Tinkoff Invest API'}
            <${'ppp-badge'} appearance="blue">
              gRPC/Web
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
                          type: `[%#(await import('./const.js')).BROKERS.TINKOFF_INVEST_API%]`
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
                window
                  .open('?page=broker-tinkoff-invest-api', '_blank')
                  .focus()}"
              appearance="primary"
            >
              Добавить профиль Tinkoff Invest API
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Торговый счёт</h5>
          </div>
          <div class="input-group">

          </div>
        </section>
      </ppp-page>
    </form>
    </div>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default TraderTinkoffGrpcWebPage.compose({
  template: traderTinkoffGrpcWebPageTemplate,
  styles: pageStyles
});
