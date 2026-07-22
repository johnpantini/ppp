export default function (i18n) {
  i18n.extend({
    $serviceSupabaseParserPage: {
      supabaseApiProfile: 'Профиль API Supabase',
      addSupabaseApi: 'Добавить API Supabase',
      pusherIntegration: 'Интеграция с Pusher',
      pusherIntegrationDescription:
        'Опциональная интеграция, позволяющая принимать сообщения от парсера в канал ppp платформы Pusher.',
      addPusherApi: 'Добавить API Pusher',
      resource: 'Ресурс',
      resourceDescription:
        'Произвольная ссылка, которая будет передана в код настройки через ключ url. Для автоматического заполнения используйте шаблоны:',
      selectTemplate: 'Выберите шаблон',
      theflyNews: 'Новости TheFly',
      clickToSelectService: 'Нажмите, чтобы выбрать сервис',
      insertUrlByTemplate: 'Вставить ссылку по шаблону',
      frame: 'Фрейм',
      frameDescription:
        'Произвольная ссылка, которая будет вставлена в iframe на странице сервиса.',
      pollingInterval: 'Интервал опроса',
      pollingIntervalDescription: 'Периодичность парсинга. Задаётся в секундах.',
      storageDepth: 'Глубина хранения',
      storageDepthDescription:
        'Максимальное количество записей для хранения в базе данных.',
      parsingFunction: 'Функция парсинга',
      parsingFunctionDescription:
        'Тело функции на языке PLV8, возвращающей массив элементов на каждой итерации парсинга.',
      callFunction: 'Выполнить функцию',
      versioning: 'Версионирование',
      versioningDescription:
        'Включите настройку, чтобы отслеживать версию сервиса и предлагать обновления.',
      trackVersionByFile: 'Отслеживать версию сервиса по этому файлу:',
      enterLink: 'Введите ссылку',
      predefinedTemplates: 'Шаблоны готовых сервисов',
      predefinedTemplatesDescription:
        'Воспользуйтесь шаблонами готовых сервисов для их быстрой настройки.',
      defaultTemplate: 'По умолчанию',
      fillOutFormsWithTemplate: 'Заполнить формы по этому шаблону',
      tableSchema: 'Поля таблицы состояния',
      tableSchemaDescription:
        'Поля таблицы для хранения обработанных записей. Будут размещены внутри выражения CREATE TABLE. Их можно задать только на этапе создания или после удаления сервиса.',
      constsData: 'Статические данные',
      constsDataDescription:
        'Тело функции на языке PLV8, возвращающей словари и прочие неизменяемые данные, настраиваемые единоразово во время сохранения сервиса.',
      insertTrigger: 'Добавление записи',
      insertTriggerDescription:
        'Произвольный код на языке PLV8, который будет исполнен при добавлении записи в таблицу состояния.',
      deleteTrigger: 'Удаление записи',
      deleteTriggerDescription:
        'Произвольный код на языке PLV8, который будет исполнен при удалении записи из таблицы состояния.',
      alsoSendToTelegram: 'Также отправлять уведомления в Telegram',
      bot: 'Бот',
      botDescription:
        'Будет использован для публикации сообщений при парсинге новых записей. Должен обладать соответствующими правами в канале/группе.',
      addBot: 'Добавить бота',
      channelOrGroup: 'Канал или группа',
      channelOrGroupDescription:
        'Идентификатор канала или группы, куда будут отправляться уведомления о торговых паузах.',
      notificationFormatting: 'Форматирование уведомлений',
      notificationFormattingDescription:
        'Логика форматирования итогового сообщения в Telegram на языке PLV8. Тестовое сообщение использует первый элемент данных, полученный от функции парсинга.',
      sendTestMessage: 'Отправить тестовое сообщение',
      saveToPPPAndUpdateInSupabase: 'Сохранить в PPP и обновить в Supabase',
      functionExecutedSeeConsole:
        'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.',
      couldNotLoadTemplateFile: 'Не удалось загрузить файл с шаблоном.',
      templateLoaded: 'Шаблон «%{name}» успешно загружен.',
      invalidUrl: 'Неверный URL',
      parsingResultNotSuitable:
        'Функция парсинга вернула результат, который не пригоден для форматирования.',
      messageSent: 'Сообщение отправлено.'
    }
  });
}
