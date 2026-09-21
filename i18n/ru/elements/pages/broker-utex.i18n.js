/**
 * Registers the i18n/ru/elements/pages/broker-utex phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerUtexPage: {
      accountLogin: 'Логин учётной записи UTEX',
      accountPassword: 'Пароль учётной записи UTEX',
      accountBlocked: 'Учётная запись временно заблокирована',
      invalidLoginOrPassword: 'Неверный логин или пароль'
    }
  });
}
