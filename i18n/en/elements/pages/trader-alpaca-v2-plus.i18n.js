export default function (i18n) {
  i18n.extend({
    $traderAlpacaV2PlusPage: {
      brokerProfileTitle: 'Broker profile',
      brokerProfileDescription: 'A UTEX, Alpaca or Psina broker profile.',
      addUtexProfile: 'Add a UTEX profile',
      addAlpacaProfile: 'Add an Alpaca profile',
      addPsinaProfile: 'Add a Psina profile',
      wsUrlTitle: 'URL for connecting to the shared market data stream',
      wsUrlDescription:
        'A link used to stream order book and time and sales data. It can be generated from a service, if one exists (use the dropdown list).',
      clickToSelectService: 'Click to select a service',
      generateLink: 'Generate a link',
      reconnectTimeoutTitle: 'Reconnection timeout',
      reconnectTimeoutDescription:
        'Time after which another attempt will be made to restore an interrupted connection to the server. Specified in milliseconds, 1000 ms by default.',
      marketDataSettingsTitle: 'Market data settings',
      useLotsCheckbox: 'Send stock volumes in the order book in lots',
      invalidUrl: 'Invalid or incomplete URL',
      invalidUrlProtocol: 'Invalid URL protocol',
      connectionLimitExceeded:
        'The limit of available connections has been exhausted',
      connectionFailedCheckLink:
        'Failed to connect, check the link and the broker'
    }
  });
}
