/**
 * Registers the i18n/ru/elements/pages/trader-tinkoff-grpc-web phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderTinkoffGrpcWebPage: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль Tinkoff.',
      addBrokerProfile: 'Добавить профиль Tinkoff',
      accountTitle: 'Торговый счёт',
      clickToSelectAccount: 'Нажмите, чтобы выбрать счёт',
      reconnectTimeoutTitle: 'Тайм-аут восстановления соединения',
      reconnectTimeoutDescription:
        'Время, по истечении которого будет предпринята очередная попытка восстановить прерванное подключение к серверам брокера. Задаётся в миллисекундах, по умолчанию 1000 мс.'
    }
  });
}
