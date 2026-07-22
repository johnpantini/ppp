import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $apisPage: {
      listHeader: 'External API list',
      connectApi: 'Connect an API',
      typeColumn: 'Type',
      createdAtColumn: 'Created',
      updatedAtColumn: 'Last modified',
      versionColumn: 'Version',
      actionsColumn: 'Actions'
    }
  });
}
