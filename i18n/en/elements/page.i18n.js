import $const from '../lib/const.i18n.js';
import $g from '../lib/general.i18n.js';

export default function (i18n) {
  $const(i18n);
  $g(i18n);

  i18n.extend({
    $operations: {
      operationInProgress: 'Operation in progress',
      operationSucceeded: 'Operation completed successfully',
      operationFailedDetailsInConsole:
        'Operation failed, see browser console for details'
    },
    $page: {
      arbitraryDocumentName:
        'An arbitrary name to refer to this document when needed.',
      arbitraryProfileName:
        'An arbitrary name to refer to this profile when needed.',
      connectionName: 'Connection name',
      serviceName: 'Service name',
      enterValue: 'Enter a value',
      enterName: 'Enter a name',
      valueInRange: 'Enter a value between %{min} and %{max}',
      saveToPPP: 'Save to PPP',
      goToTheList: 'Go to the list',
      token: 'Token',
      apiKey: 'API key',
      secret: 'Secret',
      accessToken: 'Access token',
      invalidToken: 'Invalid token',
      urlCannotBeUsed: 'This URL cannot be used',
      codeContainsErrors: 'The code contains errors.',
      documentRemovedBadge: 'Document removed',
      documentRemovalTitle: 'Document removal',
      confirmDocumentRemoval:
        'Confirm that you are going to remove the document "%{name}".',
      irreversibleDocumentRemoval:
        'The document will be removed permanently. Confirm this action.',
      documentRemovedToast: 'The document has been removed.',
      allocationNotFound: 'Allocation not found.',
      conflictPrefix: 'A document with this name already exists, follow the',
      conflictLink: 'link',
      conflictSuffix: 'to edit it.',
      couldNotReadVersion: 'Failed to read the version',
      couldNotTrackServiceVersion: 'Failed to track the service version.',
      serviceRestarted: 'The service has been restarted.',
      serviceRestartTitle: 'Service restart',
      serviceStopped: 'The service has been stopped.',
      serviceStopTitle: 'Service shutdown',
      noConnector: 'The request is not possible: no connector available.',
      functionExecutionFailed: 'Failed to execute the function.',
      sqlQueryFailed: 'The SQL query failed.',
      terminalDatabaseQueryInProgress: 'Running the database query...',
      terminalServerSetupInProgress: 'Server setup in progress...',
      terminalDoneCanClose: 'Operation completed, this window can be closed.',
      terminalOperationFailedWithStatus:
        'The operation failed with status %{status}'
    }
  });
}
