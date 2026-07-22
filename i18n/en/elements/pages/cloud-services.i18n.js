export default function (i18n) {
  i18n.extend({
    $cloudServicesPage: {
      version: 'Version %{version}',
      backupDatabase: 'Back up the database',
      restoreDatabase: 'Restore the database from a backup',
      importKeys: 'Import keys',
      importKeysTitle: 'Key import',
      importKeysDescription:
        'To import keys, prepare the master password and the compact representation from a previously configured application.',
      compactRepresentationBanner:
        'To transfer the keys to another browser, use this compact representation:',
      saveAgainPrefix: 'Save again or',
      importLink: 'import',
      saveAgainSuffix: 'the cloud service keys to use the application.',
      masterPassword: 'Master password',
      masterPasswordDescription:
        'Required to encrypt/decrypt sensitive data: tokens, keys, other passwords.',
      masterPasswordBanner:
        'The master password should be set only during the initial application setup!',
      enterPasswordPlaceholder: 'Enter the password',
      repeatMasterPasswordPlaceholder: 'Enter the master password again',
      passwordConfirmation: 'Password confirmation',
      proxyResource: 'Proxy resource',
      proxyDescriptionPrefix:
        'Used to make requests to external APIs and services. It is recommended to create one following the',
      instructionsLink: 'instructions',
      proxyDescriptionInfix: 'on the',
      personalGitHubToken: 'Personal GitHub token',
      tokenLink: 'The token',
      gitHubTokenDescriptionSuffix: 'is required to receive updates.',
      mongoDbGateway: 'MongoDB access gateway',
      mongoDbGatewayDescription:
        'The gateway link used to connect to the MongoDB cluster.',
      mongoDbConnection: 'MongoDB database connection',
      mongoDbConnectionDescription: 'The MongoDB cluster link.',
      clearPasswordAndKeys: 'Clear the password and keys',
      checkAndSaveKeys: 'Check and save the keys',
      enterAllKeysAndMasterPassword:
        'All keys and the master password must be entered.',
      generatingCompactRepresentation:
        'Generating the compact representation...',
      compactRepresentationError:
        'Failed to generate the compact representation.',
      saveDatabaseTitle: 'Save the database',
      backupCreationTitle: 'Backup creation',
      restoreDatabaseTitle: 'Restore the database',
      backupRestoreTitle: 'Backup restore',
      passwordsDoNotMatch: 'The passwords do not match',
      checkingProxy: 'Checking the proxy resource...',
      resourceCannotBeProxy: 'This resource cannot be used as a proxy',
      checkingGitHubToken: 'Checking the GitHub token...',
      invalidOrExpiredToken: 'Invalid or expired token',
      checkingMongoDbGateway: 'Checking the MongoDB access gateway...',
      gatewayRequestFailed: 'The gateway request failed',
      checkingMongoDbConnection: 'Checking the MongoDB connection...',
      mongoDbRequestFailed: 'The MongoDB request failed',
      operationDoneRefreshPage:
        'Operation completed successfully. Reload the page to use the application.',
      keysCleanupTitle: 'Password and key cleanup',
      confirmKeysCleanup:
        'The master password and all cloud service keys will be removed from the browser storage. Confirm this action.'
    }
  });
}
