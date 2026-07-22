import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $serversPage: {
      listHeader: 'Server list',
      addServer: 'Add a server',
      authTypeColumn: 'Authorization type',
      createdAtColumn: 'Created',
      updatedAtColumn: 'Last modified',
      versionColumn: 'Version',
      stateColumn: 'State',
      isolationColumn: 'Isolation',
      isolatedCheckbox: 'Isolated',
      actionsColumn: 'Actions'
    }
  });
}
