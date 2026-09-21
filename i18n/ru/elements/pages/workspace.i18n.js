/**
 * Registers the i18n/ru/elements/pages/workspace phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $workspacePage: {
      noWidgetsHeader: 'В этом терминале нет виджетов',
      noWidgetsText:
        'Перед тем, как начать торговать, разместите виджеты на рабочей области. Чтобы в дальнейшем добавлять виджеты, выберите терминал в боковом меню и нажмите',
      widgetCopiedToClipboard: 'Виджет «%{name}» скопирован в буфер обмена.',
      workspaceLoadingTitle: 'Загрузка терминала'
    }
  });
}
