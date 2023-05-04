import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { APIS } from '../../lib/const.js';
import '../button.js';
import '../text-field.js';

export async function checkCloudflareCredentials({
  serviceMachineUrl,
  accountID,
  email,
  apiKey
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: `https://api.cloudflare.com/client/v4/accounts/${accountID}`,
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': apiKey
      }
    })
  });
}

export const apiCloudflarePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Внешние API - Cloudflare - ${x.document.name}`
            : 'Внешние API - Cloudflare'}
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
            placeholder="Cloudflare"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>ID учётной записи</h5>
          <p class="description">
            Можно получить в панели управления в разделе Workers.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="ID учётной записи"
            value="${(x) => x.document.accountID}"
            ${ref('accountID')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>E-mail учётной записи</h5>
          <p class="description">
            Адрес электронной почты учётной записи Cloudflare.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="email"
            placeholder="mail@example.com"
            value="${(x) => x.document.email}"
            ${ref('email')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ API</h5>
          <p class="description">
            Global API Key. Можно найти по
            <a
              class="link"
              href="https://dash.cloudflare.com/profile/api-tokens"
              target="_blank"
              rel="noopener"
              >ссылке</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Global API Key"
            value="${(x) => x.document.apiKey}"
            ${ref('apiKey')}
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

export const apiCloudflarePageStyles = css`
  ${pageStyles}
`;

export class ApiCloudflarePage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.accountID);
    await validate(this.email);
    await validate(this.apiKey);

    if (
      !(
        await checkCloudflareCredentials({
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url'),
          accountID: this.accountID.value.trim(),
          email: this.email.value.trim(),
          apiKey: this.apiKey.value.trim()
        })
      ).ok
    ) {
      invalidate(this.apiKey, {
        errorMessage: 'Неверный ключ API, e-mail или ID учётной записи',
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.CLOUDFLARE%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.CLOUDFLARE,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        accountID: this.accountID.value.trim(),
        email: this.email.value.trim(),
        apiKey: this.apiKey.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.CLOUDFLARE,
        createdAt: new Date()
      }
    };
  }
}

export default ApiCloudflarePage.compose({
  template: apiCloudflarePageTemplate,
  styles: apiCloudflarePageStyles
}).define();
