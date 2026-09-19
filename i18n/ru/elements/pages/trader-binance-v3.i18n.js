export default function (i18n) {
  i18n.extend({
    $traderBinanceV3Page: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль Binance.',
      addBrokerProfile: 'Добавить профиль Binance',
      wsUrlTitle: 'Базовый URL для подключения к потоку рыночных данных',
      wsUrlDescription: 'Ссылка для установки WebSocket-соединения.',
      tradesModeTitle: 'Режим ленты сделок',
      tradesModeDescription:
        'В режиме агрегирования сделки суммируются по количеству и попадают в ленту как одна, если они принадлежат одной заявке тейкера.',
      aggTrades: 'Агрегированные сделки',
      rawTrades: 'Все сделки',
      reconnectTimeoutTitle: 'Тайм-аут восстановления соединения',
      reconnectTimeoutDescription:
        'Время, по истечении которого будет предпринята очередная попытка восстановить прерванное подключение к серверу. Задаётся в миллисекундах, по умолчанию 1000 мс.',
      orderbookUpdateIntervalTitle: 'Интервал обновления книги заявок',
      selectValuePlaceholder: 'Выберите значение',
      interval100ms: '100 мс',
      interval1000ms: '1000 мс',
      invalidUrl: 'Неверный или неполный URL',
      invalidUrlProtocol: 'Недопустимый протокол URL',
      connectionFailed: 'Не удалось соединиться'
    }
  });
}
