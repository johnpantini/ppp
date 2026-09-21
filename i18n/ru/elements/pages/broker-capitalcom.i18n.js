/**
 * Registers the i18n/ru/elements/pages/broker-capitalcom phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerCapitalcomPage: {
      identifier: 'Идентификатор',
      identifierDescription:
        'Идентификатор (e-mail) вашей учётной записи Capital.com.',
      customPassword: 'Пользовательский пароль',
      testRequestFailed:
        'Не удалось выполнить проверочный запрос к API Capital.com'
    }
  });
}
