export default function (i18n) {
  i18n.extend({
    $apiAstradbPage: {
      checkDbConnection: 'Проверить подключение к базе',
      dbId: 'Идентификатор базы данных',
      dbIdDescription:
        'Можно найти в панели управления базой данных, ключ ASTRA_DB_ID.',
      dbRegion: 'Регион базы данных',
      dbRegionDescription:
        'Можно найти в панели управления базой данных, ключ ASTRA_DB_REGION.',
      dbKeyspace: 'Пространство ключей',
      dbKeyspaceDescription:
        'Можно найти в панели управления базой данных, ключ ASTRA_DB_KEYSPACE.',
      dbTokenDescription:
        'Хранится в переменной окружения ASTRA_DB_APPLICATION_TOKEN.',
      tableList: 'Список таблиц',
      tableListDescription:
        'Таблицы в AstraDB в пространстве ключей текущего профиля.',
      tableColumn: 'Таблица',
      actionsColumn: 'Действия',
      wakeUpTriggerBanner:
        'Будет настроен триггер, чтобы базу не отключили за неактивность.',
      tableRemovalTitle: 'Удаление таблицы',
      confirmTableRemoval:
        'Таблица «%{table}» будет удалена. Подтвердите действие.',
      tableRemoved: 'Таблица «%{table}» успешно удалена.',
      collectionRemovalTitle: 'Удаление коллекции',
      cannotReadDbStateDocument:
        'Не удалось прочитать документ с состоянием базы.',
      noDbStateInfo: 'База данных не содержит информации о состоянии.',
      dbOkLastUpdate: 'База данных в порядке. Последнее обновление: %{date}'
    }
  });
}
