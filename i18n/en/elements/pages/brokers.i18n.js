import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/en/elements/pages/brokers phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $brokersPage: {
      title: 'Broker list',
      addBroker: 'Add a broker',
      type: 'Type',
      createdAt: 'Creation date',
      updatedAt: 'Last modified',
      version: 'Version',
      actions: 'Actions'
    }
  });
}
