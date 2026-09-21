/**
 * Registers the i18n/ru/elements/pages/broker-finam phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerFinamPage: {
      apiTokenTitle: 'Токен для доступа к API',
      apiTokenDescription:
        'Требуется для подписи всех запросов. Получить можно по',
      link: 'ссылке'
    }
  });
}
