/**
 * Registers the i18n/en/elements/pages/trader-custom phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderCustomPage: {
      urlTitle: 'Link to the trader implementation',
      continueButton: 'Continue',
      urlCannotBeLoaded: 'This URL cannot be loaded',
      loadTraderByUrl: 'Loading trader from URL'
    }
  });
}
