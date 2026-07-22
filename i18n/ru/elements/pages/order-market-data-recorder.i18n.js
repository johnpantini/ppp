export default function (i18n) {
  i18n.extend({
    $orderMarketDataRecorderPage: {
      specificationHeader: 'Спецификация',
      specificationDescription:
        'Узнайте, каким образом используются трейдеры для этой условной заявки. Трейдеры задаются в виджете заявки.',
      specificationCode:
        'Трейдер #1 - источник книги заявок.\nТрейдер #2 - источник сделок.\nТрейдер #3 - источник торговых статусов.',
      ycApiDescription:
        'API, который будет использован для выгрузки записей в облачное хранилище.',
      addYcApi: 'Добавить API Yandex Cloud',
      flagsHeader: 'Флаги',
      flagsDescription: 'Параметры работы заявки.',
      autoStartRecording: 'Запускать запись сразу после выставления заявки'
    }
  });
}
