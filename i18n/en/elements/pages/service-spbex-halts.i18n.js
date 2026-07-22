export default function (i18n) {
  i18n.extend({
    $serviceSpbexHaltsPage: {
      supabaseApiProfile: 'Supabase API profile',
      addSupabaseApi: 'Add a Supabase API',
      baseUrl: 'Base URL',
      baseUrlDescription:
        'A link to the base exchange resource. It can be a proxy server address.',
      pusherIntegration: 'Pusher integration',
      pusherIntegrationDescription:
        'An optional integration that allows receiving parser messages in the ppp channel of the Pusher platform.',
      addPusherApi: 'Add a Pusher API',
      pollingInterval: 'Polling interval',
      pollingIntervalDescription:
        'How often to check for new trading halt messages from the exchange. Specified in seconds.',
      storageDepth: 'Storage depth',
      storageDepthDescription:
        'The maximum number of records to keep in the database.',
      bot: 'Bot',
      botDescription:
        'Will be used to publish trading halt messages. Must have the appropriate permissions in the channel or group.',
      channelOrGroup: 'Channel or group',
      channelOrGroupDescription:
        'The ID of the channel or group where trading halt notifications will be sent.',
      notificationFormatting: 'Notification formatting',
      notificationFormattingDescription:
        'The logic for formatting the resulting Telegram message, written in PLV8.',
      sendTestMessage: 'Send a test message',
      saveToPPPAndUpdateInSupabase: 'Save to PPP and update in Supabase'
    }
  });
}
