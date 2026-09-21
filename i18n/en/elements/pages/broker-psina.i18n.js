/**
 * Registers the i18n/en/elements/pages/broker-psina phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerPsinaPage: {
      loginDescription: 'The Psina login.',
      psinaPassword: 'Psina password',
      adminGateway: 'Psina admin gateway',
      adminGatewayDescription: 'It will be used to verify the credentials.',
      invalidLoginOrPassword: 'Invalid login or password'
    }
  });
}
