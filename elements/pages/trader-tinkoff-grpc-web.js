import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { PAGE_STATUS, TRADER_CAPS, TRADERS } from '../../lib/const.js';
import {
  UsersServiceDefinition,
  AccountStatus,
  AccountType
} from '../../vendor/tinkoff/definitions/users.js';
import { createClient } from '../../vendor/nice-grpc-web/client/ClientFactory.js';
import { createChannel } from '../../vendor/nice-grpc-web/client/channel.js';
import { Metadata } from '../../vendor/nice-grpc-web/nice-grpc-common/Metadata.js';
import '../button.js';
import '../radio-group.js';
import '../query-select.js';
import '../text-field.js';

export const traderTinkoffGrpcWebTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Трейдеры - Tinkoff Invest API - ${x.document.name}`
            : 'Трейдеры - Tinkoff Invest API'}
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
          <ppp-query-select
            ${ref('brokerId')}
            @change="${(x) => x.scratch.set('brokerId', x.brokerId.value)}"
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
                        type: `[%#(await import('../../lib/const.js')).BROKERS.TINKOFF%]`
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
              ppp.app.mountPage('broker-tinkoff', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить профиль Tinkoff
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Торговый счёт</h5>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('accountSelector')}
            value="${(x) => x.document.account}"
            ?disabled="${(x) => !x.scratch.get('brokerId')}"
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
                        Authorization: `Bearer ${x.brokerId.datum().apiToken}`,
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
                    (a) =>
                      a.status === AccountStatus.ACCOUNT_STATUS_OPEN &&
                      a.type !== AccountType.ACCOUNT_TYPE_INVEST_BOX
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
          ></ppp-query-select>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Тайм-аут восстановления соединения</h5>
          <p class="description">
            Время, по истечении которого будет предпринята очередная попытка
            восстановить прерванное подключение к серверам брокера. Задаётся в
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

export const traderTinkoffGrpcWebStyles = css`
  ${pageStyles}
`;

export class TraderTinkoffGrpcWebPage extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.accountSelector);

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: 'Введите значение в диапазоне от 100 до 10000'
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
              type: `[%#(await import('../../lib/const.js')).TRADERS.TINKOFF_GRPC_WEB%]`
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

  statusChanged(oldValue, newValue) {
    if (newValue === PAGE_STATUS.READY) {
      this.scratch.set('brokerId', this.document.brokerId);
    }
  }

  async find() {
    return {
      type: TRADERS.TINKOFF_GRPC_WEB,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        brokerId: this.brokerId.value,
        account: this.accountSelector.value,
        accountName: this.accountSelector.datum().name,
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        version: 1,
        caps: [
          TRADER_CAPS.CAPS_LIMIT_ORDERS,
          TRADER_CAPS.CAPS_MARKET_ORDERS,
          TRADER_CAPS.CAPS_STOP_ORDERS,
          TRADER_CAPS.CAPS_ACTIVE_ORDERS,
          TRADER_CAPS.CAPS_ORDERBOOK,
          TRADER_CAPS.CAPS_TIME_AND_SALES,
          TRADER_CAPS.CAPS_POSITIONS,
          TRADER_CAPS.CAPS_TIMELINE,
          TRADER_CAPS.CAPS_LEVEL1,
          TRADER_CAPS.CAPS_CHARTS
        ],
        type: TRADERS.TINKOFF_GRPC_WEB,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderTinkoffGrpcWebPage.compose({
  template: traderTinkoffGrpcWebTemplate,
  styles: traderTinkoffGrpcWebStyles
}).define();
