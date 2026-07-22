export default function (i18n) {
  i18n.extend({
    $orderbookWidget: {
      refreshManually: 'Обновить вручную',
      pause: 'Пауза',
      clearWidget: 'Очистить виджет',
      noBookTrader: 'Отсутствует основной трейдер книги заявок.',
      codeContainsErrors: 'Код содержит ошибки.',
      tags: {
        orderbook: 'Биржевой стакан'
      },
      description:
        'отображает таблицу лимитных заявок инструмента на покупку и продажу.',
      settings: {
        tabs: {
          traders: 'Трейдеры'
        },
        bookTrader: 'Трейдер книги заявок',
        bookTraderDescription: 'Трейдер, который будет источником книги заявок.',
        ordersTrader: 'Трейдер лимитных заявок',
        ordersTraderDescription:
          'Трейдер, который будет отображать собственные лимитные заявки (количество) на ценовых уровнях.',
        ownOrdersDisplay: 'Отображение своих заявок',
        ownOrdersNative: 'Только если уровень есть у трейдера книги',
        ownOrdersVirtual: 'Всегда на виртуальном уровне',
        extraBookTrader: 'Дополнительный трейдер книги заявок #%{n}',
        bookProcessing: 'Обработка книг заявок',
        bookProcessingDescription:
          'Тело функции для обработки книг заявок, поступающих от трейдеров виджета.',
        displayMode: 'Тип отображения',
        displayModeCompact: 'Компактный',
        displayModeOneColumn: '1 колонка',
        depth: 'Глубина книги заявок',
        depthDescriptionStart: 'Количество строк',
        depthDescriptionAnd: 'и',
        depthDescriptionEnd: 'для отображения.',
        headerInterface: 'Интерфейс заголовка',
        showResetButton: 'Показывать кнопку очистки',
        showPauseButton: 'Показывать кнопку паузы',
        content: 'Наполнение',
        showSpread: 'Показывать спред',
        showPools: 'Отображать пулы ликвидности в книге заявок',
        useMicsForPools: 'Отображать пулы ликвидности кодами MIC',
        priceLevels: 'Ценовые уровни',
        showBorders: 'Выделять границы ценовых уровней',
        levelColoring: 'Раскраска ценовых уровней',
        levelColoringOff: 'Нет',
        levelColoringVolume: 'По относительному объёму',
        levelColoringOrdinal: 'По порядковому номеру',
        levelColoringBanner:
          'Параметры слева направо: Тёмная тема, Светлая тема, Прозрачность.'
      }
    }
  });
}
