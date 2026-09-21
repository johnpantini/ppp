/**
 * Registers the i18n/en/elements/pages/workspaces phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $workspacesPage: {
      listHeader: 'Workspace list',
      createdAtColumn: 'Created',
      updatedAtColumn: 'Last modified',
      actionsColumn: 'Actions',
      goToWorkspace: 'Go to the workspace'
    }
  });
}
