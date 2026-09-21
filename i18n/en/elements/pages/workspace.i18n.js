/**
 * Registers the i18n/en/elements/pages/workspace phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $workspacePage: {
      noWidgetsHeader: 'This workspace has no widgets',
      noWidgetsText:
        'Before you start trading, place widgets on the working area. To add widgets later, select the workspace in the side menu and press',
      widgetCopiedToClipboard:
        'The widget "%{name}" has been copied to the clipboard.',
      workspaceLoadingTitle: 'Workspace loading'
    }
  });
}
