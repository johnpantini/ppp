export default function (i18n) {
  i18n.extend({
    $serverPage: {
      serverNamePlaceholder: 'Мой сервер',
      connectorServiceHeader: 'Сервис-соединитель',
      connectorServiceDescription: 'Будет использован для доступа к серверу по SSH.',
      hostnameHeader: 'Адрес',
      hostnameDescription: 'Укажите имя хоста или IP-адрес сервера.',
      portHeader: 'Порт',
      portDescription: 'Укажите SSH-порт сервера.',
      usernameHeader: 'Имя пользователя',
      authTypeHeader: 'Тип авторизации',
      authByPassword: 'По паролю',
      authByKey: 'По приватному ключу',
      keyOrPasswordHeader: 'Ключ или пароль',
      keyOrPasswordDescription: 'Данные сохраняются в зашифрованном виде.',
      enterPassword: 'Введите пароль',
      enterKey: 'Введите ключ',
      loadFromFile: 'Загрузить из файла',
      preCommandsHeader: 'Команды, выполняемые до основной настройки',
      preCommandsDescription:
        'Произвольные команды, которые можно использовать в отладочных целях. Не сохраняются в базе данных.',
      domainListHeader: 'Список доменов',
      domainListDescription: 'Домены, привязанные к серверу.',
      addDomains: 'Добавить домены',
      domainColumn: 'Домен',
      actionsColumn: 'Действия',
      domainRemovalTitle: 'Удаление домена',
      confirmDomainRemoval:
        'Будет удалён домен «%{domain}». Подтвердите действие.',
      serverSetupFailed: 'Не удалось настроить сервер.'
    }
  });
}
