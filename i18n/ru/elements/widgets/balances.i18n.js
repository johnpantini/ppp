/**
 * Registers the i18n/ru/elements/widgets/balances phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $balancesWidget: {
      averagePrice: 'Средняя: %{price}',
      noBalancesTrader: 'Не задан портфельный трейдер.',
      descriptionBeforeName: 'Виджет',
      descriptionAfterName:
        'отображает денежные или иные активы, использующиеся для открытия позиций.',
      balancesTrader: 'Портфельный трейдер',
      balancesTraderDescription:
        'Трейдер, который будет источником балансовых позиций.',
      interface: 'Интерфейс',
      hideBalances: 'Скрывать значения'
    }
  });
}
