/**
 * Registers the i18n/en/elements/pages/broker-tinkoff phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerTinkoffPage: {
      apiTokenTitle: 'API access token',
      apiTokenDescription:
        'Required to sign all requests. It can be obtained via this',
      link: 'link',
      enterToken: 'Enter the token',
      malformedToken: 'Malformed token',
      noOpenAccounts: 'No open brokerage accounts found'
    }
  });
}
