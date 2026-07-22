export default function (i18n) {
  i18n.extend({
    $timeAndSalesWidget: {
      columns: {
        price: 'Цена',
        volume: 'Объём',
        amount: 'Сумма',
        time: 'Время',
        pool: 'Пул',
        condition: 'SC'
      },
      refreshManually: 'Обновить вручную',
      pause: 'Пауза',
      clearWidget: 'Очистить виджет',
      noTradesTrader: 'Отсутствует трейдер ленты.',
      historyLoadFailed: 'Не удалось загрузить историю сделок.',
      codeContainsErrors: 'Код содержит ошибки.',
      tags: {
        anonymousTrades: 'Лента обезличенных сделок'
      },
      description:
        'отображает обезличенные сделки с финансовым инструментом по всем доступным рыночным центрам.',
      settings: {
        tabs: {
          main: 'Подключения',
          columns: 'Столбцы',
          filter: 'Фильтр'
        },
        tradesTrader: 'Трейдер ленты',
        tradesTraderDescription:
          'Трейдер, который будет источником ленты сделок.',
        tradesTableColumns: 'Столбцы таблицы сделок',
        volumeFilter: 'Фильтр объёма',
        volumeFilterDescription:
          'Сделки с объёмом меньше указанного не будут отображены в ленте. Чтобы всегда отображать все сделки, введите 0. Можно вводить целые, дробные числа или код тела функции JavaScript.',
        headerInterface: 'Интерфейс заголовка',
        showResetButton: 'Показывать кнопку очистки',
        showPauseButton: 'Показывать кнопку паузы',
        timeDisplayFormat: 'Формат отображения времени',
        timeFormatHms: 'Часы, минуты, секунды',
        timeFormatHmsf: 'Часы, минуты, секунды, миллисекунды',
        timeFormatDayHms: 'День, часы, минуты, секунды',
        timeFormatHm: 'Часы, минуты',
        timeFormatDayHm: 'День, часы, минуты',
        depth: 'Количество сделок для отображения',
        depthDescription: 'Максимальное количество сделок, отображаемое в ленте.',
        volumeHighlight: 'Выделение сделок по объёму',
        volumeHighlightDescription:
          'Будут выделяться сделки с объёмом не меньше заданного.',
        nonePlaceholder: 'Нет'
      }
    }
  });
}
