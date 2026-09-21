/**
 * Registers the i18n/en/elements/pages/trader-utex-margin-stocks phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderUtexMarginStocksPage: {
      brokerProfileTitle: 'Broker profile',
      brokerProfileDescription: 'UTEX broker profile.',
      addBrokerProfile: 'Add a UTEX profile',
      commissionTitle: 'UTEX commission',
      commissionDescription:
        'Specify the commission of your UTEX trading account in %. If no value is specified, it will be calculated as 0.04% of the order amount.',
      reconnectTimeoutTitle: 'Reconnection timeout',
      reconnectTimeoutDescription:
        'Time after which another attempt will be made to restore an interrupted connection to the server. Specified in milliseconds, 1000 ms by default.'
    }
  });
}
