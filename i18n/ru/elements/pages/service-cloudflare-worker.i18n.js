export default function (i18n) {
  i18n.extend({
    $serviceCloudflareWorkerPage: {
      globalLinkBanner: 'Глобальная ссылка сервиса в Cloudflare:',
      cloudflareApiProfile: 'Профиль Cloudflare API',
      cloudflareApiProfileDescription:
        'Необходим для авторизации, нельзя изменить после создания.',
      addCloudflareApi: 'Добавить API Cloudflare',
      serviceImplementation: 'Реализация сервиса',
      serviceImplementationDescription: 'Код Cloudflare Worker.',
      versioning: 'Версионирование',
      versioningDescription:
        'Включите настройку, чтобы отслеживать версию сервиса и предлагать обновления.',
      trackVersionByFile: 'Отслеживать версию сервиса по этому файлу:',
      enterUrlPlaceholder: 'Введите ссылку',
      predefinedTemplates: 'Шаблоны готовых сервисов',
      predefinedTemplatesDescription:
        'Воспользуйтесь шаблонами готовых сервисов для их быстрой настройки.',
      customTemplate: 'По файлу отслеживания',
      defaultTemplate: 'Тестовый пример',
      tradingviewTemplate: 'Прокси для ru.tradingview.com',
      theflyTemplate: 'Прокси для thefly.com',
      psinaPusherTemplate: 'Интеграция Pusher и Psina',
      psinaUsNewsBodyExtractionTemplate:
        'Новости (Psina) - содержимое из AstraDB',
      choosePusherApi: 'Выберите профиль API Pusher',
      chooseAstraDbApi: 'Выберите профиль API AstraDB',
      doNotFillEnvVars: 'Не заполнять переменные окружения',
      fillFormsWithTemplate: 'Заполнить формы по этому шаблону',
      envVars: 'Переменные окружения',
      envVarsDescription:
        'Объект JavaScript с переменными окружения, которые будут переданы в Worker.',
      secretEnvVars: 'Шифруемые переменные окружения',
      secretEnvVarsDescription:
        'Объект JavaScript с переменными окружения, которые будут переданы в Worker в исходном виде, но сохранены в базе данных в зашифрованном.',
      saveAndUpdateInCloudflare: 'Сохранить в PPP и обновить в Cloudflare',
      cannotLoadTemplateFile: 'Не удалось загрузить файл с шаблоном.',
      templateLoaded: 'Шаблон «%{template}» успешно загружен.',
      invalidUrl: 'Неверный URL',
      cannotReadSubdomain: 'Ошибка чтения поддомена Cloudflare Workers.',
      subdomainNotConfigured:
        'В сервисе Cloudflare Workers не настроен поддомен',
      codeContainsErrors: 'Код содержит ошибки',
      cannotDeployWorker: 'Не удалось развернуть сервис в Cloudflare.',
      cannotEnableSubdomain:
        'Не удалось активировать поддомен *.dev для сервиса в Cloudflare.'
    }
  });
}
