import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $instrumentsImportPage: {
      dictionary: 'Dictionary',
      dictionaryDescription:
        'Select a source dictionary to import instruments from.',
      clearBeforeImport:
        'Delete dictionary instruments before importing (speeds up the import)',
      dictionaryUrlTitle: 'Dictionary URL',
      dictionaryUrlDescription:
        'This dictionary is loaded from an external source by URL. The value is saved upon editing.',
      importParameters: 'Import parameters',
      skipOtcInstruments: 'Do not import OTC instruments',
      brokerProfileTitle: '%{broker} broker profile',
      brokerProfileDescription: 'Required to build the dictionary.',
      addBrokerProfile: 'Add %{broker} profile',
      importInstruments: 'Import instruments',
      failedToLoadInstruments: 'Failed to load the instrument list.',
      finamAuthorizationFailed: 'Failed to authorize in Finam.',
      emptyInstrumentList: 'The list of instruments to import is empty.',
      importSucceeded: 'Operation completed, instruments imported: %{count}'
    }
  });
}
