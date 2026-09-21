/**
 * Registers the i18n/en/elements/pages/broker-mexc phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerMexcPage: {
      accessKey: 'Access key',
      keyAndSecretDescription: 'The key and secret can be generated via this',
      link: 'link',
      secretKey: 'Secret key',
      connectorService: 'Connector service',
      connectorServiceDescription:
        'It will be used to make requests to the MEXC API.'
    }
  });
}
