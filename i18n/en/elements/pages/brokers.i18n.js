import $const from '../../lib/const.i18n.js';

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
