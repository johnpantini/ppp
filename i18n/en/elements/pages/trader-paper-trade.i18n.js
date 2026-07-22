export default function (i18n) {
  i18n.extend({
    $traderPaperTradePage: {
      initialDepositTitle: 'Initial deposit',
      initialDepositDescription:
        'The values are reset when the trader is reloaded.',
      bookSourceTitle: 'Order book source',
      bookSourceDescription:
        'The trader will use the order book to execute virtual trades.',
      dictionaryTitle: 'Dictionary',
      dictionaryDescription:
        'The instrument dictionary that will be assigned to the trader.',
      marketOrderProtectionTitle: 'Market order protection, %',
      marketOrderProtectionDescription:
        'The execution price of a market order cannot be worse than the best order book price adjusted by this value.',
      commissionTitle: 'Trade commission',
      commissionDescription: 'Commission calculation code in JavaScript.',
      sourceCodeInvalid: 'The source code cannot be used.'
    }
  });
}
