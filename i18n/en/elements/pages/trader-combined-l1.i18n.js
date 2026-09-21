/**
 * Registers the i18n/en/elements/pages/trader-combined-l1 phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderCombinedL1Page: {
      l1TraderPlaceholder: 'L1 trader',
      tradersMustBeUnique: 'Traders cannot be repeated in the list',
      sourceListEmpty: 'The source list must not be empty',
      dictionaryTitle: 'Dictionary',
      dictionaryDescription:
        'The instrument dictionary that will be assigned to the trader.',
      traderListTitle: 'List of L1 source traders',
      traderListDescription:
        'The selected traders will be combined into a single combined L1 data source. Alphanumeric flags control the ability to supply data according to the documentation:'
    }
  });
}
