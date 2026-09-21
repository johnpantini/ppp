/**
 * Registers the i18n/ru/elements/widgets/lists/instruments phrases, including shared dictionaries when required.
 * @param {import('../../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $instrumentsWidget: {
      instrumentsSelection: 'Выбор инструментов для списка',
      instrumentsSelectionDescription:
        'Укажите трейдера, после чего нажмите на кнопку поиска. Выбирайте инструмент в поисковой строке виджета.',
      selectInstrument: 'Выбрать инструмент',
      instrumentsTableColumns: 'Столбцы таблицы инструментов'
    }
  });
}
