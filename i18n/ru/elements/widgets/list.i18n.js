import $widget from '../widget.i18n.js';

export default function (i18n) {
  $widget(i18n);

  i18n.extend({
    $listWidget: {
      deletionMode: 'Режим удаления',
      listLoadFailed: 'Не удалось загрузить список.',
      contentLoadFailed: 'Не удалось загрузить содержимое.',
      continueSetup: 'Продолжите настройку виджета перед тем, как сохраняться.',
      widgetDescriptionSuffix:
        'позволяет создавать листинги инструментов и любых других данных, которые можно оформить в таблицу.',
      listType: 'Тип списка',
      typeInstruments: 'Инструменты',
      typeMru: 'Недавние инструменты',
      typeIntradayStats: 'Статистика внутри дня',
      typeUrl: 'По ссылке',
      urlCannotBeUsed: 'Этот URL не может быть использован',
      continueButton: 'Продолжить'
    }
  });
}
