/**
 * Registers the i18n/en/elements/pages/bots phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $botsPage: {
      listHeader: 'Telegram bot list',
      addBot: 'Add a bot',
      createdAtColumn: 'Created',
      updatedAtColumn: 'Last modified',
      versionColumn: 'Version',
      actionsColumn: 'Actions'
    }
  });
}
