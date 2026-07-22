import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $tradersPage: {
      traderListTitle: 'Trader list',
      addTrader: 'Add trader',
      or: 'Or',
      allTraders: 'All traders',
      removedTraders: 'Removed traders',
      orByType: 'Or by type',
      typeColumn: 'Type',
      createdAtColumn: 'Created',
      updatedAtColumn: 'Last modified',
      versionColumn: 'Version',
      actionsColumn: 'Actions'
    }
  });
}
