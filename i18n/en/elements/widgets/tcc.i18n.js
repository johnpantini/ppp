import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/en/elements/widgets/tcc phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $tccWidget: {
      trader: 'Trader',
      updateInstruments: 'Update instruments',
      performReset: 'Perform a reset',
      noTradersToDisplay: 'No traders to display.',
      descriptionBeforeName: 'The',
      descriptionAfterName:
        'widget displays information about the application traders and allows interacting with them.',
      traderList: 'Trader list'
    }
  });
}
