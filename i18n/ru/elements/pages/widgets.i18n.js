import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/ru/elements/pages/widgets phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $widgetsPage: {
      listOfWidgetTemplates: 'Список шаблонов виджетов',
      addWidgetTemplate: 'Добавить шаблон виджета',
      or: 'Или',
      allTemplates: 'Все шаблоны',
      removedTemplates: 'Удалённые шаблоны',
      orByType: 'Или по типу',
      typeColumn: 'Тип',
      collectionColumn: 'Коллекция',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      actionsColumn: 'Действия',
      byLink: 'По ссылке'
    }
  });
}
