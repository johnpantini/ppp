import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $tccWidget: {
      trader: 'Трейдер',
      updateInstruments: 'Обновить инструменты',
      performReset: 'Выполнить сброс',
      noTradersToDisplay: 'Нет трейдеров для отображения.',
      descriptionBeforeName: 'Виджет',
      descriptionAfterName:
        'служит для просмотра информации о трейдерах приложения и взаимодействия с ними.',
      traderList: 'Список трейдеров'
    }
  });
}
