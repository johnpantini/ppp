import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $tradersPage: {
      traderListTitle: 'Список трейдеров',
      addTrader: 'Добавить трейдера',
      or: 'Или',
      allTraders: 'Все трейдеры',
      removedTraders: 'Удалённые трейдеры',
      orByType: 'Или по типу',
      typeColumn: 'Тип',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actionsColumn: 'Действия'
    }
  });
}
