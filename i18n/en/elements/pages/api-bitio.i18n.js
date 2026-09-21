/**
 * Registers the i18n/en/elements/pages/api-bitio phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiBitioPage: {
      dbApiKey: 'Database API key',
      dbApiKeyDescription:
        'The bit.io database API key. Can be obtained in the dashboard on the Connect tab.',
      apiKeyPlaceholder: 'API key',
      database: 'Database',
      databaseDescription: 'The database name to connect to.'
    }
  });
}
