export default function (i18n) {
  i18n.extend({
    $templateLibraryModalPage: {
      template: 'Template',
      hints: {
        formatter: 'Message formatting',
        history: 'Historical data loading'
      },
      psinaUsNews: 'News (Psina, US)',
      psinaUsStatuses: 'Trading statuses (Psina, US)',
      sourceService: 'Source service',
      selectNewsSourceService: 'Choose the news source service.',
      newsBodyExtractionService: 'News body extraction service',
      newsBodyExtractionServiceDescription:
        'Create a Cloudflare Worker from a template. It is needed if you want GPT summaries of messages.',
      yandexOauthToken: 'Yandex OAuth token',
      yandexOauthTokenDescription:
        'It is needed if you want GPT summaries of messages.',
      selectStatusesSourceService: 'Choose the statuses source service.',
      insertTemplateCode: 'Insert template code'
    }
  });
}
