import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $ordersPage: {
      listHeader: 'Order template list',
      addOrderTemplate: 'Add an order template',
      typeColumn: 'Type',
      createdAtColumn: 'Created',
      updatedAtColumn: 'Last modified',
      versionColumn: 'Version',
      actionsColumn: 'Actions'
    }
  });
}
