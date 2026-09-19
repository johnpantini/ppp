export default function (i18n) {
  i18n.extend({
    $traderUtexMarginStocksPage: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль UTEX.',
      addBrokerProfile: 'Добавить профиль UTEX',
      commissionTitle: 'Комиссия UTEX',
      commissionDescription:
        'Укажите в % комиссию вашего торгового счёта UTEX. Если значение не указано, расчет будет производиться по значению 0,04% от суммы заявки.',
      reconnectTimeoutTitle: 'Тайм-аут восстановления соединения',
      reconnectTimeoutDescription:
        'Время, по истечении которого будет предпринята очередная попытка восстановить прерванное подключение к серверу. Задаётся в миллисекундах, по умолчанию 1000 мс.'
    }
  });
}
