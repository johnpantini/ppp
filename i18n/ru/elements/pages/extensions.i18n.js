/**
 * Registers the i18n/ru/elements/pages/extensions phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $extensionsPage: {
      listHeader: 'Список дополнений',
      installExtension: 'Установить дополнение',
      authorColumn: 'Автор',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actionsColumn: 'Действия',
      openExtension: 'Открыть дополнение'
    }
  });
}
