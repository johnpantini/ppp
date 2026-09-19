import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $apisPage: {
      listHeader: 'Список внешних API',
      connectApi: 'Подключить API',
      typeColumn: 'Тип',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actionsColumn: 'Действия'
    }
  });
}
