/**
 * Registers the i18n/ru/elements/pages/broker-bybit phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerBybitPage: {
      keyAndSecretDescription: 'Ключ и секрет можно сгенерировать по',
      link: 'ссылке',
      secretKey: 'Секретный ключ',
      endpoint: 'Конечная точка',
      connectorService: 'Сервис-соединитель',
      connectorServiceDescription:
        'Будет использован для совершения запросов к API Bybit.',
      testRequestFailed: 'Не удалось выполнить проверочный запрос к API Bybit'
    }
  });
}
