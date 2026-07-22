export default function (i18n) {
  i18n.extend({
    $restoreMongodbModalPage: {
      restoreFromZipPrefix:
        'To restore the database from a ZIP archive, click',
      hereLink: 'here',
      selectS3ApiPlaceholder: 'Choose an S3 API to load the backup list',
      databaseColumn: 'Database',
      createdAtColumn: 'Creation date',
      sizeColumn: 'Size',
      actionsColumn: 'Actions',
      link: 'Link',
      restore: 'Restore',
      restoreSucceeded:
        'The restore completed successfully, you can reload the page.',
      restoreFromBackupTitle: 'Backup restore',
      confirmRestoreFromBackup:
        'The database will be restored from the backup created on %{date}. The current database will be cleared before restoring. Confirm this action.',
      backupRemovalTitle: 'Backup removal',
      confirmBackupRemoval:
        'The backup created on %{date} will be removed. Confirm this action.',
      cannotDeleteBackup: 'Failed to delete the backup.',
      backupDeleted: 'The backup has been deleted.',
      cannotFetchBucketList:
        'Failed to fetch the bucket list. Check your access permissions.',
      cannotFetchBackupList: 'Failed to fetch the backup list.'
    }
  });
}
