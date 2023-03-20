import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS } from '../../lib/const.js';
import '../text-field.js';
import '../button.js';

export const brokerBinancePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Брокеры - Binance - ${x.document.name}`
            : 'Брокеры - Binance'}
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
            placeholder="Binance"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ API Binance</h5>
          <p class="description">
            Получить можно по
            <a
              class="link"
              rel="noopener"
              target="_blank"
              href="https://www.binance.com/ru/my/settings/api-management"
              >ссылке</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Ключ API"
            value="${(x) => x.document.apiKey}"
            ${ref('apiKey')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Секретный ключ API Binance</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Секрет API"
            value="${(x) => x.document.secret}"
            ${ref('secret')}
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

export const brokerBinancePageStyles = css`
  ${pageStyles}
`;

export async function checkBinanceCredentials({
  serviceMachineUrl,
  apiKey,
  secret
}) {
  const stringifyKeyValuePair = ([key, value]) => {
    const valueString = Array.isArray(value)
      ? `["${value.join('","')}"]`
      : value;

    return `${key}=${encodeURIComponent(valueString)}`;
  };

  const buildQueryString = (params) => {
    if (!params) return '';

    return Object.entries(params).map(stringifyKeyValuePair).join('&');
  };

  const timestamp = Date.now();
  const queryString = buildQueryString({ timestamp });
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = Array.from(
    new Uint8Array(
      await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(queryString)
      )
    )
  )
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return await fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    })
  });
}

export class BrokerBinancePage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.apiKey);
    await validate(this.secret);

    const request = await checkBinanceCredentials({
      serviceMachineUrl: ppp.keyVault.getKey('service-machine-url'),
      apiKey: this.apiKey.value.trim(),
      secret: this.secret.value.trim()
    });

    if (!request.ok) {
      console.error(await request.json());

      invalidate(this.apiKey, {
        errorMessage: 'Неверный ключ или секрет',
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
          type: `[%#(await import('../../lib/const.js')).BROKERS.BINANCE%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.BINANCE,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        apiKey: this.apiKey.value.trim(),
        secret: this.secret.value.trim(),
        version: 1,
        type: BROKERS.BINANCE,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerBinancePage.compose({
  template: brokerBinancePageTemplate,
  styles: brokerBinancePageStyles
}).define();
