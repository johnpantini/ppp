/**
 * Registers the i18n/ru/elements/pages/broker-tinkoff phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerTinkoffPage: {
      apiTokenTitle: 'Токен для доступа к API',
      apiTokenDescription:
        'Требуется для подписи всех запросов. Получить можно по',
      link: 'ссылке',
      enterToken: 'Введите токен',
      malformedToken: 'Недопустимый токен',
      noOpenAccounts: 'Не найдены открытые брокерские счета'
    }
  });
}
