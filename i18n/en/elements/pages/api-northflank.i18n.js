/**
 * Registers the i18n/en/elements/pages/api-northflank phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiNorthflankPage: {
      apiToken: 'API token',
      apiTokenDescription:
        'The Northflank API token. Can be obtained in the profile settings.'
    }
  });
}
