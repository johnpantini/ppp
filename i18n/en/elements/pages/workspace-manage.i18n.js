export default function (i18n) {
  i18n.extend({
    $workspaceManagePage: {
      workspaceNameHeader: 'Workspace name',
      workspaceNameDescription:
        'The name will be displayed in the side panel in the workspace list.',
      flagsHeader: 'Flags',
      flagsDescription: 'Yes/No options.',
      allowLockedWidgets: 'Allow widget locking',
      lockedWidgetsBanner:
        'Locked widgets cannot be moved or resized.',
      ensemblesHeader: 'Widget ensembles',
      ensemblesDescription:
        'Specify the widget ensemble synchronization mode for this workspace.',
      ensembleDefault: 'Default',
      ensembleGroup: 'Synchronize by group widgets',
      ensembleAll: 'Synchronize by all widgets'
    }
  });
}
