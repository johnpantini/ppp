import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $instrumentsImportPage: {
      dictionary: 'Словарь',
      dictionaryDescription:
        'Выберите словарь-источник для импорта инструментов.',
      clearBeforeImport:
        'Удалить инструменты словаря перед импортом (ускоряет импорт)',
      dictionaryUrlTitle: 'Ссылка на словарь',
      dictionaryUrlDescription:
        'Этот словарь загружается из внешнего источника по ссылке. Значение запоминается при редактировании.',
      importParameters: 'Параметры импорта',
      skipOtcInstruments: 'Не импортировать инструменты OTC',
      brokerProfileTitle: 'Брокерский профиль %{broker}',
      brokerProfileDescription: 'Необходим для формирования словаря.',
      addBrokerProfile: 'Добавить профиль %{broker}',
      importInstruments: 'Импортировать инструменты',
      failedToLoadInstruments: 'Не удалось загрузить список инструментов.',
      finamAuthorizationFailed: 'Не удалось авторизоваться в Finam.',
      emptyInstrumentList: 'Список инструментов для импорта пуст.',
      importSucceeded:
        'Операция выполнена, импортировано инструментов: %{count}'
    }
  });
}
