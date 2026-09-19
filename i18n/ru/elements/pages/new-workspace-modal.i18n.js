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
