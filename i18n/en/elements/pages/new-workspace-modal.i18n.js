/**
 * Registers the i18n/en/elements/pages/new-workspace-modal phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $newWorkspaceModalPage: {
      nameDescription: 'It will be displayed in the side navigation.',
      workspaceNamePlaceholder: 'Workspace name',
      cloneDescription:
        'You can choose an existing workspace - all widgets will be copied from it:',
      lockedWidgetsDescription: 'Locked widgets cannot be moved or resized.',
      allowLockedWidgets: 'Allow widget locking',
      comment: 'Comment',
      commentPlaceholder: 'Arbitrary description',
      createWorkspace: 'Create a workspace',
      workspaceAlreadyExists: 'A workspace with this name already exists'
    }
  });
}
