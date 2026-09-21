import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/en/elements/pages/traders phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
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
