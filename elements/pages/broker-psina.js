import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
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

export const brokerPsinaPageTemplate = html`
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
            placeholder="Psina"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Telegram ID</h5>
          <p class="description">Логин Psina.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="Telegram ID"
            value="${(x) => x.document.login}"
            ${ref('login')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Пароль Psina</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Psina password"
            value="${(x) => x.document.password}"
            ${ref('password')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Шлюз Psina</h5>
          <p class="description">
            Будет использован для проверки учётных данных.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="https://example.com"
            value="${(x) => x.document.gateway}"
            ${ref('gateway')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const brokerPsinaPageStyles = css`
  ${pageStyles}
`;

export class BrokerPsinaPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.login);
    await validate(this.password);
    await validate(this.gateway);

    let json;

    try {
      const response = await maybeFetchError(
        await fetch(
          new URL('check_credentials', this.gateway.value).toString(),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              login: parseInt(this.login.value),
              password: this.password.value.trim()
            })
          }
        )
      );

      json = await response.json();
    } catch (e) {
      console.error(e);

      invalidate(this.gateway, {
        errorMessage: 'Этот URL не может быть использован',
        raiseException: true
      });
    }

    if (!json.psina?.result) {
      invalidate(this.password, {
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.PSINA%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.PSINA,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        login: parseInt(this.login.value),
        password: this.password.value.trim(),
        gateway: new URL(this.gateway.value).toString(),
        version: 1,
        type: BROKERS.PSINA,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerPsinaPage.compose({
  template: brokerPsinaPageTemplate,
  styles: brokerPsinaPageStyles
}).define();
