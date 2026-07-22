export default function (i18n) {
  i18n.extend({
    $traderCombinedOrderbookPage: {
      sourceTraderPlaceholder: 'Source trader',
      processorFuncCheckbox:
        'The trader will process the order book with a function:',
      tradersMustBeUnique: 'Traders cannot be repeated in the list',
      sourceListEmpty: 'The source list must not be empty',
      dictionaryTitle: 'Dictionary',
      dictionaryDescription:
        'The instrument dictionary that will be assigned to the trader.',
      traderListTitle: 'List of supplier traders',
      traderListDescription:
        'Data from the selected traders will be combined into a single combined order book.',
      maxTradersWarning: 'Up to 10 traders can be specified.'
    }
  });
}
