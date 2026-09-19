export default function (i18n) {
  i18n.extend({
    $serviceDeployedPppAspirantPage: {
      serviceUrl: 'URL сервиса',
      serviceUrlDescription: 'Ссылка на работающий сервис Aspirant.',
      dockerHint:
        'Для запуска локального Aspirant в Docker выберите профиль API Redis ниже, чтобы сформировать команду.',
      chooseRedisProfile: 'Выберите профиль Redis',
      doNotCheckUrl: 'Не проверять адрес запросами',
      checkAndSaveToPPP: 'Проверить и сохранить в PPP',
      urlCannotBeUsed: 'Указанный URL не может быть использован'
    }
  });
}
