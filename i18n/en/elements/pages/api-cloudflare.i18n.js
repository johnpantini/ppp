/**
 * Registers the i18n/en/elements/pages/api-cloudflare phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiCloudflarePage: {
      accountId: 'Account ID',
      accountIdDescription:
        'Can be obtained in the dashboard, in the Workers section.',
      accountEmail: 'Account e-mail',
      accountEmailDescription: 'The e-mail address of the Cloudflare account.',
      apiKeyDescriptionPrefix: 'Global API Key. Can be found at this',
      apiKeyDescriptionLink: 'link',
      invalidApiKeyEmailOrAccountId: 'Invalid API key, e-mail, or account ID'
    }
  });
}
