export default function (i18n) {
  i18n.extend({
    $restoreMongodbModalPage: {
      restoreFromZipPrefix: 'Чтобы восстановить базу из ZIP-архива, нажмите',
      hereLink: 'сюда',
      selectS3ApiPlaceholder: 'Выберите API S3 для загрузки списка копий',
      databaseColumn: 'База данных',
      createdAtColumn: 'Дата создания',
      sizeColumn: 'Размер',
      actionsColumn: 'Действия',
      link: 'Ссылка',
      restore: 'Восстановить',
      restoreSucceeded:
        'Восстановление прошло успешно, можно обновить страницу.',
      restoreFromBackupTitle: 'Восстановление из резервной копии',
      confirmRestoreFromBackup:
        'Будет восстановлена база данных по резервной копии, созданной %{date}. Перед восстановлением текущая база данных будет очищена. Подтвердите действие.',
      backupRemovalTitle: 'Удаление резервной копии',
      confirmBackupRemoval:
        'Будет удалена резервная копия, созданная %{date}. Подтвердите действие.',
      cannotDeleteBackup: 'Не удалось удалить резервную копию.',
      backupDeleted: 'Копия удалена.',
      cannotFetchBucketList:
        'Не удалось получить список бакетов. Проверьте права доступа.',
      cannotFetchBackupList: 'Не удалось выгрузить список резервных копий.'
    }
  });
}
