/**
 * Registers the i18n/en/elements/widgets/lists/instruments phrases, including shared dictionaries when required.
 * @param {import('../../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $instrumentsWidget: {
      instrumentsSelection: 'Instrument selection for the list',
      instrumentsSelectionDescription:
        'Specify a trader, then press the search button. Pick an instrument in the search box of the widget.',
      selectInstrument: 'Select an instrument',
      instrumentsTableColumns: 'Instruments table columns'
    }
  });
}
