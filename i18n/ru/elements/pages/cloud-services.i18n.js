export default function (i18n) {
  i18n.extend({
    $cloudServicesPage: {
      version: 'Версия %{version}',
      backupDatabase: 'Создать резервную копию базы',
      restoreDatabase: 'Восстановить базу из копии',
      importKeys: 'Импортировать ключи',
      importKeysTitle: 'Импорт ключей',
      importKeysDescription:
        'Чтобы импортировать ключи, приготовьте мастер-пароль и компактное представление из ранее настроенного приложения.',
      compactRepresentationBanner:
        'Чтобы перенести ключи в другой браузер, используйте это компактное представление:',
      saveAgainPrefix: 'Сохраните ещё раз или',
      importLink: 'импортируйте',
      saveAgainSuffix:
        'ключи облачных сервисов, чтобы пользоваться приложением.',
      masterPassword: 'Мастер-пароль',
      masterPasswordDescription:
        'Требуется для шифрования/дешифрования конфиденциальных данных: токенов, ключей, других паролей.',
      masterPasswordBanner:
        'Мастер-пароль следует задать только при первой настройке приложения!',
      enterPasswordPlaceholder: 'Введите пароль',
      repeatMasterPasswordPlaceholder: 'Введите мастер-пароль ещё раз',
      passwordConfirmation: 'Подтверждение пароля',
      proxyResource: 'Прокси-ресурс',
      proxyDescriptionPrefix:
        'Используется для совершения запросов к внешним API и сервисам. Рекомендуется создать по',
      instructionsLink: 'инструкции',
      proxyDescriptionInfix: 'на платформе',
      personalGitHubToken: 'Персональный токен GitHub',
      tokenLink: 'Токен',
      gitHubTokenDescriptionSuffix: 'необходим для получения обновлений.',
      mongoDbGateway: 'Шлюз доступа к MongoDB',
      mongoDbGatewayDescription:
        'Ссылка на шлюз для подключения к кластеру MongoDB.',
      mongoDbConnection: 'Подключение к базе данных MongoDB',
      mongoDbConnectionDescription: 'Ссылка на кластер MongoDB.',
      clearPasswordAndKeys: 'Очистить пароль и ключи',
      checkAndSaveKeys: 'Проверить и сохранить ключи',
      enterAllKeysAndMasterPassword: 'Нужно ввести все ключи и мастер-пароль.',
      generatingCompactRepresentation:
        'Генерация компактного представления...',
      compactRepresentationError:
        'Ошибка генерации компактного представления.',
      saveDatabaseTitle: 'Сохранить базу данных',
      backupCreationTitle: 'Создание резервной копии',
      restoreDatabaseTitle: 'Восстановить базу данных',
      backupRestoreTitle: 'Восстановление резервной копии',
      passwordsDoNotMatch: 'Пароли не совпадают',
      checkingProxy: 'Проверка прокси-ресурса...',
      resourceCannotBeProxy:
        'Этот ресурс не может быть использован в качестве прокси',
      checkingGitHubToken: 'Проверка токена GitHub...',
      invalidOrExpiredToken: 'Неверный или истёкший токен',
      checkingMongoDbGateway: 'Проверка шлюза доступа к MongoDB...',
      gatewayRequestFailed: 'Запрос к шлюзу завершился с ошибкой',
      checkingMongoDbConnection: 'Проверка подключения к MongoDB...',
      mongoDbRequestFailed: 'Запрос к MongoDB завершился с ошибкой',
      operationDoneRefreshPage:
        'Операция успешно выполнена. Обновите страницу, чтобы пользоваться приложением.',
      keysCleanupTitle: 'Очистка пароля и ключей',
      confirmKeysCleanup:
        'Мастер-пароль и все ключи облачных сервисов будут удалены из хранилища браузера. Подтвердите действие.'
    }
  });
}
