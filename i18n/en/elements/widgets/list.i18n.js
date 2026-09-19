import $widget from '../widget.i18n.js';

export default function (i18n) {
  $widget(i18n);

  i18n.extend({
    $listWidget: {
      deletionMode: 'Deletion mode',
      listLoadFailed: 'Failed to load the list.',
      contentLoadFailed: 'Failed to load the content.',
      continueSetup: 'Finish setting up the widget before saving.',
      widgetDescriptionSuffix:
        'allows building listings of instruments and any other data that can be arranged into a table.',
      listType: 'List type',
      typeInstruments: 'Instruments',
      typeMru: 'Recent instruments',
      typeIntradayStats: 'Intraday statistics',
      typeUrl: 'From URL',
      urlCannotBeUsed: 'This URL cannot be used',
      continueButton: 'Continue'
    }
  });
}
