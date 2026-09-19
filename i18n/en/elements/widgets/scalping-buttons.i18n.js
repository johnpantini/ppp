import $g from '../../lib/general.i18n.js';

export default function (i18n) {
  $g(i18n);

  i18n.extend({
    $scalpingButtonsWidget: {
      noOrdersTraderText: 'No trader available to modify orders.',
      widgetDescriptionSuffix:
        'allow you to quickly modify limit and conditional orders by a given number of price steps.',
      limitOrdersTraderHeader: 'Limit orders trader',
      limitOrdersTraderDescription: 'The trader that will move limit orders.',
      coolDownHeader: 'Cooldown after using the buttons',
      coolDownDescription:
        'The button stays disabled for this period after being pressed. Specified in milliseconds.',
      buySideButtonsHeader: 'Buy order buttons',
      buySideButtonsDescription:
        'List signed button values separated by commas. Start a new line to create a new row. Leave a line empty to add spacing. Values are specified in price steps of the trading instrument.',
      sellSideButtonsHeader: 'Sell order buttons',
      contentHeader: 'Content',
      showAllTabText: 'Show the "All" tab',
      showRealTabText: 'Show the "Real" tab',
      showConditionalTabText: 'Show the "Conditional" tab'
    }
  });
}
