import $const from '../../lib/const.i18n.js';

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
