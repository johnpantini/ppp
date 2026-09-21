/**
 * Registers the i18n/en/elements/pages/broker-bybit phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerBybitPage: {
      keyAndSecretDescription: 'The key and secret can be generated via this',
      link: 'link',
      secretKey: 'Secret key',
      endpoint: 'Endpoint',
      connectorService: 'Connector service',
      connectorServiceDescription:
        'It will be used to make requests to the Bybit API.',
      testRequestFailed: 'Failed to perform a test request to the Bybit API'
    }
  });
}
