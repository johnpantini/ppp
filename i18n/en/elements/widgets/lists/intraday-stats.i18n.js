export default function (i18n) {
  i18n.extend({
    $intradayStatsWidget: {
      columns: {
        buys: 'Buys',
        sells: 'Sells'
      },
      noStatsTrader: 'The portfolio and positions trader is not set.',
      sourceCodeUnusable: 'The source code cannot be used.',
      statsTrader: 'Trader for building statistics',
      statsTraderDescription:
        'The trader must support fetching the operations history and the portfolio.',
      mainTrader: 'Main trader',
      l1Source: 'L1 data source.',
      extraTraderL1: 'Extra L1 trader #%{n}',
      virtualCommFunction: 'Virtual trade commission calculation',
      statsTableColumns: 'Statistics table columns'
    }
  });
}
