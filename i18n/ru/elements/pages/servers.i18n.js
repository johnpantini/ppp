import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $serversPage: {
      listHeader: 'Список серверов',
      addServer: 'Добавить сервер',
      authTypeColumn: 'Тип авторизации',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      stateColumn: 'Состояние',
      isolationColumn: 'Изоляция',
      isolatedCheckbox: 'Изолирован',
      actionsColumn: 'Действия'
    }
  });
}
