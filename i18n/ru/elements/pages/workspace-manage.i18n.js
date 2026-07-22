export default function (i18n) {
  i18n.extend({
    $workspaceManagePage: {
      workspaceNameHeader: 'Название терминала',
      workspaceNameDescription:
        'Название будет отображаться в боковой панели в списке терминалов.',
      flagsHeader: 'Флаги',
      flagsDescription: 'Параметры, принимающие значение Да или Нет.',
      allowLockedWidgets: 'Разрешить блокировку виджетов',
      lockedWidgetsBanner:
        'Заблокированные виджеты не могут перемещаться или изменять размер.',
      ensemblesHeader: 'Ансамбли виджетов',
      ensemblesDescription:
        'Укажите режим синхронизации ансамблей виджетов для этого терминала.',
      ensembleDefault: 'По умолчанию',
      ensembleGroup: 'Синхронизировать по виджетам группы',
      ensembleAll: 'Синхронизировать по всем виджетам'
    }
  });
}
