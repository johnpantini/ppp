/**
 * Registers the i18n/ru/elements/pages/trader-ib phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderIbPage: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль Interactive Brokers.',
      addBrokerProfile: 'Добавить профиль IB',
      accountTitle: 'Торговый счёт IB',
      accountDescription: 'Можно найти в TWS в заголовке программы.',
      gatewayConnectionFailed: 'Нет связи со шлюзом.',
      gatewaySummaryFailed: 'Шлюз не выполнил запрос информации о портфеле.'
    }
  });
}
