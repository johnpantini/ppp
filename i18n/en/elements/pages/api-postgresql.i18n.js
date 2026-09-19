export default function (i18n) {
  i18n.extend({
    $apiPostgresqlPage: {
      hostname: 'Host to connect to',
      hostnameDescription: 'A domain name or an IP address.',
      database: 'Database',
      databaseDescription: 'The database name to connect to.',
      port: 'Port',
      portDescription: 'The port to connect to the database.',
      user: 'User',
      userDescription: 'The username to connect to the database.',
      password: 'Password',
      passwordDescription:
        'The password to connect to the database. It will be stored encrypted.'
    }
  });
}
