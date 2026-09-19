import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $servicesPage: {
      listHeader: 'Список сервисов',
      installService: 'Установить сервис',
      or: 'Или',
      orByType: 'Или по типу',
      allServices: 'Все сервисы',
      removedServices: 'Удалённые сервисы',
      typeColumn: 'Тип',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actualVersionColumn: 'Последняя версия',
      stateColumn: 'Состояние',
      isolationColumn: 'Изоляция',
      actionsColumn: 'Действия',
      removedBadge: 'Удалён',
      isolated: 'Изолирован',
      update: 'Обновить'
    }
  });
}
