export default function (i18n) {
  i18n.extend({
    $backupMongodbModalPage: {
      s3ApiDescription:
        'API, который будет использован для выгрузки резервной копии в облачное хранилище.',
      saveBackupToDisk: 'Сохранить копию на диск',
      saveBackupToS3: 'Сохранить копию в S3',
      cannotFetchBucketList:
        'Не удалось получить список бакетов. Проверьте права доступа.',
      cannotCreateBackupsBucket:
        'Не удалось создать бакет для резервных копий.',
      cannotUploadBackup:
        'Не удалось загрузить резервную копию в облачное хранилище.',
      backupSaved: 'Копия базы данных успешно сохранена.',
      backupCreationTitle: 'Создание резервной копии'
    }
  });
}
