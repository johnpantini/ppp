/**
 * Registers the i18n/ru/elements/pages/api-render phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiRenderPage: {
      apiToken: 'Токен API',
      apiTokenDescriptionPrefix: 'API-токен Render. Можно получить в',
      apiTokenDescriptionLink: 'панели управления',
      apiTokenDescriptionSuffix: 'профилем.'
    }
  });
}
