import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/ru/elements/widgets/portfolio phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $portfolioWidget: {
      noPortfolioTrader: 'Отсутствует портфельный трейдер.',
      widgetDescriptionPrefix: 'Виджет',
      widgetDescriptionSuffix: 'отображает сводку по всем открытым позициям.',
      tabs: {
        main: 'Основные настройки',
        columns: 'Столбцы таблицы'
      },
      portfolioTrader: 'Портфельный трейдер',
      portfolioTraderDescription:
        'Трейдер, который будет источником позиций в портфеле.',
      instrumentTypesToDisplay: 'Типы инструментов для отображения',
      cryptocurrencies: 'Криптовалюты',
      portfolioTableColumns: 'Столбцы таблицы портфеля'
    }
  });
}
