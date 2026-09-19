export default function (i18n) {
  i18n.extend({
    $traderAlpacaV2PlusPage: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль UTEX, Alpaca или Psina.',
      addUtexProfile: 'Добавить профиль UTEX',
      addAlpacaProfile: 'Добавить профиль Alpaca',
      addPsinaProfile: 'Добавить профиль Psina',
      wsUrlTitle: 'URL для подключения к общему потоку рыночных данных',
      wsUrlDescription:
        'Ссылка для передачи данных книги заявок и ленты всех сделок. Можно сформировать по сервису, если таковой имеется (воспользуйтесь выпадающим списком).',
      clickToSelectService: 'Нажмите, чтобы выбрать сервис',
      generateLink: 'Сформировать ссылку',
      reconnectTimeoutTitle: 'Тайм-аут восстановления соединения',
      reconnectTimeoutDescription:
        'Время, по истечении которого будет предпринята очередная попытка восстановить прерванное подключение к серверу. Задаётся в миллисекундах, по умолчанию 1000 мс.',
      marketDataSettingsTitle: 'Параметры рыночных данных',
      useLotsCheckbox: 'Передавать объёмы акций в книге заявок в лотах',
      invalidUrl: 'Неверный или неполный URL',
      invalidUrlProtocol: 'Недопустимый протокол URL',
      connectionLimitExceeded: 'Исчерпан лимит доступных соединений',
      connectionFailedCheckLink:
        'Не удалось соединиться, проверьте ссылку и брокера'
    }
  });
}
