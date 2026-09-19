export default function (i18n) {
  i18n.extend({
    $servicePppAspirantWorkerPage: {
      showServiceInNomad: 'Show the service in Nomad',
      showLogs: 'Show logs',
      globalServiceLink: 'Global service link:',
      stdoutDescription: 'Standard output stream.',
      stderrDescription: 'Standard error stream.',
      debugNamespaces: 'Debug namespaces',
      debugNamespacesDescription:
        'Comma-separated. The "-" prefix disables a namespace. Use * to enable all debug messages.',
      disableDebugMessages: 'Disable debug messages',
      saveDebugNamespaces: 'Save the namespaces',
      serviceDescription: 'Service description',
      serviceDescriptionNotes: 'Any notes about the service.',
      serviceType: 'Service type',
      serviceTypeDescription:
        'The service can be deployed in Aspirant, or you can provide the URL of one already set up externally.',
      setUpInAspirant: 'Set up in Aspirant',
      specifyUrl: 'Specify a URL',
      aspirantService: 'Aspirant service',
      aspirantServiceDescription:
        'The Aspirant that will run the Worker. It can be selected when the service is created or after it has been removed.',
      ycApiDescription:
        'The API that will be used to upload the service files to cloud storage.',
      addYcApi: 'Add a Yandex Cloud API',
      entryPoint: 'Entry point',
      entryPointDescription: 'JavaScript code or other content to execute.',
      launchParameters: 'Launch parameters',
      launchParametersDescription:
        'You can override the command and arguments used to start the service. $PPP_WORKER_ID and $PPP_WORKER_PATH are available in the arguments.',
      enableHttpDescription:
        'If network access is enabled, the parent Aspirant service will proxy traffic to this service at the relative link',
      enableHttp: 'Enable network access',
      extraFiles: 'Additional files',
      extraFilesDescription:
        'Links to additional files that will be placed in the service file system relative to the entry point file.',
      relativePath: 'Relative path',
      addFile: 'Add a file',
      versioning: 'Versioning',
      versioningDescription:
        'Enable this option to track the service version and receive update suggestions.',
      trackVersionByFile: 'Track the service version using this file:',
      enterLink: 'Enter a link',
      predefinedTemplates: 'Predefined service templates',
      predefinedTemplatesDescription:
        'Use predefined service templates to set services up quickly.',
      templateByWatchedFile: 'By the watched file',
      templateNone: 'No template',
      templateDefault: 'Test example',
      templateUtexAlpaca: 'Alpaca-compatible UTEX API',
      templateIbGateway: 'TWS API gateway',
      templatePpf: 'MongoDB Realm gateway',
      templateConnectors: 'Connectors',
      templateTraderRuntime: 'Trader runtime',
      templatePsinaUsNews: 'News feed (Psina, US)',
      selectPsinaBroker: 'Select a Psina profile',
      selectPusherApi: 'Select a Pusher API profile',
      selectAstraDbApi: 'Select an AstraDB API profile',
      doNotFillEnvVars: 'Do not fill in environment variables',
      fillOutFormsWithTemplate: 'Fill out the forms with this template',
      environmentVariables: 'Environment variables',
      environmentVariablesDescription:
        'A JavaScript object with environment variables that will be passed to the Worker.',
      secretEnvironmentVariables: 'Encrypted environment variables',
      secretEnvironmentVariablesDescription:
        'A JavaScript object with environment variables that will be passed to the Worker as is, but stored encrypted in the database.',
      serviceTemplate: 'Service template',
      serviceTemplateDescription:
        'The template is used for filtering in drop-down lists.',
      serviceUrl: 'Service URL',
      serviceUrlDescription:
        'Provide the URL of a service that has already been set up outside the app.',
      saveToPPPAndUpdateInAspirant: 'Save to PPP and update in Aspirant',
      northflankServiceLinkFailed:
        'Failed to get the service link in the Northflank cloud.',
      debugNotSupported: 'The service does not support this feature.',
      allocationListFailed: 'Failed to get the allocation list.',
      streamReadError: 'Error reading the %{stream} stream.',
      couldNotLoadTemplateFile: 'Failed to load the template file.',
      templateLoaded: 'The «%{name}» template has been loaded.',
      invalidUrl: 'Invalid URL',
      noAspirantConnection: 'No connection to the parent Aspirant service.',
      noAspirantConnectionError: 'No connection to the parent Aspirant service',
      invalidServiceResponse: 'Invalid service response',
      codeContainsErrors: 'The code contains errors',
      couldNotLoadFile: 'Failed to load the file',
      bucketListFailed:
        'Failed to get the bucket list. Check your access permissions.',
      bucketCreationFailed: 'Failed to create a bucket for the service files.',
      uploadToStorageFailed:
        'Failed to upload the service files to cloud storage.',
      scheduleFailed: 'Failed to schedule the service for execution.',
      noServiceArchive: 'The archive with the service files is missing.',
      deleteFromStorageFailed:
        'Failed to delete the service files from cloud storage. Removal aborted.',
      stopFailed: 'Failed to stop (remove) the service.',
      restartFailed: 'Failed to restart the service.'
    }
  });
}
