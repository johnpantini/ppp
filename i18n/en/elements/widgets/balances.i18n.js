/**
 * Registers the i18n/en/elements/widgets/balances phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $balancesWidget: {
      averagePrice: 'Average: %{price}',
      noBalancesTrader: 'No portfolio trader specified.',
      descriptionBeforeName: 'The',
      descriptionAfterName:
        'widget displays cash or other assets used to open positions.',
      balancesTrader: 'Portfolio trader',
      balancesTraderDescription:
        'A trader that will be the source of balance positions.',
      interface: 'Interface',
      hideBalances: 'Hide values'
    }
  });
}
