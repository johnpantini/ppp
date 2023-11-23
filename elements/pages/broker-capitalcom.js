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

export const brokerCapitalcomPageTemplate = html`
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
            placeholder="Capital.com"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Идентификатор</h5>
          <p class="description">
            Идентификатор (e-mail) вашей учётной записи Capital.com.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="example@gmail.com"
            value="${(x) => x.document.identifier}"
            ${ref('identifier')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ API</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Ключ API"
            value="${(x) => x.document.key}"
            ${ref('key')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Пользовательский пароль</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Пользовательский пароль"
            value="${(x) => x.document.password}"
            ${ref('password')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const brokerCapitalcomPageStyles = css`
  ${pageStyles}
`;

export const brokerBybitPageStyles = css`
  ${pageStyles}
`;

export async function checkCapitalComCredentials({
  identifier,
  key,
  password
}) {
  return ppp.fetch('https://api-capital.backend-capital.com/api/v1/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CAP-API-KEY': key
    },
    body: JSON.stringify({
      identifier,
      password,
      encryptedPassword: false
    })
  });
}

export class BrokerCapitalcomPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.identifier);
    await validate(this.key);
    await validate(this.password);

    if (
      !(
        await checkCapitalComCredentials({
          identifier: this.identifier.value,
          key: this.key.value.trim(),
          password: this.password.value.trim()
        })
      ).ok
    ) {
      invalidate(this.password, {
        errorMessage:
          'Не удалось выполнить проверочный запрос к API Capital.com',
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.CAPITALCOM%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.CAPITALCOM,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        identifier: this.identifier.value.trim(),
        key: this.key.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        type: BROKERS.CAPITALCOM,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerCapitalcomPage.compose({
  template: brokerCapitalcomPageTemplate,
  styles: brokerCapitalcomPageStyles
}).define();
