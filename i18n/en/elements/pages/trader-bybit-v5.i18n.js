/**
 * Registers the i18n/en/elements/pages/trader-bybit-v5 phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderBybitV5Page: {
      brokerProfileTitle: 'Broker profile',
      brokerProfileDescription: 'Bybit broker profile.',
      addBrokerProfile: 'Add a Bybit profile',
      productTitle: 'Product',
      productDescription: 'Choose the product you are going to trade.',
      productLinear: 'Derivatives',
      productSpot: 'Spot',
      orderbookDepthTitle: 'Order book depth',
      orderbookDepthDescription:
        'The smaller the depth, the faster the order book will be updated.',
      reconnectTimeoutTitle: 'Reconnection timeout',
      reconnectTimeoutDescription:
        'Time after which another attempt will be made to restore an interrupted connection to the server. Specified in milliseconds, 1000 ms by default.'
    }
  });
}
