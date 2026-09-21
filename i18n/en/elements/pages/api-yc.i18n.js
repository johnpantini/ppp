/**
 * Registers the i18n/en/elements/pages/api-yc phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiYcPage: {
      serviceAccount: 'Yandex Cloud service account',
      serviceAccountDescription: 'The service account ID.',
      publicKeyId: 'Yandex Cloud public key ID',
      publicKeyIdDescription:
        'The ID of the authorized public key of the service account.',
      privateKey: 'Yandex Cloud private key',
      privateKeyDescription:
        'The authorized private key of the service account.',
      staticKeyId: 'Static key ID',
      staticKeyIdDescription: 'Required to access the object storage.',
      staticKeySecret: 'Static key secret',
      jwtGenerationFailed:
        'Failed to generate a JWT. Check that your Yandex Cloud keys are correct.',
      iamTokenFailed:
        'Failed to obtain an IAM token. Check that your Yandex Cloud keys are correct.',
      bucketListFailed: 'Failed to fetch the bucket list. Check the static key.'
    }
  });
}
