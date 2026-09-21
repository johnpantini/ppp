import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/en/elements/widgets/portfolio phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
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
