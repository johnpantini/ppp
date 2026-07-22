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
      webhookSetError: 'Ошибка установки webhook.',
      webhookDeleteError: 'Ошибка удаления webhook.'
    }
  });
}
