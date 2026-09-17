export default function (i18n) {
  i18n.extend({
    $botPage: {
      botNameHeader: 'Название бота',
      botTokenHeader: 'Токен бота',
      botTokenDescription: 'Будет сохранён в зашифрованном виде. Получить можно у',
      botTokenDescriptionSuffix: '- отправьте ему команду /newbot',
      webhookDescription:
        'Укажите webhook для привязки к боту. Чтобы удалить webhook, оставьте поле пустым.',
      invalidOrIncompleteUrl: 'Неверный или неполный URL',
      webhookSecretHeader: 'Секрет webhook',
      webhookSecretDescription:
        'Будет сохранён в зашифрованном виде и передан Telegram как secret_token при установке webhook. Telegram присылает его в заголовке X-Telegram-Bot-Api-Secret-Token, а сервис отвергает запросы без совпадения. Допустимы латинские буквы, цифры, _ и -, до 256 символов. Оставьте пустым, чтобы не использовать секрет.',
      generateWebhookSecret: 'Сгенерировать',
      invalidWebhookSecret:
        'Допустимы только латинские буквы, цифры, _ и -, от 1 до 256 символов',
      webhookSetError: 'Ошибка установки webhook.',
      webhookDeleteError: 'Ошибка удаления webhook.'
    }
  });
}
