export default function (i18n) {
  i18n.extend({
    $orderMarketDataRecorderPage: {
      specificationHeader: 'Specification',
      specificationDescription:
        'Learn how traders are used for this conditional order. Traders are set in the order widget.',
      specificationCode:
        'Trader #1 - orderbook source.\nTrader #2 - trades source.\nTrader #3 - trading status source.',
      ycApiDescription:
        'The API that will be used to upload recordings to the cloud storage.',
      addYcApi: 'Add a Yandex Cloud API',
      flagsHeader: 'Flags',
      flagsDescription: 'Order behaviour options.',
      autoStartRecording:
        'Start recording right after the order is placed'
    }
  });
}
