import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { APIS } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../text-field.js';

export const apiPusherPageTemplate = html`
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
            placeholder="Pusher"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Id приложения</h5>
          <p class="description">
            Смотрите раздел App Keys панели управления Pusher.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="app_id"
            value="${(x) => x.document.appid}"
            ${ref('appid')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ приложения</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="key"
            value="${(x) => x.document.key}"
            ${ref('key')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Секрет приложения</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="secret"
            value="${(x) => x.document.secret}"
            ${ref('secret')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Кластер</h5>
          <p class="description">Датацентр, где размещено приложение.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="eu"
            value="${(x) => x.document.cluster ?? 'eu'}"
            ${ref('cluster')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const apiPusherPageStyles = css`
  ${pageStyles}
`;

export async function checkPusherCredentials({
  serviceMachineUrl,
  appid,
  key,
  secret,
  cluster
}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const hmacKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {
      name: 'HMAC',
      hash: { name: 'SHA-256' }
    },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    hmacKey,
    new TextEncoder().encode(
      [
        'GET',
        `/apps/${appid}/channels`,
        `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0`
      ].join('\n')
    )
  );
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const params = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&auth_signature=${signature}`;

  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: new URL(
        `/apps/${appid}/channels?${params}`,
        `https://api-${cluster}.pusher.com`
      ).toString()
    })
  });
}

export class ApiPusherPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.appid);
    await validate(this.key);
    await validate(this.secret);
    await validate(this.cluster);

    if (
      !(
        await checkPusherCredentials({
          appid: this.appid.value.trim(),
          key: this.key.value.trim(),
          secret: this.secret.value.trim(),
          cluster: this.cluster.value.trim(),
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url')
        })
      ).ok
    ) {
      invalidate(this.secret, {
        errorMessage: 'Неверные учётные данные',
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.PUSHER%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.PUSHER,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        appid: this.appid.value.trim(),
        key: this.key.value.trim(),
        secret: this.secret.value.trim(),
        cluster: this.cluster.value.trim(),
        version: 1,
        updatedAt: new Date(),
        // Placed here to prevent key encryption
        type: APIS.PUSHER
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default ApiPusherPage.compose({
  template: apiPusherPageTemplate,
  styles: apiPusherPageStyles
}).define();
