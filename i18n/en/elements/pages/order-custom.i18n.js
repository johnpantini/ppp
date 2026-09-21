/**
 * Registers the i18n/en/elements/pages/order-custom phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $orderCustomPage: {
      templateNameHeader: 'Template name',
      namePlaceholder: 'Order',
      baseUrlHeader: 'Base URL of the order directory',
      baseUrlDescription:
        'A link to the server directory containing the order implementation files.',
      continueButton: 'Continue',
      urlCannotBeLoaded: 'This URL cannot be loaded',
      loadOrderTemplateTitle: 'Loading an order template from a URL'
    }
  });
}
