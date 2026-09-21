/**
 * Registers the i18n/en/elements/pages/instruments phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $instrumentsPage: {
      title: 'Trading instruments',
      manageTab: 'Add & edit',
      importTab: 'Import'
    }
  });
}
