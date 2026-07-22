export default function (i18n) {
  i18n.extend({
    $traderFinamTradeApiPage: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль Finam.',
      addBrokerProfile: 'Добавить профиль Finam',
      accountTitle: 'Торговый код',
      accountDescription:
        'Трейдер может работать только с едиными счетами. Можно найти в личном кабинете, открыв счёт из списка - код отобразится в открывшихся подробностях.',
      accountPlaceholder: 'Код торгового счёта',
      connectorServiceTitle: 'Сервис-соединитель',
      connectorServiceDescription:
        'Будет использован для совершения HTTP-запросов к Finam.',
      invalidTradingCode: 'Неверный торговый код'
    }
  });
}
