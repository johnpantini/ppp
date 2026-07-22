export default function (i18n) {
  i18n.extend({
    $orderStopLossTakeProfitPage: {
      specificationHeader: 'Спецификация',
      specificationDescription:
        'Узнайте, каким образом используются трейдеры для этой условной заявки. Трейдеры задаются в виджете заявки.',
      traderL1Source: 'Трейдер #%{n} - источник данных L1.',
      orderTypeHeader: 'Тип заявки',
      orderTypeDescription:
        'Заявка Stop Loss служит для ограничения убытков, Take Profit - фиксации прибыли.',
      watchPricesHeader: 'Цены для отслеживания',
      watchPricesDescription:
        'Возможно выбрать сразу несколько цен. При отсутствии выбора будет отслеживаться цена последней сделки. MidPoint срабатывает, если и цена bid, и цена ask положительны одновременно.',
      lastPrice: 'Цена последней сделки',
      extendedLastPrice: 'Цена последней сделки (вне основной сессии)',
      bestBid: 'Лучшая цена bid',
      bestAsk: 'Лучшая цена ask',
      midpointPrice: 'Цена MidPoint',
      distanceHeader: 'Дистанция между ценой активации и ценой исполнения',
      distanceDescription:
        'Для заявок Stop Limit и Take Limit можно указать расстояние, которое будет использоваться при расчете лимитной цены исполнения относительно цены активации на этапе заполнения формы заявки в виджете.',
      distanceBanner:
        'Ценовое расстояние можно задавать в процентах (добавьте знак % после числа) или шагах цены инструмента (добавьте знак +).',
      nonePlaceholder: 'Нет',
      timeDelayHeader: 'Защитное время',
      timeDelayDescription:
        'Время, в течение которого должно сохраняться условие срабатывания заявки. Задаётся в секундах в диапазоне от 1 до 3600.',
      workingHoursHeader: 'Рабочее время',
      workingHoursDescription:
        'Временные интервалы, в течение которых допустимо срабатывание заявки (включительно). Время местное.',
      fromHours: 'От (ч.)',
      fromMinutes: 'От (мин.)',
      toHours: 'До (ч.)',
      toMinutes: 'До (мин.)'
    }
  });
}
