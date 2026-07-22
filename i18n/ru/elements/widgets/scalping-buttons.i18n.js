import $g from '../../lib/general.i18n.js';

export default function (i18n) {
  $g(i18n);

  i18n.extend({
    $scalpingButtonsWidget: {
      noOrdersTraderText: 'Отсутствует трейдер для модификации заявок.',
      widgetDescriptionSuffix:
        'позволяют быстро модифицировать лимитные и условные заявки на заданное количество шагов цены.',
      limitOrdersTraderHeader: 'Трейдер лимитных заявок',
      limitOrdersTraderDescription:
        'Трейдер, который будет переставлять лимитные заявки.',
      coolDownHeader: 'Задержка после использования кнопок',
      coolDownDescription:
        'В течение этого времени после нажатия кнопка будет недоступна. Указывается в миллисекундах.',
      buySideButtonsHeader: 'Кнопки для заявок на покупку',
      buySideButtonsDescription:
        'Перечислите значения (со знаком) кнопок через запятую. Для создания нового ряда выполните перенос строки. Чтобы сделать отступ, оставьте очередную строку пустой. Значения задаются в шагах цены торгового инструмента.',
      sellSideButtonsHeader: 'Кнопки для заявок на продажу',
      contentHeader: 'Наполнение',
      showAllTabText: 'Показывать вкладку «Все»',
      showRealTabText: 'Показывать вкладку «Биржевые»',
      showConditionalTabText: 'Показывать вкладку «Условные»'
    }
  });
}
