export default function (i18n) {
  i18n.extend({
    $apiSupabasePage: {
      projectUrl: 'URL проекта',
      projectUrlDescription:
        'Можно найти в панели управления проектом Supabase в подразделе API раздела Settings. Смотрите секцию Config, поле URL.',
      projectKey: 'Ключ проекта',
      projectKeyDescription:
        'Можно найти в панели управления проектом Supabase в подразделе API раздела Settings. Смотрите секцию Project API keys, поле anon public. Будет сохранён в зашифрованном виде.',
      database: 'База данных',
      databaseDescription: 'Название базы данных для подключения.',
      host: 'Хост',
      hostDescription: 'Хост для подключения к базе данных.',
      port: 'Порт',
      portDescription: 'Порт для подключения к базе данных.',
      user: 'Пользователь',
      userDescription: 'Имя пользователя для подключения к базе данных.',
      password: 'Пароль',
      passwordDescription:
        'Пароль для подключения к базе данных. Будет сохранён в зашифрованном виде.',
      connectorService: 'Сервис-соединитель',
      connectorServiceDescription:
        'Будет использован для совершения HTTP-запросов к Redis.',
      invalidProjectKey: 'Неверный ключ проекта',
      invalidUserOrPassword: 'Неверный пользователь или пароль'
    }
  });
}
