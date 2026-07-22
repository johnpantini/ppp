import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $orderPage: {
      searchPlaceholder: 'Search',
      continueButton: 'Continue',
      slTpCardDescription: 'A classic pending order with settings.',
      recorderCardTitle: 'Trades and quotes recording',
      recorderCardDescription:
        'Records market data changes to cloud storage.',
      customCardDescription:
        'A custom order implementation loaded from a URL.',
      manageRecordings: 'Recordings management'
    }
  });
}
