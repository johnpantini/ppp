/**
 * Registers the i18n/en/elements/pages/extensions phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $extensionsPage: {
      listHeader: 'Extension list',
      installExtension: 'Install an extension',
      authorColumn: 'Author',
      createdAtColumn: 'Created',
      updatedAtColumn: 'Last modified',
      versionColumn: 'Version',
      actionsColumn: 'Actions',
      openExtension: 'Open the extension'
    }
  });
}
