export default function (i18n) {
  i18n.extend({
    $traderBybitV5Page: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль Bybit.',
      addBrokerProfile: 'Добавить профиль Bybit',
      productTitle: 'Продукт',
      productDescription: 'Выберите продукт, в рамках которого будете торговать.',
      productLinear: 'Деривативы',
      productSpot: 'Спот',
      orderbookDepthTitle: 'Глубина книги заявок',
      orderbookDepthDescription:
        'Чем меньше глубина, тем быстрее будет обновляться книга заявок.',
      reconnectTimeoutTitle: 'Тайм-аут восстановления соединения',
      reconnectTimeoutDescription:
        'Время, по истечении которого будет предпринята очередная попытка восстановить прерванное подключение к серверу. Задаётся в миллисекундах, по умолчанию 1000 мс.'
    }
  });
}
