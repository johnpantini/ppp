export default function (i18n) {
  i18n.extend({
    $apiSupabasePage: {
      projectUrl: 'Project URL',
      projectUrlDescription:
        'Can be found in the Supabase project dashboard, in the API subsection of Settings. See the Config section, the URL field.',
      projectKey: 'Project key',
      projectKeyDescription:
        'Can be found in the Supabase project dashboard, in the API subsection of Settings. See the Project API keys section, the anon public field. It will be stored encrypted.',
      database: 'Database',
      databaseDescription: 'The database name to connect to.',
      host: 'Host',
      hostDescription: 'The host to connect to the database.',
      port: 'Port',
      portDescription: 'The port to connect to the database.',
      user: 'User',
      userDescription: 'The username to connect to the database.',
      password: 'Password',
      passwordDescription:
        'The password to connect to the database. It will be stored encrypted.',
      connectorService: 'Connector service',
      connectorServiceDescription:
        'Will be used to make HTTP requests to Redis.',
      invalidProjectKey: 'Invalid project key',
      invalidUserOrPassword: 'Invalid user or password'
    }
  });
}
