/**
 * Registers the i18n/en/elements/widgets/lists/mru phrases, including shared dictionaries when required.
 * @param {import('../../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $mruWidget: {
      autoFillBanner:
        'This list is filled automatically. Its contents can only be managed from the terminal window.',
      listDepth: 'List depth',
      instrumentsTableColumns: 'Instruments table columns'
    }
  });
}
