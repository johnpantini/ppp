/**
 * Registers the i18n/en/elements/pages/broker-alpaca phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $brokerAlpacaPage: {
      alpacaKey: 'Alpaca key',
      alpacaSecret: 'Alpaca secret',
      invalidLoginOrPassword: 'Invalid login or password',
      invalidPaperLoginOrPassword:
        'Invalid login or password for a paper trading account. Check the keys or uncheck the paper trading option for a live account',
      accountType: 'Account type',
      paperTradingDescription:
        'Paper trading keys work only with the paper trading API, live keys only with the live one. Traders using this broker profile send orders to the selected environment.',
      paperTradingCheckbox: 'Paper trading account'
    }
  });
}
