import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { APIS } from '../../lib/const.js';
import '../button.js';
import '../text-field.js';

export const apiBitioPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Внешние API - bit.io - ${x.document.name}`
            : 'Внешние API - bit.io'}
      </ppp-page-header>
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
            placeholder="PostgreSQL"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ API базы данных</h5>
          <p class="description">
            API-ключ базы bit.io. Можно получить в панели управления на вкладке
            Connect.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="API-ключ"
            value="${(x) => x.document.apiKey}"
            ${ref('apiKey')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>База данных</h5>
          <p class="description">Название базы данных для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="ppp"
            value="${(x) => x.document.db}"
            ${ref('db')}
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

export const apiBitioPageStyles = css`
  ${pageStyles}
`;

export class ApiBitioPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.apiKey);
    await validate(this.db);

    const checkCredentialsRequest = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://api.bit.io/v2beta/query',
          headers: {
            Authorization: `Bearer ${this.apiKey.value.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query_string: 'SELECT 42;',
            database_name: this.db.value.trim()
          })
        })
      }
    );

    if (!checkCredentialsRequest.ok) {
      invalidate(this.apiKey, {
        errorMessage: 'Неверный ключ API',
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.BITIO%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.BITIO,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        apiKey: this.apiKey.value.trim(),
        db: this.db.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.BITIO,
        createdAt: new Date()
      }
    };
  }
}

export default ApiBitioPage.compose({
  template: apiBitioPageTemplate,
  styles: apiBitioPageStyles
}).define();
