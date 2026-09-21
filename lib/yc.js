import { generateAWSSigningKey } from './ppp-crypto.js';
import { maybeFetchError, ValidationError } from './ppp-exceptions.js';

/**
 * @param {{ycStaticKeySecret: string, date: string}} options Secret and YYYYMMDD date.
 * @returns {Promise<ArrayBuffer>} S3 signing key scoped to ru-central1.
 */
export async function generateYCAWSSigningKey({ ycStaticKeySecret, date }) {
  return generateAWSSigningKey({
    ycStaticKeySecret,
    date,
    region: 'ru-central1'
  });
}

/**
 * Creates the signed JWT exchanged for an IAM token, with a five-minute lifetime.
 * @param {object} options Service-account credentials and JOSE implementation.
 * @param {typeof import('../vendor/jose.min.js')} options.jose JOSE module.
 * @param {string} options.ycServiceAccountID Service-account issuer identifier.
 * @param {string} options.ycPublicKeyID Public key identifier used in the header.
 * @param {string} options.ycPrivateKey PKCS#8 PEM private key for PS256 signing.
 * @returns {Promise<string>} Signed JWT, not the exchanged IAM token.
 */
export async function generateYandexIAMToken({
  jose,
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

/**
 * Exchanges service credentials and finds the active psina folder in the ppp cloud.
 * @param {Parameters<typeof generateYandexIAMToken>[0]} options Service credentials.
 * @returns {Promise<{psinaFolderId: string, iamToken: string}>} Folder and access token.
 * @throws {ValidationError} If signing fails or the named resources are unavailable.
 * @throws {import('./ppp-exceptions.js').FetchError} If a service request fails.
 */
export async function getYCPsinaFolder({
  jose,
  ycServiceAccountID,
  ycPublicKeyID,
  ycPrivateKey
}) {
  let jwt;

  try {
    jwt = await generateYandexIAMToken({
      jose,
      ycServiceAccountID,
      ycPublicKeyID: ycPublicKeyID,
      ycPrivateKey
    });
  } catch (e) {
    throw new ValidationError({
      message: 'Не удалось сгенерировать JWT-токен.'
    });
  }

  const iamTokenRequest = await globalThis.ppp.fetch(
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
    await globalThis.ppp.fetch(
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
    throw new ValidationError({
      message: 'Облако под названием ppp не найдено в Yandex Cloud.'
    });
  }

  const rFolderList = await maybeFetchError(
    await globalThis.ppp.fetch(
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
    throw new ValidationError({
      message:
        'Каталог psina не найден либо неактивен в облаке ppp Yandex Cloud.'
    });
  }

  return { psinaFolderId: psinaFolder.id, iamToken };
}
