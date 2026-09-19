import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $ordersPage: {
      listHeader: 'Список шаблонов заявок',
      addOrderTemplate: 'Добавить шаблон заявки',
      typeColumn: 'Тип',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actionsColumn: 'Действия'
    }
  });
}
