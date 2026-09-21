/**
 * Registers the i18n/ru/elements/pages/api-bitio phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiBitioPage: {
      dbApiKey: 'Ключ API базы данных',
      dbApiKeyDescription:
        'API-ключ базы bit.io. Можно получить в панели управления на вкладке Connect.',
      apiKeyPlaceholder: 'API-ключ',
      database: 'База данных',
      databaseDescription: 'Название базы данных для подключения.'
    }
  });
}
