export default function (i18n) {
  i18n.extend({
    $botPage: {
      botNameHeader: 'Bot name',
      botTokenHeader: 'Bot token',
      botTokenDescription: 'Will be stored encrypted. You can get one from',
      botTokenDescriptionSuffix: '- send it the /newbot command',
      webhookDescription:
        'Specify a webhook to bind to the bot. To remove the webhook, leave the field empty.',
      invalidOrIncompleteUrl: 'Invalid or incomplete URL',
      webhookSetError: 'Failed to set the webhook.',
      webhookDeleteError: 'Failed to delete the webhook.'
    }
  });
}
