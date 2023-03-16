import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS } from '../../lib/const.js';
import '../text-field.js';
import '../button.js';

export const brokerUtexAuroraPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Брокеры - UTEX - ${x.document.name}`
            : 'Брокеры - UTEX'}
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
            placeholder="UTEX"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Логин учётной записи UTEX</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="UTEX login"
            value="${(x) => x.document.login}"
            ${ref('login')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Пароль учётной записи UTEX</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="UTEX password"
            value="${(x) => x.document.password}"
            ${ref('password')}
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

export const brokerUtexAuroraPageStyles = css`
  ${pageStyles}
`;

export async function checkUtexAuroraCredentials({
  serviceMachineUrl,
  login,
  password
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'POST',
      url: 'https://api.utex.io/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.authorizeByFirstFactor',
      headers: {
        'User-Agent': navigator.userAgent,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        realm: 'aurora',
        clientId: 'utexweb',
        loginOrEmail: login,
        password,
        product: 'UTEX',
        locale: 'ru'
      })
    })
  });
}

export class BrokerUtexAuroraPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.login);
    await validate(this.password);

    const request = await checkUtexAuroraCredentials({
      serviceMachineUrl: ppp.keyVault.getKey('service-machine-url'),
      login: this.login.value.trim(),
      password: this.password.value.trim()
    });
    const json = await request.json();

    if (/UserSoftBlockedException|BlockingException/i.test(json?.type)) {
      invalidate(this.login, {
        errorMessage: 'Учётная запись временно заблокирована',
        raiseException: true
      });
    } else if (!request.ok) {
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
          type: `[%#(await import('../../lib/const.js')).BROKERS.UTEX_AURORA%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.UTEX_AURORA,
      name: this.name.value.trim()
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        login: this.login.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: BROKERS.UTEX_AURORA,
        createdAt: new Date()
      }
    };
  }
}

export default BrokerUtexAuroraPage.compose({
  template: brokerUtexAuroraPageTemplate,
  styles: brokerUtexAuroraPageStyles
}).define();
