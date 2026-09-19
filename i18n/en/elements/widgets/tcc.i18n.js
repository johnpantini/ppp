import $const from '../../lib/const.i18n.js';

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
