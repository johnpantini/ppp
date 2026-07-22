export default function (i18n) {
  i18n.extend({
    $lightChartWidget: {
      refreshManually: 'Обновить вручную',
      clearWidget: 'Очистить виджет',
      scrollToChartEnd: 'Перейти в конец графика',
      noChartTrader: 'Отсутствует трейдер котировок.',
      noFeedTrader: 'Отсутствует трейдер формирования графика.',
      historyLoadFailed: 'Не удалось загрузить историю котировок.',
      widgetDescriptionPrefix: 'Виджет',
      widgetDescriptionSuffix:
        'отображает график финансового инструмента в минимальной комплектации.',
      tabs: {
        traders: 'Трейдеры',
        timeframes: 'Таймфреймы'
      },
      historicalTrader: 'Трейдер исторических данных',
      historicalTraderDescription:
        'Трейдер, который будет являться источником исторических данных графика.',
      feedMode: 'Режим формирования графика',
      feedModePrints: 'По сделкам',
      feedModeCandles: 'По барам',
      tradesTrader: 'Трейдер ленты сделок',
      tradesTraderDescription:
        'График будет формироваться из сделок, приходящих от трейдера-источника.',
      candlesTrader: 'Трейдер баров',
      candlesTraderDescription:
        'График будет формироваться из баров, приходящих от трейдера-источника.',
      timeframesToDisplay: 'Таймфреймы для отображения',
      interface: 'Интерфейс',
      showTimeframeToolbar: 'Показывать панель выбора таймфрейма',
      showResetButton: 'Показывать кнопку очистки',
      showRefreshButton: 'Показывать кнопку ручного обновления',
      seriesKind: 'Вид графика',
      seriesKindCandlestick: 'Японские свечи',
      seriesKindBar: 'Бары',
      seriesKindLine: 'Линия',
      contents: 'Наполнение',
      showVWAPLine: 'Показывать линию VWAP'
    }
  });
}
