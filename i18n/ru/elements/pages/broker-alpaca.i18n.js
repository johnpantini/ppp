/**
 * Registers the i18n/ru/elements/pages/broker-alpaca phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerAlpacaPage: {
      alpacaKey: 'Ключ Alpaca',
      alpacaSecret: 'Секрет Alpaca',
      invalidLoginOrPassword: 'Неверный логин или пароль',
      invalidPaperLoginOrPassword:
        'Неверный логин или пароль для paper-счёта. Проверьте ключи или снимите отметку paper-счёта для боевого счёта',
      accountType: 'Тип счёта',
      paperTradingDescription:
        'Ключи paper-счёта работают только с paper trading API, боевые — только с боевым. Трейдеры с этим профилем брокера отправляют заявки в выбранное окружение.',
      paperTradingCheckbox: 'Paper trading account'
    }
  });
}
