export default function (i18n) {
  i18n.extend({
    $serverPage: {
      serverNamePlaceholder: 'My server',
      connectorServiceHeader: 'Connector service',
      connectorServiceDescription: 'Will be used to access the server via SSH.',
      hostnameHeader: 'Address',
      hostnameDescription: 'Specify the server host name or IP address.',
      portHeader: 'Port',
      portDescription: 'Specify the server SSH port.',
      usernameHeader: 'Username',
      authTypeHeader: 'Authorization type',
      authByPassword: 'By password',
      authByKey: 'By private key',
      keyOrPasswordHeader: 'Key or password',
      keyOrPasswordDescription: 'The data is stored encrypted.',
      enterPassword: 'Enter the password',
      enterKey: 'Enter the key',
      loadFromFile: 'Load from file',
      preCommandsHeader: 'Commands to run before the main setup',
      preCommandsDescription:
        'Arbitrary commands useful for debugging. Not saved to the database.',
      domainListHeader: 'Domain list',
      domainListDescription: 'Domains attached to the server.',
      addDomains: 'Add domains',
      domainColumn: 'Domain',
      actionsColumn: 'Actions',
      domainRemovalTitle: 'Domain removal',
      confirmDomainRemoval:
        'The domain %{domain} will be removed. Confirm this action.',
      serverSetupFailed: 'Failed to set up the server.'
    }
  });
}
