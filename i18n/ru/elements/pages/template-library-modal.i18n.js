export default function (i18n) {
  i18n.extend({
    $templateLibraryModalPage: {
      template: 'Шаблон',
      hints: {
        formatter: 'Форматирование сообщений',
        history: 'Загрузка исторических данных'
      },
      psinaUsNews: 'Новости (Psina, US)',
      psinaUsStatuses: 'Торговые статусы (Psina, US)',
      sourceService: 'Сервис-источник',
      selectNewsSourceService: 'Выберите сервис источника новостей.',
      newsBodyExtractionService: 'Сервис извлечения содержимого новостей',
      newsBodyExtractionServiceDescription:
        'Создайте Cloudflare Worker по шаблону. Понадобится, если нужен GPT-пересказ сообщений.',
      yandexOauthToken: 'Токен Yandex OAuth',
      yandexOauthTokenDescription:
        'Понадобится, если нужен GPT-пересказ сообщений.',
      selectStatusesSourceService: 'Выберите сервис источника статусов.',
      insertTemplateCode: 'Вставить код по шаблону'
    }
  });
}
