export default function (i18n) {
  i18n.extend({
    $serviceSystemdPppAspirantPage: {
      redisStorage: 'Redis storage',
      redisStorageDescription: 'Persistence for the service.',
      addRedisApi: 'Add a Redis API',
      server: 'Server',
      serverDescription:
        'The server Aspirant will run on. Cannot be changed after the service is created.',
      addServer: 'Add a server',
      nodeJsVersion: 'node.js version',
      nodeJsVersionDescription:
        'Choose which node.js version should be installed.',
      globalNetworkDomain: 'Global network domain',
      globalNetworkDomainDescription:
        'An optional domain to generate certificates for.',
      tailnetDomain: 'Tailnet domain',
      tailnetDomainDescription: 'The server domain in the Tailscale network.',
      saveAndDeployToServer: 'Save to PPP and deploy to the server',
      updateTailnetCerts: 'Update Tailnet certificates',
      updateTailnetCertsTitle: 'Tailnet certificates update',
      updateTailnetCertsConfirm:
        'The server certificates in the Tailnet network will be updated. Confirm the action.',
      cannotConfigureAspirant: 'Failed to configure the Aspirant service.',
      cannotRestartAspirant: 'Failed to restart the Aspirant service.',
      cannotStopAspirant: 'Failed to stop the Aspirant service.'
    }
  });
}
