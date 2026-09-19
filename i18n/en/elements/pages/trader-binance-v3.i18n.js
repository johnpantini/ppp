export default function (i18n) {
  i18n.extend({
    $traderBinanceV3Page: {
      brokerProfileTitle: 'Broker profile',
      brokerProfileDescription: 'Binance broker profile.',
      addBrokerProfile: 'Add a Binance profile',
      wsUrlTitle: 'Base URL for connecting to the market data stream',
      wsUrlDescription: 'A link used to establish a WebSocket connection.',
      tradesModeTitle: 'Time and sales mode',
      tradesModeDescription:
        'In aggregation mode, trades are summed by quantity and appear in the tape as a single trade if they belong to the same taker order.',
      aggTrades: 'Aggregated trades',
      rawTrades: 'All trades',
      reconnectTimeoutTitle: 'Reconnection timeout',
      reconnectTimeoutDescription:
        'Time after which another attempt will be made to restore an interrupted connection to the server. Specified in milliseconds, 1000 ms by default.',
      orderbookUpdateIntervalTitle: 'Order book update interval',
      selectValuePlaceholder: 'Select a value',
      interval100ms: '100 ms',
      interval1000ms: '1000 ms',
      invalidUrl: 'Invalid or incomplete URL',
      invalidUrlProtocol: 'Invalid URL protocol',
      connectionFailed: 'Failed to connect'
    }
  });
}
