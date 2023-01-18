import { TraderTinkoffGrpcWebPage } from '../../shared/trader-tinkoff-grpc-web-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import {
  UsersServiceDefinition,
  AccountStatus
} from '../../vendor/tinkoff/definitions/users.js';
import { createClient } from '../../vendor/nice-grpc-web/client/ClientFactory.js';
import { createChannel } from '../../vendor/nice-grpc-web/client/channel.js';
import { Metadata } from '../../vendor/nice-grpc-web/nice-grpc-common/Metadata.js';
import ppp from '../../ppp.js';

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
              placeholder="Tinkoff"
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
              @change="${(x) => x.scratchSet('brokerId', x.brokerId.value)}"
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
            <${'ppp-collection-select'}
              ${ref('accountSelector')}
              value="${(x) => x.document.account}"
              ?disabled="${(x) => !x.scratch.brokerId}"
              :context="${(x) => x}"
              :placeholder="${() => 'Нажмите, чтобы выбрать счёт'}"
              :preloaded="${(x) => {
                return {
                  _id: x.document.account,
                  name: x.document.accountName,
                  value: x.document.account
                };
              }}"
              :query="${(x) => {
                return async () => {
                  const client = createClient(
                    UsersServiceDefinition,
                    createChannel('https://invest-public-api.tinkoff.ru:443'),
                    {
                      '*': {
                        metadata: new Metadata({
                          Authorization: `Bearer ${
                            x.brokerId.datum().apiToken
                          }`,
                          'x-app-name': `${ppp.keyVault.getKey(
                            'github-login'
                          )}.ppp`
                        })
                      }
                    }
                  );
                  const response = await client.getAccounts();

                  return response.accounts
                    ?.filter?.(
                      (a) => a.status === AccountStatus.ACCOUNT_STATUS_OPEN
                    )
                    .map((a) => {
                      return {
                        _id: a.id,
                        name: a.name,
                        value: a.id
                      };
                    });
                };
              }}"
            ></ppp-collection-select>
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
