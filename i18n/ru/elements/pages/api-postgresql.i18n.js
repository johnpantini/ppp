export default function (i18n) {
  i18n.extend({
    $apiPostgresqlPage: {
      hostname: 'Хост для подключения',
      hostnameDescription: 'Доменное имя или IP-адрес.',
      database: 'База данных',
      databaseDescription: 'Название базы данных для подключения.',
      port: 'Порт',
      portDescription: 'Порт для подключения к базе данных.',
      user: 'Пользователь',
      userDescription: 'Имя пользователя для подключения к базе данных.',
      password: 'Пароль',
      passwordDescription:
        'Пароль для подключения к базе данных. Будет сохранён в зашифрованном виде.'
    }
  });
}
