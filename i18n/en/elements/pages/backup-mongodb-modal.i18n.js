export default function (i18n) {
  i18n.extend({
    $backupMongodbModalPage: {
      s3ApiDescription:
        'The API that will be used to upload the backup to the cloud storage.',
      saveBackupToDisk: 'Save the backup to disk',
      saveBackupToS3: 'Save the backup to S3',
      cannotFetchBucketList:
        'Failed to fetch the bucket list. Check your access permissions.',
      cannotCreateBackupsBucket: 'Failed to create a bucket for backups.',
      cannotUploadBackup: 'Failed to upload the backup to the cloud storage.',
      backupSaved: 'The database backup has been saved.',
      backupCreationTitle: 'Backup creation'
    }
  });
}
