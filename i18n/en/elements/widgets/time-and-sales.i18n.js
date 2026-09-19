export default function (i18n) {
  i18n.extend({
    $timeAndSalesWidget: {
      columns: {
        price: 'Price',
        volume: 'Volume',
        amount: 'Amount',
        time: 'Time',
        pool: 'Pool',
        condition: 'SC'
      },
      refreshManually: 'Refresh manually',
      pause: 'Pause',
      clearWidget: 'Clear widget',
      noTradesTrader: 'The trades trader is missing.',
      historyLoadFailed: 'Failed to load the trade history.',
      codeContainsErrors: 'The code contains errors.',
      tags: {
        anonymousTrades: 'Anonymized trades tape'
      },
      description:
        'displays anonymized trades for a financial instrument across all available market centers.',
      settings: {
        tabs: {
          main: 'Connections',
          columns: 'Columns',
          filter: 'Filter'
        },
        tradesTrader: 'Trades trader',
        tradesTraderDescription:
          'The trader that will be the source of the trades tape.',
        tradesTableColumns: 'Trades table columns',
        volumeFilter: 'Volume filter',
        volumeFilterDescription:
          'Trades with a volume below the specified value will not be displayed in the tape. To always display all trades, enter 0. You can enter integers, decimal numbers, or the code of a JavaScript function body.',
        headerInterface: 'Header interface',
        showResetButton: 'Show the clear button',
        showPauseButton: 'Show the pause button',
        timeDisplayFormat: 'Time display format',
        timeFormatHms: 'Hours, minutes, seconds',
        timeFormatHmsf: 'Hours, minutes, seconds, milliseconds',
        timeFormatDayHms: 'Day, hours, minutes, seconds',
        timeFormatHm: 'Hours, minutes',
        timeFormatDayHm: 'Day, hours, minutes',
        depth: 'Number of trades to display',
        depthDescription: 'The maximum number of trades displayed in the tape.',
        volumeHighlight: 'Volume-based trade highlighting',
        volumeHighlightDescription:
          'Trades with a volume at or above the specified value will be highlighted.',
        nonePlaceholder: 'None'
      }
    }
  });
}
