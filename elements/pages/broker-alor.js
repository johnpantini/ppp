import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS } from '../../lib/const.js';
import '../text-field.js';
import '../button.js';

export const brokerAlorPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Брокеры - Alor - ${x.document.name}`
            : 'Брокеры - Alor'}
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
            placeholder="Alor"
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
              href="https://alor.dev/open-api-tokens"
              >ссылке</a
            >. Если получаете впервые,
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://alor.dev/register"
              >зарегистрируйтесь</a
            >
            предварительно.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Alor refresh token"
            value="${(x) => x.document.refreshToken}"
            ${ref('refreshToken')}
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

export const brokerAlorPageStyles = css`
  ${pageStyles}
`;

export async function checkAlorOAPIV2RefreshToken({ refreshToken }) {
  return fetch(`https://oauth.alor.ru/refresh?token=${refreshToken}`, {
    cache: 'no-cache',
    method: 'POST'
  });
}

export class BrokerAlorPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.refreshToken);

    if (
      !(
        await checkAlorOAPIV2RefreshToken({
          refreshToken: this.refreshToken.value.trim()
        })
      ).ok
    ) {
      invalidate(this.refreshToken, {
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
          type: `[%#(await import('../../lib/const.js')).BROKERS.ALOR%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.ALOR,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        refreshToken: this.refreshToken.value.trim(),
        version: 1,
        type: BROKERS.ALOR,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerAlorPage.compose({
  template: brokerAlorPageTemplate,
  styles: brokerAlorPageStyles
}).define();
