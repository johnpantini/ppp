import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $portfolioWidget: {
      noPortfolioTrader: 'The portfolio trader is missing.',
      widgetDescriptionPrefix: 'The',
      widgetDescriptionSuffix:
        'widget displays a summary of all open positions.',
      tabs: {
        main: 'Main settings',
        columns: 'Table columns'
      },
      portfolioTrader: 'Portfolio trader',
      portfolioTraderDescription:
        'The trader that will be the source of portfolio positions.',
      instrumentTypesToDisplay: 'Instrument types to display',
      cryptocurrencies: 'Cryptocurrencies',
      portfolioTableColumns: 'Portfolio table columns'
    }
  });
}
