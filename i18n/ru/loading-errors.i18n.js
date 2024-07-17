export default function (i18n) {
  i18n.extend({
    $loadingErrors: {
      E_NO_PROXY_CONNECTION: 'Нет связи с прокси',
      E_NO_MONGODB_CONNECTION: 'Нет связи с альтернативной базой данных',
      E_BROKEN_ATLAS_REALM_LINK:
        'Отсутствует связь между базой данных и приложением MongoDB',
      E_OFFLINE_REALM:
        'Приложение MongoDB не в сети или отключено за неактивность',
      E_CLOUD_SERVICES_MISCONFIGURATION_PLEASE_WAIT:
        'Сбой настройки облачных сервисов, пожалуйста, подождите...',
      E_UNKNOWN: 'Ошибка загрузки. Подробности в консоли браузера'
    }
  });
}
