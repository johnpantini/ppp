import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { APIS } from '../../lib/const.js';
import '../button.js';
import '../text-field.js';

export const apiRenderPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Внешние API - Render - ${x.document.name}`
            : 'Внешние API - Render'}
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
            placeholder="Render"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Токен API</h5>
          <p class="description">
            API-токен Render. Можно получить в
            <a
              class="link"
              href="https://dashboard.render.com/u/settings#api-keys"
              target="_blank"
              rel="noopener"
              >панели управления</a
            >
            профилем.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Token"
            value="${(x) => x.document.token}"
            ${ref('token')}
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

export const apiRenderPageStyles = css`
  ${pageStyles}
`;

export async function checkRenderCredentials({ token, serviceMachineUrl }) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: 'https://api.render.com/v1/owners?limit=20',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
  });
}

export class ApiRenderPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.token);

    if (
      !(
        await checkRenderCredentials({
          token: this.token.value.trim(),
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url')
        })
      ).ok
    ) {
      invalidate(this.token, {
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.RENDER%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.RENDER,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        token: this.token.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.RENDER,
        createdAt: new Date()
      }
    };
  }
}

export default ApiRenderPage.compose({
  template: apiRenderPageTemplate,
  styles: apiRenderPageStyles
}).define();
