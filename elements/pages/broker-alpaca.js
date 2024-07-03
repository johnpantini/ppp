import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { BROKERS } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../text-field.js';

export const brokerAlpacaPageTemplate = html`
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
            placeholder="Alpaca"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ Alpaca</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="APCA-API-KEY-ID"
            value="${(x) => x.document.login}"
            ${ref('login')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Секрет Alpaca</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="APCA-API-SECRET-KEY"
            value="${(x) => x.document.password}"
            ${ref('password')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const brokerAlpacaPageStyles = css`
  ${pageStyles}
`;

export async function checkAlpacaCredentials({ key, secret }) {
  return ppp.fetch('https://api.alpaca.markets/v2/account', {
    headers: {
      'APCA-API-KEY-ID': key,
      'APCA-API-SECRET-KEY': secret
    }
  });
}

export class BrokerAlpacaPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.login);
    await validate(this.password);

    const response = await checkAlpacaCredentials({
      key: this.login.value.trim(),
      secret: this.password.value.trim()
    });

    if (!response.ok) {
      invalidate(this.login, {
        errorMessage: 'Неверный логин или пароль',
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.ALPACA%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.ALPACA,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        login: this.login.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        type: BROKERS.ALPACA,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerAlpacaPage.compose({
  template: brokerAlpacaPageTemplate,
  styles: brokerAlpacaPageStyles
}).define();
