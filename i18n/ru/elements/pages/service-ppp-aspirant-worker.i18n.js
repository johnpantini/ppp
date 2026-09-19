export default function (i18n) {
  i18n.extend({
    $servicePppAspirantWorkerPage: {
      showServiceInNomad: 'Показать сервис в Nomad',
      showLogs: 'Показать логи',
      globalServiceLink: 'Глобальная ссылка сервиса:',
      stdoutDescription: 'Поток стандартного вывода.',
      stderrDescription: 'Поток стандартного вывода ошибок.',
      debugNamespaces: 'Отладочные пространства имён',
      debugNamespacesDescription:
        'Задаются через запятую. Префикс "-" отключает пространство имён. Используйте *, чтобы включить все отладочные сообщения.',
      disableDebugMessages: 'Отключить отладочные сообщения',
      saveDebugNamespaces: 'Сохранить пространства имён',
      serviceDescription: 'Описание сервиса',
      serviceDescriptionNotes: 'Любые заметки о сервисе.',
      serviceType: 'Тип сервиса',
      serviceTypeDescription:
        'Сервис можно развернуть в Aspirant, а можно сразу указать URL уже настроенного извне.',
      setUpInAspirant: 'Настроить в Aspirant',
      specifyUrl: 'Указать URL',
      aspirantService: 'Сервис Aspirant',
      aspirantServiceDescription:
        'Aspirant, на котором будет запущен Worker. Можно выбрать при создании или после удаления сервиса.',
      ycApiDescription:
        'API, который будет использован для выгрузки файлов сервиса в облачное хранилище.',
      addYcApi: 'Добавить API Yandex Cloud',
      entryPoint: 'Точка входа',
      entryPointDescription:
        'Код JavaScript или другое содержимое для исполнения.',
      launchParameters: 'Параметры запуска',
      launchParametersDescription:
        'Можно переопределить команду и аргументы на запуск сервиса. В аргументах доступны $PPP_WORKER_ID и $PPP_WORKER_PATH.',
      enableHttpDescription:
        'Если включить сетевой доступ, родительский сервис Aspirant обеспечит проксирование трафика к текущему сервису по относительной ссылке',
      enableHttp: 'Включить сетевой доступ',
      extraFiles: 'Дополнительные файлы',
      extraFilesDescription:
        'Ссылки на дополнительные файлы, которые будут размещены в файловой системе сервиса относительно файла точки входа.',
      relativePath: 'Относительный путь',
      addFile: 'Добавить файл',
      versioning: 'Версионирование',
      versioningDescription:
        'Включите настройку, чтобы отслеживать версию сервиса и предлагать обновления.',
      trackVersionByFile: 'Отслеживать версию сервиса по этому файлу:',
      enterLink: 'Введите ссылку',
      predefinedTemplates: 'Шаблоны готовых сервисов',
      predefinedTemplatesDescription:
        'Воспользуйтесь шаблонами готовых сервисов для их быстрой настройки.',
      templateByWatchedFile: 'По файлу отслеживания',
      templateNone: 'Без шаблона',
      templateDefault: 'Тестовый пример',
      templateUtexAlpaca: 'Alpaca-совместимый API UTEX',
      templateIbGateway: 'Шлюз TWS API',
      templatePpf: 'Шлюз MongoDB Realm',
      templateConnectors: 'Соединители',
      templateTraderRuntime: 'Среда выполнения трейдеров',
      templatePsinaUsNews: 'Новостной источник (Psina, US)',
      selectPsinaBroker: 'Выберите профиль Psina',
      selectPusherApi: 'Выберите профиль API Pusher',
      selectAstraDbApi: 'Выберите профиль API AstraDB',
      doNotFillEnvVars: 'Не заполнять переменные окружения',
      fillOutFormsWithTemplate: 'Заполнить формы по этому шаблону',
      environmentVariables: 'Переменные окружения',
      environmentVariablesDescription:
        'Объект JavaScript с переменными окружения, которые будут переданы в Worker.',
      secretEnvironmentVariables: 'Шифруемые переменные окружения',
      secretEnvironmentVariablesDescription:
        'Объект JavaScript с переменными окружения, которые будут переданы в Worker в исходном виде, но сохранены в базе данных в зашифрованном.',
      serviceTemplate: 'Шаблон сервиса',
      serviceTemplateDescription:
        'Шаблон используется для фильтрации в выпадающих списках.',
      serviceUrl: 'URL сервиса',
      serviceUrlDescription:
        'Укажите URL сервиса, который уже настроен извне приложения.',
      saveToPPPAndUpdateInAspirant: 'Сохранить в PPP и обновить в Aspirant',
      northflankServiceLinkFailed:
        'Не удалось получить ссылку на сервис в облаке Northflank.',
      debugNotSupported: 'Сервис не поддерживает эту функцию.',
      allocationListFailed: 'Не удалось получить список размещений.',
      streamReadError: 'Ошибка чтения потока %{stream}.',
      couldNotLoadTemplateFile: 'Не удалось загрузить файл с шаблоном.',
      templateLoaded: 'Шаблон «%{name}» успешно загружен.',
      invalidUrl: 'Неверный URL',
      noAspirantConnection: 'Нет связи с родительским сервисом Aspirant.',
      noAspirantConnectionError: 'Нет связи с родительским сервисом Aspirant',
      invalidServiceResponse: 'Недопустимый ответ сервиса',
      codeContainsErrors: 'Код содержит ошибки',
      couldNotLoadFile: 'Не удалось загрузить файл',
      bucketListFailed:
        'Не удалось получить список бакетов. Проверьте права доступа.',
      bucketCreationFailed: 'Не удалось создать бакет для сервисных файлов.',
      uploadToStorageFailed:
        'Не удалось загрузить файлы сервиса в облачное хранилище.',
      scheduleFailed: 'Не удалось запланировать сервис на исполнение.',
      noServiceArchive: 'Отсутствует архив с файлами сервиса.',
      deleteFromStorageFailed:
        'Не удалось удалить файлы сервиса из облачного хранилища. Удаление прервано.',
      stopFailed: 'Не удалось остановить (удалить) сервис.',
      restartFailed: 'Не удалось перезапустить сервис.'
    }
  });
}
