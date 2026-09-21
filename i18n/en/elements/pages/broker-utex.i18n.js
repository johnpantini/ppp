/**
 * Registers the i18n/en/elements/pages/broker-utex phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerUtexPage: {
      accountLogin: 'UTEX account login',
      accountPassword: 'UTEX account password',
      accountBlocked: 'The account is temporarily blocked',
      invalidLoginOrPassword: 'Invalid login or password'
    }
  });
}
