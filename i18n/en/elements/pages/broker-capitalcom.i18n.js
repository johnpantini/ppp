/**
 * Registers the i18n/en/elements/pages/broker-capitalcom phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerCapitalcomPage: {
      identifier: 'Identifier',
      identifierDescription:
        'The identifier (e-mail) of your Capital.com account.',
      customPassword: 'Custom password',
      testRequestFailed:
        'Failed to perform a test request to the Capital.com API'
    }
  });
}
