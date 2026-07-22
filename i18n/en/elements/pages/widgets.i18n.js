import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $widgetsPage: {
      listOfWidgetTemplates: 'Widget template list',
      addWidgetTemplate: 'Add a widget template',
      or: 'Or',
      allTemplates: 'All templates',
      removedTemplates: 'Removed templates',
      orByType: 'Or by type',
      typeColumn: 'Type',
      collectionColumn: 'Collection',
      createdAtColumn: 'Creation date',
      updatedAtColumn: 'Last modified',
      actionsColumn: 'Actions',
      byLink: 'Custom URL'
    }
  });
}
