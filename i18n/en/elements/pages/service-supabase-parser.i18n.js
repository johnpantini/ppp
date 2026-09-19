export default function (i18n) {
  i18n.extend({
    $serviceSupabaseParserPage: {
      supabaseApiProfile: 'Supabase API profile',
      addSupabaseApi: 'Add a Supabase API',
      pusherIntegration: 'Pusher integration',
      pusherIntegrationDescription:
        'An optional integration that allows receiving parser messages in the ppp channel of the Pusher platform.',
      addPusherApi: 'Add a Pusher API',
      resource: 'Resource',
      resourceDescription:
        'An arbitrary link that will be passed to the setup code via the url key. Use the templates to fill it in automatically:',
      selectTemplate: 'Select a template',
      theflyNews: 'TheFly news',
      clickToSelectService: 'Click to select a service',
      insertUrlByTemplate: 'Insert a link from the template',
      frame: 'Frame',
      frameDescription:
        'An arbitrary link that will be embedded as an iframe on the service page.',
      pollingInterval: 'Polling interval',
      pollingIntervalDescription: 'Parsing frequency. Specified in seconds.',
      storageDepth: 'Storage depth',
      storageDepthDescription:
        'The maximum number of records to keep in the database.',
      parsingFunction: 'Parsing function',
      parsingFunctionDescription:
        'The body of a PLV8 function that returns an array of items on each parsing iteration.',
      callFunction: 'Run the function',
      versioning: 'Versioning',
      versioningDescription:
        'Enable this option to track the service version and receive update suggestions.',
      trackVersionByFile: 'Track the service version using this file:',
      enterLink: 'Enter a link',
      predefinedTemplates: 'Predefined service templates',
      predefinedTemplatesDescription:
        'Use predefined service templates to set services up quickly.',
      defaultTemplate: 'Default',
      fillOutFormsWithTemplate: 'Fill out the forms with this template',
      tableSchema: 'State table fields',
      tableSchemaDescription:
        'The table fields for storing processed records. They will be placed inside the CREATE TABLE statement. They can only be set when the service is created or after it has been removed.',
      constsData: 'Static data',
      constsDataDescription:
        'The body of a PLV8 function that returns dictionaries and other immutable data, configured once when the service is saved.',
      insertTrigger: 'Record insertion',
      insertTriggerDescription:
        'Arbitrary PLV8 code that will be executed when a record is inserted into the state table.',
      deleteTrigger: 'Record removal',
      deleteTriggerDescription:
        'Arbitrary PLV8 code that will be executed when a record is removed from the state table.',
      alsoSendToTelegram: 'Also send notifications to Telegram',
      bot: 'Bot',
      botDescription:
        'Will be used to publish messages when new records are parsed. Must have the appropriate permissions in the channel or group.',
      addBot: 'Add a bot',
      channelOrGroup: 'Channel or group',
      channelOrGroupDescription:
        'The ID of the channel or group where trading halt notifications will be sent.',
      notificationFormatting: 'Notification formatting',
      notificationFormattingDescription:
        'The logic for formatting the resulting Telegram message, written in PLV8. The test message uses the first data item returned by the parsing function.',
      sendTestMessage: 'Send a test message',
      saveToPPPAndUpdateInSupabase: 'Save to PPP and update in Supabase',
      functionExecutedSeeConsole:
        'The database executed the function successfully. See the result in the browser console.',
      couldNotLoadTemplateFile: 'Failed to load the template file.',
      templateLoaded: 'The «%{name}» template has been loaded.',
      invalidUrl: 'Invalid URL',
      parsingResultNotSuitable:
        'The parsing function returned a result that is not suitable for formatting.',
      messageSent: 'The message has been sent.'
    }
  });
}
