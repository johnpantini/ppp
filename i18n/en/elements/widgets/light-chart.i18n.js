export default function (i18n) {
  i18n.extend({
    $lightChartWidget: {
      refreshManually: 'Refresh manually',
      clearWidget: 'Clear the widget',
      scrollToChartEnd: 'Scroll to the end of the chart',
      noChartTrader: 'The quotes trader is missing.',
      noFeedTrader: 'The chart feed trader is missing.',
      historyLoadFailed: 'Failed to load the quote history.',
      widgetDescriptionPrefix: 'The',
      widgetDescriptionSuffix:
        'widget displays a chart of a financial instrument in a minimal configuration.',
      tabs: {
        traders: 'Traders',
        timeframes: 'Timeframes'
      },
      historicalTrader: 'Historical data trader',
      historicalTraderDescription:
        'The trader that will serve as the source of historical chart data.',
      feedMode: 'Chart feed mode',
      feedModePrints: 'From trades',
      feedModeCandles: 'From bars',
      tradesTrader: 'Time and sales trader',
      tradesTraderDescription:
        'The chart will be built from trades coming from the source trader.',
      candlesTrader: 'Bars trader',
      candlesTraderDescription:
        'The chart will be built from bars coming from the source trader.',
      timeframesToDisplay: 'Timeframes to display',
      interface: 'Interface',
      showTimeframeToolbar: 'Show the timeframe selection toolbar',
      showResetButton: 'Show the clear button',
      showRefreshButton: 'Show the manual refresh button',
      seriesKind: 'Chart style',
      seriesKindCandlestick: 'Candlesticks',
      seriesKindBar: 'Bars',
      seriesKindLine: 'Line',
      contents: 'Contents',
      showVWAPLine: 'Show the VWAP line'
    }
  });
}
