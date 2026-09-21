/**
 * Registers the i18n/en/elements/pages/extension-manage phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $extensionManagePage: {
      titleDescription:
        'The name to display in the side panel in the extensions section.'
    }
  });
}
