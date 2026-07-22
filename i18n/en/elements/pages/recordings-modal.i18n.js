export default function (i18n) {
  i18n.extend({
    $recordingsModalPage: {
      selectYcApiPlaceholder:
        'Choose a Yandex Cloud API to load the recording list',
      dictionaryColumn: 'Dictionary',
      dateColumn: 'Date',
      sizeColumn: 'Size',
      actionsColumn: 'Actions',
      recordingRemovalTitle: 'Recording removal',
      confirmRecordingRemoval:
        'The recording [%{ticker}] created on %{date} will be removed. Confirm this action.',
      cannotDeleteRecording: 'Failed to delete the recording.',
      recordingDeleted: 'The recording has been deleted.',
      cannotFetchBucketList:
        'Failed to fetch the bucket list. Check your access permissions.',
      cannotFetchRecordingList: 'Failed to fetch the recording list.'
    }
  });
}
