export default function (i18n) {
  i18n.extend({
    $serviceCloudPppAspirantPage: {
      redisStorage: 'Хранилище Redis',
      redisStorageDescription: 'Персистентность для сервиса.',
      addRedisApi: 'Добавить API Redis',
      cloudProviderApiProfile: 'Профиль API облачного провайдера',
      cloudProviderApiDescription:
        'Northflank или Render. Можно выбрать только на этапе создания или после удаления сервиса.',
      northflankBanner:
        'Northflank: должен быть заранее создан проект под названием ppp в облаке.',
      renderBannerBeforeSuffix:
        'Render: создайте пустой сервис (тип Docker) с именем aspirant-',
      renderBannerSuffixWord: 'суффикс',
      renderBannerAfterSuffix: '. Суффикс сгенерируйте ниже.',
      addNorthflankApi: 'Добавить API Northflank',
      addRenderApi: 'Добавить API Render',
      slugHeader: 'Суффикс сервиса в облачном провайдере (11 символов)',
      slugDescription:
        'Это значение должно быть уникальным и конфиденциальным. Его можно задать только при создании или после удаления сервиса.',
      slugPlaceholder: 'Сгенерируйте уникальное значение кнопкой',
      generateSlug: 'Сгенерировать уникальное значение',
      saveAndDeployToCloud: 'Сохранить в PPP и развернуть в облаке',
      slugLengthError: 'Значение должно содержать 11 символов',
      slugCharsError: 'Допустимы только цифры и латинские буквы',
      cannotFetchRenderServices:
        'Не удалось получить список сервисов в облаке Render. Операция не может быть выполнена.',
      serviceNotFoundInRender:
        'Сервис %{serviceName} не найден в облаке Render. Создайте его перед тем, как сохранять в PPP.',
      cannotFetchNorthflankProjects:
        'Не удалось получить список проектов Northflank.',
      pppProjectNotFoundInNorthflank:
        'Проект под названием ppp не найден в облаке Northflank.',
      cannotCreateAspirantService:
        'Не удалось создать сервис Aspirant, подробности в консоли браузера.',
      cannotUpdateRenderEnvVars:
        'Не удалось обновить переменные окружения сервиса в облаке Render.',
      cannotUpdateRenderService:
        'Не удалось обновить сервис Aspirant в облаке Render, подробности в консоли браузера.',
      cannotDeployRenderService:
        'Не удалось развернуть сервис Aspirant в облаке Render.',
      cannotRestartNorthflankService:
        'Не удалось перезапустить сервис в облаке Northflank.',
      cannotRestartRenderService:
        'Не удалось перезапустить сервис в облаке Render.',
      cannotStopNorthflankService:
        'Не удалось остановить сервис в облаке Northflank.',
      cannotStopRenderService: 'Не удалось остановить сервис в облаке Render.',
      cannotRemoveNorthflankService:
        'Не удалось полностью удалить сервис. Удалите его вручную в панели управления Northflank.',
      cannotRemoveRenderService:
        'Не удалось полностью удалить сервис. Удалите его вручную в панели управления Render.'
    }
  });
}
