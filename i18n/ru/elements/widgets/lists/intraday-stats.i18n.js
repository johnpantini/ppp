export default function (i18n) {
  i18n.extend({
    $intradayStatsWidget: {
      columns: {
        buys: 'Покупки',
        sells: 'Продажи'
      },
      noStatsTrader: 'Отсутствует трейдер портфеля и позиций.',
      sourceCodeUnusable: 'Исходный код не может быть использован.',
      statsTrader: 'Трейдер для формирования статистики',
      statsTraderDescription:
        'Трейдер должен поддерживать выгрузку истории операций и портфеля.',
      mainTrader: 'Основной трейдер',
      l1Source: 'Источник L1-данных.',
      extraTraderL1: 'Дополнительный трейдер L1 #%{n}',
      virtualCommFunction: 'Расчёт комиссии виртуальных сделок',
      statsTableColumns: 'Столбцы таблицы со статистикой'
    }
  });
}
