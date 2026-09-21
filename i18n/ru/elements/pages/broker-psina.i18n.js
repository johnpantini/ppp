/**
 * Registers the i18n/ru/elements/pages/broker-psina phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerPsinaPage: {
      loginDescription: 'Логин Psina.',
      psinaPassword: 'Пароль Psina',
      adminGateway: 'Шлюз администратора Psina',
      adminGatewayDescription: 'Будет использован для проверки учётных данных.',
      invalidLoginOrPassword: 'Неверный логин или пароль'
    }
  });
}
