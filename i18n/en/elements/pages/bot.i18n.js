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
      webhookSecretHeader: 'Webhook secret',
      webhookSecretDescription:
        'Will be stored encrypted and passed to Telegram as secret_token when the webhook is set. Telegram sends it back in the X-Telegram-Bot-Api-Secret-Token header, and the service rejects requests that do not match. Letters, digits, _ and - are allowed, up to 256 characters. Leave empty to use no secret.',
      generateWebhookSecret: 'Generate',
      invalidWebhookSecret:
        'Only letters, digits, _ and - are allowed, 1 to 256 characters',
      webhookSetError: 'Failed to set the webhook.',
      webhookDeleteError: 'Failed to delete the webhook.'
    }
  });
}
