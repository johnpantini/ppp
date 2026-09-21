/**
 * Registers the i18n/ru/elements/pages/broker-mexc phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerMexcPage: {
      accessKey: 'Ключ доступа',
      keyAndSecretDescription: 'Ключ и секрет можно сгенерировать по',
      link: 'ссылке',
      secretKey: 'Секретный ключ',
      connectorService: 'Сервис-соединитель',
      connectorServiceDescription:
        'Будет использован для совершения запросов к API MEXC.'
    }
  });
}
