import $const from '../../lib/const.i18n.js';

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
