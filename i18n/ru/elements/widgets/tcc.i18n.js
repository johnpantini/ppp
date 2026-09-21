import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/ru/elements/widgets/tcc phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
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
