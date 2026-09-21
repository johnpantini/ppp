/**
 * Registers the i18n/ru/elements/pages/api-northflank phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiNorthflankPage: {
      apiToken: 'Токен API',
      apiTokenDescription:
        'API-токен Northflank. Можно получить в настройках профиля.'
    }
  });
}
