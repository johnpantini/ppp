import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $orderPage: {
      searchPlaceholder: 'Поиск',
      continueButton: 'Продолжить',
      slTpCardDescription: 'Классическая отложенная заявка с настройками.',
      recorderCardTitle: 'Запись сделок и котировок',
      recorderCardDescription:
        'Записывает изменения рыночных данных в облачное хранилище.',
      customCardDescription:
        'Собственная реализация заявки, загружаемая по ссылке.',
      manageRecordings: 'Управление записями'
    }
  });
}
