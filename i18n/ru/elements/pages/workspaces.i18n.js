/**
 * Registers the i18n/ru/elements/pages/workspaces phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $workspacesPage: {
      listHeader: 'Список терминалов',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      actionsColumn: 'Действия',
      goToWorkspace: 'Перейти в терминал'
    }
  });
}
