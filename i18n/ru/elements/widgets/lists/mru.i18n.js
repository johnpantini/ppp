/**
 * Registers the i18n/ru/elements/widgets/lists/mru phrases, including shared dictionaries when required.
 * @param {import('../../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $mruWidget: {
      autoFillBanner:
        'Этот список наполняется автоматически. Содержимым можно управлять, только находясь в окне терминала.',
      listDepth: 'Глубина списка',
      instrumentsTableColumns: 'Столбцы таблицы инструментов'
    }
  });
}
