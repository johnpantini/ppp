/**
 * Registers the i18n/ru/elements/pages/trader-combined-orderbook phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderCombinedOrderbookPage: {
      sourceTraderPlaceholder: 'Трейдер-источник',
      processorFuncCheckbox:
        'Трейдер будет обрабатывать книгу заявок функцией:',
      tradersMustBeUnique: 'Трейдеры не могут повторяться в списке',
      sourceListEmpty: 'Список источников не должен быть пустым',
      dictionaryTitle: 'Словарь',
      dictionaryDescription:
        'Словарь инструментов, который будет назначен трейдеру.',
      traderListTitle: 'Список трейдеров-поставщиков',
      traderListDescription:
        'Данные выбранных трейдеров будут объединены в одну комбинированную книгу заявок.',
      maxTradersWarning: 'Можно указать до 10 трейдеров.'
    }
  });
}
