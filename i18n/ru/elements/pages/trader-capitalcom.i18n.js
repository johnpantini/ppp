/**
 * Registers the i18n/ru/elements/pages/trader-capitalcom phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderCapitalcomPage: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль Capital.com.',
      addBrokerProfile: 'Добавить профиль Capital.com',
      lastPriceModeTitle: 'Определение последней цены',
      lastPriceModeDescription:
        'Вышестоящий источник предоставляет цены bid/ask CFD-контрактов. Выберите, каким образом рассчитывать цену последней сделки.',
      connectorServiceTitle: 'Сервис-соединитель',
      connectorServiceDescription:
        'Будет использован для совершения HTTP-запросов к Capital.com.'
    }
  });
}
