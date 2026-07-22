export default function (i18n) {
  i18n.extend({
    $clockWidget: {
      descriptionBeforeName: 'Виджет',
      descriptionAfterName:
        'служит для отображения времени по заданным настройкам.',
      interface: 'Интерфейс',
      displayTimeInHeader: 'Отображать время в заголовке (вместо названия)',
      headerTimeFormat: 'Формат отображения в заголовке',
      formats: {
        default: 'Часы, минуты, секунды',
        day1: 'День, часы, минуты, секунды',
        compact: 'Часы, минуты',
        day2: 'День, часы, минуты'
      }
    }
  });
}
