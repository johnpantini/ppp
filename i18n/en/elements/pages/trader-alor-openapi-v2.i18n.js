export default function (i18n) {
  i18n.extend({
    $traderAlorOpenapiV2Page: {
      brokerProfileTitle: 'Broker profile',
      brokerProfileDescription: 'Alor broker profile.',
      addBrokerProfile: 'Add an Alor profile',
      portfolioIdTitle: 'Client portfolio ID',
      portfolioIdDescription: 'Alor portfolio for the required trading section.',
      portfolioTypeTitle: 'Client portfolio type',
      portfolioTypeStock: 'Stock market',
      portfolioTypeFutures: 'Derivatives market',
      portfolioTypeCurrency: 'Currency and precious metals market',
      exchangeTitle: 'Exchange',
      orderbookDepthTitle: 'Order book depth',
      orderbookDepthDescription: '20 levels by default.',
      flatCommissionTitle: 'Flat rate commission',
      flatCommissionDescription:
        'Specify your commission rate in % if it differs from the standard rates offered by the broker.',
      reconnectTimeoutTitle: 'Reconnection timeout',
      reconnectTimeoutDescription:
        'Time after which another attempt will be made to restore an interrupted connection to the broker servers. Specified in milliseconds, 1000 ms by default.',
      invalidAlorToken: 'Invalid Alor token.',
      portfolioSummaryFailed: 'Unable to fetch portfolio information.'
    }
  });
}
