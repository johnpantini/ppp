/**
 * Registers the i18n/en/elements/pages/api-seatable phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiSeatablePage: {
      baseToken: 'Base token',
      baseTokenDescription:
        'The Seatable base API token. Can be obtained in the dashboard.'
    }
  });
}
