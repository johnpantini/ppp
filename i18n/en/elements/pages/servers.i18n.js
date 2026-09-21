import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/en/elements/pages/servers phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
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
