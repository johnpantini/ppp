import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { HMAC } from '../../lib/ppp-crypto.js';
import { APIS } from '../../lib/const.js';
import * as jose from '../../vendor/jose.min.js';
import '../badge.js';
import '../button.js';
import '../snippet.js';
import '../text-field.js';

export const apiYcPageTemplate = html`
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
            placeholder="Yandex Cloud"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Сервисный аккаунт Yandex Cloud</h5>
          <p class="description">Идентификатор сервисного аккаунта.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Введите значение"
            value="${(x) => x.document.ycServiceAccountID}"
            ${ref('ycServiceAccountID')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Идентификатор открытого ключа Yandex Cloud</h5>
          <p class="description">
            Идентификатор открытого авторизованного ключа сервисного аккаунта.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Введите значение"
            value="${(x) => x.document.ycPublicKeyID}"
            ${ref('ycPublicKeyID')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Закрытый ключ Yandex Cloud</h5>
          <p class="description">
            Закрытый авторизованный ключ сервисного аккаунта.
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            style="height: 256px"
            :code="${(x) =>
              x.document.ycPrivateKey ??
              `-----BEGIN PRIVATE KEY-----
-----END PRIVATE KEY-----`}"
            ${ref('ycPrivateKey')}
          ></ppp-snippet>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Идентификатор статического ключа</h5>
          <p class="description">Требуется для доступа к хранилищу объектов.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="YC"
            value="${(x) => x.document.ycStaticKeyID}"
            ${ref('ycStaticKeyID')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Секрет статического ключа</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="YC"
            value="${(x) => x.document.ycStaticKeySecret}"
            ${ref('ycStaticKeySecret')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const apiYcPageStyles = css`
  ${pageStyles}
`;

export async function generateYandexIAMToken({
  ycServiceAccountID,
  ycPublicKeyID,
  ycPrivateKey
}) {
  const now = Math.floor(new Date().getTime() / 1000);
  const payload = {
    aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
    iss: ycServiceAccountID,
    iat: now,
    exp: now + 300
  };

  const key = await jose.importPKCS8(ycPrivateKey, 'PS256');

  return await new jose.CompactSign(
    new TextEncoder().encode(JSON.stringify(payload))
  )
    .setProtectedHeader({
      alg: 'PS256',
      kid: ycPublicKeyID
    })
    .sign(key);
}

export async function generateYCAWSSigningKey({ ycStaticKeySecret, date }) {
  const dateKey = await HMAC(`AWS4${ycStaticKeySecret}`, date);
  const regionKey = await HMAC(dateKey, 'ru-central1');
  const serviceKey = await HMAC(regionKey, 's3');

  return HMAC(serviceKey, 'aws4_request');
}

export async function getYCPsinaFolder({
  ycServiceAccountID,
  ycPublicKeyID,
  ycPrivateKey
}) {
  let jwt;

  try {
    jwt = await generateYandexIAMToken({
      ycServiceAccountID,
      ycPublicKeyID,
      ycPrivateKey
    });
  } catch (e) {
    invalidate(ppp.app.toast, {
      errorMessage: 'Не удалось сгенерировать JWT-токен.',
      raiseException: true
    });
  }

  const iamTokenRequest = await ppp.fetch(
    'https://iam.api.cloud.yandex.net/iam/v1/tokens',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jwt })
    }
  );

  await maybeFetchError(
    iamTokenRequest,
    'Не удалось получить IAM-токен. Проверьте правильность ключей Yandex Cloud.'
  );

  const { iamToken } = await iamTokenRequest.json();
  const rCloudList = await maybeFetchError(
    await ppp.fetch(
      'https://resource-manager.api.cloud.yandex.net/resource-manager/v1/clouds',
      {
        headers: {
          Authorization: `Bearer ${iamToken}`
        }
      }
    ),
    'Не удалось получить список облачных ресурсов Yandex Cloud.'
  );

  const { clouds } = await rCloudList.json();
  const pppCloud = clouds?.find((c) => c.name === 'ppp');

  if (!pppCloud) {
    invalidate(ppp.app.toast, {
      errorMessage: 'Облако под названием ppp не найдено в Yandex Cloud.',
      raiseException: true
    });
  }

  const rFolderList = await maybeFetchError(
    await ppp.fetch(
      `https://resource-manager.api.cloud.yandex.net/resource-manager/v1/folders?cloudId=${pppCloud.id}`,
      {
        headers: {
          Authorization: `Bearer ${iamToken}`
        }
      }
    ),
    'Не удалось получить список каталогов облака ppp Yandex Cloud.'
  );

  const { folders } = await rFolderList.json();
  const psinaFolder = folders?.find(
    (f) => f.name === 'psina' && f.status === 'ACTIVE'
  );

  if (!psinaFolder) {
    invalidate(ppp.app.toast, {
      errorMessage:
        'Каталог psina не найден либо неактивен в облаке ppp Yandex Cloud.',
      raiseException: true
    });
  }

  return { psinaFolderId: psinaFolder.id, iamToken };
}

export class ApiYcPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.ycServiceAccountID);
    await validate(this.ycPublicKeyID);
    await validate(this.ycPrivateKey);
    await validate(this.ycStaticKeyID);
    await validate(this.ycStaticKeySecret);

    let jwt;

    try {
      jwt = await generateYandexIAMToken({
        ycServiceAccountID: this.ycServiceAccountID.value.trim(),
        ycPublicKeyID: this.ycPublicKeyID.value.trim(),
        ycPrivateKey: this.ycPrivateKey.value.trim()
      });
    } catch (e) {
      invalidate(this.ycPrivateKey, {
        errorMessage:
          'Не удалось сгенерировать JWT. Проверьте правильность ключей Yandex Cloud.',
        raiseException: true
      });
    }

    const iamTokenRequest = await ppp.fetch(
      'https://iam.api.cloud.yandex.net/iam/v1/tokens',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jwt })
      }
    );

    await maybeFetchError(
      iamTokenRequest,
      'Не удалось получить IAM-токен. Проверьте правильность ключей Yandex Cloud.'
    );
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.YC%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.YC,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        ycServiceAccountID: this.ycServiceAccountID.value.trim(),
        ycPublicKeyID: this.ycPublicKeyID.value.trim(),
        ycPrivateKey: this.ycPrivateKey.value.trim(),
        ycStaticKeyID: this.ycStaticKeyID.value.trim(),
        ycStaticKeySecret: this.ycStaticKeySecret.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.YC,
        createdAt: new Date()
      }
    };
  }
}

export default ApiYcPage.compose({
  template: apiYcPageTemplate,
  styles: apiYcPageStyles
}).define();
