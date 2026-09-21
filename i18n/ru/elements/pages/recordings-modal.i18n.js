/**
 * Registers the i18n/ru/elements/pages/recordings-modal phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $recordingsModalPage: {
      selectYcApiPlaceholder:
        'Выберите API Yandex Cloud для загрузки списка записей',
      dictionaryColumn: 'Словарь',
      dateColumn: 'Дата',
      sizeColumn: 'Размер',
      actionsColumn: 'Действия',
      recordingRemovalTitle: 'Удаление записи',
      confirmRecordingRemoval:
        'Будет удалена запись [%{ticker}], созданная %{date}. Подтвердите действие.',
      cannotDeleteRecording: 'Не удалось удалить запись.',
      recordingDeleted: 'Запись удалена.',
      cannotFetchBucketList:
        'Не удалось получить список бакетов. Проверьте права доступа.',
      cannotFetchRecordingList: 'Не удалось выгрузить список записей.'
    }
  });
}
