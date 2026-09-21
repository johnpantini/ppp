/**
 * Registers the i18n/ru/elements/pages/trader-combined-l1 phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderCombinedL1Page: {
      l1TraderPlaceholder: 'Трейдер L1',
      tradersMustBeUnique: 'Трейдеры не могут повторяться в списке',
      sourceListEmpty: 'Список источников не должен быть пустым',
      dictionaryTitle: 'Словарь',
      dictionaryDescription:
        'Словарь инструментов, который будет назначен трейдеру.',
      traderListTitle: 'Список трейдеров-источников L1',
      traderListDescription:
        'Выбранные трейдеры будут объединены в один комбинированный источник данных L1. Цифробуквенные флаги контролируют возможность поставки данных в соотвествии с документацией:'
    }
  });
}
