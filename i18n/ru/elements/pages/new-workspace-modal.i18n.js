/**
 * Registers the i18n/ru/elements/pages/new-workspace-modal phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $newWorkspaceModalPage: {
      nameDescription: 'Будет отображаться в боковой панели.',
      workspaceNamePlaceholder: 'Название терминала',
      cloneDescription:
        'Можно выбрать существующий терминал - из него будут скопированы все виджеты:',
      lockedWidgetsDescription:
        'Заблокированные виджеты не могут перемещаться или изменять размер.',
      allowLockedWidgets: 'Разрешить блокировку виджетов',
      comment: 'Комментарий',
      commentPlaceholder: 'Произвольное описание',
      createWorkspace: 'Создать пространство',
      workspaceAlreadyExists:
        'Рабочее пространство с таким названием уже существует'
    }
  });
}
