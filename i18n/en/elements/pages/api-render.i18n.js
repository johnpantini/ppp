/**
 * Registers the i18n/en/elements/pages/api-render phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiRenderPage: {
      apiToken: 'API token',
      apiTokenDescriptionPrefix: 'The Render API token. Can be obtained in the',
      apiTokenDescriptionLink: 'dashboard',
      apiTokenDescriptionSuffix: 'of your profile.'
    }
  });
}
