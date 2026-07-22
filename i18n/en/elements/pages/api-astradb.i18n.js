export default function (i18n) {
  i18n.extend({
    $apiAstradbPage: {
      checkDbConnection: 'Check database connection',
      dbId: 'Database ID',
      dbIdDescription:
        'Can be found in the database dashboard, the ASTRA_DB_ID key.',
      dbRegion: 'Database region',
      dbRegionDescription:
        'Can be found in the database dashboard, the ASTRA_DB_REGION key.',
      dbKeyspace: 'Keyspace',
      dbKeyspaceDescription:
        'Can be found in the database dashboard, the ASTRA_DB_KEYSPACE key.',
      dbTokenDescription:
        'Stored in the ASTRA_DB_APPLICATION_TOKEN environment variable.',
      tableList: 'Table list',
      tableListDescription:
        'AstraDB tables in the keyspace of the current profile.',
      tableColumn: 'Table',
      actionsColumn: 'Actions',
      wakeUpTriggerBanner:
        'A trigger will be set up to keep the database from being suspended due to inactivity.',
      tableRemovalTitle: 'Table removal',
      confirmTableRemoval:
        'The table "%{table}" will be removed. Confirm this action.',
      tableRemoved: 'The table "%{table}" has been removed.',
      collectionRemovalTitle: 'Collection removal',
      cannotReadDbStateDocument:
        'Failed to read the database state document.',
      noDbStateInfo: 'The database does not contain any state information.',
      dbOkLastUpdate: 'The database is fine. Last update: %{date}'
    }
  });
}
