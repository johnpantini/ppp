/**
 * Registers the i18n/en/elements/pages/broker-finam phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerFinamPage: {
      apiTokenTitle: 'API access token',
      apiTokenDescription:
        'Required to sign all requests. It can be obtained via this',
      link: 'link'
    }
  });
}
