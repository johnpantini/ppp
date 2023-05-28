import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { BROKERS } from '../../lib/const.js';
import { createClient } from '../../vendor/nice-grpc-web/client/ClientFactory.js';
import { createChannel } from '../../vendor/nice-grpc-web/client/channel.js';
import { Metadata } from '../../vendor/nice-grpc-web/nice-grpc-common/Metadata.js';
import {
  UsersServiceDefinition,
  AccountStatus
} from '../../vendor/tinkoff/definitions/users.js';
import '../badge.js';
import '../button.js';
import '../text-field.js';

export const brokerTinkoffPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название подключения</h5>
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
          <h5>Токен для доступа к API</h5>
          <p class="description">
            Требуется для подписи всех запросов. Получить можно по
            <a
              class="link"
              rel="noopener"
              target="_blank"
              href="https://www.tinkoff.ru/invest/settings/api/"
              >ссылке</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Введите токен"
            value="${(x) => x.document.apiToken}"
            ${ref('apiToken')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const brokerTinkoffPageStyles = css`
  ${pageStyles}
`;

export class BrokerTinkoffPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.apiToken);

    let client;

    try {
      client = createClient(
        UsersServiceDefinition,
        createChannel('https://invest-public-api.tinkoff.ru:443'),
        {
          '*': {
            metadata: new Metadata({
              Authorization: `Bearer ${this.apiToken.value.trim()}`,
              'x-app-name': 'johnpantini.ppp'
            })
          }
        }
      );
    } catch (e) {
      console.error(e);

      invalidate(this.apiToken, {
        errorMessage: 'Недопустимый токен',
        raiseException: true
      });
    }

    try {
      const response = await client.getAccounts();

      if (
        !response?.accounts?.filter?.(
          (a) => a.status === AccountStatus.ACCOUNT_STATUS_OPEN
        )?.length
      ) {
        invalidate(this.apiToken, {
          errorMessage: 'Не найдены открытые брокерские счета',
          raiseException: true
        });
      }
    } catch (e) {
      console.error(e);

      invalidate(this.apiToken, {
        errorMessage: 'Неверный токен',
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
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.TINKOFF%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.TINKOFF,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        apiToken: this.apiToken.value.trim(),
        version: 1,
        type: BROKERS.TINKOFF,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerTinkoffPage.compose({
  template: brokerTinkoffPageTemplate,
  styles: brokerTinkoffPageStyles
}).define();
