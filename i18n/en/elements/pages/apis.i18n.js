import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/en/elements/pages/apis phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
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
