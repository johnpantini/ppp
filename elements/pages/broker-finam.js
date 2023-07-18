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
import ppp from '../../ppp.js';

export const brokerFinamPageTemplate = html`
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
            placeholder="Finam"
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
              target="_blank"
              rel="noopener"
              href="https://www.comon.ru/my/trade-api/tokens/"
              >ссылке</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Finam token"
            value="${(x) => x.document.token}"
            ${ref('token')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const brokerFinamPageStyles = css`
  ${pageStyles}
`;

export async function checkFinamAPIToken({ token }) {
  return fetch(
    new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
    {
      cache: 'no-cache',
      method: 'POST',
      body: JSON.stringify({
        method: 'GET',
        url: 'https://trade-api.finam.ru/public/api/v1/access-tokens/check',
        headers: {
          'X-Api-Key': token
        }
      })
    }
  );
}

export class BrokerFinamPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.token);

    if (
      !(
        await checkFinamAPIToken({
          token: this.token.value.trim()
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.FINAM%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.FINAM,
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
        type: BROKERS.FINAM,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerFinamPage.compose({
  template: brokerFinamPageTemplate,
  styles: brokerFinamPageStyles
}).define();
