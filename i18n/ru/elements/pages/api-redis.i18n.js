export default function (i18n) {
  i18n.extend({
    $apiRedisPage: {
      host: 'Хост',
      hostDescription: 'Хост для подключения.',
      enterAddress: 'Введите адрес',
      secureConnection: 'Защищённое соединение',
      port: 'Порт',
      portDescription: 'Порт для подключения.',
      database: 'База данных',
      databaseDescription: 'Индекс базы данных Redis для подключения.',
      username: 'Имя пользователя',
      usernameDescription: 'Имя пользователя для подключения.',
      password: 'Пароль',
      passwordDescription: 'Пароль Redis.',
      upstashZeroDbOnly:
        'Upstash поддерживает только базу данных с нулевым индексом'
    }
  });
}
