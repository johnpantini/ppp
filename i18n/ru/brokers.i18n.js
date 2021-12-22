import { SUPPORTED_BROKERS } from '../../lib/const.js';

i18n.extend({
  $pages: {
    brokers: {
      toast: {
        title: 'Список брокеров'
      }
    }
  },
  $brokerType: {
    [SUPPORTED_BROKERS.ALOR_OPENAPI_V2]: 'Alor Open API V2',
    [SUPPORTED_BROKERS.TINKOFF_OPENAPI_V1]: 'Tinkoff Open API V1',
    [SUPPORTED_BROKERS.UNITED_TRADERS]: 'United Traders',
    [SUPPORTED_BROKERS.ALPACA_V2]: 'Alpaca Data API V2'
  }
});
